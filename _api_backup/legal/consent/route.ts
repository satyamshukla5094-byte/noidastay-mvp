import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, consentType } = body;
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ success: false, error: "Supabase config missing" }, { status: 500 });
    }
    const supabase = createClient(supabaseUrl, serviceKey);
    await supabase.from("consent_logs").insert({ user_id: userId, ip_address: ip, consent_type: consentType });
    await supabase.from("consent_records").insert({ user_id: userId, consent_type: consentType, status: "Granted", ip_address: ip });
    return NextResponse.json({ success: true, acknowledged: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Failed to log consent" }, { status: 500 });
  }
}
