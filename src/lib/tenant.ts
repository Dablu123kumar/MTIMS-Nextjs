import { NextRequest, NextResponse } from "next/server";
import { getSession } from "./auth";

export interface TenantContext {
  userId: string;
  tenantId: string;
  role: string;
}

/**
 * Extract tenant context from request.
 * Uses middleware-injected headers (fast) when available,
 * falls back to full session verification (slow) if not.
 */
export async function getTenantContext(req: NextRequest): Promise<TenantContext | NextResponse> {
  // Fast path: middleware already verified the token and set these headers
  const userId = req.headers.get("x-user-id");
  const tenantId = req.headers.get("x-tenant-id");
  const role = req.headers.get("x-user-role");

  if (userId && tenantId && role) {
    return { userId, tenantId, role };
  }

  // Slow path: full session verification (for cases where middleware didn't run)
  const session = await getSession(req);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return {
    userId: (session.user as any)._id.toString(),
    tenantId: session.tenantId,
    role: session.role,
  };
}

/**
 * Check if user has one of the required roles
 */
export function requireRole(context: TenantContext, roles: string[]): NextResponse | null {
  if (!roles.includes(context.role)) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }
  return null;
}

/**
 * Build a tenant-scoped query filter.
 * Owner role can optionally see all tenants.
 */
export function tenantFilter(context: TenantContext, additionalFilter: Record<string, any> = {}) {
  if (context.role === "Owner") {
    return additionalFilter;
  }

  return {
    tenantId: context.tenantId,
    ...additionalFilter,
  };
}

/**
 * Admin roles that can manage data
 */
export const ADMIN_ROLES = ["Owner", "SuperAdmin", "Admin", "Counsellor"];

/**
 * All valid user roles
 */
export const ALL_ROLES = [
  "Owner",
  "SuperAdmin",
  "Admin",
  "Accounts",
  "Counsellor",
  "Telecaller",
  "Trainer",
  "Student",
] as const;

export type UserRole = (typeof ALL_ROLES)[number];
