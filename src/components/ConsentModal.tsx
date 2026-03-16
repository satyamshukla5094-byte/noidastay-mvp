"use client";

import { useState } from "react";

type ConsentModalProps = {
  open: boolean;
  onClose: () => void;
  onGrant: (type: "KYC" | "Sharing" | "Marketing") => Promise<void>;
  consentType: "KYC" | "Sharing" | "Marketing";
  title?: string;
  description?: string;
};

export function ConsentModal({ open, onClose, onGrant, consentType, title, description }: ConsentModalProps) {
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAccept() {
    setLoading(true);
    setError(null);
    try {
      await onGrant(consentType);
      onClose();
    } catch (err) {
      setError("Could not save consent. Please retry.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{title ?? "Consent Required"}</h2>
            <p className="mt-1 text-sm text-slate-600">{description ?? "Your consent is required to continue with secure KYC and data processing."}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <h3 className="text-sm font-medium text-slate-800">Consent category: <span className="font-semibold">{consentType}</span></h3>
          <ul className="mt-2 list-disc pl-5 text-sm text-slate-700 space-y-1">
            <li>We process only minimal KYC data needed for rental verification.</li>
            <li>All scans are encrypted and stored in private vault storage.</li>
            <li>You can withdraw consent anytime from Privacy Dashboard.</li>
          </ul>
        </div>

        <div className="mt-4 flex items-start gap-2">
          <input id="consent_check" type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
          <label htmlFor="consent_check" className="text-sm text-slate-700">I understand and grant consent for this purpose.</label>
        </div>

        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-xl border border-slate-300 px-3 py-2 text-sm">Cancel</button>
          <button disabled={!checked || loading} onClick={handleAccept} className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:bg-slate-300">
            {loading ? "Saving..." : "Accept and continue"}
          </button>
        </div>

        <div className="mt-3 text-xs text-slate-500">DPDP-compliant: no pre-ticked consent and explicit user action required.</div>
        <div className="mt-2 text-xs text-blue-600"><a href="/terms" className="underline">View full Privacy Policy</a></div>
      </div>
    </div>
  );
}
