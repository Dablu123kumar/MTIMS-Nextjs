import { connectDB } from "./db";
import Rbac from "@/models/rbac.model";
import type { TenantContext } from "./tenant";

/**
 * All available permissions grouped by module.
 * Use these keys when configuring role permissions.
 */
export const PERMISSIONS = {
  students: ["students.view", "students.create", "students.update", "students.delete"],
  courses: ["courses.view", "courses.create", "courses.update", "courses.delete"],
  batches: ["batches.view", "batches.create", "batches.update", "batches.delete"],
  fees: ["fees.view", "fees.create", "fees.update", "fees.delete"],
  installments: ["installments.view", "installments.create", "installments.update", "installments.markPaid"],
  attendance: ["attendance.view", "attendance.create"],
  marks: ["marks.view", "marks.create", "marks.update"],
  teachers: ["teachers.view", "teachers.create", "teachers.update", "teachers.delete"],
  trainers: ["trainers.view", "trainers.create", "trainers.update", "trainers.delete"],
  reports: ["reports.view", "reports.export"],
  settings: ["settings.view", "settings.update"],
  users: ["users.view", "users.create", "users.update", "users.delete"],
  rbac: ["rbac.view", "rbac.manage"],
  daybook: ["daybook.view", "daybook.create", "daybook.update"],
  forms: ["forms.view", "forms.create", "forms.update", "forms.delete"],
  email: ["email.view", "email.send", "email.configure"],
  labs: ["labs.view", "labs.create", "labs.update", "labs.delete"],
  alerts: ["alerts.view", "alerts.create", "alerts.update", "alerts.delete"],
  completions: ["completions.view", "completions.create", "completions.update"],
  approvals: ["approvals.view", "approvals.manage"],
} as const;

/** Flat list of all permission keys */
export const ALL_PERMISSIONS = Object.values(PERMISSIONS).flat();

// Simple in-memory cache with TTL
const cache = new Map<string, { data: Record<string, boolean>; expiresAt: number }>();
const CACHE_TTL = 60_000; // 1 minute

/**
 * Get permissions for a role within a tenant.
 * Caches results for 1 minute to avoid repeated DB queries.
 */
export async function getPermissions(
  tenantId: string,
  role: string
): Promise<Record<string, boolean>> {
  const cacheKey = `${tenantId}:${role}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  await connectDB();
  const rbac: any = await Rbac.findOne({ tenantId, role, isActive: true }).lean();

  const permissions: Record<string, boolean> = {};
  if (rbac?.permissions) {
    // Handle Mongoose Map → plain object
    const permsObj = rbac.permissions instanceof Map
      ? Object.fromEntries(rbac.permissions)
      : rbac.permissions;
    Object.assign(permissions, permsObj);
  }

  cache.set(cacheKey, { data: permissions, expiresAt: Date.now() + CACHE_TTL });
  return permissions;
}

/**
 * Check if the user's role has a specific permission.
 * Returns null if allowed, or a 403 error response string if denied.
 *
 * This is ADDITIVE to requireRole() — use alongside, not as replacement.
 */
export async function checkPermission(
  ctx: TenantContext,
  permission: string
): Promise<boolean> {
  // Owner and SuperAdmin always have all permissions
  if (ctx.role === "Owner" || ctx.role === "SuperAdmin") return true;

  const permissions = await getPermissions(ctx.tenantId, ctx.role);
  return permissions[permission] === true;
}

/**
 * Clear the permission cache for a specific tenant+role or all entries.
 * Call this when RBAC settings are updated.
 */
export function clearPermissionCache(tenantId?: string, role?: string): void {
  if (tenantId && role) {
    cache.delete(`${tenantId}:${role}`);
  } else {
    cache.clear();
  }
}
