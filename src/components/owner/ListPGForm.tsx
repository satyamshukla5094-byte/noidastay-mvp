"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building, MapPin, Bed, Users, Camera, 
  ChevronRight, ChevronLeft, CheckCircle2, 
  Info, Loader2, Plus, Trash2, ShieldCheck
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ListPGForm({ ownerId }: { ownerId: string }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    address: "",
    sector: "Knowledge Park 2",
    description: "",
    price: "",
    inventory: {
      single: { available: false, price: "" },
      double: { available: false, price: "" },
      triple: { available: false, price: "" },
    },
    parentGuestRoom: {
      available: false,
      price: "",
      maxDays: "3"
    },
    images: [] as File[],
    previews: [] as string[]
  });

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files],
      previews: [...prev.previews, ...newPreviews]
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // 1. Upload Images
      const uploadedUrls = [];
      for (const file of formData.images) {
        const path = `${ownerId}/properties/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("property-images")
          .upload(path, file);
        
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from("property-images").getPublicUrl(path);
          uploadedUrls.push(publicUrl);
        }
      }

      // 2. Insert Property (Hidden by default)
      const { data: property, error: propError } = await supabase
        .from("properties")
        .insert({
          owner_id: ownerId,
          title: formData.title,
          description: formData.description,
          price: parseInt(formData.price),
          sector: formData.sector,
          images: uploadedUrls,
          visibility_status: "hidden",
          parent_guest_room_available: formData.parentGuestRoom.available,
          parent_guest_room_price: formData.parentGuestRoom.price ? parseInt(formData.parentGuestRoom.price) : null,
          inventory_config: formData.inventory,
          is_verified: false
        })
        .select()
        .single();

      if (propError) throw propError;

      // 3. Create initial verification record
      await supabase.from("property_verifications").insert({
        property_id: property.id,
        status: "pending"
      });

      router.push("/owner/my-properties?new=true");
    } catch (err) {
      console.error(err);
      alert("Failed to list property. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
      {/* Progress Bar */}
      <div className="h-2 bg-slate-100 flex">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`flex-1 transition-colors duration-500 ${step >= i ? 'bg-blue-600' : 'bg-transparent'}`} />
        ))}
      </div>

      <div className="p-10">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-900">Basic Details</h2>
                <p className="text-slate-500 text-sm">Tell us about your PG's identity.</p>
              </div>
              <div className="space-y-4">
                <input 
                  type="text" placeholder="Property Name (e.g. Royal PG)" 
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500"
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                />
                <input 
                  type="text" placeholder="Exact Address" 
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500"
                  value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                />
                <select 
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-medium"
                  value={formData.sector} onChange={e => setFormData({...formData, sector: e.target.value})}
                >
                  <option>Knowledge Park 2</option>
                  <option>Knowledge Park 3</option>
                  <option>Pari Chowk</option>
                  <option>Alpha 1</option>
                </select>
                <textarea 
                  placeholder="Describe your PG features..." rows={4}
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500"
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <button onClick={handleNext} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-2">
                Next Step <ChevronRight size={20} />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-900">Inventory & Pricing</h2>
                <p className="text-slate-500 text-sm">Define your room types and monthly rent.</p>
              </div>
              <div className="space-y-4">
                {['single', 'double', 'triple'].map((type) => (
                  <div key={type} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border-2 border-slate-100">
                    <div className="flex-1">
                      <p className="text-sm font-black text-slate-700 capitalize">{type} Seater</p>
                    </div>
                    <input 
                      type="number" placeholder="₹ Rent" 
                      className="w-32 p-2 rounded-xl border-2 border-slate-200 outline-none focus:border-blue-500 text-sm font-bold"
                      onChange={e => setFormData({
                        ...formData, 
                        inventory: { ...formData.inventory, [type]: { available: true, price: e.target.value } }
                      })}
                    />
                  </div>
                ))}
                <div className="pt-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Base Starting Price</label>
                  <input 
                    type="number" placeholder="₹ Lowest price shown to students" 
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-black text-xl text-blue-600"
                    value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={handleBack} className="flex-1 bg-slate-100 text-slate-600 py-5 rounded-2xl font-black flex items-center justify-center gap-2">
                  <ChevronLeft size={20} /> Back
                </button>
                <button onClick={handleNext} className="flex-[2] bg-slate-900 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-2">
                  Next Step <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-900">Parent Guest Room</h2>
                <p className="text-slate-500 text-sm">Special feature for visiting parents.</p>
              </div>
              <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100 space-y-6">
                <div className="flex items-center justify-between">
                  <label className="text-lg font-bold text-blue-900">Enable this feature?</label>
                  <div className="relative">
                    <input 
                      type="checkbox" className="sr-only peer" 
                      checked={formData.parentGuestRoom.available}
                      onChange={e => setFormData({...formData, parentGuestRoom: {...formData.parentGuestRoom, available: e.target.checked}})}
                    />
                    <div className="w-14 h-7 bg-slate-200 rounded-full peer peer-checked:bg-blue-600 transition-colors" />
                    <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full peer-checked:translate-x-7 transition-transform" />
                  </div>
                </div>
                {formData.parentGuestRoom.available && (
                  <div className="space-y-4 pt-4 border-t border-blue-100">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-blue-400 uppercase tracking-widest">Price per night</label>
                      <input 
                        type="number" placeholder="₹ 500" 
                        className="w-full p-4 bg-white border-2 border-blue-100 rounded-2xl outline-none focus:border-blue-500 font-bold"
                        value={formData.parentGuestRoom.price} onChange={e => setFormData({...formData, parentGuestRoom: {...formData.parentGuestRoom, price: e.target.value}})}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-4">
                <button onClick={handleBack} className="flex-1 bg-slate-100 text-slate-600 py-5 rounded-2xl font-black flex items-center justify-center gap-2">
                  <ChevronLeft size={20} /> Back
                </button>
                <button onClick={handleNext} className="flex-[2] bg-slate-900 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-2">
                  Next Step <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-900">Property Media</h2>
                <p className="text-slate-500 text-sm">Upload real photos. Verified listings need real proof.</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {formData.previews.map((src, i) => (
                  <div key={i} className="aspect-video bg-slate-100 rounded-2xl overflow-hidden relative group">
                    <img src={src} className="w-full h-full object-cover" alt="Preview" />
                    <button className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <label className="aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-100 transition-colors">
                  <Plus className="text-slate-400" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Add Photos</span>
                  <input type="file" multiple className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-3">
                <ShieldCheck className="text-emerald-600 shrink-0" size={20} />
                <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                  Your listing will be reviewed by Satyam within 24 hours. High-quality photos increase trust scores by 40%.
                </p>
              </div>

              <div className="flex gap-4">
                <button onClick={handleBack} className="flex-1 bg-slate-100 text-slate-600 py-5 rounded-2xl font-black flex items-center justify-center gap-2">
                  <ChevronLeft size={20} /> Back
                </button>
                <button 
                  onClick={handleSubmit} 
                  disabled={loading}
                  className="flex-[2] bg-blue-600 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl shadow-blue-100"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={20} /> Finalize & List PG</>}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
