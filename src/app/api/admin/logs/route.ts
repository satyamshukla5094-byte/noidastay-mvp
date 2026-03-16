import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ success: false, error: "Supabase missing" }, { status: 500 });
  }
  const supabase = createClient(supabaseUrl, serviceKey);
  const { data: docLogs, error: docError } = await supabase.from("document_access_logs").select("id,user_id,document_path,action,accessed_at,ip_address").order("accessed_at", { ascending: false }).limit(100);
  const { data: vaultLogs, error: vaultError } = await supabase.from("vault_access_logs").select("id,user_id,file_path,action,accessed_at,ip_address").order("accessed_at", { ascending: false }).limit(100);
  const { data: auditLogs, error: auditError } = await supabase.from("audit_logs").select("id,user_id,action_type,document_id,timestamp").order("timestamp", { ascending: false }).limit(100);
  if (docError || vaultError || auditError) {
    return NextResponse.json({ success: false, error: (docError || vaultError || auditError)?.message || "error fetching logs" }, { status: 500 });
  }

  const normalized = [
    ...(docLogs || []).map((log: any) => ({ ...log, document_path: log.document_path, action: log.action, timestamp: log.accessed_at, log_type: "document" })),
    ...(vaultLogs || []).map((log: any) => ({ id: log.id, user_id: log.user_id, document_path: log.file_path, action: log.action, timestamp: log.accessed_at, ip_address: log.ip_address, log_type: "vault" })),
    ...(auditLogs || []).map((log: any) => ({ id: log.id, user_id: log.user_id, action: log.action_type, document_path: log.document_id, timestamp: log.timestamp, log_type: "audit" })),
  ];
  normalized.sort((a, b) => new Date(b.timestamp || b.accessed_at).getTime() - new Date(a.timestamp || a.accessed_at).getTime());

  return NextResponse.json({ success: true, logs: normalized.slice(0, 200) });
}
