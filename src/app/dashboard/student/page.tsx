"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Home, FileText, CreditCard, ShieldCheck, 
  Download, ExternalLink, Loader2, AlertCircle,
  TrendingUp, Clock, CheckCircle2
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import UserTrustCard from "@/components/UserTrustCard";
import Link from "next/link";

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [agreements, setAgreements] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [booking, setBooking] = useState<any>(null);

  useEffect(() => {
    async function loadDashboardData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [profileRes, agreementsRes, transactionsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("legal_agreements").select("*").eq("student_id", user.id).order("signed_at", { ascending: false }),
        supabase.from("transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
      ]);

      setProfile(profileRes.data);
      setAgreements(agreementsRes.data || []);
      setTransactions(transactionsRes.data || []);
      
      // Mock current booking for UI
      if (agreementsRes.data && agreementsRes.data.length > 0) {
        setBooking({
          status: "Active",
          propertyName: "Knowledge Park Elite PG",
          moveInDate: "Aug 1, 2026",
          roomNo: "302-B"
        });
      }

      setLoading(false);
    }

    loadDashboardData();

    // Realtime subscription for transactions
    const txSubscription = supabase
      .channel("student-tx-updates")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "transactions" }, (payload) => {
        setTransactions(prev => prev.map(tx => tx.id === payload.new.id ? payload.new : tx));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(txSubscription);
    };
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
      <p className="text-gray-500 font-medium animate-pulse">Syncing Trust Data...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 hidden lg:flex flex-col p-6">
        <div className="flex items-center gap-2 font-black text-xl mb-10">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm">NS</div>
          NoidaStay
        </div>
        
        <nav className="space-y-1 flex-1">
          <Link href="/dashboard/student" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm">
            <Home size={18} /> Overview
          </Link>
          <Link href="/dashboard/agreement" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl font-medium text-sm transition-colors">
            <FileText size={18} /> Agreements
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl font-medium text-sm transition-colors">
            <CreditCard size={18} /> Payments
          </Link>
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-50">
          <UserTrustCard user={profile} showScore={false} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Student Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back, {profile?.full_name?.split(' ')[0] || 'Student'}</p>
          </div>
          
          {profile?.kyc_status !== 'verified' && (
            <Link href="/verify" className="bg-amber-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-amber-200 hover:bg-amber-600 transition-all text-sm">
              <ShieldCheck size={18} /> Complete KYC Verification
            </Link>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: My Stay & Documents */}
          <div className="lg:col-span-2 space-y-8">
            {/* My Stay */}
            <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Home className="text-blue-500" size={20} /> My Current Stay
                </h2>
                {booking ? (
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {booking.status}
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-gray-50 text-gray-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                    No Active Booking
                  </span>
                )}
              </div>

              {booking ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Property</p>
                    <p className="font-bold text-gray-900">{booking.propertyName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Room No.</p>
                    <p className="font-bold text-gray-900">{booking.roomNo}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Move-in Date</p>
                    <p className="font-bold text-gray-900">{booking.moveInDate}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                  <p className="text-gray-400 text-sm">Ready to move in? Explore verified PGs nearby.</p>
                  <Link href="/search" className="mt-4 inline-block text-blue-600 font-bold text-sm hover:underline">Browse Listings →</Link>
                </div>
              )}
            </section>

            {/* Documents */}
            <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FileText className="text-blue-500" size={20} /> Legal Documents
              </h2>
              
              <div className="space-y-4">
                {agreements.length > 0 ? agreements.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-blue-200 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <FileText size={18} className="text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">Rent Agreement - {new Date(doc.signed_at).toLocaleDateString()}</p>
                        <p className="text-[10px] text-gray-400 font-mono uppercase tracking-tighter">HASH: {doc.document_hash.substring(0, 16)}...</p>
                      </div>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                      <Download size={20} />
                    </button>
                  </div>
                )) : (
                  <p className="text-center py-6 text-gray-400 text-xs italic">No signed agreements found.</p>
                )}
              </div>
            </section>
          </div>

          {/* Right Column: Trust Meter & Payments */}
          <div className="space-y-8">
            {/* Trust Meter Card */}
            <div className="bg-gray-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-black text-lg">Trust Score</h2>
                  <TrendingUp className="text-emerald-400" size={20} />
                </div>
                
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-5xl font-black">{profile?.kyc_status === 'verified' ? '95' : '45'}%</span>
                  <span className="text-xs text-gray-400 mb-2 uppercase font-bold tracking-widest">Strength</span>
                </div>
                
                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden mb-6">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: profile?.kyc_status === 'verified' ? '95%' : '45%' }}
                    className="h-full bg-emerald-500"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                    <CheckCircle2 size={12} /> Email Verified
                  </div>
                  <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${profile?.kyc_status === 'verified' ? 'text-emerald-400' : 'text-gray-500'}`}>
                    {profile?.kyc_status === 'verified' ? <CheckCircle2 size={12} /> : <Clock size={12} />} ID Verification
                  </div>
                </div>
              </div>
              
              {/* Decorative SVG background */}
              <div className="absolute top-0 right-0 -mr-20 -mt-20 opacity-10">
                <ShieldCheck size={200} />
              </div>
            </div>

            {/* Payment History */}
            <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <CreditCard className="text-blue-500" size={20} /> Payment History
              </h2>

              <div className="space-y-6">
                {transactions.length > 0 ? transactions.map((tx) => (
                  <div key={tx.id} className="flex justify-between items-start border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-gray-900 capitalize">{tx.type.replace('_', ' ')}</p>
                      <p className="text-[10px] text-gray-400">{new Date(tx.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-gray-900">₹{tx.amount}</p>
                      <span className={`text-[9px] font-black uppercase tracking-widest ${
                        tx.status === 'escrow_held' ? 'text-blue-500' : 
                        tx.status === 'released' ? 'text-emerald-500' : 'text-gray-400'
                      }`}>
                        {tx.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                )) : (
                  <p className="text-center py-6 text-gray-400 text-xs italic">No transactions yet.</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
