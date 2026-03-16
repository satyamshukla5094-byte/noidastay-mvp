"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, CheckCircle, Clock, Shield, Phone, Mail, AlertCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface InstantAgreementProps {
  kycData: any;
  property: any;
  onComplete: (data: any) => void;
}

export default function InstantAgreement({ kycData, property, onComplete }: InstantAgreementProps) {
  const [agreementText, setAgreementText] = useState("");
  const [isGenerating, setIsGenerating] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [agreementId, setAgreementId] = useState("");

  const supabase = createClient();

  useEffect(() => {
    generateAgreement();
  }, [kycData, property]);

  const generateAgreement = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Generate agreement text
      const agreement = `
RENTAL AGREEMENT

This Rental Agreement is made on ${new Date().toLocaleDateString()} between:

OWNER: [Verified Owner Details]
TENANT: ${kycData.fullName}
Aadhaar: ${kycData.idNumber}
Address: ${kycData.address}

PROPERTY: ${property.title}
Address: ${property.sector}, Greater Noida
Rent: ₹${property.price.toLocaleString("en-IN")}/month
Security Deposit: ₹${property.price.toLocaleString("en-IN")}
Brokerage Fee: ₹499

TERM: 11 months
START DATE: ${new Date().toLocaleDateString()}

TERMS & CONDITIONS:
1. Rent to be paid by 5th of each month
2. Security deposit refundable at end of term
3. 30-day notice period for termination
4. No sub-letting without written consent
5. Property to be used for residential purposes only

This agreement is legally binding under Indian law.
      `.trim();

      setAgreementText(agreement);

      // Create agreement record
      const { data: agreementRecord, error: insertError } = await supabase
        .from("legal_agreements")
        .insert({
          user_id: user.id,
          property_id: property.id,
          type: "rental",
          content: agreement,
          status: "pending",
          metadata: {
            tenant_name: kycData.fullName,
            tenant_id: kycData.idNumber,
            rent_amount: property.price,
            start_date: new Date().toISOString(),
          }
        })
        .select()
        .single();

      if (insertError) throw insertError;
      setAgreementId(agreementRecord.id);

    } catch (err: any) {
      setError(err.message || "Failed to generate agreement");
    } finally {
      setIsGenerating(false);
    }
  };

  const sendOTP = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Send OTP to user's phone/email
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          agreementId,
        }),
      });

      if (!response.ok) throw new Error("Failed to send OTP");

      setOtpSent(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const verifyOTP = async () => {
    if (otp.length !== 6) {
      setError("Please enter 6-digit OTP");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const response = await fetch("/api/legal/sign-agreement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agreementId,
          otp,
        }),
      });

      const result = await response.json();
      
      if (!result.success) throw new Error(result.error);

      // Update agreement status
      await supabase
        .from("legal_agreements")
        .update({ status: "signed" })
        .eq("id", agreementId);

      onComplete({
        agreementId,
        signedAt: new Date().toISOString(),
      });

    } catch (err: any) {
      setError(err.message || "Failed to verify OTP");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Rental Agreement
        </h2>
        <p className="text-gray-600">
          Pre-filled with your KYC data. Sign with OTP to proceed.
        </p>
      </motion.div>

      {isGenerating ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="inline-flex items-center gap-2 text-blue-600">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Generating your agreement...</span>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          {/* Agreement Preview */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Agreement Preview</h3>
            <div className="bg-white rounded-lg p-4 text-sm text-gray-700 max-h-64 overflow-y-auto">
              <pre className="whitespace-pre-wrap font-mono text-xs">
                {agreementText}
              </pre>
            </div>
          </div>

          {/* Tenant Details */}
          <div className="bg-emerald-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-emerald-900 mb-3">Tenant Details (Auto-filled)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Name:</span>
                <span className="ml-2 font-medium">{kycData.fullName}</span>
              </div>
              <div>
                <span className="text-gray-600">Aadhaar:</span>
                <span className="ml-2 font-medium">{kycData.idNumber}</span>
              </div>
              <div className="md:col-span-2">
                <span className="text-gray-600">Address:</span>
                <span className="ml-2 font-medium">{kycData.address}</span>
              </div>
            </div>
          </div>

          {/* OTP Section */}
          {!otpSent ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <button
                onClick={sendOTP}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
              >
                <Phone className="w-4 h-4" />
                Send OTP to Sign Agreement
              </button>
              <p className="text-sm text-gray-500 mt-2">
                OTP will be sent to your registered mobile number
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto"
            >
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600">
                  Enter 6-digit OTP sent to your mobile
                </p>
              </div>

              <div className="flex gap-2 justify-center mb-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={otp[index] || ""}
                    onChange={(e) => {
                      const newOtp = otp.split("");
                      newOtp[index] = e.target.value;
                      setOtp(newOtp.join(""));
                    }}
                    className="w-12 h-12 text-center border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg font-semibold"
                  />
                ))}
              </div>

              <button
                onClick={verifyOTP}
                disabled={isVerifying || otp.length !== 6}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Sign Agreement
                  </>
                )}
              </button>

              <button
                onClick={() => setOtpSent(false)}
                className="w-full mt-2 text-blue-600 text-sm hover:underline"
              >
                Resend OTP
              </button>
            </motion.div>
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
        </motion.div>
      )}

      {/* Security Badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-600"
      >
        <Shield className="w-4 h-4" />
        <span>Legally binding e-signature with OTP verification</span>
      </motion.div>
    </div>
  );
}
