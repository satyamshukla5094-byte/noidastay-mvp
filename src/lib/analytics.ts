"use client";

import PostHog from "posthog-js";
import { useEffect } from "react";

export function Analytics() {
  useEffect(() => {
    if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      window.posthog = PostHog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: "/ingest",
        ui_host: "https://app.posthog.com",
        person_profiles: "identified_only",
        capture_pageview: false,
        capture_pageleave: true,
        advanced_disable_decide: true,
      });

      // Track page views
      window.posthog.capture("$pageview");
    }
  }, []);

  return null;
}

// Custom tracking functions
export const analytics = {
  // KYC Events
  kycStarted: () => window.posthog?.capture("kyc_started"),
  kycCompleted: () => window.posthog?.capture("kyc_completed"),
  kycFailed: (error: string) => window.posthog?.capture("kyc_failed", { error }),

  // Search Events
  mapSearched: (filters: any) => window.posthog?.capture("map_searched", { filters }),
  propertyViewed: (propertyId: string) => window.posthog?.capture("property_viewed", { propertyId }),
  favoriteAdded: (propertyId: string) => window.posthog?.capture("favorite_added", { propertyId }),

  // Payment Events
  paymentInitiated: (amount: number, type: string) => 
    window.posthog?.capture("payment_initiated", { amount, type }),
  paymentCompleted: (amount: number, type: string) => 
    window.posthog?.capture("payment_completed", { amount, type }),
  paymentFailed: (error: string) => window.posthog?.capture("payment_failed", { error }),

  // Visit Events
  visitScheduled: (propertyId: string) => window.posthog?.capture("visit_scheduled", { propertyId }),
  visitConfirmed: (propertyId: string) => window.posthog?.capture("visit_confirmed", { propertyId }),

  // Conversion Events
  userRegistered: () => window.posthog?.capture("user_registered"),
  ownerOnboarded: () => window.posthog?.capture("owner_onboarded"),
  propertyListed: () => window.posthog?.capture("property_listed"),

  // Identify User
  identify: (userId: string, properties?: any) => window.posthog?.identify(userId, properties),

  // Reset on logout
  reset: () => window.posthog?.reset(),
};

// Export for global access
declare global {
  interface Window {
    posthog: typeof PostHog;
  }
}
