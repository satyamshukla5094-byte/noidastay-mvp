"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge, CheckCircle, Shield, Star } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface DigiLockerBadgeProps {
  userId: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function DigiLockerBadge({ userId, showLabel = true, size = "md" }: DigiLockerBadgeProps) {
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5", 
    lg: "w-6 h-6"
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };

  useEffect(() => {
    checkDigiLockerStatus();
  }, [userId]);

  const checkDigiLockerStatus = async () => {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from("profiles")
      .select("is_digilocker_verified, digilocker_verified_at")
      .eq("id", userId)
      .single();

    if (data && !error) {
      setIsVerified(data.is_digilocker_verified && data.digilocker_verified_at);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className={`${sizeClasses[size]} bg-gray-200 rounded-full animate-pulse`} />
        {showLabel && <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />}
      </div>
    );
  }

  if (!isVerified) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2"
    >
      <div className="relative">
        <div className={`${sizeClasses[size]} bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center`}>
          <Badge className={`${size === "sm" ? "w-2.5 h-2.5" : size === "md" ? "w-3 h-3" : "w-4 h-4"} text-white`} />
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"
        />
      </div>
      
      {showLabel && (
        <div className="flex items-center gap-1">
          <span className={`${textSizeClasses[size]} font-semibold text-blue-700`}>
            DigiLocker Verified
          </span>
          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
        </div>
      )}
    </motion.div>
  );
}
