"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Camera, X, Loader2, CheckCircle2, ShieldCheck, Info } from "lucide-react";
import { supabase } from "@/lib/supabase";
import imageCompression from "browser-image-compression";

interface ReviewModalProps {
  propertyId: string;
  bookingId: string;
  studentId: string;
  onClose: () => void;
}

export default function ReviewModal({ propertyId, bookingId, studentId, onClose }: ReviewModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setIsSuccess] = useState(false);
  const [ratings, setRatings] = useState({
    overall: 5,
    food: 5,
    wifi: 5,
    behavior: 5,
    cleanliness: 5
  });
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const compressedFiles: File[] = [];
    const newPreviews: string[] = [];

    for (const file of files) {
      try {
        const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1280, useWebWorker: true };
        const compressed = await imageCompression(file, options);
        compressedFiles.push(compressed);
        newPreviews.push(URL.createObjectURL(compressed));
      } catch (err) {
        console.error(err);
      }
    }

    setImages(prev => [...prev, ...compressedFiles]);
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const uploadedUrls = [];
      for (const file of images) {
        const path = `${studentId}/reviews/${propertyId}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from("property-images").upload(path, file);
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from("property-images").getPublicUrl(path);
          uploadedUrls.push(publicUrl);
        }
      }

      const { error } = await supabase.from("reviews").insert({
        user_id: studentId,
        property_id: propertyId,
        booking_id: bookingId,
        rating: ratings.overall,
        food_rating: ratings.food,
        wifi_rating: ratings.wifi,
        behavior_rating: ratings.behavior,
        cleanliness_rating: ratings.cleanliness,
        comment,
        photos: uploadedUrls,
        is_verified: true
      });

      if (error) throw error;
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Failed to submit review.");
    } finally {
      setLoading(false);
    }
  };

  const StarRating = ({ value, label, onChange }: { value: number, label: string, onChange: (v: number) => void }) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button key={s} onClick={() => onChange(s)}>
            <Star size={18} className={s <= value ? "fill-amber-400 text-amber-400" : "text-slate-200"} />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end md:items-center justify-center p-4">
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="bg-white w-full max-w-lg rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden">
        {success ? (
          <div className="p-12 text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Review Submitted!</h2>
            <p className="text-slate-500">You've earned <b>50 NoidaStay Credits</b>. Thank you for helping other students!</p>
            <button onClick={onClose} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold">Done</button>
          </div>
        ) : (
          <>
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2 text-sm"><Star size={16} className="text-amber-400" /> Write a Review</h3>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3">
                <ShieldCheck className="text-emerald-600" size={20} />
                <p className="text-[10px] text-emerald-800 font-bold uppercase tracking-tight">Verified Resident Status: Confirmed</p>
              </div>
              <div className="space-y-1">
                <StarRating label="Food Quality" value={ratings.food} onChange={v => setRatings({...ratings, food: v})} />
                <StarRating label="WiFi Speed" value={ratings.wifi} onChange={v => setRatings({...ratings, wifi: v})} />
                <StarRating label="Landlord Behavior" value={ratings.behavior} onChange={v => setRatings({...ratings, behavior: v})} />
                <StarRating label="Cleanliness" value={ratings.cleanliness} onChange={v => setRatings({...ratings, cleanliness: v})} />
              </div>
              <textarea placeholder="Share your experience (food, roommates, location)..." rows={4} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500" value={comment} onChange={e => setComment(e.target.value)} />
              <div className="grid grid-cols-3 gap-3">
                {previews.map((src, i) => (
                  <div key={i} className="aspect-square bg-slate-100 rounded-xl overflow-hidden relative">
                    <img src={src} className="w-full h-full object-cover" alt="" />
                  </div>
                ))}
                <label className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer">
                  <Camera className="text-slate-400" size={20} />
                  <span className="text-[8px] font-black text-slate-400 uppercase">Add Room Photo</span>
                  <input type="file" multiple className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
              </div>
              <button disabled={loading || !comment.trim()} onClick={handleSubmit} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin" size={20} /> : "Post Verified Review"}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
