"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, Building, TrendingUp, CheckCircle2, 
  XCircle, Clock, Search, MoreVertical, 
  LayoutGrid, List, Loader2, ArrowUpRight
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import UserTrustCard from "@/components/UserTrustCard";

export default function OwnerDashboard() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalLeads: 0,
    occupancy: 0,
    revenueHeld: 0
  });

  useEffect(() => {
    async function loadOwnerData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [profileRes, propertiesRes, leadsRes, txRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("properties").select("*").eq("owner_id", user.id),
        supabase.from("leads").select("*, profiles(*)").order("created_at", { ascending: false }),
        supabase.from("transactions").select("amount").eq("status", "escrow_held")
      ]);

      setProfile(profileRes.data);
      setProperties(propertiesRes.data || []);
      setLeads(leadsRes.data || []);
      
      const totalRevenue = txRes.data?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;
      setStats({
        totalLeads: leadsRes.data?.length || 0,
        occupancy: 78, // Mock occupancy percentage
        revenueHeld: totalRevenue
      });

      setLoading(false);
    }

    loadOwnerData();

    // Realtime subscription for leads and transactions
    const leadSubscription = supabase
      .channel("owner-lead-updates")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "leads" }, (payload) => {
        // In a real app, we'd fetch the profile too
        console.log("New lead received!", payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(leadSubscription);
    };
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <Loader2 className="animate-spin text-emerald-600 mb-4" size={40} />
      <p className="text-gray-500 font-medium">Syncing Owner Insights...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Simplified for Owner */}
      <aside className="w-64 bg-white border-r border-gray-100 hidden lg:flex flex-col p-6">
        <div className="flex items-center gap-2 font-black text-xl mb-10 text-emerald-600">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white text-sm">NS</div>
          NoidaStay
        </div>
        
        <nav className="space-y-1 flex-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-sm">
            <Building size={18} /> My Properties
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl font-medium text-sm transition-colors">
            <Users size={18} /> Lead Manager
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl font-medium text-sm transition-colors">
            <TrendingUp size={18} /> Revenue
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-black text-gray-900">Owner Dashboard</h1>
          <p className="text-gray-500 mt-1">Managing {properties.length} properties in Greater Noida</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Total Leads</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-black text-gray-900">{stats.totalLeads}</span>
              <span className="text-emerald-500 text-xs font-bold mb-1">+12%</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Occupancy Rate</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-black text-gray-900">{stats.occupancy}%</span>
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full mb-2 ml-2">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stats.occupancy}%` }} />
              </div>
            </div>
          </div>
          <div className="bg-emerald-600 p-6 rounded-3xl shadow-xl shadow-emerald-100 text-white">
            <p className="text-[10px] text-emerald-200 font-black uppercase tracking-widest mb-1">Escrow Balance</p>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-black">₹{stats.revenueHeld.toLocaleString()}</span>
              <ArrowUpRight size={24} className="text-emerald-300" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          {/* Lead Manager */}
          <section className="xl:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Recent Inquiries</h2>
              <div className="flex bg-white border border-gray-100 rounded-lg p-1">
                <button className="p-1.5 bg-gray-50 rounded-md text-gray-600"><List size={16} /></button>
                <button className="p-1.5 text-gray-400"><LayoutGrid size={16} /></button>
              </div>
            </div>

            <div className="space-y-4">
              {leads.length > 0 ? leads.map((lead) => (
                <div key={lead.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6 group hover:border-emerald-200 transition-all">
                  <div className="w-full md:w-48 shrink-0">
                    <UserTrustCard user={lead.profiles} showScore={false} />
                  </div>
                  
                  <div className="flex-1 space-y-2 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Inquiry For:</span>
                      <span className="text-sm font-bold text-gray-900">Knowledge Park Elite PG</span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">Interested in a double sharing room from August 1st. KYC verification completed.</p>
                    <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                        <Clock size={12} /> 2 hours ago
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full md:w-auto">
                    <button className="flex-1 md:flex-none p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors">
                      <CheckCircle2 size={20} />
                    </button>
                    <button className="flex-1 md:flex-none p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors">
                      <XCircle size={20} />
                    </button>
                    <button className="p-3 text-gray-300 hover:text-gray-500">
                      <MoreVertical size={20} />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                  <p className="text-gray-400 italic">No active leads found for your properties.</p>
                </div>
              )}
            </div>
          </section>

          {/* Occupancy Tracker */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Occupancy Status</h2>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="grid grid-cols-4 gap-3">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`aspect-square rounded-xl flex items-center justify-center text-[10px] font-black transition-all cursor-pointer ${
                      i % 3 === 0 
                      ? 'bg-gray-50 text-gray-300 border border-gray-100' 
                      : i % 5 === 0 
                      ? 'bg-amber-50 text-amber-500 border border-amber-100 animate-pulse'
                      : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}
                  >
                    {101 + i}
                  </div>
                ))}
              </div>
              
              <div className="mt-8 space-y-3 pt-6 border-t border-gray-50">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Occupied</span>
                  <span className="text-gray-900">12 Rooms</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gray-200" /> Vacant</span>
                  <span className="text-gray-900">4 Rooms</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-amber-500">
                  <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500" /> Pending Audit</span>
                  <span className="text-gray-900">1 Room</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-600 p-6 rounded-3xl shadow-xl shadow-blue-100 text-white">
              <h4 className="font-bold text-sm mb-2">Need More Leads?</h4>
              <p className="text-[10px] text-blue-100 leading-relaxed mb-4">Promote your property to 5,000+ verified students in Greater Noida.</p>
              <button className="w-full bg-white text-blue-600 py-2 rounded-xl text-xs font-black uppercase tracking-widest">Boost Listing</button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
