import { createClient } from "@supabase/supabase-js";

export async function triggerPostPaymentFlow(bookingId: string, userId: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // 1. Fetch booking/agreement details to ensure everything is ready
    const { data: profile } = await supabase
      .from("profiles")
      .select("kyc_status")
      .eq("id", userId)
      .single();

    if (profile?.kyc_status !== "verified") {
      console.warn(`User ${userId} is not KYC verified. Skipping automated signature trigger.`);
      return;
    }

    // 2. Log that we are initiating the post-payment legal flow
    await supabase.from("audit_logs").insert({
      user_id: userId,
      action_type: "POST_PAYMENT_FLOW_INITIATED",
      details: { booking_id: bookingId }
    });

    // 3. In a real-world production app, this would trigger an email/SMS 
    // to the user with the signing link generated in Step 2.
    // For this MVP, we are setting the stage for the UI to redirect.
    console.log(`Automation: Triggering Digital Signature flow for Booking ${bookingId}`);

  } catch (error) {
    console.error("Post-Payment Automation Error:", error);
  }
}
