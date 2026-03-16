"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { CheckCircle2, Inbox, ShieldCheck, Bell, RotateCcw } from "lucide-react";

type Property = {
  id: string;
  owner_id?: string;
  title?: string;
  price?: number;
  sector?: string;
  is_verified?: boolean;
  images?: string[];
  created_at?: string;
};

export default function AdminPendingListings() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<number>(0);
  const [auditFeed, setAuditFeed] = useState<any[]>([]);
  const [feedError, setFeedError] = useState<string | null>(null);

  const fetchPending = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("properties")
      .select("id, title, price, sector, is_verified, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) {
      setError(error.message);
      setProperties([]);
    } else {
      setError(null);
      setProperties(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPending();
    const channel = supabase
      .channel("properties-updates")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "properties" }, fetchPending)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "properties" }, fetchPending)
      .subscribe();

    const loadAuditFeed = async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("id, user_id, action_type, document_id, timestamp")
        .order("timestamp", { ascending: false })
        .limit(20);
      if (error) {
        setFeedError(error.message);
      } else {
        setAuditFeed(data || []);
      }
    };
    loadAuditFeed();

    const feedChannel = supabase
      .channel("audit-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "audit_logs" }, (payload) => {
        setAuditFeed((prev) => [payload.new, ...prev].slice(0, 20));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(feedChannel);
    };
  }, []);

  const triggerSync = async () => {
    setSyncing(true);
    setSyncProgress(10);
    setActionMessage(null);

    try {
      const response = await fetch("/api/sync", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: "https://example.com" }) });
      setSyncProgress(60);
      const data = await response.json();
      setSyncProgress(100);

      if (!response.ok) {
        throw new Error(data?.error || "Sync API failed");
      }
      setActionMessage(`Sync done: found ${data.found || 0}, updated ${data.updated || 0}, inserted ${data.inserted || 0}`);
      fetchPending();
    } catch (err: any) {
      setActionMessage(`Sync failed: ${err?.message || "unknown"}`);
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncProgress(0), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto rounded-3xl border border-white/10 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-xl shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/20 px-3 py-1 text-xs text-violet-200"><ShieldCheck className="h-3.5 w-3.5" /> Admin Verify</div>
            <h1 className="mt-2 text-3xl font-bold text-white">Sync & Verify Center</h1>
            <p className="text-slate-300 mt-1">Automated PG sync from external sources and one-click approval.</p>
          </div>
          <button disabled={syncing} onClick={triggerSync} className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70">
            {syncing ? <RotateCcw className="h-4 w-4 animate-spin" /> : <Inbox className="h-4 w-4" />} Sync from External Source
          </button>
        </div>

        <div className="mt-3 rounded-xl border border-white/10 bg-slate-900/50 p-3">
          {syncProgress > 0 && <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-slate-700"><div style={{ width: `${syncProgress}%` }} className="h-full rounded-full bg-emerald-400 transition-all duration-300" /></div>}
          {actionMessage && <div className="rounded-lg bg-emerald-500/20 border border-emerald-400/30 px-3 py-2 text-emerald-200 text-sm">{actionMessage}</div>}
          {error && <div className="rounded-lg bg-rose-500/20 border border-rose-400/30 px-3 py-2 text-rose-200 text-sm">{error}</div>}

          {loading ? (
            <div className="py-10 text-center text-slate-300">Loading properties...</div>
          ) : properties.length === 0 ? (
            <div className="text-center py-10 text-slate-300">No listings yet.</div>
          ) : (
            <div className="overflow-x-auto mt-3">
              <table className="min-w-full text-left text-sm text-slate-200">
                <thead className="border-b border-slate-700 text-xs uppercase tracking-wide text-slate-300">
                  <tr>
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">Title</th>
                    <th className="px-3 py-2">Sector</th>
                    <th className="px-3 py-2">Price</th>
                    <th className="px-3 py-2">Verified</th>
                    <th className="px-3 py-2">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map((item, index) => (
                    <tr key={item.id} className="border-b border-slate-700/40 hover:bg-slate-800/40">
                      <td className="px-3 py-2">{index + 1}</td>
                      <td className="px-3 py-2">{item.title || "Untitled"}</td>
                      <td className="px-3 py-2">{item.sector || "Alpha"}</td>
                      <td className="px-3 py-2">₹{item.price ?? "0"}</td>
                      <td className="px-3 py-2 text-emerald-300">{item.is_verified ? "Yes" : "No"}</td>
                      <td className="px-3 py-2">{item.created_at ? new Date(item.created_at).toLocaleDateString() : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-4 rounded-xl border border-red-300 bg-red-900/10 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-700 font-semibold"><Bell className="h-4 w-4" /> Security Feed (Real-time)</div>
            <span className="rounded-full bg-yellow-200 px-2 py-1 text-xs font-semibold text-yellow-900">System Health: Protected</span>
          </div>
          {feedError && <div className="mt-2 text-xs text-red-400">{feedError}</div>}
          <ul className="mt-2 space-y-2 text-xs text-slate-100">
            {auditFeed.length === 0 ? (
              <li className="rounded-lg border border-red-200/30 bg-red-900/30 px-2 py-1">No security events yet.</li>
            ) : auditFeed.map((log) => (
              <li key={log.id} className="rounded-lg border border-red-200/30 bg-red-900/20 px-2 py-1">
                <div className="font-medium text-red-200">{log.action_type}</div>
                <div className="text-[11px] text-slate-200">User {log.user_id} accessed doc {log.document_id} at {new Date(log.timestamp).toLocaleTimeString()}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-3 text-xs text-slate-300 inline-flex items-center gap-2"><Bell className="h-3.5 w-3.5 text-slate-300" /> Real-time admin dashboard for synced inventory.</div>
      </div>
    </div>
  );
}
