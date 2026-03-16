"use client";

import { useEffect, useState } from "react";

type LogEntry = {
  id: string;
  user_id: string | null;
  document_path: string;
  action: string;
  accessed_at: string;
  ip_address: string | null;
};

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    fetch("/api/admin/logs")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setLogs(data.logs || []);
      });
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-blue-500 font-semibold">Hidden Audit Console</p>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">Document Access Audit Log</h1>
            <p className="text-sm text-slate-600 mt-1">Government compliance log for DPDP/Aadhaar audits.</p>
          </div>
          <span className="text-xs font-semibold bg-slate-100 border border-slate-200 px-2 py-1 rounded-full">Read-only</span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-700 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-3 py-2">When</th>
                <th className="px-3 py-2">User</th>
                <th className="px-3 py-2">Doc Path</th>
                <th className="px-3 py-2">Action</th>
                <th className="px-3 py-2">IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-slate-100 even:bg-slate-50">
                  <td className="px-3 py-2 text-xs text-slate-600">{new Date(log.accessed_at).toLocaleString()}</td>
                  <td className="px-3 py-2 text-xs text-slate-700">{log.user_id || "anonymous"}</td>
                  <td className="px-3 py-2 text-xs text-slate-700">{log.document_path}</td>
                  <td className="px-3 py-2 text-xs text-slate-700">{log.action}</td>
                  <td className="px-3 py-2 text-xs text-slate-700">{log.ip_address || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && <p className="p-4 text-sm text-slate-500">No logs yet.</p>}
        </div>
      </div>
    </main>
  );
}
