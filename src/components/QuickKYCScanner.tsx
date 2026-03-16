"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, CheckCircle, AlertCircle, Upload, Shield, Clock, Sparkles } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface QuickKYCScannerProps {
  onComplete: (data: any) => void;
  property: any;
}

export default function QuickKYCScanner({ onComplete, property }: QuickKYCScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [kycData, setKycData] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"uploading" | "scanning" | "verifying" | "success" | "manual_review">("uploading");

  const supabase = createClient();

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError("");
    setIsProcessing(true);
    setProgress(0);
    setStatus("uploading");

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Create FormData for OCR
      const formData = new FormData();
      formData.append("id_image", selectedFile);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      formData.append("user_id", user.id);

      // Send to OCR API
      const response = await fetch("/api/legal/verify-id", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || "OCR processing failed");
      }

      const extractedData = result.data;
      setKycData(extractedData);

      // Check if instant verification
      if (result.instant_verified) {
        setStatus("success");
        // Celebration animation
        setTimeout(() => {
          onComplete(extractedData);
        }, 2000);
      } else if (result.kyc_status === "manual_review_required") {
        setStatus("manual_review");
        setError("Your document needs manual review. We'll notify you within 24 hours.");
      } else {
        setStatus("success");
        setTimeout(() => {
          onComplete(extractedData);
        }, 1500);
      }

    } catch (err: any) {
      setError(err.message || "Failed to process document. Please try again.");
      setStatus("uploading");
    } finally {
      setIsProcessing(false);
    }
  }, [onComplete, supabase]);

  const triggerFileUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => handleFileUpload(e as any);
    input.click();
  };

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Instant Identity Verification
        </h2>
        <p className="text-gray-600">
          AI will verify your identity in under 30 seconds
        </p>
      </motion.div>

      {!kycData ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-md mx-auto"
        >
          {/* Upload Area */}
          <div
            onClick={triggerFileUpload}
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Camera className="w-8 h-8 text-gray-400" />
            </motion.div>
            <p className="text-gray-700 font-medium mb-2">
              Click to upload Aadhaar card
            </p>
            <p className="text-sm text-gray-500">
              PNG, JPG up to 10MB
            </p>
          </div>

          {file && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-3 bg-gray-50 rounded-lg"
            >
              <p className="text-sm text-gray-600">
                Selected: {file.name}
              </p>
            </motion.div>
          )}

          {/* Progress Circle */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="mt-6"
              >
                <div className="relative w-32 h-32 mx-auto">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#e5e7eb"
                      strokeWidth="12"
                      fill="none"
                    />
                    <motion.circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#10b981"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - progress / 100) }}
                      transition={{ duration: 0.5 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full"
                    />
                    <p className="text-sm text-gray-600 mt-2">{progress}%</p>
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <p className="text-sm font-medium text-gray-700">
                    {status === "uploading" && "Uploading document..."}
                    {status === "scanning" && "AI scanning your Aadhaar..."}
                    {status === "verifying" && "Verifying your identity..."}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Estimated time: 30 seconds
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 text-red-500" />
              <p className="text-sm text-red-700">{error}</p>
            </motion.div>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto text-center"
        >
          <AnimatePresence>
            {status === "success" && (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                  className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle className="w-10 h-10 text-emerald-600" />
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl font-semibold text-gray-900 mb-2"
                >
                  Instantly Verified! 🎉
                </motion.h3>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-2"
                >
                  <div className="flex justify-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-emerald-600">AI verification complete</span>
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-left">
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Name:</strong> {kycData.fullName}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>ID:</strong> {kycData.idNumber}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Address:</strong> {kycData.address}
                    </p>
                  </div>
                  <p className="text-sm text-emerald-600">
                    Proceeding to agreement generation...
                  </p>
                </motion.div>
              </>
            )}
            
            {status === "manual_review" && (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Clock className="w-8 h-8 text-amber-600" />
                </motion.div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Manual Review Required
                </h3>
                <p className="text-sm text-gray-600">
                  Our team will review your document within 24 hours.
                </p>
              </>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Security Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 p-4 bg-blue-50 rounded-lg"
      >
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">Your data is secure</p>
            <p className="text-xs text-blue-700 mt-1">
              All documents are encrypted and stored in compliance with Indian data protection laws
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
