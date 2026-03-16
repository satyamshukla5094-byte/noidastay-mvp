"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Zap, Flame, ShieldAlert } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface LiveActivityTrackerProps {
  propertyId: string;
  remainingRooms?: number;
}

export default function LiveActivityTracker({ propertyId, remainingRooms }: LiveActivityTrackerProps) {
  const [viewers, setViewers] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initialize Realtime Presence for this listing
    const channel = supabase.channel(`listing:${propertyId}`, {
      config: {
        presence: {
          key: propertyId,
        },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const count = Object.keys(state).length;
        // Mocking higher activity for urgency in MVP, min 2 viewers
        setViewers(Math.max(count, Math.floor(Math.random() * 3) + 2));
        setLoading(false);
      })
      .on("presence", { event: "join" }, ({ newPresences }) => {
        console.log("New student viewing:", newPresences);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [propertyId]);

  return (
    <div className="fixed bottom-24 left-4 right-4 z-40 pointer-events-none md:bottom-10 md:left-auto md:right-10 md:max-w-xs">
      <AnimatePresence>
        {/* Scarcity Badge */}
        {remainingRooms && remainingRooms <= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 bg-red-600 text-white px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 border-2 border-white pointer-events-auto"
          >
            <ShieldAlert size={16} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">Only {remainingRooms} Rooms Left in this PG!</span>
          </motion.div>
        )}

        {/* Live Viewer Pulse */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/90 backdrop-blur-xl p-4 rounded-3xl shadow-2xl border border-slate-100 flex items-center gap-4 pointer-events-auto shadow-blue-100/50"
        >
          {loading ? (
            <div className="flex items-center gap-3 w-full animate-pulse">
              <div className="w-10 h-10 bg-slate-100 rounded-full" />
              <div className="h-3 bg-slate-100 rounded w-24" />
            </div>
          ) : (
            <>
              <div className="relative">
                <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center">
                  <Flame className="text-orange-500" size={20} />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-ping" />
              </div>
              <div>
                <p className="text-slate-900 font-black text-sm flex items-center gap-1">
                  {viewers} students 
                  <Users size={14} className="text-blue-500" />
                </p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Viewing this room right now</p>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
