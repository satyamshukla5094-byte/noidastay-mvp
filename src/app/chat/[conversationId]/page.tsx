"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Camera, ShieldCheck, ArrowLeft, 
  Loader2, Image as ImageIcon, Check, CheckCheck,
  User, MessageCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ChatPage() {
  const { conversationId } = useParams();
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [conversation, setConversation] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Safety filter logic
  const containsSensitiveInfo = (text: string) => {
    const phoneRegex = /(\d{10})|(\d{3}-\d{3}-\d{4})/;
    const linkRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/;
    return phoneRegex.test(text) || linkRegex.test(text);
  };

  useEffect(() => {
    async function loadChat() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [convRes, messagesRes, profileRes] = await Promise.all([
        supabase.from("conversations").select("*, student:profiles!student_id(full_name, kyc_status, role), owner:profiles!owner_id(full_name, kyc_status, role), properties(title)").eq("id", conversationId).single(),
        supabase.from("messages").select("*").eq("conversation_id", conversationId).order("created_at", { ascending: true }),
        supabase.from("profiles").select("*").eq("id", user.id).single()
      ]);

      if (convRes.data) setConversation(convRes.data);
      if (messagesRes.data) setMessages(messagesRes.data);
      if (profileRes.data) setProfile(profileRes.data);
      setLoading(false);
    }

    loadChat();

    // Realtime subscription
    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on("postgres_changes", { 
        event: "INSERT", 
        schema: "public", 
        table: "messages", 
        filter: `conversation_id=eq.${conversationId}` 
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !profile) return;

    if (containsSensitiveInfo(newMessage)) {
      alert("NoidaStay Safety: Sharing phone numbers or external links is restricted until a visit is scheduled.");
      return;
    }

    const content = newMessage;
    setNewMessage("");

    try {
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: profile.id,
        content: content,
      });

      await supabase.from("conversations").update({
        last_message: content,
        updated_at: new Date().toISOString()
      }).eq("id", conversationId);

    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setUploading(true);
    try {
      const path = `${profile.id}/chat/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("chat-media").upload(path, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("chat-media").getPublicUrl(path);

      await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: profile.id,
        content: "Shared a photo",
        image_url: publicUrl
      });
    } catch (err) {
      console.error("Image upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
      <p className="text-slate-500 font-medium animate-pulse">Establishing Secure Channel...</p>
    </div>
  );

  const otherUser = profile?.role === "student" ? conversation?.owner : conversation?.student;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-2xl mx-auto border-x border-slate-100">
      {/* Header */}
      <header className="bg-white p-4 border-b border-slate-100 flex items-center gap-4 sticky top-0 z-50">
        <button onClick={() => router.back()} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div className="flex-1 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
            <User className="text-blue-500" size={20} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-slate-900 leading-none">{otherUser?.full_name}</h3>
              {otherUser?.kyc_status === 'verified' && (
                <ShieldCheck size={14} className="text-emerald-500" />
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
              {conversation?.properties?.title}
            </p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-center py-10">
          <div className="inline-flex flex-col items-center gap-2 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <MessageCircle className="text-blue-500" size={32} />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Inquiry Session Started</p>
            <p className="text-[10px] text-slate-400 max-w-[200px] text-center italic">
              NoidaStay Filter is active. Contact sharing restricted before visit confirmation.
            </p>
          </div>
        </div>

        {messages.map((msg) => {
          const isMe = msg.sender_id === profile?.id;
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                isMe ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-white text-slate-900 rounded-tl-none border border-slate-100'
              }`}>
                {msg.image_url ? (
                  <img src={msg.image_url} alt="Shared" className="rounded-xl mb-2 max-h-64 object-cover" />
                ) : (
                  <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                )}
                <div className={`flex items-center gap-1 mt-1.5 justify-end ${isMe ? 'text-slate-400' : 'text-slate-400'}`}>
                  <span className="text-[9px] font-bold">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {isMe && (msg.is_read ? <CheckCheck size={12} className="text-blue-400" /> : <Check size={12} />)}
                </div>
              </div>
            </motion.div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <footer className="p-4 bg-white border-t border-slate-100 sticky bottom-0">
        <form onSubmit={handleSendMessage} className="flex items-end gap-3">
          <label className="p-3 bg-slate-50 text-slate-400 hover:text-blue-500 rounded-2xl cursor-pointer transition-colors shrink-0 border-2 border-slate-100">
            {uploading ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} />}
            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
          </label>
          
          <div className="flex-1 bg-slate-50 rounded-2xl border-2 border-slate-100 focus-within:border-blue-500 transition-all p-1 flex items-end">
            <textarea
              rows={1}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 bg-transparent border-none outline-none p-3 text-sm font-medium resize-none max-h-32"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <button 
              type="submit"
              disabled={!newMessage.trim()}
              className="p-3 bg-slate-900 text-white rounded-xl shadow-lg hover:bg-black transition-all disabled:opacity-50 mb-1 mr-1"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
}
