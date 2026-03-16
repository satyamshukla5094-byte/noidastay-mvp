"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, ShieldCheck, PenTool, Download, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AgreementDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [draft, setDraft] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(data);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const handleGenerateDraft = async () => {
    if (profile?.kyc_status !== "verified") {
      setError("KYC Verification is required before you can generate a rent agreement.");
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      // For MVP, we use a mock property ID or the first one found
      const { data: property } = await supabase.from("properties").select("id").limit(1).single();
      
      const response = await fetch("/api/legal/generate-contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: profile.id,
          propertyId: property?.id 
        }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      setDraft(data.previewData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-widest mb-2">
            <ShieldCheck size={16} />
            Digital Broker Legal
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">Rent Agreements</h1>
          <p className="text-gray-500 mt-2">Generate, e-Sign, and Manage your legally binding documents.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Action Area */}
          <div className="md:col-span-2 space-y-6">
            {!draft ? (
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="text-blue-500 w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">New Agreement</h2>
                <p className="text-gray-500 mt-2 mb-8">Ready to move in? Generate your digital rent agreement in seconds.</p>
                
                <button
                  onClick={handleGenerateDraft}
                  disabled={generating}
                  className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all disabled:opacity-50"
                >
                  {generating ? <Loader2 className="animate-spin" /> : <PenTool size={20} />}
                  Generate Draft Agreement
                </button>

                {error && (
                  <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-2 text-sm text-left">
                    <AlertCircle size={18} className="shrink-0" />
                    {error}
                  </div>
                )}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
              >
                <div className="bg-gray-900 p-6 text-white flex justify-between items-center">
                  <h3 className="font-bold">Draft Agreement Preview</h3>
                  <span className="text-xs bg-blue-500 px-2 py-1 rounded-full">Pending Signature</span>
                </div>
                <div className="p-8 space-y-6 max-h-[500px] overflow-y-auto font-serif text-sm text-gray-800 leading-relaxed border-b">
                  <div className="text-center font-bold text-lg uppercase border-b pb-4 mb-6">Rent Agreement - Greater Noida PG</div>
                  <p>This Rent Agreement is made on <b>{draft.date}</b>.</p>
                  <p><b>BETWEEN:</b> {draft.owner_name} (Owner) and {draft.student_name} (Tenant).</p>
                  <p><b>PROPERTY:</b> {draft.owner_address}</p>
                  <p><b>MONTHLY RENT:</b> ₹{draft.room_price}</p>
                  <p><b>SECURITY DEPOSIT:</b> ₹{draft.deposit_amount}</p>
                  <div className="space-y-2 mt-8">
                    <p className="font-bold underline">Terms:</p>
                    <p>1. 30-day notice period for termination.</p>
                    <p>2. Rent due by 5th of every month.</p>
                    <p>3. Digitally brokered by NoidaStay.</p>
                  </div>
                </div>
                <div className="p-6 bg-gray-50 flex gap-4">
                  <button className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all">
                    Sign with Aadhaar OTP
                  </button>
                  <button onClick={() => setDraft(null)} className="px-6 bg-white text-gray-600 border border-gray-200 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all">
                    Edit
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Status Sidebar */}
          <div className="space-y-6">
            <div className={`p-6 rounded-3xl shadow-sm border ${profile?.kyc_status === 'verified' ? 'bg-green-50 border-green-100' : 'bg-yellow-50 border-yellow-100'}`}>
              <div className="flex items-center gap-2 mb-4">
                {profile?.kyc_status === 'verified' ? (
                  <CheckCircle className="text-green-600" size={20} />
                ) : (
                  <AlertCircle className="text-yellow-600" size={20} />
                )}
                <span className={`font-bold text-sm ${profile?.kyc_status === 'verified' ? 'text-green-700' : 'text-yellow-700'}`}>
                  KYC Status: {profile?.kyc_status?.toUpperCase() || 'NONE'}
                </span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                {profile?.kyc_status === 'verified' 
                  ? "Your identity is verified. You are eligible to sign legally binding digital agreements." 
                  : "Please complete your KYC verification to unlock digital signing features."}
              </p>
              {profile?.kyc_status !== 'verified' && (
                <button className="mt-4 w-full bg-yellow-600 text-white py-2 rounded-xl text-xs font-bold">Verify Now</button>
              )}
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h4 className="font-bold text-sm mb-4">Recent Documents</h4>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <FileText className="mx-auto text-gray-200 mb-2" size={32} />
                  <p className="text-xs text-gray-400">No signed documents yet.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
