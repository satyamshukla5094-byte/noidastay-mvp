import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { sendDiscordAlert } from "@/lib/alerts/discord";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      // Log unauthorized attempt
      const ip = request.headers.get("x-forwarded-for") || "unknown";
      await sendDiscordAlert("SECURITY", "Invalid Webhook Signature", `Unauthorized attempt to hit payment webhook from IP: ${ip}`, [
        { name: "Attempted IP", value: ip, inline: true }
      ]);
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
        .select("*, profiles(full_name)")
        .single();

      if (txError) throw txError;

      // Send Payment Success Alert
      await sendDiscordAlert("PAYMENT", "Payment Success", `New Escrow deposit of ₹${txData.amount} received!`, [
        { name: "Student", value: txData.profiles?.full_name || "Unknown", inline: true },
        { name: "Order ID", value: orderId, inline: true }
      ]);

      // Trigger Post-Payment Automation (Digital Signature Flow)
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
