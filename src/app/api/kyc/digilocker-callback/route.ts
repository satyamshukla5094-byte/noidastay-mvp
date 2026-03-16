import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // Handle OAuth errors
    if (error) {
      console.error("DigiLocker OAuth error:", error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/wizard?error=digilocker_auth_failed`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/wizard?error=missing_oauth_params`
      );
    }

    // Validate state
    const storedState = sessionStorage.getItem('digilocker_state');
    const userId = sessionStorage.getItem('user_id');
    
    if (state !== storedState || !userId) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/wizard?error=invalid_state`
      );
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch("https://app.digio.in/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.DIGIO_CLIENT_ID!,
        client_secret: process.env.DIGIO_CLIENT_SECRET!,
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL}/api/kyc/digilocker-callback`,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange authorization code");
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Fetch user data from DigiLocker
    const kycResponse = await fetch("https://api.digio.in/v2/kyc/aadhaar", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!kycResponse.ok) {
      throw new Error("Failed to fetch KYC data from DigiLocker");
    }

    const kycData = await kycResponse.json();

    // Extract relevant data from DigiLocker response
    const extractedData = {
      fullName: kycData.name || kycData.full_name,
      idNumber: kycData.aadhaar_number || kycData.uid,
      address: kycData.address || kycData.full_address,
      dob: kycData.date_of_birth || kycData.dob,
      email: kycData.email,
      phone: kycData.mobile_number || kycData.phone,
      digilockerId: kycData.digilocker_id,
      xmlHash: crypto.createHash('sha256').update(JSON.stringify(kycData)).digest('hex'),
    };

    // Mask ID number
    const maskedId = maskIdNumber(extractedData.idNumber);

    // Store in Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check for duplicate ID
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("masked_id", maskedId)
      .neq("id", userId)
      .single();

    if (existingProfile) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/wizard?error=duplicate_id`
      );
    }

    // Update profile with DigiLocker data
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        kyc_status: "verified",
        kyc_verified: true,
        kyc_method: "digilocker",
        is_digilocker_verified: true,
        digilocker_verified_at: new Date().toISOString(),
        digilocker_request_id: kycData.request_id,
        digilocker_xml_hash: extractedData.xmlHash,
        masked_id: maskedId,
        permanent_address: extractedData.address,
        full_name: extractedData.fullName,
        phone: extractedData.phone,
      })
      .eq("id", userId);

    if (updateError) {
      throw new Error("Failed to update profile");
    }

    // Log the audit
    await supabase.from("audit_logs").insert({
      user_id: userId,
      action_type: "KYC_VERIFICATION",
      details: {
        method: "digilocker",
        masked_id: maskedId,
        digilocker_id: extractedData.digilockerId,
        provider_response: {
          request_id: kycData.request_id,
          status: "success"
        }
      }
    });

    // Send Discord alert
    const { sendDiscordAlert } = await import("@/lib/alerts/discord");
    await sendDiscordAlert("KYC", "DigiLocker Verified", `User ${extractedData.fullName} verified via DigiLocker!`, [
      { name: "User ID", value: userId, inline: true },
      { name: "Method", value: "DigiLocker", inline: true },
      { name: "Processing Time", value: "< 30 seconds", inline: true }
    ]);

    // Clean up session storage
    sessionStorage.removeItem('digilocker_state');
    sessionStorage.removeItem('user_id');

    // Redirect with success
    const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/wizard?digilocker_success=true&data=${encodeURIComponent(JSON.stringify({
      fullName: extractedData.fullName,
      idNumber: maskedId,
      address: extractedData.address,
      dob: extractedData.dob,
      kyc_method: "digilocker",
      instant_verified: true
    }))}`;

    return NextResponse.redirect(redirectUrl);

  } catch (error: any) {
    console.error("DigiLocker callback error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/wizard?error=digilocker_processing_failed`
    );
  }
}

function maskIdNumber(id: string) {
  const cleaned = id.replace(/\s+/g, "");
  if (cleaned.length <= 4) return "****";
  const visible = cleaned.slice(-4);
  return "XXXX-XXXX-" + visible;
}
