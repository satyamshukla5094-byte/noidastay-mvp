"use client";

import { CheckCircle, ExternalLink, ShieldAlert, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function OwnerVerifyPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-emerald-600 p-8 text-center">
          <ShieldAlert className="h-16 w-16 text-white mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Owner Verification Required</h1>
          <p className="text-emerald-100">
            To maintain a trusted marketplace, all NoidaStay PG owners must verify their properties.
          </p>
        </div>

        <div className="p-8 space-y-8">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Step 10: Land Record Verification</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              We require owners to cross-check their property details with the UP Bhulekh database to confirm ownership. Please follow the link below to retrieve your official land records.
            </p>

            <a
              href="https://upbhulekh.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-xl hover:bg-emerald-100 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="bg-emerald-600 p-2 rounded-lg text-white">
                  <ExternalLink className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-emerald-900">UP Bhulekh Portal</h3>
                  <p className="text-xs text-emerald-700">upbhulekh.gov.in</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-emerald-500 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              What to do next?
            </h3>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>Save a copy of your verified land record (Khasra/Khatauni).</li>
              <li>Upload it in your owner dashboard under the Properties section.</li>
              <li>Our team will verify the document within 24 hours.</li>
            </ul>
          </div>

          <div className="pt-4 flex gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Skip for now
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-sm"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
