"use client";

import { useState } from "react";
import { Plus, ShieldCheck, Upload, ExternalLink } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function DashboardOverview() {
  const [activeTab, setActiveTab] = useState("overview");
  const [verificationForm, setVerificationForm] = useState({
    aadhaarName: "Test Owner",
    plotNumber: "",
    bhulekhUrl: "",
  });
  const [isSubmittingVerification, setIsSubmittingVerification] = useState(false);

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingVerification(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("owner_verifications").insert([
        {
          owner_aadhaar_name: verificationForm.aadhaarName,
          plot_number: verificationForm.plotNumber,
          bhulekh_url: verificationForm.bhulekhUrl || "https://upbhulekh.gov.in/",
          status: "pending",
        },
      ]);
      if (error) {
        console.warn("Owner verification insert failed (MVP env):", error.message);
      }
    } catch (err) {
      console.warn("Owner verification exception:", err);
    } finally {
      setIsSubmittingVerification(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, Test Owner!</h1>
          <p className="text-gray-500 mt-1">Here is what is happening with your properties today.</p>
        </div>
        <button className="hidden sm:flex items-center px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium transition-colors focus:ring-4 focus:ring-emerald-100">
          <Plus className="h-5 w-5 mr-2" />
          Add Property
        </button>
      </div>

      <div className="mb-8 border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'overview'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("verification")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center ${
              activeTab === 'verification'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
             <ShieldCheck className="h-4 w-4 mr-2" />
             Verification
          </button>
        </div>
      </div>

          {activeTab === "overview" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Stat Cards */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Total Properties</h3>
                  <p className="text-3xl font-bold text-gray-900">3</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Active Leads</h3>
                  <p className="text-3xl font-bold text-emerald-600">12</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Occupancy Rate</h3>
                  <p className="text-3xl font-bold text-gray-900">85%</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
                <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">Recent Leads</h2>
                  <button className="text-emerald-600 text-sm font-medium hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50">
                      <tr>
                        <th className="px-6 py-3 font-semibold text-gray-500 text-sm">Property</th>
                        <th className="px-6 py-3 font-semibold text-gray-500 text-sm">Student Phone</th>
                        <th className="px-6 py-3 font-semibold text-gray-500 text-sm">Status</th>
                        <th className="px-6 py-3 font-semibold text-gray-500 text-sm">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">Premium Boys PG</p>
                          <p className="text-sm text-gray-500">Knowledge Park III</p>
                        </td>
                        <td className="px-6 py-4 font-medium">+91 98765 43210</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                            Interested
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">2 hours ago</td>
                      </tr>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">Cozy Girls Apartment</p>
                          <p className="text-sm text-gray-500">Alpha 1</p>
                        </td>
                        <td className="px-6 py-4 font-medium">+91 87654 32109</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Contacted
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">Yesterday</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === "verification" && (
            <form
              onSubmit={handleVerificationSubmit}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8"
            >
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Property Verification</h2>
                <p className="text-gray-500 text-sm max-w-2xl">
                  Link your documents and UP Bhulekh record so that our team can grant the
                  &ldquo;Verified&rdquo; badge on your listings. This uses the{" "}
                  <span className="font-semibold">owner_verifications</span> record in Supabase.
                </p>
              </div>

              <div className="space-y-8 max-w-3xl">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Owner Aadhaar Name
                  </label>
                  <input
                    type="text"
                    value={verificationForm.aadhaarName}
                    onChange={(e) =>
                      setVerificationForm((prev) => ({ ...prev, aadhaarName: e.target.value }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none"
                    placeholder="Enter full name as per Aadhaar"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                    <Upload className="h-8 w-8 text-gray-400 mb-3" />
                    <p className="font-medium text-gray-900 mb-1">Electricity Bill</p>
                    <p className="text-xs text-gray-500 max-w-[200px] text-center">
                      Upload latest bill via dashboard or share a link in notes to match UP Bhulekh.
                    </p>
                  </div>

                  <div className="border border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                    <Upload className="h-8 w-8 text-gray-400 mb-3" />
                    <p className="font-medium text-gray-900 mb-1">Property Tax Receipt</p>
                    <p className="text-xs text-gray-500 max-w-[200px] text-center">
                      Ensure plot details match the UP Bhulekh record you share below.
                    </p>
                  </div>
                </div>

                <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-semibold text-blue-900">
                      Plot / Khata Number
                    </label>
                    <a
                      href="https://upbhulekh.gov.in/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Verify on UP Bhulekh <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <input
                    type="text"
                    value={verificationForm.plotNumber}
                    onChange={(e) =>
                      setVerificationForm((prev) => ({ ...prev, plotNumber: e.target.value }))
                    }
                    className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                    placeholder="e.g. 129/A"
                    required
                  />
                  <label className="block text-sm font-semibold text-blue-900 mt-3">
                    UP Bhulekh Record URL
                  </label>
                  <input
                    type="url"
                    value={verificationForm.bhulekhUrl}
                    onChange={(e) =>
                      setVerificationForm((prev) => ({ ...prev, bhulekhUrl: e.target.value }))
                    }
                    className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                    placeholder="Paste the exact URL of your land record from upbhulekh.gov.in"
                  />
                  <p className="text-xs text-blue-600/80">
                    These details are stored in the <code>owner_verifications</code> table for
                    admin review.
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={isSubmittingVerification}
                    className="px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:bg-emerald-400 disabled:cursor-not-allowed"
                  >
                    {isSubmittingVerification ? "Submitting..." : "Submit for Verification"}
                  </button>
                </div>
              </div>
            </form>
          )}
    </div>
  );
}
