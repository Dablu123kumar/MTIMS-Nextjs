import { NextRequest, NextResponse } from "next/server";
import { logger } from "./logger";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    store.forEach((entry, key) => {
      if (now > entry.resetTime) {
        store.delete(key);
      }
    });
  }, 5 * 60 * 1000);
}

function getClientIdentifier(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

interface RateLimitConfig {
  windowMs: number;
  max: number;
}

function checkRateLimit(key: string, config: RateLimitConfig): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetTime) {
    store.set(key, { count: 1, resetTime: now + config.windowMs });
    return { allowed: true, remaining: config.max - 1, resetTime: now + config.windowMs };
  }

  entry.count++;

  if (entry.count > config.max) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }

  return { allowed: true, remaining: config.max - entry.count, resetTime: entry.resetTime };
}

const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10);
const GENERAL_MAX = parseInt(process.env.RATE_LIMIT_MAX || "5000", 10);
const AUTH_MAX = parseInt(process.env.AUTH_RATE_LIMIT_MAX || "100", 10);
const OTP_MAX = parseInt(process.env.OTP_RATE_LIMIT_MAX || "10", 10);

function getConfigForPath(pathname: string): { config: RateLimitConfig; prefix: string } {
  if (pathname.includes("/verify-otp") || pathname.includes("/resend-otp")) {
    return { config: { windowMs: WINDOW_MS, max: OTP_MAX }, prefix: "otp" };
  }
  if (pathname.startsWith("/api/auth/")) {
    return { config: { windowMs: WINDOW_MS, max: AUTH_MAX }, prefix: "auth" };
  }
  return { config: { windowMs: WINDOW_MS, max: GENERAL_MAX }, prefix: "general" };
}

export function rateLimitMiddleware(req: NextRequest): NextResponse | null {
  const clientIp = getClientIdentifier(req);
  const pathname = req.nextUrl.pathname;
  const { config, prefix } = getConfigForPath(pathname);
  const key = `${prefix}:${clientIp}`;

  const result = checkRateLimit(key, config);

  if (!result.allowed) {
    logger.warn("Rate limit exceeded", { ip: clientIp, path: pathname, prefix });
    return NextResponse.json(
      { success: false, error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((result.resetTime - Date.now()) / 1000)),
          "X-RateLimit-Limit": String(config.max),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(result.resetTime / 1000)),
        },
      }
    );
  }

  return null;
}
