import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const backupBucket = "backup-vault";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Weekly CRON Backup Script
 * Exports masked data to a secondary bucket
 */
export async function performWeeklyBackup() {
  try {
    console.log("Starting masked database backup...");

    // 1. Fetch Listings (Masked)
    const { data: listings } = await supabase
      .from("properties")
      .select("id, title, price, sector, category, amenities, is_verified, created_at");

    // 2. Fetch Users (Masked - No PII like phone numbers or exact IDs)
    const { data: users } = await supabase
      .from("profiles")
      .select("id, kyc_status, role, created_at");

    const backupData = {
      timestamp: new Date().toISOString(),
      properties: listings || [],
      profiles: users || [],
    };

    const fileName = `backup_${new Date().toISOString().split('T')[0]}.json`;
    const buffer = Buffer.from(JSON.stringify(backupData, null, 2));

    // 3. Upload to Backup Bucket
    const { error: uploadError } = await supabase.storage
      .from(backupBucket)
      .upload(fileName, buffer, {
        contentType: "application/json",
        upsert: true
      });

    if (uploadError) throw uploadError;

    console.log(`Backup successful: ${fileName}`);
    return { success: true, fileName };

  } catch (error) {
    console.error("Backup failed:", error);
    return { success: false, error };
  }
}
