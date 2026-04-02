import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/jwt";

// --- Inline rate limiting (edge-compatible, no Node.js deps) ---

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

// Periodic cleanup to prevent memory leak (every 5 min)
let lastCleanup = Date.now();
function cleanupStore() {
  const now = Date.now();
  if (now - lastCleanup < 300_000) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now > entry.resetTime) store.delete(key);
  }
}

const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10);
const GENERAL_MAX = parseInt(process.env.RATE_LIMIT_MAX || "5000", 10);
const AUTH_MAX = parseInt(process.env.AUTH_RATE_LIMIT_MAX || "100", 10);
const OTP_MAX = parseInt(process.env.OTP_RATE_LIMIT_MAX || "10", 10);

function getRateLimitConfig(pathname: string) {
  if (pathname.includes("/verify-otp") || pathname.includes("/resend-otp")) {
    return { max: OTP_MAX, prefix: "otp" };
  }
  if (pathname.startsWith("/api/auth/")) {
    return { max: AUTH_MAX, prefix: "auth" };
  }
  return { max: GENERAL_MAX, prefix: "general" };
}

function checkRateLimit(req: NextRequest): NextResponse | null {
  cleanupStore();
  const pathname = req.nextUrl.pathname;
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const { max, prefix } = getRateLimitConfig(pathname);
  const key = `${prefix}:${ip}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetTime) {
    store.set(key, { count: 1, resetTime: now + WINDOW_MS });
    return null;
  }

  entry.count++;

  if (entry.count > max) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((entry.resetTime - now) / 1000)),
          "X-RateLimit-Limit": String(max),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(entry.resetTime / 1000)),
        },
      }
    );
  }

  return null;
}

// --- Token verification cache (edge-compatible) ---
// Caches verified tokens for 60s to avoid re-verifying on every navigation
const tokenCache = new Map<string, { payload: any; expiresAt: number }>();
const TOKEN_CACHE_TTL = 60_000; // 60 seconds

async function getCachedPayload(token: string) {
  const cached = tokenCache.get(token);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.payload;
  }

  const payload = await verifyAccessToken(token);
  if (payload) {
    tokenCache.set(token, { payload, expiresAt: Date.now() + TOKEN_CACHE_TTL });
    // Cleanup old entries periodically
    if (tokenCache.size > 100) {
      const now = Date.now();
      for (const [k, v] of tokenCache) {
        if (v.expiresAt < now) tokenCache.delete(k);
      }
    }
  }
  return payload;
}

// --- Public routes ---

const publicPaths = [
  "/login",
  "/register",
  "/verify-otp",
  "/forgot-password",
  "/api/auth/register",
  "/api/auth/login",
  "/api/auth/verify-otp",
  "/api/auth/resend-otp",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/refresh",
  "/api/course-fees/payment/success",
  "/api/course-fees/payment/failure",
  "/api/health",
  "/api/ready",
];

// --- Middleware ---

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Rate limiting for API routes only
  if (pathname.startsWith("/api/")) {
    const rateLimitResponse = checkRateLimit(req);
    if (rateLimitResponse) return rateLimitResponse;
  }

  // Allow public paths
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check for auth token on protected routes
  const token =
    req.cookies.get("accessToken")?.value ||
    req.cookies.get("token")?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Use cached verification — avoids re-verifying the same token on every navigation
  const payload = await getCachedPayload(token);
  if (!payload) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, error: "Token expired", code: "TOKEN_EXPIRED" },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Attach tenant info to REQUEST headers for downstream API routes
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-user-id", payload.userId);
  requestHeaders.set("x-tenant-id", payload.tenantId);
  requestHeaders.set("x-user-role", payload.role);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
