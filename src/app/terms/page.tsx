export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-3xl shadow-lg p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-blue-600 font-semibold">NoidaStay Terms</p>
        <h1 className="text-3xl font-bold text-slate-900 mt-2">Terms of Service</h1>
        <p className="mt-3 text-slate-600">These terms describe NoidaStay's role as a digital intermediary and the limits of our liability for property and booking conditions.</p>

        <section className="mt-6">
          <h2 className="text-xl font-semibold text-slate-800">1. Digital Intermediary Role</h2>
          <p className="mt-2 text-slate-700">NoidaStay operates as a digital broker platform connecting students and property owners. We facilitate listing discovery, KYC, agreement generation, and secure payment infrastructure. We do not own or operate the listed properties.</p>
        </section>

        <section className="mt-4">
          <h2 className="text-xl font-semibold text-slate-800">2. Limited Liability</h2>
          <p className="mt-2 text-slate-700">We strive for accuracy, but we are not responsible for property conditions, amenities, or third-party owner representations. Owners are responsible for the rental property and tenant disputes.</p>
        </section>

        <section className="mt-4">
          <h2 className="text-xl font-semibold text-slate-800">3. Escrow & Brokerage Guarantees</h2>
          <p className="mt-2 text-slate-700">For bookings that use our escrow services, we guarantee deposit protection and legal advisory support under our Premium Digital Broker terms. Specific terms are included in the digital rental agreement.</p>
        </section>

        <section className="mt-4">
          <h2 className="text-xl font-semibold text-slate-800">4. DPDP & Aadhaar Compliance</h2>
          <p className="mt-2 text-slate-700">We handle personal data in accordance with DPDP principles. Aadhaar-based KYC is collected only with explicit consent and is masked in all UI responses. Users may request deletion under the 'Right to be Forgotten'.</p>
        </section>

        <section className="mt-4">
          <h2 className="text-xl font-semibold text-slate-800">5. Governing Law</h2>
          <p className="mt-2 text-slate-700">These terms are governed by Indian law, including the IT Act 2000 and relevant regulations for digital intermediaries.</p>
        </section>
      </div>
    </main>
  );
}
