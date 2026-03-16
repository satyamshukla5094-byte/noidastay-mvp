"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, CheckCircle, AlertCircle, Upload, Shield, Clock, Sparkles, Badge, Zap, ArrowRight } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface TrustFirstKYCProps {
  onComplete: (data: any) => void;
  property: any;
}

export default function TrustFirstKYC({ onComplete, property }: TrustFirstKYCProps) {
  const [selectedMethod, setSelectedMethod] = useState<"digilocker" | "upload" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [kycData, setKycData] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);

  const supabase = createClient();

  // DigiLocker OAuth Flow
  const handleDigiLockerAuth = useCallback(async () => {
    setIsProcessing(true);
    setError("");

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Generate state for OAuth
      const state = Math.random().toString(36).substring(2, 15);
      
      // Store state in session storage
      sessionStorage.setItem('digilocker_state', state);
      sessionStorage.setItem('user_id', user.id);

      // Redirect to DigiLocker OAuth (using Digio as example provider)
      const redirectUri = encodeURIComponent(`${window.location.origin}/api/kyc/digilocker-callback`);
      const digioUrl = `https://app.digio.in/oauth?client_id=${process.env.NEXT_PUBLIC_DIGIO_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&state=${state}&scope=read+aadhaar`;
      
      window.location.href = digioUrl;

    } catch (err: any) {
      setError(err.message || "Failed to initiate DigiLocker verification");
      setIsProcessing(false);
    }
  }, [supabase]);

  // Legacy Upload Flow
  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError("");
    setIsProcessing(true);

    try {
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

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || "OCR processing failed");
      }

      const extractedData = result.data;
      setKycData(extractedData);

      setTimeout(() => {
        onComplete(extractedData);
      }, 1500);

    } catch (err: any) {
      setError(err.message || "Failed to process document. Please try again.");
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
          Choose Verification Method
        </h2>
        <p className="text-gray-600">
          Select how you'd like to verify your identity
        </p>
      </motion.div>

      {!selectedMethod ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto space-y-4"
        >
          {/* DigiLocker Option (Recommended) */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedMethod("digilocker")}
            className="relative bg-gradient-to-r from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-xl p-6 cursor-pointer hover:border-emerald-400 hover:shadow-lg transition-all"
          >
            {/* Gold Badge */}
            <div className="absolute top-3 right-3">
              <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                <Zap className="w-3 h-3" />
                FASTEST
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-emerald-600 rounded-xl flex items-center justify-center">
                <Badge className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Instant Verify via DigiLocker
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Connect your DigiLocker for instant, government-verified identity
                </p>
                <div className="flex items-center gap-2 text-xs text-emerald-700">
                  <CheckCircle className="w-3 h-3" />
                  <span>100% authentic data</span>
                  <span>•</span>
                  <span>No document upload</span>
                  <span>•</span>
                  <span>Instant verification</span>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-emerald-600" />
            </div>
          </motion.div>

          {/* Upload Option (Legacy) */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedMethod("upload")}
            className="relative bg-white border-2 border-gray-200 rounded-xl p-6 cursor-pointer hover:border-gray-300 hover:shadow-lg transition-all"
          >
            <div className="absolute top-3 right-3">
              <div className="flex items-center gap-1 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                <Clock className="w-3 h-3" />
                SLOW
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
                <Camera className="w-8 h-8 text-gray-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Upload Photo of ID
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Take a photo of your Aadhaar card for AI-powered verification
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Upload className="w-3 h-3" />
                  <span>Takes 5 minutes</span>
                  <span>•</span>
                  <span>Manual processing</span>
                  <span>•</span>
                  <span>Requires clear photo</span>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-6 text-xs text-gray-500"
          >
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              <span>Bank-level security</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              <span>GDPR compliant</span>
            </div>
            <div className="flex items-center gap-1">
              <Badge className="w-3 h-3" />
              <span>Govt. authorized</span>
            </div>
          </motion.div>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          {selectedMethod === "digilocker" && (
            <motion.div
              key="digilocker"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="max-w-md mx-auto text-center"
            >
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Badge className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Connecting to DigiLocker...
              </h3>
              <p className="text-gray-600 mb-6">
                You'll be redirected to the official DigiLocker portal for secure authentication
              </p>
              
              {isProcessing ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm text-emerald-600">Opening secure connection...</p>
                </div>
              ) : (
                <button
                  onClick={handleDigiLockerAuth}
                  className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-2 mx-auto"
                >
                  <Badge className="w-5 h-5" />
                  Connect DigiLocker
                </button>
              )}

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

              <button
                onClick={() => setSelectedMethod(null)}
                className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Choose different method
              </button>
            </motion.div>
          )}

          {selectedMethod === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="max-w-md mx-auto"
            >
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-10 h-10 text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                Upload ID Document
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Upload a clear photo of your Aadhaar card
              </p>

              <div
                onClick={triggerFileUpload}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all"
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-700 font-medium mb-2">
                  Click to upload Aadhaar card
                </p>
                <p className="text-sm text-gray-500">
                  PNG, JPG up to 10MB
                </p>
              </div>

              {file && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Selected: {file.name}
                  </p>
                </div>
              )}

              {isProcessing && (
                <div className="mt-4 flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-3 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm text-gray-600">Processing document...</p>
                </div>
              )}

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <button
                onClick={() => setSelectedMethod(null)}
                className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Choose different method
              </button>
            </motion.div>
          )}
        </AnimatePresence>
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
              All verification methods are encrypted and compliant with Indian data protection laws
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
