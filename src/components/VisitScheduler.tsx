"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, Clock, CheckCircle2, AlertCircle, 
  Loader2, ArrowRight, ShieldCheck, MapPin 
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface VisitSchedulerProps {
  propertyId: string;
  ownerId: string;
  propertyTitle: string;
  studentId: string;
}

export default function VisitScheduler({ propertyId, ownerId, propertyTitle, studentId }: VisitSchedulerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const scheduledAt = new Date(`${date}T${time}`);
      
      // 1. Create Visit Record
      const { data: visit, error: visitError } = await supabase
        .from("visits")
        .insert({
          student_id: studentId,
          property_id: propertyId,
          owner_id: ownerId,
          scheduled_at: scheduledAt.toISOString(),
          status: "requested"
        })
        .select()
        .single();

      if (visitError) throw visitError;

      // 2. Trigger WhatsApp Notifications
      await fetch("/api/notify/visit-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitId: visit.id,
          studentId,
          ownerId,
          propertyTitle,
          scheduledAt: scheduledAt.toISOString(),
          type: "NEW_REQUEST"
        }),
      });

      setStatus("success");
    } catch (err) {
      console.error(err);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-100"
      >
        <Calendar size={20} /> Schedule a Visit
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60]"
              onClick={() => setIsOpen(false)}
            />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] z-[70] p-8 max-w-2xl mx-auto shadow-2xl"
            >
              {status === "idle" ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="text-center space-y-2 mb-8">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                      <Clock className="text-blue-600" size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900">Choose Visit Time</h2>
                    <p className="text-slate-500 text-sm">Owner visits are allowed between 9 AM - 7 PM</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Date</label>
                      <input 
                        type="date" 
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold"
                        onChange={(e) => setDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Time</label>
                      <select 
                        required
                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold"
                        onChange={(e) => setTime(e.target.value)}
                      >
                        <option value="">Choose slot</option>
                        {["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-3">
                    <ShieldCheck className="text-emerald-600 shrink-0" size={20} />
                    <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                      As a <b>Verified Student</b>, your request is prioritized. Owners usually respond within 30 minutes.
                    </p>
                  </div>

                  <button 
                    disabled={loading || !date || !time}
                    className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <>Request Visit <ArrowRight size={20}/></>}
                  </button>
                </form>
              ) : status === "success" ? (
                <div className="text-center py-10 space-y-6">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="text-emerald-600" size={40} />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-slate-900">Visit Requested!</h2>
                    <p className="text-slate-500">We've sent a WhatsApp to the owner. You'll get a notification once confirmed.</p>
                  </div>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="w-full bg-slate-100 text-slate-900 py-4 rounded-2xl font-bold"
                  >
                    Got it
                  </button>
                </div>
              ) : (
                <div className="text-center py-10 space-y-6">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="text-red-600" size={40} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900">Something went wrong</h2>
                  <button onClick={() => setStatus("idle")} className="text-blue-600 font-bold">Try again</button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
