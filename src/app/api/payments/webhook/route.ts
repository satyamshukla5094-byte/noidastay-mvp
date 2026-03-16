import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);
    const { payload } = event;

    if (event.event === "payment.captured") {
      const payment = payload.payment.entity;
      const orderId = payment.order_id;

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Update transaction status to escrow_held
      const { data: txData, error: txError } = await supabase
        .from("transactions")
        .update({
          status: "escrow_held",
          razorpay_payment_id: payment.id,
          razorpay_signature: signature,
          updated_at: new Date().toISOString()
        })
        .eq("razorpay_order_id", orderId)
        .select()
        .single();

      if (txError) throw txError;

      // Trigger Post-Payment Automation (Digital Signature Flow)
      // For MVP, we'll hit our internal API or update a flag that the UI listens to
      await supabase.from("audit_logs").insert({
        user_id: txData.user_id,
        action_type: "PAYMENT_VERIFIED",
        details: {
          order_id: orderId,
          type: txData.type,
          amount: txData.amount
        }
      });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Webhook Processing Error:", error);
    return NextResponse.json({ success: false, error: "Webhook failed" }, { status: 500 });
  }
}
