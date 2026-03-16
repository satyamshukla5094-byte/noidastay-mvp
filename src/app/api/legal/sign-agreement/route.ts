import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agreementId, otp } = body;

    if (!agreementId || !otp) {
      return NextResponse.json(
        { success: false, error: "Missing agreement ID or OTP" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Verify OTP
    const { data: otpData, error: otpError } = await supabase
      .from("otp_verifications")
      .select("*")
      .eq("agreement_id", agreementId)
      .eq("otp", otp)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (otpError || !otpData) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // Update agreement status to signed
    const { data: agreement, error: agreementError } = await supabase
      .from("legal_agreements")
      .update({
        status: "signed",
        signed_at: new Date().toISOString(),
      })
      .eq("id", agreementId)
      .select()
      .single();

    if (agreementError) throw agreementError;

    // Clean up OTP
    await supabase
      .from("otp_verifications")
      .delete()
      .eq("agreement_id", agreementId);

    return NextResponse.json({
      success: true,
      agreement,
    });

  } catch (error: any) {
    console.error("Agreement signing error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to sign agreement" },
      { status: 500 }
    );
  }
}
