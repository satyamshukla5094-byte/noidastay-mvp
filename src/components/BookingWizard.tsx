"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, AlertCircle, Shield, FileText, CreditCard, Home } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import TrustFirstKYC from "@/components/TrustFirstKYC";
import QuickKYCScanner from "@/components/QuickKYCScanner";
import InstantAgreement from "@/components/InstantAgreement";
import UnifiedPayment from "@/components/UnifiedPayment";
import BookingConfirmation from "@/components/BookingConfirmation";

interface BookingWizardProps {
  listingId: string;
}

type Step = "identity" | "agreement" | "payment" | "confirmed";

const STEPS: { key: Step; label: string; icon: React.ReactNode }[] = [
  { key: "identity", label: "Identity", icon: <Shield className="w-4 h-4" /> },
  { key: "agreement", label: "Agreement", icon: <FileText className="w-4 h-4" /> },
  { key: "payment", label: "Payment", icon: <CreditCard className="w-4 h-4" /> },
  { key: "confirmed", label: "Confirmed", icon: <Home className="w-4 h-4" /> },
];

export default function BookingWizard({ listingId }: BookingWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>("identity");
  const [completedSteps, setCompletedSteps] = useState<Set<Step>>(new Set());
  const [kycData, setKycData] = useState<any>(null);
  const [agreementData, setAgreementData] = useState<any>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [useTrustFirstKYC, setUseTrustFirstKYC] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchProperty();
    handleDigiLockerCallback();
  }, [listingId]);

  const handleDigiLockerCallback = () => {
    const digilockerSuccess = searchParams.get("digilocker_success");
    const dataParam = searchParams.get("data");
    
    if (digilockerSuccess === "true" && dataParam) {
      try {
        const data = JSON.parse(decodeURIComponent(dataParam));
        setKycData(data);
        markStepComplete("identity");
      } catch (error) {
        console.error("Failed to parse DigiLocker data:", error);
      }
    }
  };

  const fetchProperty = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("id", listingId)
      .single();

    if (data) {
      setProperty(data);
    }
    setLoading(false);
  };

  const markStepComplete = (step: Step) => {
    setCompletedSteps(prev => new Set([...prev, step]));
    
    // Auto-advance to next step after completion
    const stepIndex = STEPS.findIndex(s => s.key === step);
    if (stepIndex < STEPS.length - 1) {
      setTimeout(() => {
        setCurrentStep(STEPS[stepIndex + 1].key);
      }, 800);
    }
  };

  const handleKYCComplete = (data: any) => {
    setKycData(data);
    markStepComplete("identity");
  };

  const handleAgreementComplete = (data: any) => {
    setAgreementData(data);
    markStepComplete("agreement");
  };

  const handlePaymentComplete = (data: any) => {
    setPaymentData(data);
    markStepComplete("payment");
    setTimeout(() => {
      setCurrentStep("confirmed");
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.key} className="flex items-center">
                <div className="flex items-center">
                  <motion.div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      completedSteps.has(step.key)
                        ? "bg-emerald-600 text-white"
                        : currentStep === step.key
                        ? "bg-emerald-100 text-emerald-600 border-2 border-emerald-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: completedSteps.has(step.key) ? 1.1 : 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {completedSteps.has(step.key) ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      step.icon
                    )}
                  </motion.div>
                  <span className={`ml-2 text-sm font-medium ${
                    completedSteps.has(step.key)
                      ? "text-emerald-600"
                      : currentStep === step.key
                      ? "text-emerald-600"
                      : "text-gray-400"
                  }`}>
                    {step.label}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    completedSteps.has(step.key) ? "bg-emerald-600" : "bg-gray-200"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Property Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 mb-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{property?.title}</h1>
              <p className="text-gray-600 mt-1">
                ₹{property?.price?.toLocaleString("en-IN")}/month • {property?.sector}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="text-2xl font-bold text-emerald-600">
                ₹{(property?.price + 499).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-white rounded-xl shadow-sm"
          >
            {currentStep === "identity" && (
              <TrustFirstKYC
                onComplete={handleKYCComplete}
                property={property}
              />
            )}
            
            {currentStep === "agreement" && (
              <InstantAgreement
                kycData={kycData}
                property={property}
                onComplete={handleAgreementComplete}
              />
            )}
            
            {currentStep === "payment" && (
              <UnifiedPayment
                property={property}
                kycData={kycData}
                agreementData={agreementData}
                onComplete={handlePaymentComplete}
              />
            )}
            
            {currentStep === "confirmed" && (
              <BookingConfirmation
                property={property}
                kycData={kycData}
                paymentData={paymentData}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Cancel Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <button
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-700 text-sm underline"
          >
            Cancel and return to listing
          </button>
        </motion.div>
      </div>
    </div>
  );
}
