"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function SocialProofPopups() {
  const [notification, setNotification] = useState<any>(null);

  useEffect(() => {
    // 1. Initial fetch of recent bookings/verifications
    async function fetchRecentActivity() {
      const { data } = await supabase
        .from("audit_logs")
        .select("*, profiles(full_name)")
        .in("action_type", ["AGREEMENT_SIGNED", "KYC_COMPLETED"])
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (data) {
        showNotification(data);
      }
    }

    // 2. Real-time subscription for new activity
    const channel = supabase
      .channel("social-proof")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "audit_logs" }, (payload) => {
        if (["AGREEMENT_SIGNED", "KYC_COMPLETED"].includes(payload.new.action_type)) {
          showNotification(payload.new);
        }
      })
      .subscribe();

    const timer = setTimeout(fetchRecentActivity, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearTimeout(timer);
    };
  }, []);

  const showNotification = async (log: any) => {
    // Fetch profile name if not included
    let name = log.profiles?.full_name || "A student";
    if (!log.profiles?.full_name) {
      const { data: p } = await supabase.from("profiles").select("full_name").eq("id", log.user_id).single();
      if (p) name = p.full_name;
    }

    const first_name = name.split(' ')[0];
    const action = log.action_type === "AGREEMENT_SIGNED" ? "booked a room" : "verified their identity";
    const time = "just now";

    setNotification({ name: first_name, action, time });
    setTimeout(() => setNotification(null), 6000);
  };

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, x: -50, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed bottom-24 left-4 z-[60] md:bottom-10 md:left-10"
        >
          <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-4 min-w-[280px]">
            <div className="relative">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <Bell size={18} />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
            </div>
            <div>
              <p className="text-xs font-medium">
                <span className="font-black text-blue-400">{notification.name} S.</span> {notification.action}
              </p>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{notification.time}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
