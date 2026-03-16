import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { transactionId, adminId } = await request.json();

    if (!transactionId || !adminId) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // Initialize Supabase Admin Client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Fetch transaction and verify it's in escrow_held status
    const { data: tx, error: fetchError } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", transactionId)
      .single();

    if (fetchError || !tx) {
      return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 });
    }

    if (tx.status !== "escrow_held") {
      return NextResponse.json({ success: false, error: `Cannot release funds from status: ${tx.status}` }, { status: 400 });
    }

    // 2. Perform Release Logic
    // In a real production app, this would trigger a Razorpay Transfer or Payout.
    // Here we update the internal status to 'released'.
    const { error: updateError } = await supabase
      .from("transactions")
      .update({ 
        status: "released",
        updated_at: new Date().toISOString()
      })
      .eq("id", transactionId);

    if (updateError) throw updateError;

    // 3. Log the release in Audit Logs
    await supabase.from("audit_logs").insert({
      user_id: adminId,
      action_type: "ESCROW_RELEASED",
      details: {
        transaction_id: transactionId,
        amount: tx.amount,
        type: tx.type,
        released_by: adminId
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Funds released from escrow successfully.",
      type: tx.type
    });

  } catch (error: any) {
    console.error("Escrow Release Error:", error);
    return NextResponse.json({ success: false, error: "Failed to release funds" }, { status: 500 });
  }
}
