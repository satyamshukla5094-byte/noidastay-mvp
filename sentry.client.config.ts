// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  debug: false,
  beforeSend(event) {
    // Filter out noisy errors in production
    if (process.env.NODE_ENV === "production") {
      const errorMessages = [
        "Network request failed",
        "Failed to fetch",
        "AbortError",
        "ResizeObserver loop limit exceeded"
      ];
      
      if (event.exception?.values?.some(exc => 
        errorMessages.some(msg => exc.value?.includes(msg))
      )) {
        return null;
      }
    }
    return event;
  },
});
