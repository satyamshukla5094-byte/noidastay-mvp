import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body;
    if (!userId) {
      return NextResponse.json({ success: false, error: "userId required" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ success: false, error: "Supabase config missing" }, { status: 500 });
    }
    const supabase = createClient(supabaseUrl, serviceKey);

    // Delete storage files from vault and legacy student-documents
    const deleteInBucket = async (bucket: string) => {
      const { data: files } = await supabase.storage.from(bucket).list(`${userId}/`, { limit: 200, offset: 0 });
      if (files) {
        const paths = files.map((f: any) => `${userId}/${f.name}`);
        if (paths.length > 0) {
          await supabase.storage.from(bucket).remove(paths);
        }
      }
    };
    await deleteInBucket("student-documents");
    await deleteInBucket("vault-documents");

    // Remove legal agreements and access logs for this user
    await supabase.from("legal_agreements").delete().or(`student_id.eq.${userId},owner_id.eq.${userId}`);
    await supabase.from("vault_access_logs").delete().eq("user_id", userId);

    // Clear sensitive profile fields
    const { error } = await supabase.from("profiles").update({
      aadhaar_number: null,
      pan_number: null,
      aadhaar_number_enc: null,
      pan_number_enc: null,
      aadhaar_scan_vault_path: null,
      aadhaar_front_vault_path: null,
      aadhaar_back_vault_path: null,
      pan_card_vault_path: null,
      masked_id: null,
      permanent_address: null,
      kyc_status: "pending",
    }).eq("id", userId);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Data deleted" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
