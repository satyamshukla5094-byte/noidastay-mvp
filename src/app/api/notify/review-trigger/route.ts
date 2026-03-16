import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // This would ideally be a cron job, but we'll implement the logic 
    // to check for eligible bookings (moved in 7 days ago)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateStr = sevenDaysAgo.toISOString().split('T')[0];

    const { data: bookings, error: fetchError } = await supabase
      .from("legal_agreements")
      .select("*, profiles!legal_agreements_student_id_fkey(full_name, whatsapp_number), properties(title)")
      .eq("move_in_date", dateStr)
      .eq("status", "active");

    if (fetchError) throw fetchError;

    for (const booking of (bookings || [])) {
      // Trigger WhatsApp notification logic
      console.log(`[REVIEW TRIGGER]: Sending WhatsApp to ${booking.profiles.whatsapp_number}: Hi ${booking.profiles.full_name}, How's your stay at ${booking.properties.title} so far? Leave a review and earn 50 NoidaStay Credits! Link: ${process.env.NEXT_PUBLIC_SITE_URL}/property/${booking.property_id}#reviews`);
      
      // Log notification
      await supabase.from("audit_logs").insert({
        user_id: booking.student_id,
        action_type: "REVIEW_NOTIFICATION_SENT",
        details: { booking_id: booking.id }
      });
    }

    return NextResponse.json({ success: true, processed: bookings?.length || 0 });
  } catch (error: any) {
    console.error("Review Trigger Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
