/**
 * Environment Variable Validation
 * This script ensures that critical security keys are present before the app starts.
 */

const requiredServerKeys = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "SARVAM_API_KEY",
  "RAZORPAY_KEY_SECRET",
  "RAZORPAY_WEBHOOK_SECRET",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN"
];

const requiredPublicKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SITE_URL"
];

export function validateEnv() {
  if (process.env.NODE_ENV === "development") return;

  const missing = [];

  // Check Private Keys (Server-side only)
  if (typeof window === "undefined") {
    for (const key of requiredServerKeys) {
      if (!process.env[key]) missing.push(key);
    }
  }

  // Check Public Keys
  for (const key of requiredPublicKeys) {
    if (!process.env[key]) missing.push(key);
  }

  if (missing.length > 0) {
    const errorMsg = `[CRITICAL SECURITY ERROR]: Missing required environment variables: ${missing.join(", ")}`;
    console.error(errorMsg);
    
    if (process.env.NODE_ENV === "production") {
      throw new Error(errorMsg);
    }
  }
}
