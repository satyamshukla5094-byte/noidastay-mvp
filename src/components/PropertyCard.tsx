"use client";

import Image from "next/image";
import { useState } from "react";
import { CheckCircle2, MapPin, MessageCircle } from "lucide-react";

interface PropertyCardProps {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  distanceInfo: string;
  sector: string;
  ownerAadhaarName?: string;
  ownerBillName?: string;
  verificationStatus?: string;
  isVerified?: boolean;
}

export function PropertyCard({
  id,
  title,
  price,
  imageUrl,
  distanceInfo,
  sector,
  ownerAadhaarName,
  ownerBillName,
  verificationStatus,
  isVerified,
}: PropertyCardProps) {
  const [isLoggingLead, setIsLoggingLead] = useState(false);

  // Logic: Verified ONLY if Aadhaar matches Bill Name AND status is verified
  const isActuallyVerified = Boolean(
    ownerAadhaarName && 
    ownerBillName && 
    ownerAadhaarName.toLowerCase() === ownerBillName.toLowerCase() && 
    verificationStatus === "verified"
  ) || isVerified; // Fallback to isVerified boolean if new fields missing

  const isPending = verificationStatus === "pending";

  const handleContactClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoggingLead(true);

    try {
      // Log the lead to Supabase using an API route
      await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          propertyId: id,
          location: sector
        })
      });
    } catch (error) {
      console.error("Failed to log lead, but proceeding to WhatsApp...", error);
    } finally {
      setIsLoggingLead(false);
      
      // WhatsApp Redirect
      const phoneNumber = "919999999999"; // Replace with actual property owner phone number later
      const message = `Hi, I'm interested in the PG in ${sector} I saw on NoidaStay!`;
      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank");
    }
  };

  return (
    <div className="group flex flex-col gap-3 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-white border border-transparent hover:border-gray-100 pb-3 h-full cursor-pointer">
      {/* Image Container with Aspect Ratio */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-2xl bg-gray-200">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Badges */}
        {isActuallyVerified ? (
          <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-emerald-600 shadow-sm backdrop-blur-sm">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Verified</span>
          </div>
        ) : isPending ? (
          <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-amber-600 shadow-sm backdrop-blur-sm">
            <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Verification Pending</span>
          </div>
        ) : null}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 px-3 flex-grow">
        <div className="flex flex-col gap-1 flex-grow">
          <h3 className="font-semibold text-gray-900 line-clamp-2">{title}</h3>
          
          <div className="flex items-center text-gray-500 text-sm mt-0.5">
            <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
            <span className="truncate">{sector} • {distanceInfo}</span>
          </div>
        </div>

        <div className="mt-2 flex flex-col gap-3">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-emerald-600">
              ₹{price.toLocaleString("en-IN")}
            </span>
            <span className="text-sm text-gray-500 font-medium">/mo</span>
          </div>

          <div 
            role="button"
            tabIndex={0}
            onClick={handleContactClick}
            className={`w-full flex items-center justify-center gap-2 ${isLoggingLead ? 'opacity-70 cursor-not-allowed' : ''} bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-medium transition-colors text-sm`}
          >
            <MessageCircle className="h-4 w-4" />
            {isLoggingLead ? "Connecting..." : "Contact Owner"}
          </div>
        </div>
      </div>
    </div>
  );
}
