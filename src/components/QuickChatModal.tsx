"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, User, ShieldCheck, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface QuickChatModalProps {
  propertyId: string;
  ownerId: string;
  studentId: string;
  propertyTitle: string;
  onClose: () => void;
}

const COMMON_QUESTIONS = [
  "Is the food quality good?",
  "What are the gate timings?",
  "Is there a power backup?",
  "Are laundry services included?",
];

export default function QuickChatModal({ 
  propertyId, 
  ownerId, 
  studentId, 
  propertyTitle, 
  onClose 
}: QuickChatModalProps) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleStartChat = async (content: string) => {
    setLoading(true);
    try {
      // 1. Check/Create Conversation
      const { data: conv, error: convError } = await supabase
        .from("conversations")
        .upsert({
          student_id: studentId,
          owner_id: ownerId,
          listing_id: propertyId,
          last_message: content,
          updated_at: new Date().toISOString(),
        }, { onConflict: "student_id, owner_id, listing_id" })
        .select()
        .single();

      if (convError) throw convError;

      // 2. Send First Message
      const { error: msgError } = await supabase
        .from("messages")
        .insert({
          conversation_id: conv.id,
          sender_id: studentId,
          content: content,
        });

      if (msgError) throw msgError;

      // 3. Redirect to Chat Page
      router.push(`/chat/${conv.id}`);
    } catch (err) {
      console.error("Chat Start Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end md:items-center justify-center p-4"
    >
      <motion.div 
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        className="bg-white w-full max-w-lg rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <MessageCircle size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm">Inquiry for {propertyTitle}</h3>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Direct to Owner</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Common Questions</p>
            <div className="flex flex-wrap gap-2">
              {COMMON_QUESTIONS.map((q) => (
                <button 
                  key={q}
                  onClick={() => handleStartChat(q)}
                  className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-all text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <textarea 
              rows={3}
              placeholder="Type your own question..."
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium text-sm"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button 
              disabled={loading || !message.trim()}
              onClick={() => handleStartChat(message)}
              className="absolute bottom-3 right-3 p-3 bg-slate-900 text-white rounded-xl shadow-lg hover:bg-black transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <ShieldCheck size={12} className="text-emerald-500" />
            NoidaStay Secure Inquiry System
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
