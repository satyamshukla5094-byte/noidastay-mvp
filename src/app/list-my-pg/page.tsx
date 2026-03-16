"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, CloudUpload, ImagePlus, ShieldCheck, Sparkles, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

const localities = [
  "Alpha",
  "Beta",
  "Gamma",
  "Delta",
  "Knowledge Park I",
  "Knowledge Park II",
  "Knowledge Park III",
  "Pari Chowk",
];

const genders = ["Boys", "Girls", "Coed"];

type Toast = { type: "success" | "error" | "info"; message: string };

export default function ListMyPgPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [gender, setGender] = useState("Boys");
  const [selectedLocalities, setSelectedLocalities] = useState<string[]>([]);
  const [parentGuestRoom, setParentGuestRoom] = useState(false);
  const [verifiedByOwner, setVerifiedByOwner] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const validateStep1 = useMemo(() => {
    return name.trim().length > 2 && Number(price) > 0;
  }, [name, price]);

  const handleLocalityToggle = (locality: string) => {
    setSelectedLocalities((current) =>
      current.includes(locality)
        ? current.filter((l) => l !== locality)
        : [...current, locality]
    );
  };

  const handleImagePick = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const fileArray = Array.from(e.target.files).slice(0, 6);
    setImages(fileArray);
  };

  const showToast = (payload: Toast) => {
    setToast(payload);
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateStep1) {
      showToast({ type: "error", message: "Please complete required fields" });
      return;
    }

    setIsSubmitting(true);
    try {
      const uploadedImageUrls: string[] = [];
      for (const imageFile of images) {
        const filePath = `listings/${Date.now()}-${imageFile.name.replace(/\s+/g, "-")}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("listings-images")
          .upload(filePath, imageFile, { cacheControl: "3600", upsert: false });
        if (uploadError) {
          throw new Error(`Image upload failed: ${uploadError.message}`);
        }
        const publicUrlData = supabase.storage
          .from("listings-images")
          .getPublicUrl(uploadData.path);
        if (!publicUrlData?.data?.publicUrl) {
          throw new Error("Could not get public URL from storage");
        }
        uploadedImageUrls.push(publicUrlData.data.publicUrl);
      }

      const ownerId = process.env.NEXT_PUBLIC_DEFAULT_OWNER_ID || undefined;
      if (!ownerId) {
        throw new Error("Missing default owner ID env var (NEXT_PUBLIC_DEFAULT_OWNER_ID)");
      }

      const importPayload = [{
        owner_id: ownerId,
        title: `${name} - PG listing`,
        description: `${gender} PG in ${selectedLocalities.join(", ")}`,
        price: Number(price),
        lat: 0,
        lng: 0,
        sector: selectedLocalities[0] || "Alpha",
        verified_by_owner: verifiedByOwner,
        images: uploadedImageUrls,
        parent_guest_room: parentGuestRoom,
      }];

      const response = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(importPayload),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Import API failed");
      }

      showToast({ type: "success", message: `Listing synced: ${result.inserted || 0} new, ${result.updated || 0} updated.` });
      setStep(1);
      setName("");
      setPrice("");
      setGender("Boys");
      setSelectedLocalities([]);
      setParentGuestRoom(false);
      setVerifiedByOwner(false);
      setImages([]);
    } catch (err: any) {
      console.error(err);
      showToast({ type: "error", message: err?.message || "Could not submit listing" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-violet-900 text-white p-4 sm:p-8">
      <div className="max-w-3xl mx-auto rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-2xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="rounded-xl bg-violet-500/20 p-2">
            <Sparkles className="h-5 w-5 text-violet-200" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-violet-200">NoidaStay Owner Onboarding</p>
            <h1 className="text-2xl font-bold">List My PG</h1>
            <p className="text-sm text-slate-300">High-scale property intake with instant DB save and upload.</p>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-white/10 bg-slate-900/60 p-3 grid grid-cols-3 gap-2 text-xs">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`rounded-lg py-2 px-3 text-center ${step === i ? "bg-violet-500 text-white" : "bg-white/10 text-slate-300"}`}>
              Step {i}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-200">Owner Name</label>
                <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rahul Sharma" className="mt-1 w-full rounded-xl border border-slate-500 bg-slate-900/80 px-3 py-2 text-white outline-none focus:border-violet-400" />
              </div>
              <div>
                <label className="block text-sm text-slate-200">Monthly Price (INR)</label>
                <input required type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 9000" className="mt-1 w-full rounded-xl border border-slate-500 bg-slate-900/80 px-3 py-2 text-white outline-none focus:border-violet-400" />
              </div>
              <div>
                <label className="block text-sm text-slate-200">Gender</label>
                <div className="mt-1 flex gap-2">
                  {genders.map((item) => (
                    <button type="button" key={item} onClick={() => setGender(item)} className={`rounded-xl px-3 py-2 border ${gender === item ? "bg-violet-500 border-violet-400 text-white" : "bg-slate-800 border-slate-600 text-slate-200"}`}>
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-200">Select Localities</p>
                <p className="text-xs text-slate-300">Pick all that apply for this listing.</p>
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {localities.map((item) => {
                    const selected = selectedLocalities.includes(item);
                    return (
                      <button type="button" key={item} onClick={() => handleLocalityToggle(item)} className={`rounded-xl border px-2 py-2 text-left text-sm ${selected ? "bg-violet-500 border-violet-400 text-white" : "bg-slate-800 border-slate-600 text-slate-200"}`}>
                        {selected ? "✓ " : ""}{item}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="text-sm text-slate-300">Selected: {selectedLocalities.length ? selectedLocalities.join(", ") : "None"}</div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <label className="flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-800/50 px-3 py-2">
                  <input checked={parentGuestRoom} onChange={(e) => setParentGuestRoom(e.target.checked)} type="checkbox" className="h-4 w-4 accent-violet-400" />
                  <span>Parent Guest Room</span>
                </label>
                <label className="flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-800/50 px-3 py-2">
                  <input checked={verifiedByOwner} onChange={(e) => setVerifiedByOwner(e.target.checked)} type="checkbox" className="h-4 w-4 accent-violet-400" />
                  <span>Verified by Owner</span>
                </label>
              </div>
              <div>
                <label className="block text-sm text-slate-200">Upload Listing Photos</label>
                <div className="mt-2 rounded-xl border border-dashed border-slate-500 bg-slate-900/70 p-3">
                  <div className="flex items-center gap-3 text-slate-300">
                    <CloudUpload className="h-4 w-4" />
                    <span>Pick up to 6 images</span>
                  </div>
                  <input type="file" accept="image/*" multiple onChange={handleImagePick} className="mt-2 w-full cursor-pointer text-slate-200" />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {images.map((file) => (
                      <div key={`${file.name}-${file.size}`} className="rounded-md border border-violet-400/30 bg-violet-500/10 px-2 py-1 text-xs text-slate-100">{file.name}</div>
                    ))}
                    {!images.length && <span className="text-xs text-slate-400">No files selected</span>}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 pt-2">
            {step > 1 ? (
              <button type="button" onClick={() => setStep((s) => s - 1)} className="inline-flex items-center gap-2 rounded-xl border border-slate-500 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-100 hover:bg-slate-700">
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
            ) : <div />}

            {step < 3 ? (
              <button type="button" onClick={() => setStep((s) => s + 1)} className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-3 py-2 text-sm font-medium text-white hover:bg-violet-400">
                Continue <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button disabled={isSubmitting} type="submit" className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60">
                {isSubmitting ? "Submitting..." : "Submit Listing"}
                <Check className="h-4 w-4" />
              </button>
            )}
          </div>
        </form>

        <div className="mt-5 rounded-xl border border-violet-300/20 bg-violet-900/20 p-3 text-xs text-slate-200">
          <div className="font-semibold text-violet-100">NoidaStay special</div>
          <div className="mt-1">Parent Guest Room and Verified by Owner flags accelerate trust signal in the admin queue.</div>
        </div>
      </div>

      {toast && (
        <div className={`fixed right-4 bottom-4 z-30 animate-fade-in rounded-xl px-4 py-3 ${toast.type === "success" ? "bg-emerald-600" : toast.type === "error" ? "bg-rose-600" : "bg-sky-500"}`}>
          <div className="flex items-center gap-2 text-white text-sm">
            {toast.type === "success" ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
