"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, CheckCircle, AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface KYCScannerProps {
  userId: string;
  onSuccess?: (data: any) => void;
}

export default function KYCScanner({ userId, onSuccess }: KYCScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [status, setStatus] = useState<"idle" | "uploading" | "verifying" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus("uploading");
    setScanning(true);

    const formData = new FormData();
    formData.append("id_image", file);
    formData.append("user_id", userId);

    try {
      // Step 1: Verification API call (OCR + Profile Update)
      const response = await fetch("/api/legal/verify-id", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Verification failed");
      }

      setResult(data.data);
      setStatus("success");
      if (onSuccess) onSuccess(data.data);
    } catch (err: any) {
      console.error("KYC Error:", err);
      setError(err.message);
      setStatus("error");
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
          <ShieldCheck className="text-blue-600" />
          Trust Engine KYC
        </h2>
        <p className="text-gray-500 text-sm mt-2">Zero-Typing Identity Verification for NoidaStay</p>
      </div>

      <AnimatePresence mode="wait">
        {status === "idle" || status === "error" ? (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center"
          >
            <label className="relative cursor-pointer group">
              <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors border-2 border-dashed border-blue-200">
                <Camera className="w-12 h-12 text-blue-500" />
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
              />
            </label>
            <p className="mt-4 text-sm font-medium text-gray-700">Scan Aadhaar Card</p>
            <p className="text-xs text-gray-400 mt-1">Supports JPG, PNG (Max 5MB)</p>

            {status === "error" && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm"
              >
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}
          </motion.div>
        ) : status === "uploading" || status === "verifying" ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center py-10"
          >
            <div className="relative w-48 h-32 bg-gray-100 rounded-lg overflow-hidden border-2 border-blue-200">
              {/* Scanning Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-400/30 to-transparent h-1/2 w-full"
                animate={{ 
                  top: ["-50%", "100%"] 
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={32} />
              </div>
            </div>
            <p className="mt-6 text-sm font-semibold text-blue-600 animate-pulse">
              Sarvam AI is extracting data...
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-6 text-center"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="text-green-600 w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Verification Complete</h3>
            <div className="mt-4 p-4 bg-gray-50 rounded-xl w-full text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500 text-xs">Name</span>
                <span className="text-gray-900 text-xs font-semibold">{result?.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-xs">Aadhaar</span>
                <span className="text-gray-900 text-xs font-semibold font-mono">{result?.idNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-xs">Address</span>
                <span className="text-gray-900 text-xs font-semibold truncate max-w-[150px]">{result?.address}</span>
              </div>
            </div>
            <div className="mt-6 flex gap-3 w-full">
              <div className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-bold shadow-lg shadow-green-200">
                Verified Profile
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-center gap-4 text-[10px] text-gray-400 uppercase tracking-widest">
        <span className="flex items-center gap-1"><ShieldCheck size={12}/> Secure Vault</span>
        <span>•</span>
        <span>DPDP 2023 Compliant</span>
      </div>
    </div>
  );
}
