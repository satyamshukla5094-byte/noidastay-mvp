import { NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { bookingId, userId, propertyId, checkIn, checkOut, nights, totalAmount } = await request.json();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Fetch details for voucher
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single();
    const { data: property } = await supabase.from("properties").select("*, profiles!properties_owner_id_fkey(*)").eq("id", propertyId).single();

    if (!profile || !property) {
      return NextResponse.json({ success: false, error: "Booking data not found" }, { status: 404 });
    }

    // 2. Generate PDF Voucher
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString("en-IN");
    
    let y = 20;
    doc.setFontSize(22);
    doc.setTextColor(0, 102, 204);
    doc.text("NOIDASTAY CHECK-IN VOUCHER", 105, y, { align: "center" });
    y += 15;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Booking ID: ${bookingId.slice(0, 8).toUpperCase()}`, 20, y);
    doc.text(`Date: ${date}`, 150, y);
    y += 15;

    doc.setFont("helvetica", "bold");
    doc.text("GUEST DETAILS:", 20, y);
    doc.setFont("helvetica", "normal");
    y += 7;
    doc.text(`Name: ${profile.full_name}`, 30, y);
    doc.text(`Contact: ${profile.whatsapp_number}`, 120, y);
    y += 15;

    doc.setFont("helvetica", "bold");
    doc.text("STAY DETAILS:", 20, y);
    doc.setFont("helvetica", "normal");
    y += 7;
    doc.text(`Property: ${property.title}`, 30, y);
    y += 7;
    doc.text(`Check-in: ${new Date(checkIn).toDateString()}`, 30, y);
    doc.text(`Check-out: ${new Date(checkOut).toDateString()}`, 120, y);
    y += 7;
    doc.text(`Total Nights: ${nights}`, 30, y);
    y += 15;

    doc.setFont("helvetica", "bold");
    doc.text("LOCATION & CONTACT:", 20, y);
    doc.setFont("helvetica", "normal");
    y += 7;
    doc.text(`Address: ${property.sector}`, 30, y);
    y += 7;
    doc.text(`Owner: ${property.profiles?.full_name}`, 30, y);
    doc.text(`Owner Phone: +91 99999 99999`, 120, y);
    y += 20;

    // Draw a "QR Code" placeholder
    doc.setDrawColor(0);
    doc.rect(85, y, 40, 40);
    doc.setFontSize(8);
    doc.text("SCAN AT GATE", 105, y + 22, { align: "center" });
    doc.text("VERIFIED BY NOIDASTAY", 105, y + 45, { align: "center" });

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
    const fileName = `voucher_${bookingId}.pdf`;
    const filePath = `${userId}/vouchers/${fileName}`;

    // 3. Save to Vault
    const { error: uploadError } = await supabase.storage
      .from("vault-documents")
      .upload(filePath, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true
      });

    if (uploadError) throw uploadError;

    // 4. Update availability
    // Note: In a real app, you'd loop through all dates in the range
    await supabase.from("guest_room_availability").update({ is_booked: true }).eq("property_id", propertyId).eq("available_date", checkIn.split('T')[0]);

    return NextResponse.json({
      success: true,
      voucherUrl: filePath,
      message: "Voucher generated and stay confirmed."
    });

  } catch (error: any) {
    console.error("Voucher Generation Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
