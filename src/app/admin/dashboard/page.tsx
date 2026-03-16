"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Building, CreditCard, Clock, 
  ShieldCheck, AlertCircle, TrendingUp, 
  Activity, ArrowUpRight, Search, 
  CheckCircle2, XCircle, MoreVertical,
  Zap, Database, Globe
} from "lucide-react";
import { supabase } from "@/lib/supabase";

import FinancialsTab from "@/components/admin/FinancialsTab";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "kyc" | "escrow" | "financials">("overview");
  const [stats, setStats] = useState({
    verifiedStudents: 0,
    escrowBalance: 0,
    activeListings: 0,
    pendingVisits: 0
  });
  const [kycQueue, setKycQueue] = useState<any[]>([]);
  const [escrowList, setEscrowList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [health, setHealth] = useState({
    db: "green",
    scraper: "green",
    payments: "green"
  });

  useEffect(() => {
    async function loadAdminData() {
      const [
        studentsRes, 
        escrowRes, 
        listingsRes, 
        visitsRes,
        kycQueueRes,
        escrowListRes,
        auditLogsRes
      ] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact" }).eq("kyc_status", "verified"),
        supabase.from("transactions").select("amount").eq("status", "escrow_held"),
        supabase.from("properties").select("id", { count: "exact" }).eq("visibility_status", "public"),
        supabase.from("visits").select("id", { count: "exact" }).eq("status", "requested"),
        supabase.from("profiles").select("*").eq("kyc_status", "pending").order("updated_at", { ascending: false }),
        supabase.from("transactions").select("*, profiles(full_name)").eq("status", "escrow_held").order("created_at", { ascending: false }),
        supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(10)
      ]);

      const totalEscrow = escrowRes.data?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;

      setStats({
        verifiedStudents: studentsRes.count || 0,
        escrowBalance: totalEscrow,
        activeListings: listingsRes.count || 0,
        pendingVisits: visitsRes.count || 0
      });

      setKycQueue(kycQueueRes.data || []);
      setEscrowList(escrowListRes.data || []);
      setAuditLogs(auditLogsRes.data || []);
      setLoading(false);
    }

    loadAdminData();

    // Real-time subscriptions
    const auditSub = supabase
      .channel("admin-audit-logs")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "audit_logs" }, (payload) => {
        setAuditLogs(prev => [payload.new, ...prev].slice(0, 10));
      })
      .subscribe();

    const txSub = supabase
      .channel("admin-tx-updates")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "transactions" }, (payload) => {
        // Refresh stats/lists if needed
      })
      .subscribe();

    return () => {
      supabase.removeChannel(auditSub);
      supabase.removeChannel(txSub);
    };
  }, []);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
      <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
      <p className="font-mono text-xs uppercase tracking-[0.3em] opacity-50">Initializing God View...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-4 md:p-8 lg:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header & Health */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-blue-500 font-black text-xs uppercase tracking-[0.2em] mb-2">
              <ShieldCheck size={14} />
              NoidaStay Command Center
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">Marketplace Overview</h1>
          </div>

          <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 backdrop-blur-xl">
            <button 
              onClick={() => setActiveTab("overview")}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "overview" ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab("financials")}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "financials" ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Financials
            </button>
          </div>
        </header>

        {activeTab === "overview" ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <StatCard label="Verified Students" value={stats.verifiedStudents} icon={<Users className="text-blue-400" />} />
              <StatCard label="Escrow Balance" value={`₹${stats.escrowBalance.toLocaleString()}`} icon={<CreditCard className="text-emerald-400" />} />
              <StatCard label="Active Listings" value={stats.activeListings} icon={<Building className="text-amber-400" />} />
              <StatCard label="Pending Visits" value={stats.pendingVisits} icon={<Clock className="text-purple-400" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* KYC Queue */}
              <section className="lg:col-span-8 space-y-8">
                <div className="bg-slate-900/50 rounded-[2.5rem] border border-slate-800 overflow-hidden backdrop-blur-xl">
                  <div className="p-8 border-b border-slate-800 flex items-center justify-between">
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                      <ShieldCheck className="text-blue-500" />
                      KYC Approval Queue
                    </h2>
                    <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {kycQueue.length} Pending
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">
                          <th className="p-6">Student</th>
                          <th className="p-6">Document</th>
                          <th className="p-6">Extracted Data</th>
                          <th className="p-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {kycQueue.length > 0 ? kycQueue.map((student) => (
                          <tr key={student.id} className="group hover:bg-slate-800/30 transition-colors">
                            <td className="p-6">
                              <div className="font-bold text-white">{student.full_name}</div>
                              <div className="text-xs text-slate-500">{student.email}</div>
                            </td>
                            <td className="p-6">
                              <div className="text-xs font-mono text-slate-400">{student.masked_id}</div>
                            </td>
                            <td className="p-6 text-xs text-slate-400 max-w-xs truncate">
                              {student.permanent_address}
                            </td>
                            <td className="p-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all">
                                  <CheckCircle2 size={18} />
                                </button>
                                <button className="p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                                  <XCircle size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={4} className="p-12 text-center text-slate-600 italic text-sm">
                              Queue is empty. All students verified.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Escrow Controller */}
                <div className="bg-slate-900/50 rounded-[2.5rem] border border-slate-800 overflow-hidden backdrop-blur-xl">
                  <div className="p-8 border-b border-slate-800 flex items-center justify-between">
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                      <CreditCard className="text-emerald-500" />
                      Escrow Controller
                    </h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">
                          <th className="p-6">Transaction</th>
                          <th className="p-6">Student</th>
                          <th className="p-6 text-right">Amount</th>
                          <th className="p-6 text-right">Escrow Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {escrowList.length > 0 ? escrowList.map((tx) => (
                          <tr key={tx.id}>
                            <td className="p-6">
                              <div className="font-bold text-slate-300">ORD-{tx.razorpay_order_id?.slice(-6).toUpperCase()}</div>
                              <div className="text-[10px] text-slate-500">{new Date(tx.created_at).toLocaleDateString()}</div>
                            </td>
                            <td className="p-6 font-medium text-slate-400">{tx.profiles?.full_name}</td>
                            <td className="p-6 text-right font-black text-white">₹{tx.amount}</td>
                            <td className="p-6 text-right">
                              <button className="text-xs font-black bg-emerald-600 text-white px-4 py-2 rounded-xl shadow-lg shadow-emerald-900/20 hover:bg-emerald-500 transition-all">
                                Release Funds
                              </button>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={4} className="p-12 text-center text-slate-600 italic text-sm">
                              No funds currently held in escrow.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              {/* Real-time Security Feed */}
              <aside className="lg:col-span-4 space-y-8">
                <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 relative overflow-hidden h-full">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-white font-black text-lg flex items-center gap-2">
                      <Activity className="text-red-500" size={20} />
                      Live Security Feed
                    </h2>
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  </div>

                  <div className="space-y-6 relative z-10">
                    <AnimatePresence initial={false}>
                      {auditLogs.map((log, i) => (
                        <motion.div 
                          key={log.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex gap-4 group"
                        >
                          <div className="w-px bg-slate-800 absolute left-2 top-0 bottom-0 -z-10 group-last:hidden" />
                          <div className="w-4 h-4 rounded-full bg-slate-800 border-4 border-[#020617] relative z-10 mt-1" />
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{log.action_type}</p>
                              <span className="text-[10px] text-slate-600 font-mono">{new Date(log.created_at).toLocaleTimeString()}</span>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed font-medium">
                              {log.details?.msg || `User performed ${log.action_type.toLowerCase().replace('_', ' ')} protocol.`}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Grid Background */}
                  <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                </div>
              </aside>
            </div>
          </>
        ) : (
          <FinancialsTab />
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string, value: any, icon: React.ReactNode }) {
  return (
    <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-slate-800 shadow-xl backdrop-blur-xl">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-slate-800 rounded-2xl">
          {icon}
        </div>
        <TrendingUp className="text-emerald-500/50" size={16} />
      </div>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <div className="text-3xl font-black text-white">{value}</div>
    </div>
  );
}

function HealthIndicator({ label, status }: { label: string, status: string }) {
  const color = status === 'green' ? 'bg-emerald-500' : status === 'yellow' ? 'bg-amber-500' : 'bg-red-500';
  const glow = status === 'green' ? 'shadow-emerald-500/20' : status === 'yellow' ? 'shadow-amber-500/20' : 'shadow-red-500/20';
  
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${color} shadow-lg ${glow} animate-pulse`} />
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
    </div>
  );
}

const Loader2 = ({ className, size }: { className?: string, size?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
