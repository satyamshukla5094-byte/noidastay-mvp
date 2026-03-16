import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { userId, consentType, status, details } = await request.json();
    if (!userId || !consentType || !status) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ success: false, error: "Supabase config missing" }, { status: 500 });
    }

    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const supabase = createClient(supabaseUrl, serviceKey);
    const { error } = await supabase.from("consent_records").insert({
      user_id: userId,
      consent_type: consentType,
      status,
      ip_address: ip,
      details: details ?? {},
    });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, status: "logged" });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, error: err.message || "Failed" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ success: false, error: "userId required" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ success: false, error: "Supabase config missing" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const { data, error } = await supabase
      .from("consent_records")
      .select("id,consent_type,status,timestamp,ip_address,details")
      .eq("user_id", userId)
      .order("timestamp", { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, records: data });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, error: err.message || "Failed" }, { status: 500 });
  }
}
