import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getTenantContext, tenantFilter, requireRole } from "@/lib/tenant";
import { successResponse, errorResponse, validationErrorResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/errors";
import { sanitizeBody } from "@/lib/sanitize";
import { clearPermissionCache } from "@/lib/rbac";
import Rbac from "@/models/rbac.model";
import { updateRbacSchema } from "@/validations/rbac.validation";

const SUPER_ADMIN_ROLES = ["Owner", "SuperAdmin"];

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;
    const roleCheck = requireRole(ctx, SUPER_ADMIN_ROLES);
    if (roleCheck) return roleCheck;

    const doc = await Rbac.findOne(tenantFilter(ctx, { _id: id })).lean();
    if (!doc) return errorResponse("Role access record not found", 404);

    return successResponse(doc);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;
    const roleCheck = requireRole(ctx, SUPER_ADMIN_ROLES);
    if (roleCheck) return roleCheck;

    const body = sanitizeBody(await req.json());
    const parsed = updateRbacSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const doc: any = await Rbac.findOneAndUpdate(
      tenantFilter(ctx, { _id: id }),
      { $set: parsed.data },
      { new: true }
    ).lean();

    if (!doc) return errorResponse("Role access record not found", 404);

    // Clear cache for this role so new permissions take effect
    clearPermissionCache(ctx.tenantId, doc.role);
    return successResponse(doc);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;
    const roleCheck = requireRole(ctx, SUPER_ADMIN_ROLES);
    if (roleCheck) return roleCheck;

    const doc: any = await Rbac.findOneAndDelete(tenantFilter(ctx, { _id: id }));
    if (!doc) return errorResponse("Role access record not found", 404);

    clearPermissionCache(ctx.tenantId, doc.role);
    return successResponse({ message: "Role access record deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}
