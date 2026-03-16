import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get user's DigiLocker verification status
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        is_digilocker_verified,
        digilocker_verified_at,
        digilocker_request_id,
        kyc_status,
        kyc_verified,
        full_name,
        masked_id
      `)
      .eq("id", userId)
      .single();

    if (error) {
      throw new Error("Failed to fetch verification status");
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      digilockerVerified: data.is_digilocker_verified,
      verifiedAt: data.digilocker_verified_at,
      requestId: data.digilocker_request_id,
      kycStatus: data.kyc_status,
      kycVerified: data.kyc_verified,
      fullName: data.full_name,
      maskedId: data.masked_id,
    });

  } catch (error: any) {
    console.error("DigiLocker status check error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check verification status" },
      { status: 500 }
    );
  }
}
