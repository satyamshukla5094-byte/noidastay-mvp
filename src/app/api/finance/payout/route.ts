import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Decimal } from "decimal.js";

/**
 * Marks a ledger entry as processed and potentially triggers the actual payout.
 */
export async function POST(request: Request) {
  try {
    const { ledgerId, adminId } = await request.json();

    if (!ledgerId || !adminId) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Fetch ledger entry
    const { data: entry, error: fetchError } = await supabase
      .from("revenue_ledger")
      .select("*, transactions(*, profiles(*))")
      .eq("id", ledgerId)
      .single();

    if (fetchError || !entry) {
      return NextResponse.json({ success: false, error: "Ledger entry not found" }, { status: 404 });
    }

    if (entry.payout_status === "processed") {
      return NextResponse.json({ success: false, error: "Payout already processed" }, { status: 400 });
    }

    // 2. Update status
    const { error: updateError } = await supabase
      .from("revenue_ledger")
      .update({ 
        payout_status: "processed",
        updated_at: new Date().toISOString()
      })
      .eq("id", ledgerId);

    if (updateError) throw updateError;

    // 3. Log Audit Trail
    await supabase.from("audit_logs").insert({
      user_id: adminId,
      action_type: "FINANCIAL_PAYOUT_PROCESSED",
      details: {
        ledger_id: ledgerId,
        amount_net: entry.amount_net,
        owner_id: entry.transactions.user_id,
        processed_by: adminId
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Payout marked as processed successfully."
    });

  } catch (error: any) {
    console.error("Payout Trigger Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
