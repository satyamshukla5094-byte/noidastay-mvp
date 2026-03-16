"use client";

import { motion } from "framer-motion";
import { CheckCircle, Home, Calendar, Phone, Download, Share2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface BookingConfirmationProps {
  property: any;
  kycData: any;
  paymentData: any;
}

export default function BookingConfirmation({ property, kycData, paymentData }: BookingConfirmationProps) {
  const supabase = createClient();

  const downloadVoucher = async () => {
    try {
      const response = await fetch(`/api/legal/generate-voucher?transactionId=${paymentData.transactionId}`);
      const result = await response.json();
      
      if (result.success && result.voucherUrl) {
        window.open(result.voucherUrl, "_blank");
      }
    } catch (error) {
      console.error("Failed to download voucher:", error);
    }
  };

  const shareConfirmation = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "I've booked a PG with NoidaStay!",
          text: `Just secured my room at ${property.title} in ${property.sector}. Moving in soon! 🎉`,
          url: `${window.location.origin}/property/${property.id}`,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    }
  };

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="text-center mb-8"
      >
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          You're all set! 🎉
        </h2>
        <p className="text-xl text-emerald-600 font-semibold">
          See you at {property.title}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-2xl mx-auto"
      >
        {/* Success Card */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 mb-6">
          <div className="text-center mb-4">
            <Home className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
            <h3 className="text-xl font-bold text-emerald-900">Booking Confirmed</h3>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Property:</span>
                <p className="font-semibold text-gray-900">{property.title}</p>
              </div>
              <div>
                <span className="text-gray-600">Location:</span>
                <p className="font-semibold text-gray-900">{property.sector}</p>
              </div>
              <div>
                <span className="text-gray-600">Tenant:</span>
                <p className="font-semibold text-gray-900">{kycData.fullName}</p>
              </div>
              <div>
                <span className="text-gray-600">Amount Paid:</span>
                <p className="font-semibold text-emerald-600">
                  ₹{paymentData.amount.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Next Steps
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                1
              </div>
              <div>
                <p className="font-medium text-blue-900">Download Check-in Voucher</p>
                <p className="text-sm text-blue-700">Show this voucher at the property for check-in</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                2
              </div>
              <div>
                <p className="font-medium text-blue-900">Schedule Move-in</p>
                <p className="text-sm text-blue-700">Contact property owner to arrange move-in time</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                3
              </div>
              <div>
                <p className="font-medium text-blue-900">Complete Room Audit</p>
                <p className="text-sm text-blue-700">Document room condition during move-in</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={downloadVoucher}
            className="bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download Check-in Voucher
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={shareConfirmation}
            className="bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            Share Confirmation
          </motion.button>
        </div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 p-4 bg-gray-50 rounded-lg"
        >
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <Phone className="w-4 h-4" />
            <span className="text-sm">
              Need help? Contact us at support@noidastay.in or call +91 99999 99999
            </span>
          </div>
        </motion.div>

        {/* Important Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg"
        >
          <p className="text-sm text-amber-800">
            <strong>Important:</strong> Your security deposit is held in escrow and will be released to the owner only after successful move-in. Your rental agreement is legally binding.
          </p>
        </motion.div>
      </motion.div>

      {/* Confetti Animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 2, delay: 0.5 }}
        className="fixed inset-0 pointer-events-none"
      >
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: -20,
              rotate: Math.random() * 360
            }}
            animate={{ 
              y: window.innerHeight + 20,
              rotate: Math.random() * 720
            }}
            transition={{ 
              duration: 3 + Math.random() * 2,
              delay: Math.random() * 0.5,
              repeat: Infinity,
              repeatDelay: Math.random() * 2
            }}
            className="absolute w-2 h-2 bg-emerald-500 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}
