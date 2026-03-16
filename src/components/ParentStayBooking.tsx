"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, Users, CreditCard, ShieldCheck, Loader2 } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

interface ParentStayBookingProps {
  propertyId: string;
  pricePerNight: number;
  userId: string;
  propertyTitle: string;
}

export default function ParentStayBooking({ propertyId, pricePerNight, userId, propertyTitle }: ParentStayBookingProps) {
  const [range, setRange] = useState<any>();
  const [loading, setLoading] = useState(false);
  const SERVICE_FEE = 199;

  const numberOfNights = range?.from && range?.to ? differenceInDays(range.to, range.from) : 0;
  const subtotal = numberOfNights * pricePerNight;
  const total = subtotal > 0 ? subtotal + SERVICE_FEE : 0;

  const handleBooking = async () => {
    if (!range?.from || !range?.to) return;
    setLoading(true);
    try {
      const response = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: crypto.randomUUID(),
          userId,
          amount: total,
          type: "short_term_parent",
          meta: {
            propertyId,
            checkIn: range.from,
            checkOut: range.to,
            nights: numberOfNights
          }
        }),
      });
      const data = await response.json();
      if (data.success) {
        // Trigger Razorpay flow (Step 3 logic integration)
        alert("Redirecting to payment for Parent Stay...");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-8 space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-50 rounded-2xl">
          <Users className="text-blue-600" size={24} />
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-900">Parent Guest Room</h3>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Short-Stay Booking</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-center p-4 bg-slate-50 rounded-3xl border border-slate-100">
          <DayPicker
            mode="range"
            selected={range}
            onSelect={setRange}
            disabled={{ before: new Date() }}
            styles={{
              caption: { color: '#0f172a', fontWeight: 'bold' },
              head_cell: { color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }
            }}
          />
        </div>

        {numberOfNights > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 p-6 bg-slate-900 rounded-3xl text-white shadow-xl"
          >
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">₹{pricePerNight} × {numberOfNights} nights</span>
              <span className="font-bold">₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">NoidaStay Service Fee</span>
              <span className="font-bold">₹{SERVICE_FEE}</span>
            </div>
            <div className="border-t border-slate-800 pt-4 flex justify-between items-center">
              <span className="font-bold">Total Amount</span>
              <span className="text-2xl font-black text-blue-400">₹{total}</span>
            </div>
          </motion.div>
        )}
      </div>

      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-3">
        <ShieldCheck className="text-emerald-600 shrink-0" size={20} />
        <p className="text-[10px] text-emerald-800 leading-relaxed font-bold uppercase tracking-tight">
          Instant Booking: No rent agreement needed for short stays. Digital check-in voucher generated post-payment.
        </p>
      </div>

      <button
        disabled={loading || !numberOfNights}
        onClick={handleBooking}
        className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-black transition-all disabled:opacity-50"
      >
        {loading ? <Loader2 className="animate-spin" /> : <><CreditCard size={20} /> Book Now</>}
      </button>
    </div>
  );
}
