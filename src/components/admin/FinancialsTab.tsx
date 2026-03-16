"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, ArrowUpRight, DollarSign, 
  Clock, CheckCircle2, FileText, Loader2,
  PieChart, BarChart3, Receipt
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function FinancialsTab() {
  const [loading, setLoading] = useState(true);
  const [ledger, setLedger] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingPayouts: 0,
    taxReserve: 0,
    netProfit: 0
  });

  useEffect(() => {
    async function loadFinancialData() {
      const { data: ledgerData, error } = await supabase
        .from("revenue_ledger")
        .select(`
          *,
          transactions (
            *,
            profiles (full_name, bank_details)
          )
        `)
        .order("created_at", { ascending: false });

      if (ledgerData) {
        setLedger(ledgerData);
        
        const totalGross = ledgerData.reduce((sum, item) => sum + Number(item.amount_gross), 0);
        const totalTax = ledgerData.reduce((sum, item) => sum + Number(item.tax_amount), 0);
        const totalNet = ledgerData.reduce((sum, item) => sum + Number(item.amount_net), 0);
        const pendingCount = ledgerData.filter(item => item.payout_status === 'pending').length;

        setStats({
          totalRevenue: totalGross,
          pendingPayouts: pendingCount,
          taxReserve: totalTax,
          netProfit: totalNet
        });
      }
      setLoading(false);
    }

    loadFinancialData();
  }, []);

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Brokerage Revenue (INR)',
        data: [12000, 19000, 15000, 25000, 22000, 30000],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const handlePayout = async (id: string) => {
    try {
      const { error } = await supabase
        .from("revenue_ledger")
        .update({ payout_status: 'processed', updated_at: new Date().toISOString() })
        .eq("id", id);
      
      if (!error) {
        setLedger(prev => prev.map(item => item.id === id ? { ...item, payout_status: 'processed' } : item));
        setStats(prev => ({ ...prev, pendingPayouts: prev.pendingPayouts - 1 }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="flex items-center justify-center p-20"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="space-y-10">
      {/* Financial Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FinStatCard label="Total Revenue (Gross)" value={`₹${stats.totalRevenue.toLocaleString()}`} icon={<DollarSign className="text-emerald-400" />} />
        <FinStatCard label="Tax Reserve (18% GST)" value={`₹${stats.taxReserve.toLocaleString()}`} icon={<PieChart className="text-amber-400" />} />
        <FinStatCard label="Net Realized Profit" value={`₹${stats.netProfit.toLocaleString()}`} icon={<TrendingUp className="text-blue-400" />} trend="+14%" />
        <FinStatCard label="Pending Payouts" value={stats.pendingPayouts} icon={<Clock className="text-purple-400" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-8 bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-800 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <BarChart3 className="text-blue-500" />
              Revenue Growth
            </h2>
            <select className="bg-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-1 rounded-lg outline-none border border-slate-700">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-64">
            <Line data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: 'rgba(255,255,255,0.05)' } }, x: { grid: { display: false } } } }} />
          </div>
        </div>

        {/* Tax/Referral Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-800 backdrop-blur-xl h-full">
            <h2 className="text-lg font-black text-white mb-6 flex items-center gap-2">
              <Receipt className="text-amber-500" />
              Tax Calculator
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Gross Brokerage</span>
                <span className="text-white font-bold">₹{stats.totalRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Service GST (18%)</span>
                <span className="text-red-400 font-bold">-₹{stats.taxReserve.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Referral Discounts</span>
                <span className="text-amber-400 font-bold">-₹0.00</span>
              </div>
              <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                <span className="text-xs font-black uppercase text-slate-400">Pure Profit</span>
                <span className="text-2xl font-black text-emerald-400">₹{stats.netProfit.toLocaleString()}</span>
              </div>
            </div>
            <p className="mt-6 text-[10px] text-slate-500 leading-relaxed italic">
              * Calculations based on standard student housing service fees in Uttar Pradesh.
            </p>
          </div>
        </div>
      </div>

      {/* Payout Ledger */}
      <div className="bg-slate-900/50 rounded-[2.5rem] border border-slate-800 overflow-hidden backdrop-blur-xl">
        <div className="p-8 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Clock className="text-purple-500" />
            Payout Ledger
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">
                <th className="p-6">Owner / Beneficiary</th>
                <th className="p-6">Amount (Gross)</th>
                <th className="p-6">Commission</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-400">
              {ledger.map((item) => (
                <tr key={item.id} className="group hover:bg-slate-800/30 transition-colors">
                  <td className="p-6">
                    <div className="font-bold text-white">{item.transactions?.profiles?.full_name}</div>
                    <div className="text-[10px] font-mono text-slate-500">{item.transactions?.profiles?.bank_details?.upi_id || "No UPI ID set"}</div>
                  </td>
                  <td className="p-6 font-bold text-slate-300">₹{item.amount_gross}</td>
                  <td className="p-6 font-bold text-emerald-500">₹{item.amount_net}</td>
                  <td className="p-6">
                    <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${item.payout_status === 'processed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                      {item.payout_status}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    {item.payout_status === 'pending' && (
                      <button 
                        onClick={() => handlePayout(item.id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20"
                      >
                        Release Payout
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FinStatCard({ label, value, icon, trend }: { label: string, value: any, icon: React.ReactNode, trend?: string }) {
  return (
    <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-slate-800 shadow-xl backdrop-blur-xl">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-slate-800 rounded-2xl">
          {icon}
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-[10px] font-black text-emerald-400">
            <ArrowUpRight size={12} />
            {trend}
          </div>
        )}
      </div>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <div className="text-2xl font-black text-white">{value}</div>
    </div>
  );
}
