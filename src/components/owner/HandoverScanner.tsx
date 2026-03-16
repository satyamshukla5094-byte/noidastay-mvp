"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, QrCode, Loader2, ShieldCheck, User, Home } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function OwnerHandoverScanner() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);

  const handleManualScan = async (bookingId: string) => {
    setLoading(true);
    try {
      // 1. Verify the booking and handover status
      const { data, error } = await supabase
        .from("legal_agreements")
        .select("*, profiles!legal_agreements_student_id_fkey(full_name)")
        .eq("id", bookingId)
        .single();

      if (error) throw error;
      setBookingData(data);

      // 2. Finalize handover
      const { error: updateError } = await supabase
        .from("legal_agreements")
        .update({ 
          handover_confirmed: true,
          status: "active", // Finalize booking status
          updated_at: new Date().toISOString()
        })
        .eq("id", bookingId);

      if (updateError) throw updateError;

      // 3. Log Audit Trail
      await supabase.from("audit_logs").insert({
        user_id: data.owner_id,
        action_type: "KEY_HANDOVER_COMPLETE",
        details: { booking_id: bookingId, student_name: data.profiles.full_name }
      });

      setResult("success");
    } catch (err) {
      console.error(err);
      setResult("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
      <div className="bg-slate-900 p-8 text-white text-center">
        <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <QrCode size={32} />
        </div>
        <h1 className="text-2xl font-black">Key Handover</h1>
        <p className="text-slate-400 text-sm mt-1">Scan student Move-In QR code</p>
      </div>

      <div className="p-8 space-y-6">
        {result === "success" ? (
          <div className="text-center space-y-4 py-6">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="text-emerald-600" size={48} />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Handover Complete!</h2>
            <div className="p-4 bg-slate-50 rounded-2xl text-left space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
                <span>Student</span>
                <span className="text-slate-900">{bookingData?.profiles?.full_name}</span>
              </div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
                <span>Status</span>
                <span className="text-emerald-600 font-black">STAY ACTIVE</span>
              </div>
            </div>
            <p className="text-slate-500 text-sm">Security deposit is now protected in escrow.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="aspect-square bg-slate-100 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 text-slate-400">
              <div className="animate-pulse flex flex-col items-center">
                <QrCode size={64} className="mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest text-center px-10">Camera initializing...</p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                <span className="bg-white px-4 italic">Or manual confirmation</span>
              </div>
            </div>

            <button 
              onClick={() => {
                const id = prompt("Enter Booking ID (from QR):");
                if (id) handleManualScan(id);
              }}
              disabled={loading}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 transition-all hover:bg-black disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Confirm via Booking ID"}
            </button>
          </div>
        )}
      </div>

      <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
        <ShieldCheck size={12} className="text-emerald-500" />
        Anti-Fraud Handover Protocol
      </div>
    </div>
  );
}
