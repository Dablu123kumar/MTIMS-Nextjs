import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { connectDB } from "./db";
import { logger } from "./logger";
import User from "@/models/user.model";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET!;
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

export interface JWTPayload {
  userId: string;
  tenantId: string;
  role: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export function generateAccessToken(userId: string, tenantId: string, role: string): string {
  return jwt.sign({ userId, tenantId, role }, JWT_ACCESS_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRES_IN,
  });
}

export function generateRefreshToken(userId: string, tenantId: string, role: string): string {
  return jwt.sign({ userId, tenantId, role }, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });
}

export function generateTokenPair(userId: string, tenantId: string, role: string): TokenPair {
  return {
    accessToken: generateAccessToken(userId, tenantId, role),
    refreshToken: generateRefreshToken(userId, tenantId, role),
  };
}

/** @deprecated Use generateAccessToken instead */
export function generateToken(userId: string, tenantId: string, role: string): string {
  return generateAccessToken(userId, tenantId, role);
}

export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_ACCESS_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

/** @deprecated Use verifyAccessToken instead */
export function verifyToken(token: string): JWTPayload | null {
  return verifyAccessToken(token);
}

export async function getSession(req?: NextRequest) {
  let token: string | undefined;

  if (req) {
    const authHeader = req.headers.get("authorization");
    token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;

    if (!token) {
      token = req.cookies.get("accessToken")?.value || req.cookies.get("token")?.value;
    }
  } else {
    const cookieStore = await cookies();
    token = cookieStore.get("accessToken")?.value || cookieStore.get("token")?.value;
  }

  if (!token) return null;

  const payload = verifyAccessToken(token);
  if (!payload) return null;

  await connectDB();
  const user = await User.findById(payload.userId).select("-password -otp -otpExpiresAt").lean();
  if (!user) return null;

  return {
    user,
    tenantId: payload.tenantId,
    role: payload.role,
  };
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getOTPExpiration(): Date {
  return new Date(Date.now() + 5 * 60 * 1000);
}

export function isOTPExpired(expiresAt: Date): boolean {
  return new Date() > new Date(expiresAt);
}
