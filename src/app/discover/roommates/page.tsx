"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Search, Filter, GraduationCap, 
  BookOpen, Sparkles, Heart, CheckCircle2, 
  Loader2, ShieldCheck, MessageCircle, Info
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { calculateCompatibilityScore, Habits } from "@/lib/matching";
import Link from "next/link";

export default function RoommateDiscovery() {
  const [loading, setLoading] = useState(true);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [roommates, setRoommates] = useState<any[]>([]);
  const [filterCollege, setFilterCollege] = useState(true);
  const [requestingId, setRequestingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadRoommates() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch current user's roommate profile
      const { data: currentProfile } = await supabase
        .from("roommate_profiles")
        .select("*, profiles!inner(kyc_status, full_name)")
        .eq("user_id", user.id)
        .single();

      setCurrentUserProfile(currentProfile);

      // 2. Fetch all other searching & KYC verified students
      const { data: others } = await supabase
        .from("roommate_profiles")
        .select("*, profiles!inner(kyc_status, full_name, avatar_url)")
        .eq("profiles.is_searching", true)
        .eq("profiles.kyc_status", "verified")
        .neq("user_id", user.id);

      if (others && currentProfile) {
        const withScores = others.map(r => ({
          ...r,
          compatibility: calculateCompatibilityScore(currentProfile.habits as Habits, r.habits as Habits)
        })).sort((a, b) => b.compatibility - a.compatibility);
        
        setRoommates(withScores);
      }
      setLoading(false);
    }

    loadRoommates();
  }, []);

  const handleSendRequest = async (targetId: string) => {
    setRequestingId(targetId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("match_requests").insert({
        sender_id: user.id,
        receiver_id: targetId,
        status: "pending"
      });

      // Update local state to show sent
      setRoommates(prev => prev.map(r => r.user_id === targetId ? { ...r, requestSent: true } : r));
    } catch (err) {
      console.error(err);
    } finally {
      setRequestingId(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
      <p className="text-slate-500 font-medium animate-pulse">Finding Compatible Roommates...</p>
    </div>
  );

  if (currentUserProfile?.profiles?.kyc_status !== 'verified') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 text-center space-y-6">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
            <ShieldCheck className="text-amber-500" size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-900">KYC Required</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Roommate Discovery is a <b>Safe Zone</b>. Only KYC verified students can find and match with others to ensure marketplace safety.
          </p>
          <Link href="/verify" className="block w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-lg shadow-slate-200">
            Verify My Identity
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30 px-6 py-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-[0.2em] mb-1">
              <Sparkles size={14} /> Social Discovery
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Potential Roommates</h1>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
            <button 
              onClick={() => setFilterCollege(!filterCollege)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filterCollege ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
            >
              NIET Students
            </button>
            <button 
              onClick={() => setFilterCollege(false)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${!filterCollege ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
            >
              All Colleges
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 mt-8">
        {/* Discount Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-600 text-white p-6 rounded-[2rem] shadow-xl shadow-emerald-100 mb-12 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <Users className="text-white" size={28} />
            </div>
            <div>
              <h2 className="text-xl font-black italic uppercase tracking-tight">Group Booking Incentive!</h2>
              <p className="text-emerald-100 text-sm font-medium">Found a roommate? Book together and get 10% off the Brokerage Fee!</p>
            </div>
          </div>
          <button className="bg-white text-emerald-700 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-50 transition-colors">
            Learn More
          </button>
        </motion.div>

        {/* Roommate Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {roommates.map((r) => (
            <motion.div 
              key={r.user_id}
              whileHover={{ y: -5 }}
              className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col"
            >
              {/* Profile Header */}
              <div className="p-8 pb-4">
                <div className="flex justify-between items-start mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 bg-slate-100 rounded-3xl overflow-hidden border-4 border-white shadow-lg">
                      <img src={r.profiles.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full border-2 border-white">
                      <ShieldCheck size={14} />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Compatibility</p>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-black text-blue-600">{r.compatibility}%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-900">{r.profiles.full_name}</h3>
                  <p className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <GraduationCap size={14} className="text-blue-500" /> {r.major} • Year {r.year}
                  </p>
                </div>
              </div>

              {/* Habits */}
              <div className="px-8 py-4 flex flex-wrap gap-2">
                {Object.entries(r.habits as Habits).map(([key, value]) => (
                  <span key={key} className="px-3 py-1.5 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-bold uppercase tracking-tight border border-slate-100">
                    {value.replace('_', ' ')}
                  </span>
                ))}
              </div>

              <div className="px-8 py-4 flex-1">
                <p className="text-sm text-slate-500 leading-relaxed italic line-clamp-3">"{r.bio || "Looking for a chilled out roommate who values study time."}"</p>
              </div>

              {/* Actions */}
              <div className="p-8 pt-0 mt-auto">
                {r.requestSent ? (
                  <div className="w-full bg-emerald-50 text-emerald-600 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 border border-emerald-100">
                    <CheckCircle2 size={18} /> Match Request Sent
                  </div>
                ) : (
                  <button 
                    onClick={() => handleSendRequest(r.user_id)}
                    disabled={requestingId === r.user_id}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg shadow-slate-200"
                  >
                    {requestingId === r.user_id ? <Loader2 className="animate-spin" size={18} /> : <><Sparkles size={18} /> Send Match Request</>}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
