import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "@supabase/supabase-js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
  try {
    const { bookingId, userId, amount, type } = await request.json();

    if (!bookingId || !userId || !amount || !type) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // Initialize Supabase Admin Client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Create Razorpay Order
    const options = {
      amount: Math.round(amount * 100), // amount in the smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_${bookingId}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // Store pending transaction in Supabase
    const { error: txError } = await supabase
      .from("transactions")
      .insert({
        booking_id: bookingId,
        user_id: userId,
        amount: amount,
        status: "pending",
        type: type,
        razorpay_order_id: order.id
      });

    if (txError) throw txError;

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });

  } catch (error: any) {
    console.error("Payment Order Creation Error:", error);
    return NextResponse.json({ success: false, error: "Failed to create payment order" }, { status: 500 });
  }
}
