import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { jsPDF } from "jspdf";
import { fillTemplate } from "@/lib/legal/agreement-template";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, propertyId } = body;

    if (!userId || !propertyId) {
      return NextResponse.json({ success: false, error: "Missing userId or propertyId" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Check KYC Status
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
    }

    if (profile.kyc_status !== "verified") {
      return NextResponse.json({ 
        success: false, 
        error: "KYC verification required before signing agreement",
        currentStatus: profile.kyc_status 
      }, { status: 403 });
    }

    // 2. Fetch Property Details
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("*, profiles!properties_owner_id_fkey(*)")
      .eq("id", propertyId)
      .single();

    if (propertyError || !property) {
      return NextResponse.json({ success: false, error: "Property not found" }, { status: 404 });
    }

    // 3. Generate Draft PDF
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString("en-IN");
    
    const agreementData = {
      date,
      student_name: profile.legal_full_name || profile.full_name || "Unknown Student",
      student_address: profile.permanent_address || "Provided via KYC",
      student_masked_id: profile.masked_id || "XXXX-XXXX-XXXX",
      owner_name: property.profiles?.full_name || "Property Owner",
      owner_address: property.sector || "Greater Noida",
      room_price: property.price,
      deposit_amount: property.price * 2, // Standard 2 month deposit
      document_hash: "DRAFT_PENDING_SIGNATURE"
    };

    const htmlContent = fillTemplate(agreementData);
    
    // For MVP, we'll use jsPDF's text methods to build a clean PDF 
    // since server-side HTML-to-PDF can be heavy
    let y = 20;
    doc.setFontSize(18);
    doc.text("RENT AGREEMENT - NOIDASTAY", 105, y, { align: "center" });
    y += 15;
    
    doc.setFontSize(12);
    doc.text(`Date: ${date}`, 20, y);
    y += 10;
    
    doc.setFont("helvetica", "bold");
    doc.text("FIRST PARTY (OWNER):", 20, y);
    doc.setFont("helvetica", "normal");
    y += 7;
    doc.text(`${agreementData.owner_name}`, 30, y);
    y += 5;
    doc.text(`Sector: ${agreementData.owner_address}`, 30, y);
    y += 10;

    doc.setFont("helvetica", "bold");
    doc.text("SECOND PARTY (TENANT):", 20, y);
    doc.setFont("helvetica", "normal");
    y += 7;
    doc.text(`${agreementData.student_name}`, 30, y);
    y += 5;
    doc.text(`Aadhaar: ${agreementData.student_masked_id}`, 30, y);
    y += 15;

    doc.setFont("helvetica", "bold");
    doc.text("TERMS & CONDITIONS:", 20, y);
    doc.setFont("helvetica", "normal");
    y += 10;
    const terms = [
      `1. Monthly Rent: INR ${agreementData.room_price}`,
      `2. Security Deposit: INR ${agreementData.deposit_amount} (Refundable)`,
      "3. Notice Period: 30 Days",
      "4. NoidaStay Digital Broker Platform Terms Apply."
    ];
    terms.forEach(term => {
      doc.text(term, 30, y);
      y += 8;
    });

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
    const draftHash = crypto.createHash("sha256").update(pdfBuffer).digest("hex");

    return NextResponse.json({
      success: true,
      draftId: draftHash,
      previewData: agreementData,
      message: "Draft generated. Ready for e-Signature."
    });

  } catch (error: any) {
    console.error("Generate Contract Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
