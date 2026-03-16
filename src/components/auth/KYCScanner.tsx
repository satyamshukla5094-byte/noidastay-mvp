"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, ShieldCheck, AlertCircle, CheckCircle, Loader2, RefreshCcw } from "lucide-react";

interface KYCScannerProps {
  userId: string;
  onSuccess?: (data: any) => void;
}

export default function KYCScanner({ userId, onSuccess }: KYCScannerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "scanning" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        startVerification(selectedFile);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const startVerification = async (selectedFile: File) => {
    setStatus("scanning");
    setError(null);

    const formData = new FormData();
    formData.append("id_image", selectedFile);
    formData.append("user_id", userId);
    formData.append("doc_type", "AADHAAR");

    try {
      const response = await fetch("/api/verify-id", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
        setStatus("success");
        if (onSuccess) onSuccess(data.data);
      } else {
        throw new Error(data.error || "Verification failed");
      }
    } catch (err: any) {
      console.error("KYC Error:", err);
      setError(err.message || "Failed to verify identity. Please try again.");
      setStatus("error");
    }
  };

  const resetScanner = () => {
    setFile(null);
    setPreview(null);
    setStatus("idle");
    setError(null);
    setResult(null);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-3xl shadow-2xl border border-gray-100">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-2xl mb-4">
          <ShieldCheck className="text-blue-600 w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Digital KYC</h2>
        <p className="text-gray-500 text-sm mt-1">Zero-Typing Identity Verification</p>
      </div>

      <AnimatePresence mode="wait">
        {status === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center"
          >
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-[3/2] bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-4 hover:bg-gray-100 transition-all group"
            >
              <div className="p-4 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                <Camera className="w-8 h-8 text-blue-500" />
              </div>
              <div className="text-center">
                <span className="text-sm font-semibold text-gray-700 block">Scan Aadhaar or PAN</span>
                <span className="text-xs text-gray-400 mt-1 block">Ensure document is clearly visible</span>
              </div>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
            />
          </motion.div>
        )}

        {status === "scanning" && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative"
          >
            <div className="aspect-[3/2] w-full bg-gray-900 rounded-2xl overflow-hidden relative shadow-inner">
              {preview && (
                <img src={preview} alt="ID Preview" className="w-full h-full object-cover opacity-60 grayscale" />
              )}
              
              {/* Shimmer Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/40 to-transparent h-1/2 w-full z-10"
                animate={{ top: ["-50%", "100%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
              
              <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                <Loader2 className="w-12 h-12 text-white animate-spin mb-4" />
                <span className="text-white font-bold text-lg tracking-wide animate-pulse">
                  Scanning Identity...
                </span>
                <span className="text-blue-200 text-xs mt-2">Sarvam AI is processing document</span>
              </div>
            </div>
          </motion.div>
        )}

        {status === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="aspect-[3/2] w-full bg-green-50 rounded-2xl flex flex-col items-center justify-center gap-4 border-2 border-green-100">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-200">
                <CheckCircle className="text-white w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Verified Profile</h3>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold mt-2">
                  <ShieldCheck size={14} />
                  Verified Student
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-2xl text-left space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-xs font-medium">LEGAL NAME</span>
                <span className="text-gray-900 font-bold text-sm uppercase">{result?.fullName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-xs font-medium">DOCUMENT ID</span>
                <span className="text-gray-900 font-mono font-bold text-sm">{result?.maskedId}</span>
              </div>
            </div>
            
            <button
              onClick={() => window.location.reload()}
              className="mt-6 w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-colors"
            >
              Back to Dashboard
            </button>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="aspect-[3/2] w-full bg-red-50 rounded-2xl flex flex-col items-center justify-center gap-4 border-2 border-red-100">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="text-red-600 w-10 h-10" />
              </div>
              <div className="px-6">
                <h3 className="text-lg font-bold text-gray-900">Verification Failed</h3>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
            
            <button
              onClick={resetScanner}
              className="mt-6 w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCcw size={18} />
              Retake Photo
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 flex items-center justify-center gap-6 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
        <span className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-blue-400" /> India Stack</span>
        <span>•</span>
        <span>Sarvam AI Vision</span>
        <span>•</span>
        <span>DPDP Compliant</span>
      </div>
    </div>
  );
}
