"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function MyStayPage() {
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutFee] = useState(499);
  const [reportMessage, setReportMessage] = useState("");
  const [reportStatus, setReportStatus] = useState<string | null>(null);
  const [receiptStatus, setReceiptStatus] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("propertyId");

  useEffect(() => {
    if (!propertyId) {
      setLoading(false);
      return;
    }
    const supabase = createClient();
    const load = async () => {
      const { data, error } = await supabase.from("properties").select("id, title, address, sector, price").eq("id", propertyId).single();
      if (!error && data) {
        setProperty(data);
      }
      setLoading(false);
    };
    load();
  }, [propertyId]);

  const handleDownloadAgreement = () => {
    const doc = `NoidaStay Premium Digital Broker\n\nTenant: Student\nProperty: ${property?.title ?? "Your PG"}\nProperty ID: ${propertyId}\nMonthly Rent: ₹${property?.price ?? "--"}\nBrokerage Fee: ₹${checkoutFee}\n\nThis agreement certifies that NoidaStay will facilitate legal rent documentation, deposit protection, and move-in support.`;
    const blob = new Blob([doc], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `noidastay-agreement-${propertyId ?? "booking"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateReceipt = () => {
    const receipt = `NoidaStay Rent Receipt\n\nTenant: Student\nProperty: ${property?.title ?? "Your PG"}\nPayment: ₹${property?.price ?? "--"}\/mo\nBrokerage Service Fee: ₹${checkoutFee}\nDate: ${new Date().toLocaleDateString()}\n\nThank you for booking with NoidaStay Premium Digital Broker.`;
    const blob = new Blob([receipt], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `noidastay-rent-receipt-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setReceiptStatus("Receipt generated and downloaded successfully.");
  };

  const handleReportIssue = async () => {
    if (!propertyId || !reportMessage.trim()) {
      setReportStatus("Please provide a short issue description.");
      return;
    }
    try {
      const response = await fetch("/api/report-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId, message: reportMessage.trim() }),
      });
      const body = await response.json();
      if (response.ok) {
        setReportStatus("Issue reported to your broker and owner. We will follow up within 2h.");
        setReportMessage("");
      } else {
        setReportStatus(body.error || "Unable to report issue at this moment.");
      }
    } catch (error) {
      setReportStatus("Unable to connect. Please try again.");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center p-8">Loading your My Stay dashboard...</div>;
  }

  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-3xl shadow-xl p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-purple-600 font-semibold">NoidaStay Premium Digital Broker</p>
            <h1 className="text-3xl font-extrabold text-slate-900 mt-2">My Stay</h1>
            <p className="mt-2 text-sm text-slate-600 max-w-xl">Your student concierge dashboard for agreement, receipts, and direct broker support.</p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-purple-700 via-violet-800 to-amber-400 p-3 text-white text-xs font-semibold">High Trust • 24/7 Concierge</div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-purple-200 bg-purple-50 p-4">
            <p className="text-xs font-semibold tracking-wide text-purple-600">Booking Summary</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">{property?.title ?? "Your Selected Property"}</h2>
            <p className="text-sm text-slate-600 mt-1">{property?.sector ?? "Sector across Greater Noida"}</p>
            <div className="mt-3 text-sm text-slate-700">
              <div className="flex justify-between mt-2"><span>Monthly Rent</span><span className="font-semibold">₹{property?.price ?? "--"}</span></div>
              <div className="flex justify-between mt-1"><span>Brokerage Service Fee</span><span className="font-semibold">₹{checkoutFee}</span></div>
              <div className="border-t border-purple-200 mt-3 pt-3 flex justify-between text-sm font-semibold"><span>Total Paid</span><span>₹{property?.price ? Number(property.price) + checkoutFee : checkoutFee}</span></div>
            </div>
            <button onClick={handleDownloadAgreement} className="mt-4 w-full rounded-xl bg-purple-700 text-white font-semibold py-2.5 hover:bg-purple-800 transition">Download Digital Agreement</button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Student Concierge</p>
            <h3 className="mt-2 text-xl font-semibold text-slate-900">Report issue to broker</h3>
            <p className="text-sm text-slate-600 mt-1">Your request is sent to the owner and our broker desk for priority attention.</p>
            <textarea
              className="mt-3 w-full border border-slate-300 rounded-xl p-2.5 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={4}
              placeholder="Example: The WiFi is down and the lock is stiff. Please assign a support agent."
              value={reportMessage}
              onChange={(e) => setReportMessage(e.target.value)}
            />
            <button onClick={handleReportIssue} className="mt-2 w-full rounded-xl bg-amber-600 hover:bg-amber-700 text-white py-2.5 font-semibold transition">Report Issue</button>
            {reportStatus && <p className="mt-2 text-sm text-indigo-600">{reportStatus}</p>}

            <div className="mt-5 border-t border-slate-200 pt-3">
              <h4 className="font-semibold text-slate-900">Rent Receipt</h4>
              <p className="text-sm text-slate-600 mt-1">Generate an official rent receipt for your records instantly.</p>
              <button onClick={handleGenerateReceipt} className="mt-2 rounded-xl border border-purple-700 text-purple-700 hover:bg-purple-50 px-3 py-2 text-sm font-semibold">Generate & Download Receipt</button>
              {receiptStatus && <p className="mt-2 text-sm text-green-700">{receiptStatus}</p>}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-center gap-2 text-yellow-700 font-semibold text-sm"><span className="bg-yellow-300 rounded-full px-2 py-0.5 text-xs">Premium</span> Concierge Promise</div>
          <ul className="mt-2 text-sm text-slate-700 list-disc pl-5 space-y-1">
            <li>Digital agreement copy stored in your dashboard.</li>
            <li>Broker support ping goes to both owner and in-app operations.</li>
            <li>Rent receipt generation for all monthly payments.</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
