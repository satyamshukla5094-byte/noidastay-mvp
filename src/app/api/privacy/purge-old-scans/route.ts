import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ success: false, error: "Supabase config missing" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  const threshold = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString();
  let expiredProfiles: any[] = [];
  let error: any = null;

  const query = await supabase
    .from("profiles")
    .select("id, aadhaar_scan_vault_path, aadhaar_front_vault_path, aadhaar_back_vault_path, pan_card_vault_path, stay_end_at");

  if (query.error) {
    // If profile columns are not present, we cannot run retention automatically.
    return NextResponse.json({ success: false, error: query.error.message || "Unable to query profiles" }, { status: 500 });
  }

  expiredProfiles = (query.data || []).filter((p: any) => {
    if (!p.stay_end_at) return false;
    return new Date(p.stay_end_at) < new Date(threshold);
  });

  const userIds = (expiredProfiles || []).map((p: any) => p.id);
  const removed: string[] = [];

  for (const profile of expiredProfiles || []) {
    const paths = [profile.aadhaar_scan_vault_path, profile.aadhaar_front_vault_path, profile.aadhaar_back_vault_path, profile.pan_card_vault_path].filter(Boolean);
    for (const path of paths) {
      try {
        await supabase.storage.from("vault-documents").remove([path]);
        removed.push(path);
      } catch {
        // ignore any removal failure
      }
    }
  }

  return NextResponse.json({ success: true, deleted: removed, users_affected: userIds.length });
}
