import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getTenantContext, tenantFilter, requireRole } from "@/lib/tenant";
import { successResponse, validationErrorResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/errors";
import { sanitizeBody } from "@/lib/sanitize";
import { clearPermissionCache } from "@/lib/rbac";
import Rbac from "@/models/rbac.model";
import { createRbacSchema } from "@/validations/rbac.validation";

const SUPER_ADMIN_ROLES = ["Owner", "SuperAdmin"];

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;
    const roleCheck = requireRole(ctx, SUPER_ADMIN_ROLES);
    if (roleCheck) return roleCheck;

    const { searchParams } = new URL(req.url);
    const isActive = searchParams.get("isActive");

    const filter: any = tenantFilter(ctx);
    if (isActive === "true") filter.isActive = true;
    if (isActive === "false") filter.isActive = false;

    const data = await Rbac.find(filter).sort({ role: 1 }).lean();

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;
    const roleCheck = requireRole(ctx, SUPER_ADMIN_ROLES);
    if (roleCheck) return roleCheck;

    const body = sanitizeBody(await req.json());
    const parsed = createRbacSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const doc = await Rbac.create({
      ...parsed.data,
      tenantId: ctx.tenantId,
    });

    clearPermissionCache(ctx.tenantId, parsed.data.role);
    return successResponse(doc, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
