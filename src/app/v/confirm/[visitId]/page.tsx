"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, MapPin, Calendar, Clock, Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ConfirmVisitPage() {
  const params = useParams();
  const visitId = params?.visitId as string;
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [visit, setVisit] = useState<any>(null);
  const [status, setStatus] = useState<"idle" | "confirmed" | "error">("idle");

  useEffect(() => {
    async function fetchVisit() {
      const { data, error } = await supabase
        .from("visits")
        .select("*, properties(title, sector), profiles!visits_student_id_fkey(full_name)")
        .eq("id", visitId)
        .single();

      if (data) setVisit(data);
      setLoading(false);
    }
    if (visitId) fetchVisit();
  }, [visitId]);

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      // 1. Update visit status
      const { error } = await supabase
        .from("visits")
        .update({ status: "confirmed", updated_at: new Date().toISOString() })
        .eq("id", visitId);

      if (error) throw error;

      // 2. Trigger confirmation WhatsApp notification
      await fetch("/api/notify/visit-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitId,
          studentId: visit.student_id,
          ownerId: visit.owner_id,
          propertyTitle: visit.properties.title,
          scheduledAt: visit.scheduled_at,
          type: "VISIT_CONFIRMED"
        }),
      });

      setStatus("confirmed");
    } catch (err) {
      console.error(err);
      setStatus("error");
    } finally {
      setConfirming(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
        <div className="bg-slate-900 p-8 text-white text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
            <Calendar className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-black">Confirm Visit</h1>
          <p className="text-slate-400 text-sm mt-1">NoidaStay Quick Action</p>
        </div>

        <div className="p-8 space-y-6">
          {status === "idle" ? (
            <>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <ShieldCheck className="text-emerald-500" size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Verified Student</p>
                    <p className="font-bold text-slate-900">{visit?.profiles?.full_name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <MapPin className="text-blue-500" size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Property</p>
                    <p className="font-bold text-slate-900">{visit?.properties?.title}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <Clock className="text-amber-500" size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Scheduled Time</p>
                    <p className="font-bold text-slate-900">{new Date(visit?.scheduled_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleConfirm}
                disabled={confirming}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-emerald-100 transition-all disabled:opacity-50"
              >
                {confirming ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={24} />}
                Confirm Visit
              </button>
            </>
          ) : status === "confirmed" ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="text-emerald-600" size={48} />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Visit Confirmed!</h2>
              <p className="text-slate-500">The student has been notified via WhatsApp with the property location.</p>
            </div>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
                <ShieldCheck size={48} />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Something went wrong</h2>
              <p className="text-slate-500">Please try again or contact NoidaStay support.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
