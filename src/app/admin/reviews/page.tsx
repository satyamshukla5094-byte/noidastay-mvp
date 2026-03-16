"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Star, MessageSquare, ShieldCheck, Flag, 
  CheckCircle2, XCircle, Loader2, Search,
  Filter, Eye, Trash2
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminReviewModeration() {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "flagged">("all");

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  async function fetchReviews() {
    setLoading(true);
    let query = supabase
      .from("reviews")
      .select("*, profiles(full_name), properties(title)")
      .order("created_at", { ascending: false });

    if (filter === "flagged") {
      query = query.eq("is_flagged", true);
    }

    const { data } = await query;
    if (data) setReviews(data);
    setLoading(false);
  }

  const handleAction = async (id: string, action: "approve" | "delete" | "clear_flag") => {
    try {
      if (action === "delete") {
        await supabase.from("reviews").delete().eq("id", id);
      } else if (action === "clear_flag") {
        await supabase.from("reviews").update({ is_flagged: false }).eq("id", id);
      }
      fetchReviews();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
      <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
      <p className="font-mono text-xs uppercase tracking-widest opacity-50">Syncing Feedback Vault...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-4 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-blue-500 font-black text-xs uppercase tracking-[0.2em] mb-2">
              <ShieldCheck size={14} />
              Quality Control Engine
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">Review Moderation</h1>
          </div>

          <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
            <button 
              onClick={() => setFilter("all")}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === "all" ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
              All Feedback
            </button>
            <button 
              onClick={() => setFilter("flagged")}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === "flagged" ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Flagged Only
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6">
          {reviews.length > 0 ? reviews.map((review) => (
            <motion.div 
              key={review.id}
              layout
              className={`bg-slate-900/50 p-8 rounded-[2.5rem] border ${review.is_flagged ? 'border-red-500/30 bg-red-500/5' : 'border-slate-800'} backdrop-blur-xl group hover:border-slate-700 transition-all`}
            >
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-blue-400 font-black">
                      {review.profiles?.full_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-bold text-white">{review.profiles?.full_name}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        Resident at {review.properties?.title}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={12} className={s <= review.rating ? "fill-amber-400 text-amber-400" : "text-slate-800"} />
                    ))}
                  </div>

                  <p className="text-sm text-slate-400 leading-relaxed italic font-medium">"{review.comment}"</p>

                  {review.photos?.length > 0 && (
                    <div className="flex gap-2">
                      {review.photos.map((url: string, i: number) => (
                        <div key={i} className="w-16 h-16 rounded-xl overflow-hidden border border-slate-800 shadow-inner">
                          <img src={url} className="w-full h-full object-cover" alt="" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex md:flex-col justify-end gap-3 shrink-0">
                  {review.is_flagged ? (
                    <button 
                      onClick={() => handleAction(review.id, "clear_flag")}
                      className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                    >
                      <CheckCircle2 size={20} />
                    </button>
                  ) : null}
                  <button 
                    onClick={() => handleAction(review.id, "delete")}
                    className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          )) : (
            <div className="text-center py-24 bg-slate-900/20 rounded-[3rem] border-2 border-dashed border-slate-800">
              <MessageSquare className="mx-auto text-slate-800 mb-4" size={48} />
              <p className="text-slate-500 font-medium italic">No reviews found in this sector.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
