"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CreditCard, CheckCircle, AlertCircle, Shield, Clock } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { loadRazorpay } from "@/lib/razorpay";

interface UnifiedPaymentProps {
  property: any;
  kycData: any;
  agreementData: any;
  onComplete: (data: any) => void;
}

export default function UnifiedPayment({ property, kycData, agreementData, onComplete }: UnifiedPaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [orderCreated, setOrderCreated] = useState(false);

  const supabase = createClient();

  const brokerageFee = 499;
  const securityDeposit = property.price;
  const totalAmount = brokerageFee + securityDeposit;

  useEffect(() => {
    createOrder();
  }, []);

  const createOrder = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Create Razorpay order for total amount
      const response = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalAmount * 100, // Convert to paise
          currency: "INR",
          receipt: `booking_${property.id}_${user.id}`,
          notes: {
            property_id: property.id,
            user_id: user.id,
            agreement_id: agreementData.agreementId,
            brokerage_fee: brokerageFee,
            security_deposit: securityDeposit,
          },
        }),
      });

      const result = await response.json();
      
      if (!result.success) throw new Error(result.error);

      setOrderCreated(true);
    } catch (err: any) {
      setError(err.message || "Failed to initialize payment");
    }
  };

  const handlePayment = async () => {
    if (!orderCreated) return;

    setIsProcessing(true);
    setError("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Load Razorpay
      const Razorpay = await loadRazorpay();
      
      // Create transaction record
      const { data: transaction, error: txError } = await supabase
        .from("transactions")
        .insert({
          user_id: user.id,
          property_id: property.id,
          type: "booking",
          amount: totalAmount,
          status: "pending",
          metadata: {
            kyc_data: kycData,
            agreement_id: agreementData.agreementId,
            breakdown: {
              brokerage_fee: brokerageFee,
              security_deposit: securityDeposit,
            },
          },
        })
        .select()
        .single();

      if (txError) throw txError;

      // Create Razorpay order for this transaction
      const orderResponse = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalAmount * 100,
          currency: "INR",
          receipt: transaction.id,
          notes: {
            transaction_id: transaction.id,
            property_id: property.id,
            user_id: user.id,
          },
        }),
      });

      const orderResult = await orderResponse.json();
      if (!orderResult.success) throw new Error(orderResult.error);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: totalAmount * 100,
        currency: "INR",
        name: "NoidaStay",
        description: `Booking: ${property.title}`,
        order_id: orderResult.order.id,
        prefill: {
          name: kycData.fullName,
          email: user.email || "",
          contact: "", // Will be filled by user
        },
        notes: {
          property_id: property.id,
          transaction_id: transaction.id,
        },
        handler: async (response: any) => {
          // Payment successful
          const verifyResponse = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              transaction_id: transaction.id,
            }),
          });

          const verifyResult = await verifyResponse.json();
          
          if (!verifyResult.success) {
            throw new Error(verifyResult.error);
          }

          // Update transaction status
          await supabase
            .from("transactions")
            .update({
              status: "escrow_held",
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
            .eq("id", transaction.id);

          onComplete({
            transactionId: transaction.id,
            paymentId: response.razorpay_payment_id,
            amount: totalAmount,
            paidAt: new Date().toISOString(),
          });
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
      };

      const rzp = new Razorpay(options);
      rzp.open();

    } catch (err: any) {
      setError(err.message || "Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Secure Payment
        </h2>
        <p className="text-gray-600">
          Single payment for brokerage fee and security deposit
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-2xl mx-auto"
      >
        {/* Payment Breakdown */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Payment Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Brokerage Fee (One-time)</span>
              <span className="font-medium">₹{brokerageFee.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Security Deposit (Refundable)</span>
              <span className="font-medium">₹{securityDeposit.toLocaleString("en-IN")}</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                <span className="text-2xl font-bold text-purple-600">
                  ₹{totalAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Property Summary */}
        <div className="bg-purple-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-purple-900 mb-2">Booking Summary</h4>
          <div className="text-sm text-purple-700">
            <p><strong>Property:</strong> {property.title}</p>
            <p><strong>Location:</strong> {property.sector}</p>
            <p><strong>Tenant:</strong> {kycData.fullName}</p>
          </div>
        </div>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Shield className="w-4 h-4 text-green-600" />
          <span className="text-sm text-gray-600">
            Payment protected by escrow until move-in
          </span>
        </div>

        {/* Payment Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handlePayment}
          disabled={!orderCreated || isProcessing}
          className="w-full bg-purple-600 text-white py-4 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing Payment...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Pay ₹{totalAmount.toLocaleString("en-IN")} to Secure Room
            </>
          )}
        </motion.button>

        {!orderCreated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-center"
          >
            <div className="inline-flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Initializing payment gateway...</span>
            </div>
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

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 grid grid-cols-3 gap-4 text-center"
        >
          <div className="p-3 bg-gray-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <p className="text-xs text-gray-600">Secure Payment</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <p className="text-xs text-gray-600">Escrow Protected</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <p className="text-xs text-gray-600">Instant Confirmation</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
