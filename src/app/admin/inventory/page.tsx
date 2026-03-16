"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Globe, Search, Database, Loader2, CheckCircle, 
  AlertCircle, ExternalLink, Terminal, ShieldCheck,
  Server, Zap
} from "lucide-react";

export default function InventoryScraper() {
  const [url, setUrl] = useState("");
  const [parentGuestRoom, setParentGuestRoom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<{ msg: string; type: "info" | "success" | "error"; time: string }[]>([]);
  const [lastResult, setLastResult] = useState<any>(null);

  const addLog = (msg: string, type: "info" | "success" | "error" = "info") => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [{ msg, type, time }, ...prev].slice(0, 50));
  };

  const handleRunScraper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    addLog(`Initiating scrape for: ${url}`, "info");

    try {
      const response = await fetch("/api/admin/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, parentGuestRoom }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Scraper engine failed");
      }

      setLastResult(data.record);
      addLog(`Success: ${data.record.title} ${data.mode} in Knowledge Park database`, "success");
      setUrl("");
    } catch (err: any) {
      addLog(`Error: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-[0.2em]">
              <Server size={14} strokeWidth={3} />
              Content Engine v2.0
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Inventory Command Center</h1>
            <p className="text-slate-500 font-medium">Automated Property Acquisition for Greater Noida Market</p>
          </div>
          
          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
            <div className="px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Engine: Online</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Control Panel */}
          <div className="lg:col-span-7 space-y-8">
            <section className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
              <form onSubmit={handleRunScraper} className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Globe size={16} className="text-blue-500" />
                    Target Source URL
                  </label>
                  <div className="relative group">
                    <input
                      type="url"
                      required
                      placeholder="https://example-pg-directory.com/listing/kp-2"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-slate-900 font-medium placeholder:text-slate-400"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                    />
                    <Search className="absolute left-4 top-4.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={parentGuestRoom}
                        onChange={(e) => setParentGuestRoom(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-blue-600 transition-colors shadow-inner" />
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition-transform shadow-sm" />
                    </div>
                    <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Parent Guest Room Available</span>
                  </label>
                  <div className="h-4 w-px bg-slate-200" />
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <Zap size={14} className="text-amber-500" /> Auto-Categorize: Active
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-black transition-all shadow-2xl shadow-slate-900/20 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={24} strokeWidth={3} />
                      Executing Scraper Protocol...
                    </>
                  ) : (
                    <>
                      <Database size={24} />
                      Run Content Engine
                    </>
                  )}
                </button>
              </form>
            </section>

            {/* Live Log */}
            <section className="bg-slate-900 p-8 rounded-[2rem] shadow-2xl border border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Terminal size={120} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-white font-black text-lg flex items-center gap-2">
                    <Terminal className="text-emerald-400" size={20} />
                    Live Status Log
                  </h2>
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500/50" />
                    <div className="w-2 h-2 rounded-full bg-amber-500/50" />
                    <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                  </div>
                </div>
                
                <div className="space-y-3 h-64 overflow-y-auto font-mono scrollbar-hide">
                  <AnimatePresence initial={false}>
                    {logs.length > 0 ? logs.map((log, i) => (
                      <motion.div
                        key={i + log.time}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`text-xs flex items-start gap-3 p-2 rounded-lg ${
                          log.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                          log.type === 'error' ? 'bg-red-500/10 text-red-400' : 'text-slate-400'
                        }`}
                      >
                        <span className="opacity-40 shrink-0">[{log.time}]</span>
                        <span className="font-medium break-all">{log.msg}</span>
                      </motion.div>
                    )) : (
                      <div className="flex items-center justify-center h-full text-slate-600 italic text-sm">
                        Awaiting commands...
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </section>
          </div>

          {/* Result Card */}
          <div className="lg:col-span-5 space-y-8">
            <section className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 flex flex-col h-full">
              <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <CheckCircle className="text-emerald-500" size={24} />
                Last Acquisition
              </h2>
              
              <div className="flex-1">
                {lastResult ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                  >
                    <div className="aspect-video bg-slate-100 rounded-3xl overflow-hidden shadow-inner relative group">
                      <img 
                        src={lastResult.images?.[0] || 'https://images.unsplash.com/photo-1554995207-c18c203602cb'} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        alt="Scraped Property"
                      />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase text-slate-900 shadow-sm border border-slate-200">
                        {lastResult.category}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-2xl font-black text-slate-900">{lastResult.title}</h3>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
                          <ShieldCheck size={12} /> {lastResult.sector}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="space-y-1">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Base Price</p>
                          <p className="text-2xl font-black text-blue-600">₹{lastResult.price.toLocaleString()}</p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Status</p>
                          <p className="text-sm font-black text-emerald-600">ACTIVE</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {lastResult.amenities?.slice(0, 4).map((a: string, i: number) => (
                          <span key={i} className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase">
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <a 
                      href={lastResult.scraped_url} 
                      target="_blank" 
                      className="w-full bg-slate-50 text-slate-500 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition-all text-sm mt-auto border border-slate-100"
                    >
                      Inspect Source Listing <ExternalLink size={14} />
                    </a>
                  </motion.div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30 py-20">
                    <Database size={64} />
                    <p className="font-bold text-slate-400 max-w-[200px]">No active sync results to display.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
