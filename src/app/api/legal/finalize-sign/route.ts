import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { jsPDF } from "jspdf";
import { uploadSignedAgreement } from "@/lib/vault";
import { verifyEsignStatus } from "@/lib/legal/esign-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, propertyId, documentId } = body;

    if (!userId || !propertyId || !documentId) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // 1. Verify e-Sign Status with Provider (Mocked for now)
    const isSigned = await verifyEsignStatus(documentId);
    if (!isSigned) {
      return NextResponse.json({ success: false, error: "Document not signed yet" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 2. Fetch data again to generate final signed PDF
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single();
    const { data: property } = await supabase.from("properties").select("*, profiles!properties_owner_id_fkey(*)").eq("id", propertyId).single();

    if (!profile || !property) {
      return NextResponse.json({ success: false, error: "Data fetch failed" }, { status: 404 });
    }

    // 3. Generate Final Signed PDF
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString("en-IN");
    
    let y = 20;
    doc.setFontSize(18);
    doc.text("FINAL SIGNED RENT AGREEMENT", 105, y, { align: "center" });
    y += 15;
    
    doc.setFontSize(12);
    doc.text(`Agreement Date: ${date}`, 20, y);
    y += 10;
    
    doc.setFont("helvetica", "bold");
    doc.text("OWNER:", 20, y);
    doc.setFont("helvetica", "normal");
    y += 7;
    doc.text(`${property.profiles?.full_name}`, 30, y);
    y += 10;

    doc.setFont("helvetica", "bold");
    doc.text("TENANT:", 20, y);
    doc.setFont("helvetica", "normal");
    y += 7;
    doc.text(`${profile.legal_full_name || profile.full_name}`, 30, y);
    y += 5;
    doc.text(`Aadhaar (Masked): ${profile.masked_id}`, 30, y);
    y += 15;

    doc.setFont("helvetica", "bold");
    doc.text("TERMS:", 20, y);
    doc.setFont("helvetica", "normal");
    y += 10;
    doc.text(`Rent: INR ${property.price}`, 30, y);
    y += 8;
    doc.text(`Deposit: INR ${property.price * 2}`, 30, y);
    y += 20;

    doc.setFont("helvetica", "bold");
    doc.text("DIGITAL SIGNATURE VERIFIED", 20, y);
    doc.setFontSize(10);
    y += 7;
    doc.text(`Signer: ${profile.legal_full_name || profile.full_name}`, 20, y);
    y += 5;
    doc.text(`E-Sign ID: ${documentId}`, 20, y);
    y += 5;
    doc.text(`Timestamp: ${new Date().toISOString()}`, 20, y);

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    // 4. Secure Storage & Hashing (Vault Sync)
    const agreementRecord = await uploadSignedAgreement({
      pdfBuffer,
      userId,
      propertyId,
    });

    return NextResponse.json({
      success: true,
      agreementId: agreementRecord.id,
      message: "Agreement signed and vaulted successfully."
    });

  } catch (error: any) {
    console.error("Finalize Sign Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
