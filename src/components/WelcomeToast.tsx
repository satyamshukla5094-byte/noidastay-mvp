"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, X } from "lucide-react";

export default function WelcomeToast() {
  const searchParams = useSearchParams();
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    const welcomeName = searchParams.get("welcome");
    if (welcomeName) {
      setName(welcomeName);
      setShow(true);
      
      const timer = setTimeout(() => {
        setShow(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  if (!show) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="bg-white border border-emerald-100 shadow-lg rounded-xl p-4 flex items-start gap-4 max-w-sm w-full">
        <div className="p-1 bg-emerald-100 rounded-full flex-shrink-0">
          <CheckCircle className="h-5 w-5 text-emerald-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900">Welcome, {name}!</h3>
          <p className="text-xs text-gray-500 mt-1">Your account has been successfully created.</p>
        </div>
        <button 
          onClick={() => setShow(false)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
