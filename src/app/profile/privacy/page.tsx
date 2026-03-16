"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

type ConsentRecord = {
  id: string;
  consent_type: string;
  status: string;
  timestamp: string;
  ip_address: string | null;
  details: any;
};

export default function PrivacyPage() {
  const [records, setRecords] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      setUserId(data.user.id);
      const res = await fetch(`/api/privacy/consent?userId=${data.user.id}`);
      const json = await res.json();
      if (json.success) {
        setRecords(json.records || []);
      }
      setLoading(false);
    };
    load();
  }, []);

  const withdrawConsent = async (type: string) => {
    if (!userId) return;
    await fetch("/api/privacy/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, consentType: type, status: "Withdrawn" }),
    });
    const res = await fetch(`/api/privacy/consent?userId=${userId}`);
    const json = await res.json();
    if (json.success) setRecords(json.records || []);
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-3xl shadow-lg p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-blue-500 font-semibold">Trust Center</p>
            <h1 className="text-2xl font-bold text-slate-900">Privacy Dashboard</h1>
            <p className="mt-1 text-sm text-slate-600">View your explicit consents and withdraw anytime.</p>
          </div>
          <Link href="/terms" className="text-xs text-blue-600 underline">Full Privacy Policy</Link>
        </div>

        <div className="mt-4 border border-slate-200 rounded-2xl bg-slate-50 p-3">
          <p className="text-sm text-slate-700">DPDP requires clear tracking of explicit consent for processing. Under each record, you can withdraw consent for future processing.</p>
        </div>

        {loading ? (
          <div className="mt-4 text-sm text-slate-500">Loading...</div>
        ) : records.length === 0 ? (
          <div className="mt-4 text-sm text-slate-500">No consent records yet. Please complete KYC to generate consent logs.</div>
        ) : (
          <div className="mt-4 space-y-3">
            {records.map((record) => (
              <div key={record.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{record.consent_type}</div>
                    <div className="text-xs text-slate-500">{new Date(record.timestamp).toLocaleString()}</div>
                  </div>
                  <span className={`text-xs font-semibold ${record.status === "Granted" ? "text-emerald-700 bg-emerald-100" : "text-red-700 bg-red-100"} px-2 py-1 rounded-full`}>
                    {record.status}
                  </span>
                </div>
                <div className="mt-2 text-xs text-slate-600">IP: {record.ip_address || "unknown"}</div>
                <div className="mt-2 flex items-center gap-2">
                  <button onClick={() => withdrawConsent(record.consent_type)} className="text-xs rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-red-700 hover:bg-red-100">Withdraw {record.consent_type}</button>
                  <span className="text-xs text-slate-500">Details: {JSON.stringify(record.details || {}, null, 0)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
