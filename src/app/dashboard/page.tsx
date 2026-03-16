"use client";

import { useState } from "react";
import { Plus, ShieldCheck, Upload, ExternalLink, CheckCircle2, CircleDot, Play } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const stepLabels = [
  "Document Drafted",
  "eSign Sent",
  "Stamping Complete",
  "Deposit Secured",
];

export default function DashboardOverview() {
  const [activeTab, setActiveTab] = useState("overview");
  const [ocrUrl, setOcrUrl] = useState("");
  const [ocrResult, setOcrResult] = useState<any>(null);
  const [agreementStatus, setAgreementStatus] = useState("");
  const [step, setStep] = useState(1);
  const [ttsText, setTtsText] = useState("यह समझौता पत्र किराये की शर्तों और शुल्क को स्पष्ट करता है।");
  const [ttsUrl, setTtsUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [verificationForm, setVerificationForm] = useState({
    aadhaarName: "Test Owner",
    plotNumber: "",
    bhulekhUrl: "",
  });
  const [isSubmittingVerification, setIsSubmittingVerification] = useState(false);

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingVerification(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("owner_verifications").insert([
        {
          owner_aadhaar_name: verificationForm.aadhaarName,
          plot_number: verificationForm.plotNumber,
          bhulekh_url: verificationForm.bhulekhUrl || "https://upbhulekh.gov.in/",
          status: "pending",
        },
      ]);
      if (error) {
        console.warn("Owner verification insert failed:", error.message);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setIsSubmittingVerification(false);
    }
  };

  const handleExtractKyc = async () => {
    if (!ocrUrl) return;
    try {
      const resp = await fetch("/api/legal/extract-kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_url: ocrUrl }),
      });
      const data = await resp.json();
      setOcrResult(data);
    } catch (err) {
      setOcrResult({ error: "Unable to extract from image" });
    }
  };

  const handleGenerateAgreement = async () => {
    setIsGenerating(true);
    try {
      const resp = await fetch("/api/legal/generate-agreement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenant_name: "Student Tenant",
          owner_name: verificationForm.aadhaarName,
          property_address: "Sector 1, Greater Noida",
          period_of_stay: "01 Apr 2026 - 30 Sep 2026",
          monthly_rent: "₹9,499",
          refundable_deposit: "₹9,499",
        }),
      });
      if (!resp.ok) {
        setAgreementStatus("Failed to generate agreement.");
        return;
      }
      const buffer = await resp.arrayBuffer();
      const blob = new Blob([buffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setAgreementStatus("Generated. Opening PDF...");
      window.open(url, "_blank");
    } catch (error) {
      setAgreementStatus("Error generating agreement.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSpeakHindi = async () => {
    setIsSpeaking(true);
    try {
      const resp = await fetch("/api/legal/speak-hindi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: ttsText }),
      });
      const data = await resp.json();
      if (!data.success || !data.audioBase64) {
        setTtsUrl("");
        return;
      }
      const blob = new Blob([Uint8Array.from(atob(data.audioBase64), (c) => c.charCodeAt(0))], {
        type: "audio/mpeg",
      });
      const audioUrl = URL.createObjectURL(blob);
      setTtsUrl(audioUrl);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (error) {
      setTtsUrl("");
    } finally {
      setIsSpeaking(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">NoidaStay Legal Automation Hub</h1>
          <p className="mt-1 text-slate-600">Your premium digital broker engine for document workflows.</p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-xl border border-blue-300 text-blue-700 bg-blue-50 px-3 py-2 text-xs font-semibold">Gov-Tech</button>
          <button className="rounded-xl border border-amber-300 text-amber-800 bg-amber-50 px-3 py-2 text-xs font-semibold">Trusted</button>
        </div>
      </div>

      <div className="mt-4 bg-white border border-blue-100 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-wrap gap-2 items-center mb-3">
          <span className="text-sm font-semibold text-blue-700">Status Tracker</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">Mobile-friendly</span>
        </div>
        <div className="flex flex-col gap-3 sm:gap-0 sm:flex-row sm:justify-between">
          {stepLabels.map((label, index) => {
            const active = index <= step;
            return (
              <div
                key={label}
                className={`flex items-start gap-2 sm:flex-col sm:items-center sm:text-center p-3 rounded-xl border ${
                  active ? "border-blue-600 bg-blue-50" : "border-slate-200 bg-white"
                } w-full sm:w-[22%]`}
              >
                <div className={`p-2 rounded-full ${active ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"}`}>
                  {active ? <CheckCircle2 className="h-4 w-4" /> : <CircleDot className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-700">{label}</p>
                  {index === step && <p className="text-[11px] text-blue-600">Current</p>}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex gap-2 flex-wrap">
          <button
            onClick={() => setStep((prev) => Math.max(0, prev - 1))}
            className="text-xs font-medium px-3 py-1.5 border border-slate-300 rounded-lg"
          >
            Back
          </button>
          <button
            onClick={() => setStep((prev) => Math.min(stepLabels.length - 1, prev + 1))}
            className="text-xs font-semibold px-3 py-1.5 bg-blue-600 text-white rounded-lg"
          >
            Next Step
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Sarvam OCR Pipeline</h2>
              <p className="text-sm text-slate-600">Extract KYC fields from Aadhaar image quickly.</p>
            </div>
            <Upload className="h-5 w-5 text-slate-400" />
          </div>
          <div className="mt-3">
            <input
              type="url"
              value={ocrUrl}
              onChange={(e) => setOcrUrl(e.target.value)}
              placeholder="Paste Aadhaar image URL"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleExtractKyc}
              className="mt-2 inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700"
            >
              Extract KYC
            </button>

            {ocrResult && (
              <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm">
                <div><strong>Full Name:</strong> {ocrResult.data?.full_name ?? ocrResult.data?.name ?? "-"}</div>
                <div><strong>ID:</strong> {ocrResult.data?.id_number ?? "-"}</div>
                <div><strong>Address:</strong> {ocrResult.data?.permanent_address ?? "-"}</div>
                {ocrResult.error && <div className="mt-1 text-red-600">{ocrResult.error}</div>}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Dynamic Agreement Generator</h2>
              <p className="text-sm text-slate-600">Generate professional legal PDF instantly.</p>
            </div>
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="mt-3">
            <button
              onClick={handleGenerateAgreement}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-600 text-white text-sm hover:bg-emerald-700 disabled:opacity-70"
            >
              <span>Generate Agreement PDF</span>
            </button>
            {agreementStatus && <p className="mt-2 text-sm text-slate-600">{agreementStatus}</p>}
          </div>
          <div className="mt-4 border-t border-slate-200 pt-3 text-xs text-slate-500">
            Includes stay period, security deposit clause, and NoidaStay Brokerage terms.
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold">Owner Explanation Tool (Hindi TTS)</h2>
            <p className="text-sm text-slate-600">Speak the major agreement points so the owner can review clearly.</p>
          </div>
          <button
            onClick={handleSpeakHindi}
            disabled={isSpeaking}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
          >
            <Play className="h-4 w-4" /> {isSpeaking ? "Speaking..." : "Speak in Hindi"}
          </button>
        </div>
        <textarea
          value={ttsText}
          onChange={(e) => setTtsText(e.target.value)}
          rows={3}
          className="mt-3 w-full border border-slate-300 rounded-xl p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        {ttsUrl && (
          <audio controls className="mt-2 w-full">
            <source src={ttsUrl} type="audio/mpeg" />
            Your browser does not support audio.
          </audio>
        )}
      </div>

      <div className="mt-6 border-t border-slate-200 pt-4">
        <div className="flex flex-wrap gap-2 mb-3 text-xs font-semibold text-slate-600 uppercase tracking-[0.14em]">
          <span className="px-2 py-1 rounded-full bg-slate-100">Step-by-step automation</span>
          <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700">Student-ready, mobile UI</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
            <h3 className="text-sm font-semibold text-blue-800">Legal Automation in 2 minutes</h3>
            <p className="text-sm text-slate-700 mt-1">Draft, review, sign, and deliver agreement without multiple trips to Pare Chowk.</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
            <h3 className="text-sm font-semibold text-emerald-800">Brokerage Efficiency</h3>
            <p className="text-sm text-slate-700 mt-1">Digital process for KYC + legal docs + owner explanation builds trust quickly.</p>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Document & KYC Workflow</h2>
            <p className="text-sm text-slate-600">Owner verification and onboarding are now one flow.</p>
          </div>
          <div className="flex text-xs gap-2">
            <span className="px-2 py-1 rounded-full border border-indigo-200 text-indigo-700">Draft</span>
            <span className="px-2 py-1 rounded-full border border-amber-200 text-amber-700">Stamp</span>
            <span className="px-2 py-1 rounded-full border border-emerald-200 text-emerald-700">Deposit</span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
            <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">1. Draft</div>
            <p className="text-xs text-slate-600 mt-1">Create legal agreement and store copy.</p>
          </div>
          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
            <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">2. eSign</div>
            <p className="text-xs text-slate-600 mt-1">Send to student and owner by email/WhatsApp link.</p>
          </div>
          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
            <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">3. Stamping</div>
            <p className="text-xs text-slate-600 mt-1">Confirm stamping status with admin and owner.</p>
          </div>
        </div>
      </div>

      {activeTab === "verification" && (
        <form
          onSubmit={handleVerificationSubmit}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mt-6"
        >
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Property Verification</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm text-slate-700 font-medium">Owner Aadhaar Name</label>
              <input
                type="text"
                value={verificationForm.aadhaarName}
                onChange={(e) => setVerificationForm((prev) => ({ ...prev, aadhaarName: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="text-sm text-slate-700 font-medium">Plot / Khata Number</label>
              <input
                type="text"
                value={verificationForm.plotNumber}
                onChange={(e) => setVerificationForm((prev) => ({ ...prev, plotNumber: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                required
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="text-sm text-slate-700 font-medium">UP Bhulekh URL</label>
            <input
              type="url"
              value={verificationForm.bhulekhUrl}
              onChange={(e) => setVerificationForm((prev) => ({ ...prev, bhulekhUrl: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmittingVerification}
            className="mt-4 rounded-xl bg-emerald-600 text-white px-4 py-2.5 font-semibold hover:bg-emerald-700"
          >
            {isSubmittingVerification ? "Submitting..." : "Submit Verification"}
          </button>
        </form>
      )}
    </div>
  );
}
