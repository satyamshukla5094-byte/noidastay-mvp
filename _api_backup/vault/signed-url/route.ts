import { NextResponse } from "next/server";
import { getSignedUrl } from "@/lib/vault";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, filePath, agreementId } = body;
    if (!userId || !filePath) {
      return NextResponse.json({ success: false, error: "userId and filePath are required" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ success: false, error: "Supabase config missing" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const { data: agreement, error: agreementError } = agreementId
      ? await supabase.from("legal_agreements").select("security_deposit_escrowed, student_id, owner_id").eq("id", agreementId).single()
      : { data: null, error: null };

    if (agreementError) {
      return NextResponse.json({ success: false, error: "Agreement lookup failed" }, { status: 500 });
    }
    if (agreement && agreement.owner_id === userId && !agreement.security_deposit_escrowed) {
      return NextResponse.json({ success: false, error: "Owner cannot access student ID before escrow completion" }, { status: 403 });
    }

    const signedUrl = await getSignedUrl(filePath);

    return NextResponse.json({ success: true, signedUrl });
  } catch (error: any) {
    console.error("Signed URL error", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to sign" }, { status: 500 });
  }
}
