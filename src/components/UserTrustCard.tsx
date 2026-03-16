"use client";

import { motion } from "framer-motion";
import { ShieldCheck, User, Info, CheckCircle2, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface UserTrustCardProps {
  user: {
    full_name: string;
    kyc_status: "none" | "pending" | "verified" | "rejected";
    avatar_url?: string;
    role: string;
  };
  showScore?: boolean;
}

export default function UserTrustCard({ user, showScore = true }: UserTrustCardProps) {
  const isVerified = user.kyc_status === "verified";
  
  // Calculate a mock trust score based on verification status
  const trustScore = isVerified ? 95 : 45;
  const scoreColor = isVerified ? "text-emerald-600" : "text-amber-600";
  const barColor = isVerified ? "bg-emerald-500" : "bg-amber-500";

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
      <div className="relative mb-4">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-50">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
          ) : (
            <User className="text-gray-400 w-10 h-10" />
          )}
        </div>
        {isVerified && (
          <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1.5 rounded-full border-2 border-white shadow-sm">
            <ShieldCheck size={14} />
          </div>
        )}
      </div>

      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-1.5 justify-center">
        {user.full_name}
      </h3>
      
      <div className="mt-1 flex items-center gap-2">
        {isVerified ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <CheckCircle2 size={12} /> Verified Student
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <AlertCircle size={12} /> KYC Pending
          </span>
        )}
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info size={14} className="text-gray-300 hover:text-gray-500 transition-colors" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">
                {isVerified 
                  ? "Identity verified via Aadhaar/PAN. Document hashes stored in secure vault." 
                  : "Identity verification is required for this profile."}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {showScore && (
        <div className="mt-6 w-full space-y-2">
          <div className="flex justify-between items-end px-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Trust Score</span>
            <span className={`text-lg font-black ${scoreColor}`}>{trustScore}%</span>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${trustScore}%` }}
              className={`h-full ${barColor}`} 
            />
          </div>
          <p className="text-[10px] text-gray-400">Based on ID, Phone & Move-in history</p>
        </div>
      )}
    </div>
  );
}
