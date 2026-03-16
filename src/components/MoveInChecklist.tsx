"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Camera, CheckCircle2, AlertCircle, Loader2, 
  ShieldCheck, ArrowRight, Trash2, Info,
  Fan, Wind, Bed, DoorOpen, Lightbulb
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import imageCompression from "browser-image-compression";
import { QRCodeSVG } from "qrcode.react";

interface AuditItem {
  name: string;
  icon: React.ReactNode;
}

const CHECKLIST_ITEMS: AuditItem[] = [
  { name: "Ceiling Fan", icon: <Fan size={20} /> },
  { name: "Air Conditioner", icon: <Wind size={20} /> },
  { name: "Bed & Mattress", icon: <Bed size={20} /> },
  { name: "Wardrobe", icon: <DoorOpen size={20} /> },
  { name: "Lights & Switches", icon: <Lightbulb size={20} /> },
];

export default function MoveInChecklist({ bookingId, studentId }: { bookingId: string, studentId: string }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [audits, setAudits] = useState<Record<string, { condition: string, photo: File | null, preview: string }>>({});
  const [loading, setLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isDisputed, setIsDisputed] = useState(false);

  const currentItem = CHECKLIST_ITEMS[currentStep];

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1280,
        useWebWorker: true
      };
      const compressedFile = await imageCompression(file, options);
      
      setAudits(prev => ({
        ...prev,
        [currentItem.name]: {
          condition: "Working",
          photo: compressedFile,
          preview: URL.createObjectURL(compressedFile)
        }
      }));
    } catch (err) {
      console.error("Compression error:", err);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      // 1. Upload all evidence to kyc-vault
      for (const item of CHECKLIST_ITEMS) {
        const audit = audits[item.name];
        if (audit?.photo) {
          const path = `${studentId}/audit/${bookingId}/${item.name.replace(/\s+/g, '_')}.jpg`;
          const { error: uploadError } = await supabase.storage
            .from("kyc-vault")
            .upload(path, audit.photo, { upsert: true });

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage.from("kyc-vault").getPublicUrl(path);
            
            // 2. Create room_audit record
            await supabase.from("room_audits").insert({
              booking_id: bookingId,
              item_name: item.name,
              condition: audit.condition,
              photo_url: publicUrl,
              verified_by_student: true,
              audit_type: 'move_in'
            });
          }
        }
      }

      // 3. Finalize move-in status
      await supabase.from("legal_agreements").update({ 
        move_in_date: new Date().toISOString(),
        handover_confirmed: true 
      }).eq("id", bookingId);

      setIsFinished(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDispute = async () => {
    setIsDisputed(true);
    try {
      await supabase.from("legal_agreements").update({ is_disputed: true }).eq("id", bookingId);
      // Trigger WhatsApp notification to Admin (Satyam)
      console.log("ALERT: Move-in Dispute registered for booking " + bookingId);
    } catch (err) {
      console.error(err);
    }
  };

  if (isFinished) return (
    <div className="text-center space-y-8 p-10 bg-white rounded-[3rem] shadow-2xl border border-slate-100 max-w-md mx-auto">
      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle2 className="text-emerald-600" size={40} />
      </div>
      <div>
        <h2 className="text-2xl font-black text-slate-900">Move-In Successful!</h2>
        <p className="text-slate-500 text-sm mt-2 font-medium">Show this QR code to the owner to receive your keys.</p>
      </div>
      
      <div className="p-6 bg-slate-50 rounded-[2rem] border-2 border-slate-100 inline-block mx-auto shadow-inner">
        <QRCodeSVG value={`confirm-handover:${bookingId}`} size={200} />
      </div>

      <div className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
        <ShieldCheck size={12} className="text-emerald-500" />
        Verified Move-In Protocol
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col min-h-[600px]">
      <div className="bg-slate-900 p-8 text-white">
        <div className="flex items-center gap-2 text-blue-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-4">
          <ShieldCheck size={14} />
          Digital Audit Active
        </div>
        <h1 className="text-2xl font-black tracking-tight">Room Checklist</h1>
        <p className="text-slate-400 text-xs mt-1 font-medium">Step {currentStep + 1} of {CHECKLIST_ITEMS.length}</p>
      </div>

      <div className="p-8 flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentItem.name}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 space-y-8"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                {currentItem.icon}
              </div>
              <h3 className="text-xl font-black text-slate-900">{currentItem.name}</h3>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Photo Evidence</label>
              {!audits[currentItem.name]?.preview ? (
                <label className="aspect-[4/3] bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-slate-100 transition-all group">
                  <div className="p-4 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                    <Camera className="text-blue-500" size={24} />
                  </div>
                  <span className="text-xs font-bold text-slate-400">Capture Condition</span>
                  <input type="file" className="hidden" accept="image/*" capture="environment" onChange={handlePhotoCapture} />
                </label>
              ) : (
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-lg group">
                  <img src={audits[currentItem.name].preview} className="w-full h-full object-cover" alt="Audit Evidence" />
                  <button 
                    onClick={() => setAudits(prev => ({ ...prev, [currentItem.name]: { ...prev[currentItem.name], preview: '', photo: null } }))}
                    className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Condition</label>
              <div className="grid grid-cols-2 gap-3">
                {['Working', 'Damaged', 'Dirty', 'Missing'].map((status) => (
                  <button 
                    key={status}
                    onClick={() => setAudits(prev => ({ ...prev, [currentItem.name]: { ...prev[currentItem.name], condition: status } }))}
                    className={`py-3 rounded-2xl text-xs font-bold border transition-all ${
                      audits[currentItem.name]?.condition === status 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-lg' 
                      : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-10 space-y-4">
          <div className="flex gap-3">
            {currentStep > 0 && (
              <button 
                onClick={() => setCurrentStep(s => s - 1)}
                className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm"
              >
                Previous
              </button>
            )}
            {currentStep < CHECKLIST_ITEMS.length - 1 ? (
              <button 
                disabled={!audits[currentItem.name]?.preview}
                onClick={() => setCurrentStep(s => s + 1)}
                className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                Next Item <ArrowRight size={18} />
              </button>
            ) : (
              <button 
                disabled={loading || !audits[currentItem.name]?.preview}
                onClick={handleFinish}
                className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-100 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={18} /> Complete Move-In</>}
              </button>
            )}
          </div>

          <button 
            onClick={handleDispute}
            className="w-full py-3 text-[10px] font-black text-red-400 uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:text-red-500 transition-colors"
          >
            <AlertCircle size={14} /> Report Room Discrepancy
          </button>
        </div>
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-100">
        <div className="flex gap-1.5 justify-center">
          {CHECKLIST_ITEMS.map((_, i) => (
            <div key={i} className={`h-1 rounded-full transition-all ${i === currentStep ? 'w-8 bg-blue-500' : 'w-2 bg-slate-200'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
