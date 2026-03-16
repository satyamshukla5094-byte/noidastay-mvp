"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, CreditCard, Lock, Info, Loader2, CheckCircle, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Script from "next/script";
import { useSearchParams } from "next/navigation";

export default function CheckoutPage({ params }: { params: { bookingId: string } }) {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [property, setProperty] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const BROKERAGE_FEE = 499;
  const isGroupBooking = searchParams.get("group") === "true";

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(profileData);

      // In MVP, we fetch the property linked to the booking (mocked logic here)
      const { data: propData } = await supabase.from("properties").select("*").limit(1).single();
      setProperty(propData);
      
      setLoading(false);
    }
    fetchData();
  }, []);

  const handlePayment = async () => {
    if (!profile || !property) return;
    setProcessing(true);

    const totalAmount = BROKERAGE_FEE + Number(property.price);
    const discount = isGroupBooking ? (BROKERAGE_FEE * 0.1) : 0;
    const finalBrokerage = BROKERAGE_FEE - discount;
    const finalTotal = finalBrokerage + Number(property.price);
    
    const response = await fetch("/api/bookings/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookingId: params.bookingId,
        userId: profile.id,
        amount: totalAmount,
        type: "security_deposit"
      }),
    });

    const orderData = await response.json();
    if (!orderData.success) throw new Error(orderData.error);

    try {
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "NoidaStay",
        description: `Booking for ${property.title}`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          // In a real app, the webhook handles the status update, 
          // but we'll redirect the user here.
          window.location.href = `/dashboard/agreement?bookingId=${params.bookingId}`;
        },
        prefill: {
          name: profile.full_name,
          contact: profile.whatsapp_number,
        },
        theme: {
          color: "#000000",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-gray-900 p-8 text-white">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-widest mb-4">
              <ShieldCheck size={16} />
              Escrow Protection Active
            </div>
            <h1 className="text-3xl font-extrabold">Complete Booking</h1>
            <p className="text-gray-400 mt-2">Secure your stay at {property?.title}</p>
          </div>

          <div className="p-8">
            {isGroupBooking && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3">
                <Sparkles className="text-emerald-600" size={20} />
                <div>
                  <p className="text-xs font-black text-emerald-700 uppercase tracking-widest">Group Discount Applied!</p>
                  <p className="text-[10px] text-emerald-600 font-medium">10% off Brokerage Fee for booking with your matched roommate.</p>
                </div>
              </div>
            )}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Brokerage Fee</span>
                  <span className="font-bold">₹{BROKERAGE_FEE}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Security Deposit (Escrow)</span>
                  <span className="font-bold">₹{property?.price}</span>
                </div>
                <div className="border-t pt-4 flex justify-between items-center">
                  <span className="font-bold text-lg">Total Amount</span>
                  <span className="font-black text-2xl text-blue-600">₹{BROKERAGE_FEE + Number(property?.price)}</span>
                </div>
              </div>

              <div className="bg-blue-50 rounded-2xl p-4 flex gap-3 text-blue-800 text-sm">
                <Info size={20} className="shrink-0" />
                <p>
                  <b>Security Guarantee:</b> Your deposit is held in a secure escrow and protected by NoidaStay until your move-in is confirmed.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm flex items-center gap-2">
                  <CreditCard size={18} />
                  {error}
                </div>
              )}

              <button
                onClick={handlePayment}
                disabled={processing}
                className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg hover:shadow-gray-200"
              >
                {processing ? <Loader2 className="animate-spin" /> : <Lock size={20} />}
                Pay & Secure Deposit
              </button>
            </div>

            <div className="mt-8 pt-8 border-t flex items-center justify-center gap-6 opacity-40">
              <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" alt="Razorpay" className="h-4" />
              <div className="w-px h-4 bg-gray-300" />
              <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest">
                <CheckCircle size={10} /> 100% Secure
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
