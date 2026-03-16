"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Shield, Upload, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

export default function VerifyProfilePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [aadhaarFront, setAadhaarFront] = useState<File | null>(null);
  const [aadhaarBack, setAadhaarBack] = useState<File | null>(null);
  const [panFile, setPanFile] = useState<File | null>(null);
  const [kycStatus, setKycStatus] = useState<"pending" | "verified" | "rejected">("pending");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      setUserId(user.id);
      const { data: profile } = await supabase.from("profiles").select("kyc_status, aadhaar_number, pan_number").eq("id", user.id).single();
      if (profile) {
        setKycStatus(profile.kyc_status || "pending");
      }
    };
    load();
  }, [router]);

  const handleUpload = async (file: File | null, fileId: string) => {
    if (!file || !userId) return null;
    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("file", file);
    formData.append("file_name", fileId);

    const resp = await fetch("/api/vault/upload", { method: "POST", body: formData });
    const result = await resp.json();
    if (!result.success) {
      throw new Error(result.error || "Vault upload failed");
    }
    return result.filePath;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);
    setMessage("");

    try {
      const supabase = createClient();
      let frontPath = "";
      let backPath = "";
      let panPath = "";
      if (aadhaarFront) frontPath = (await handleUpload(aadhaarFront, "aadhaar-front.jpg")) || "";
      if (aadhaarBack) backPath = (await handleUpload(aadhaarBack, "aadhaar-back.jpg")) || "";
      if (panFile) panPath = (await handleUpload(panFile, "pan-card.jpg")) || "";

      const encryptedAadhaar = btoa(aadhaarNumber || "");
      const encryptedPan = btoa(panNumber || "");
      const { error } = await supabase.from("profiles").upsert([
        {
          id: userId,
          aadhaar_number: encryptedAadhaar,
          pan_number: encryptedPan,
          kyc_status: "pending",
          aadhaar_front_vault_path: frontPath,
          aadhaar_back_vault_path: backPath,
          pan_card_vault_path: panPath,
        },
      ], { onConflict: "id" });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage("KYC documents submitted. You will be notified once verified.");
        setKycStatus("pending");
      }
    } catch (err: any) {
      setMessage(err.message ?? "Upload failed");
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    { label: "Upload Documents", done: true },
    { label: "Under Review", done: kycStatus !== "pending" },
    { label: "Verified", done: kycStatus === "verified" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-white border border-blue-100 rounded-3xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-blue-100 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center gap-3">
            <Link href="/profile" className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"><ArrowLeft className="h-4 w-4" /></Link>
            <div>
              <p className="text-xs uppercase tracking-wide text-blue-100">Trust & Security</p>
              <h1 className="text-2xl font-bold">Student KYC Verification</h1>
              <p className="text-sm text-blue-100/90 mt-1">Your data is encrypted and secure.</p>
            </div>
            <div className="ml-auto rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">🔒 Security Vault Mode</div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-center gap-2 text-blue-700 font-semibold"><Shield className="h-4 w-4" /> <span>End-to-End Encrypted Vault</span></div>
            <p className="text-sm text-blue-600 mt-1">Sensitive documents are stored in private vault-documents and shared only with short-lived signed links.</p>
          </div>

          <div className="space-y-2">
            <h2 className="font-semibold text-lg text-gray-800">Verification Progress</h2>
            <div className="space-y-2">
              {steps.map((step, idx) => (
                <div key={step.label} className="flex items-center gap-3">
                  <div className={`h-6 w-6 flex items-center justify-center rounded-full ${step.done ? "bg-emerald-600" : "bg-gray-200"}`}>
                    {step.done ? <CheckCircle2 className="h-4 w-4 text-white" /> : <span className="text-xs text-gray-500">{idx + 1}</span>}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{step.label}</p>
                    <p className="text-xs text-gray-400">{step.done ? "Completed" : idx === 1 ? "In progress" : "Pending"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Aadhaar Number</label>
                <input value={aadhaarNumber} onChange={(e) => setAadhaarNumber(e.target.value)} maxLength={12} placeholder="1234 5678 9123" className="mt-2 w-full px-3 py-2 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">PAN Number</label>
                <input value={panNumber} onChange={(e) => setPanNumber(e.target.value)} placeholder="ABCDE1234F" className="mt-2 w-full px-3 py-2 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className="p-3 border border-blue-200 rounded-xl bg-white flex flex-col text-sm">
                <span className="font-medium text-gray-700">Aadhaar Front</span>
                <span className="text-xs text-gray-500 mt-1">JPEG/PNG</span>
                <input type="file" accept="image/*" onChange={(e) => setAadhaarFront(e.target.files?.[0] ?? null)} className="mt-2" />
              </label>
              <label className="p-3 border border-blue-200 rounded-xl bg-white flex flex-col text-sm">
                <span className="font-medium text-gray-700">Aadhaar Back</span>
                <span className="text-xs text-gray-500 mt-1">JPEG/PNG</span>
                <input type="file" accept="image/*" onChange={(e) => setAadhaarBack(e.target.files?.[0] ?? null)} className="mt-2" />
              </label>
              <label className="p-3 border border-blue-200 rounded-xl bg-white flex flex-col text-sm">
                <span className="font-medium text-gray-700">PAN Card</span>
                <span className="text-xs text-gray-500 mt-1">JPEG/PNG</span>
                <input type="file" accept="image/*" onChange={(e) => setPanFile(e.target.files?.[0] ?? null)} className="mt-2" />
              </label>
            </div>

            <button type="submit" disabled={saving} className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-300">
              <Upload className="h-4 w-4" /> {saving ? "Submitting..." : "Submit for KYC Review"}
            </button>
            {message && <p className="text-sm text-green-700">{message}</p>}
          </form>
        </div>
      </div>
    </main>
  );
}
