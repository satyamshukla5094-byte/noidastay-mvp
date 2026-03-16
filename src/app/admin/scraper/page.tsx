"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Globe, Database, Loader2, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";

export default function ScraperDashboard() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setStatus("idle");
    setError(null);

    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Scraping failed");
      }

      setResult(data.result);
      setStatus("success");
      setUrl("");
    } catch (err: any) {
      console.error("Scraper Error:", err);
      setError(err.message);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-widest mb-2">
            <Globe size={16} />
            Digital Broker Admin
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">Inventory Scraper</h1>
          <p className="text-gray-500 mt-2">Paste a PG listing URL to instantly sync it to NoidaStay.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Scraper Card */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <form onSubmit={handleSync} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target URL</label>
                  <div className="relative">
                    <input
                      type="url"
                      required
                      placeholder="https://example.com/pg-listing-123"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                    />
                    <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Syncing Inventory...
                    </>
                  ) : (
                    <>
                      <Database size={18} />
                      Sync to Database
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Results Area */}
            {status === "success" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 border border-green-100 p-6 rounded-2xl"
              >
                <div className="flex items-center gap-2 text-green-700 font-bold mb-4">
                  <CheckCircle size={20} />
                  Successfully {result?.mode}
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm space-y-3">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-gray-500 text-xs">Title</span>
                    <span className="text-gray-900 font-bold text-sm">{result?.record?.title}</span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-gray-500 text-xs">Sector</span>
                    <span className="text-gray-900 font-bold text-sm">{result?.record?.sector}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-xs">Price</span>
                    <span className="text-blue-600 font-black text-sm">₹{result?.record?.price}</span>
                  </div>
                </div>
                <button className="mt-4 w-full py-2 bg-green-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1">
                  View Listing <ExternalLink size={12} />
                </button>
              </motion.div>
            )}

            {status === "error" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-100 p-6 rounded-2xl flex gap-3 text-red-700"
              >
                <AlertCircle size={20} />
                <div>
                  <div className="font-bold">Sync Failed</div>
                  <div className="text-sm opacity-80">{error}</div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Stats/Help Card */}
          <div className="space-y-6">
            <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-xl">
              <h3 className="font-bold text-lg mb-4">Market Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-gray-400 text-xs">Greater Noida Coverage</span>
                  <span className="text-xl font-black">84%</span>
                </div>
                <div className="w-full bg-gray-800 h-1.5 rounded-full">
                  <div className="bg-blue-500 h-1.5 rounded-full w-[84%]" />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <div className="text-gray-400 text-[10px] uppercase">Active PGs</div>
                    <div className="text-lg font-bold">1,240</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-[10px] uppercase">Verified</div>
                    <div className="text-lg font-bold text-green-400">912</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h4 className="font-bold text-sm mb-3">Recent Syncs</h4>
              <div className="space-y-3">
                {["Knowledge Park III", "Pari Chowk", "Sector 126"].map((loc) => (
                  <div key={loc} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-xs text-gray-600 font-medium">{loc}</span>
                    <span className="text-[10px] text-gray-400 ml-auto">2m ago</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
