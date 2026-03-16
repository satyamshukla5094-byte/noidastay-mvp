import React from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamic imports for heavy components
export const DynamicMap = dynamic(
  () => import("@/components/Map").then((mod) => mod.default),
  {
    loading: () => (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-xl">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    ),
    ssr: false,
  }
);

export const DynamicKYCScanner = dynamic(
  () => import("@/components/KYCScanner").then((mod) => mod.default),
  {
    loading: () => (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-xl">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    ),
    ssr: false,
  }
);

export const DynamicVisitScheduler = dynamic(
  () => import("@/components/VisitScheduler").then((mod) => mod.default),
  {
    loading: () => (
      <div className="flex items-center justify-center h-48 bg-gray-100 rounded-xl">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    ),
    ssr: false,
  }
);

export const DynamicReviewModal = dynamic(
  () => import("@/components/ReviewModal").then((mod) => mod.default),
  {
    loading: () => (
      <div className="flex items-center justify-center h-48 bg-gray-100 rounded-xl">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    ),
    ssr: false,
  }
);
