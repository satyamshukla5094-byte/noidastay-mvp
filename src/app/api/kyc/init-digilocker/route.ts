import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    // Generate OAuth state
    const state = Math.random().toString(36).substring(2, 15);
    
    // Store state (in production, use Redis or database)
    // For now, we'll return it to be stored in session

    // Construct DigiLocker OAuth URL
    const digioUrl = `https://app.digio.in/oauth?client_id=${process.env.NEXT_PUBLIC_DIGIO_CLIENT_ID}&redirect_uri=${encodeURIComponent(`${process.env.NEXT_PUBLIC_SITE_URL}/api/kyc/digilocker-callback`)}&response_type=code&state=${state}&scope=read+aadhaar`;

    return NextResponse.json({
      success: true,
      oauthUrl: digioUrl,
      state,
    });

  } catch (error: any) {
    console.error("DigiLocker OAuth init error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to initiate DigiLocker OAuth" },
      { status: 500 }
    );
  }
}
