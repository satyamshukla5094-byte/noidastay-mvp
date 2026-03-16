"use client";

import { useEffect, useMemo, useState } from "react";
import { MOCK_PROPERTIES } from "@/lib/mockData";
import { Inbox, MapPin, Phone } from "lucide-react";
import { supabase } from "@/lib/supabase";

type LocalInquiry = {
  propertyId: string;
  method: "whatsapp" | "view_phone";
  at: string;
  accepted?: boolean;
};

export default function InquiriesPage() {
  const [localInquiries, setLocalInquiries] = useState<LocalInquiry[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem("noidastay_inquiries");
      const parsed = stored ? (JSON.parse(stored) as LocalInquiry[]) : [];
      setLocalInquiries(parsed.sort((a, b) => b.at.localeCompare(a.at)));
    } catch {
      setLocalInquiries([]);
    }
  }, []);

  const setAccepted = (idx: number) => {
    setLocalInquiries((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], accepted: true };
      if (typeof window !== "undefined") {
        window.localStorage.setItem("noidastay_inquiries", JSON.stringify(next));
      }
      return next;
    });
  };

  const propertiesById = useMemo(() => {
    const map = new Map<string, (typeof MOCK_PROPERTIES)[number]>();
    for (const p of MOCK_PROPERTIES) {
      map.set(p.id, p);
    }
    return map;
  }, []);

  // Best-effort Supabase sync: this will no-op if placeholder keys are used.
  useEffect(() => {
    const syncToSupabase = async () => {
      if (!localInquiries.length) return;
      try {
        const uniquePropertyIds = Array.from(new Set(localInquiries.map((i) => i.propertyId)));
        await supabase
          .from("leads")
          .select("id")
          .in("property_id", uniquePropertyIds)
          .limit(1);
      } catch {
        // ignore for local dev
      }
    };
    syncToSupabase();
  }, [localInquiries]);

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Inbox className="h-7 w-7 text-emerald-600" />
            My Inquiries
          </h1>
          <p className="text-gray-500 mt-1">
            A personal trail of PGs where you viewed the number or contacted the owner.
          </p>
        </div>
      </div>

      {localInquiries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-1">
            <Phone className="h-7 w-7 text-emerald-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">No inquiries yet</h2>
          <p className="text-gray-500 max-w-md">
            When you tap &quot;Show Number&quot; or &quot;Contact via WhatsApp&quot;, those PGs will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100">
          {localInquiries.map((inq, index) => {
            const property = propertiesById.get(inq.propertyId);
            return (
              <div key={`${inq.propertyId}-${inq.at}-${index}`} className="p-6 flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-400">{new Date(inq.at).toLocaleString()}</p>
                  <h3 className="text-lg font-semibold text-gray-900 mt-1">
                    {property?.title || "Unknown PG"}
                  </h3>
                  <div className="mt-1 flex items-center text-sm text-gray-500 gap-1.5">
                    <MapPin className="h-4 w-4 text-emerald-600/80" />
                    <span>
                      {property?.sector || "Unknown Sector"} {property?.distanceInfo && `• ${property.distanceInfo}`}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-end justify-start sm:justify-end gap-2">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${inq.method === "view_phone" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"}`}>
                    {inq.method === "view_phone" ? "Viewed Number" : "Contacted on WhatsApp"}
                  </span>
                  {inq.accepted ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-600 text-white">✓ Owner Accepted</span>
                  ) : (
                    <button onClick={() => setAccepted(index)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-700 text-white hover:bg-slate-600 transition">Accept Inquiry</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

