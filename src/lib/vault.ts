import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const VAULT_BUCKET = "vault-documents";

function getAdminSupabase() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase vault config missing");
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

export async function ensureVaultBucket() {
  const adminSupabase = getAdminSupabase();
  const existingBuckets = await adminSupabase.storage.listBuckets();
  if (!existingBuckets.data?.some((b: any) => b.name === VAULT_BUCKET)) {
    await adminSupabase.storage.createBucket(VAULT_BUCKET, { public: false });
  }
}

export async function uploadSignedAgreement({
  pdfBuffer,
  userId,
  propertyId,
  bookingId
}: {
  pdfBuffer: Buffer;
  userId: string;
  propertyId: string;
  bookingId?: string;
}) {
  const adminSupabase = getAdminSupabase();
  await ensureVaultBucket();

  const documentHash = crypto.createHash("sha256").update(pdfBuffer).digest("hex");
  const fileName = `signed_${propertyId}_${Date.now()}.pdf`;
  const filePath = `${userId}/agreements/${fileName}`;

  // Upload to secure vault
  const { error: uploadError } = await adminSupabase.storage
    .from(VAULT_BUCKET)
    .upload(filePath, pdfBuffer, {
      contentType: "application/pdf",
      upsert: true,
      metadata: { user_id: userId, type: "signed_agreement" }
    });

  if (uploadError) throw uploadError;

  // Insert into legal_agreements table with integrity hash
  const { data, error: dbError } = await adminSupabase
    .from("legal_agreements")
    .insert({
      student_id: userId,
      property_id: propertyId,
      booking_id: bookingId || null,
      file_path: filePath,
      document_hash: documentHash,
      signed_at: new Date().toISOString(),
      status: "signed",
      security_deposit_escrowed: false
    })
    .select()
    .single();

  if (dbError) throw dbError;

  // Audit log
  await adminSupabase.from("audit_logs").insert({
    user_id: userId,
    action_type: "AGREEMENT_SIGNED",
    details: {
      agreement_id: data.id,
      document_hash: documentHash,
      file_path: filePath
    }
  });

  return data;
}
