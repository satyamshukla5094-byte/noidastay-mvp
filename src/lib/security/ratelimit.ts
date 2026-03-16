import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

// Create a new ratelimiter, that allows 3 requests per 1 hour
// This requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) 
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

export const kycRateLimit = redis 
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(3, "1 h"),
      analytics: true,
      prefix: "@upstash/ratelimit",
    })
  : null;

/**
 * Middleware wrapper for rate limiting
 */
export async function withRateLimit(req: NextRequest, limiter: Ratelimit | null, identifier: string) {
  if (!limiter) {
    console.warn("Ratelimiter not configured. Skipping check.");
    return { success: true };
  }

  const result = await limiter.limit(identifier);
  
  if (!result.success) {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Too many attempts. Please try again in an hour." },
        { 
          status: 429,
          headers: {
            "X-RateLimit-Limit": result.limit.toString(),
            "X-RateLimit-Remaining": result.remaining.toString(),
            "X-RateLimit-Reset": result.reset.toString(),
          }
        }
      )
    };
  }

  return { success: true };
}
