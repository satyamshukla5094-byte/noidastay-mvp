import { NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import { createClient } from "@supabase/supabase-js";
import { calculateRevenueBreakdown } from "@/lib/finance";

export async function POST(request: Request) {
  try {
    const { transactionId, userId } = await request.json();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Fetch transaction and profile data
    const { data: tx, error: txError } = await supabase
      .from("transactions")
      .select("*, profiles(*), properties(title, sector)")
      .eq("id", transactionId)
      .single();

    if (txError || !tx) throw new Error("Transaction not found");

    // 2. Calculate breakdown and update ledger
    const { gross, tax, net } = calculateRevenueBreakdown(tx.amount);
    
    const { error: ledgerError } = await supabase
      .from("revenue_ledger")
      .upsert({
        transaction_id: transactionId,
        type: tx.type === 'brokerage_fee' ? 'service_fee' : 'commission',
        amount_gross: gross.toNumber(),
        tax_amount: tax.toNumber(),
        amount_net: net.toNumber(),
        payout_status: 'pending'
      }, { onConflict: 'transaction_id' });

    if (ledgerError) throw ledgerError;

    // 3. Generate PDF Receipt
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString("en-IN");
    
    doc.setFontSize(22);
    doc.setTextColor(0, 102, 204);
    doc.text("NOIDASTAY PAYMENT RECEIPT", 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Receipt ID: RCP-${transactionId.slice(0,8).toUpperCase()}`, 20, 30);
    doc.text(`Date: ${date}`, 150, 30);

    doc.setDrawColor(200);
    doc.line(20, 35, 190, 35);

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("BILL TO:", 20, 45);
    doc.setFont("helvetica", "bold");
    doc.text(tx.profiles.full_name, 20, 52);
    doc.setFont("helvetica", "normal");
    doc.text(tx.profiles.whatsapp_number || "", 20, 58);

    doc.text("PROPERTY DETAILS:", 120, 45);
    doc.setFont("helvetica", "bold");
    doc.text(tx.properties.title, 120, 52);
    doc.setFont("helvetica", "normal");
    doc.text(tx.properties.sector, 120, 58);

    // Table
    doc.setFillColor(245, 247, 250);
    doc.rect(20, 70, 170, 10, 'F');
    doc.setFont("helvetica", "bold");
    doc.text("Description", 25, 77);
    doc.text("Amount (INR)", 160, 77, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.text(tx.type.replace('_', ' ').toUpperCase(), 25, 90);
    doc.text(gross.toFixed(2), 160, 90, { align: "right" });

    doc.line(20, 100, 190, 100);
    doc.text("Subtotal", 130, 110);
    doc.text(gross.toFixed(2), 160, 110, { align: "right" });
    doc.text("GST (18%)", 130, 118);
    doc.text(tax.toFixed(2), 160, 118, { align: "right" });
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Total Paid", 130, 130);
    doc.text(`₹${gross.toFixed(2)}`, 160, 130, { align: "right" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150);
    doc.text("This is a computer generated receipt and does not require a physical signature.", 105, 150, { align: "center" });
    doc.text("Verified by NoidaStay Digital Broker Platform", 105, 155, { align: "center" });

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
    const filePath = `${userId}/receipts/RCP-${transactionId}.pdf`;

    await supabase.storage
      .from("vault-documents")
      .upload(filePath, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true
      });

    const { data: { publicUrl } } = supabase.storage.from("vault-documents").getPublicUrl(filePath);

    return NextResponse.json({ success: true, receiptUrl: publicUrl });

  } catch (error: any) {
    console.error("Invoice Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
