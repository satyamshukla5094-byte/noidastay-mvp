import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { visitId, studentId, ownerId, propertyTitle, scheduledAt, type } = await request.json();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch phone numbers
    const { data: owner } = await supabase.from("profiles").select("whatsapp_number, full_name").eq("id", ownerId).single();
    const { data: student } = await supabase.from("profiles").select("whatsapp_number, full_name").eq("id", studentId).single();

    const formattedTime = new Date(scheduledAt).toLocaleString('en-IN', { 
      dateStyle: 'medium', 
      timeStyle: 'short' 
    });

    if (type === "NEW_REQUEST") {
      // Notify Owner
      console.log(`[WHATSAPP TO OWNER ${owner?.whatsapp_number}]: Hi ${owner?.full_name}, a Verified Student (${student?.full_name}) wants to visit ${propertyTitle} on ${formattedTime}. Reply YES to confirm: ${process.env.NEXT_PUBLIC_SITE_URL}/v/confirm/${visitId} - NoidaStay`);
      
      // Notify Student
      console.log(`[WHATSAPP TO STUDENT ${student?.whatsapp_number}]: Great choice! Your visit to ${propertyTitle} is requested for ${formattedTime}. We'll notify you once the owner confirms. - NoidaStay`);
    }

    if (type === "VISIT_CONFIRMED") {
      // Notify Student with Location
      console.log(`[WHATSAPP TO STUDENT ${student?.whatsapp_number}]: Your visit to ${propertyTitle} on ${formattedTime} is CONFIRMED! ✅ Exact Location: https://maps.google.com/?q=${encodeURIComponent(propertyTitle + " Greater Noida")} - Verified by NoidaStay`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("WhatsApp Notification Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
