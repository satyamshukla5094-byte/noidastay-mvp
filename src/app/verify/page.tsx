"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Upload, FileText, CheckCircle2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { ConsentModal } from "@/components/ConsentModal";

export default function VerifyPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null);
  const [propertyDetails, setPropertyDetails] = useState({ id: "", title: "", address: "" });
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [showNotice, setShowNotice] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace("/login");
        return;
      }
      setUserId(data.user.id);
      const accepted = window.localStorage.getItem("noidastay_consent") === "1";
      setConsentAccepted(accepted);
      if (!accepted) setShowNotice(true);
    };
    loadUser();
  }, [router]);

  const handleGrantConsent = async (consentType: "KYC" | "Sharing" | "Marketing") => {
    if (!userId) return;
    await fetch("/api/privacy/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, consentType, status: "Granted" }),
    });
    window.localStorage.setItem("noidastay_consent", "1");
    setConsentAccepted(true);
  };
  const handleScan = async () => {
    if (!file || !userId) {
      setError("Please upload an image and sign in first.");
      return;
    }
    setIsScanning(true);
    setError("");
    setScanResult(null);
    try {
      const formData = new FormData();
      formData.append("id_image", file);
      formData.append("user_id", userId);
      const res = await fetch("/api/legal/verify-id", { method: "POST", body: formData });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "OCR failed");
      } else {
        setScanResult(data.data);
      }
    } catch (err) {
      setError("Could not scan image.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleGenerateContract = async () => {
    if (!scanResult) {
      setError("Please scan and verify ID first.");
      return;
    }
    try {
      const resource = await fetch("/api/legal/generate-agreement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: {
            fullName: scanResult.fullName,
            masked_id: scanResult.idNumber,
            permanent_address: scanResult.address,
          },
          property: {
            id: propertyDetails.id || "pg-001",
            title: propertyDetails.title || "NoidaStay Premium PG",
            address: propertyDetails.address || "Sector 1, Greater Noida",
            monthly_rent: 9500,
          },
        }),
      });
      const json = await resource.json();
      if (json.success) {
        setPdfUrl(json.url);
      } else {
        setError(json.error || "Could not create agreement");
      }
    } catch (err) {
      setError("Error generating contract");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-3xl shadow-lg p-4 sm:p-6">
        <div className="flex items-center gap-2 text-slate-900 mb-3">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          <h1 className="text-xl sm:text-2xl font-bold">Smart KYC Scanner</h1>
        </div>
        <p className="text-sm text-slate-600">Zero-typing Aadhaar OCR with Sarvam AI and instant legal agreement generation.</p>

        <div className="mt-4 rounded-2xl border border-slate-200 p-3 bg-blue-50 text-blue-900">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide font-semibold">Smart Scanner</div>
          <div className="mt-1 text-xs">Upload Aadhaar image and get auto-extracted name, masked Aadhaar, address, and DOB.</div>
        </div>

        <div className="mt-4 space-y-3">
          <label className="block text-sm font-medium text-slate-700">Upload Aadhaar Image</label>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="block w-full text-sm text-slate-700 file:border file:border-slate-300 file:rounded-lg file:px-3 file:py-2 file:bg-white" />
          <button onClick={handleScan} disabled={isScanning || !file || !consentAccepted} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 text-white px-3 py-2 text-sm font-semibold hover:bg-emerald-700 disabled:bg-emerald-300">
            {isScanning ? "Scanning..." : "Start Scanning"}
            <Upload className="h-4 w-4" />
          </button>
          {!consentAccepted && <p className="text-xs text-red-600 mt-1">You must accept the privacy notice before scanning.</p>}
        </div>

        {isScanning && (
          <div className="mt-3 rounded-xl border border-slate-200 bg-gradient-to-r from-slate-100 via-white to-slate-100 p-3">
            <div className="h-3 w-full rounded-full bg-gradient-to-r from-slate-200 via-slate-400 to-slate-200 animate-pulse"></div>
            <div className="mt-2 text-xs text-slate-500">High-end scanning in progress. Stays mobile-first and fast.</div>
          </div>
        )}

        {scanResult && (
          <div className="mt-3 border border-emerald-200 bg-emerald-50 rounded-xl p-3">
            <div className="flex items-center gap-2 text-emerald-900 font-semibold"><CheckCircle2 className="h-4 w-4" />Verified by Sarvam AI 🇮🇳</div>
            <div className="mt-2 text-sm text-slate-700 space-y-1">
              <div><span className="font-semibold">Name:</span> {scanResult.fullName}</div>
              <div><span className="font-semibold">Aadhaar:</span> {scanResult.idNumber}</div>
              <div><span className="font-semibold">DOB:</span> {scanResult.dob}</div>
              <div><span className="font-semibold">Address:</span> {scanResult.address}</div>
            </div>
          </div>
        )}

        <div className="mt-4 rounded-xl border border-slate-200 p-3 bg-white">
          <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm"><FileText className="h-4 w-4" /> Generate Legal Agreement</div>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input value={propertyDetails.title} onChange={(e) => setPropertyDetails((p) => ({ ...p, title: e.target.value }))} placeholder="Property title" className="border border-slate-300 rounded-lg px-2 py-1 text-sm" />
            <input value={propertyDetails.address} onChange={(e) => setPropertyDetails((p) => ({ ...p, address: e.target.value }))} placeholder="Property address" className="border border-slate-300 rounded-lg px-2 py-1 text-sm" />
          </div>
          <button onClick={handleGenerateContract} className="mt-3 rounded-xl bg-slate-900 text-white px-3 py-2 text-sm font-semibold hover:bg-slate-800">Generate and Save Agreement</button>
          {pdfUrl && (
            <a href={pdfUrl} target="_blank" rel="noreferrer" className="block mt-2 text-sm text-blue-700 underline">Download generated legal agreement</a>
          )}
        </div>

        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}

        <div className="mt-5 border-t border-slate-200 pt-3 text-xs text-slate-500">Mobile-first KYC and agreement system for PG gates. Use quickly with one scan.</div>
      </div>

      <ConsentModal
        open={showNotice}
        onClose={() => setShowNotice(false)}
        consentType="KYC"
        title="DPDP Privacy Notice"
        description="We need your explicit consent to process Aadhaar-based KYC and generate rental agreements."
        onGrant={handleGrantConsent}
      />
    </main>
  );
}
