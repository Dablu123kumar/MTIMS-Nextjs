import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse, validationErrorResponse } from "@/lib/api-response";
import { getTenantContext, requireRole, ADMIN_ROLES } from "@/lib/tenant";
import { updateTenantSchema } from "@/validations/tenant.validation";
import Tenant from "@/models/tenant.model";
import { sanitizeBody } from "@/lib/sanitize";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;

    const { id } = await params;

    // Non-owners can only view their own tenant
    if (ctx.role !== "Owner" && id !== ctx.tenantId) {
      return errorResponse("Forbidden", 403);
    }

    const tenant = await Tenant.findById(id).lean();
    if (!tenant) return errorResponse("Tenant not found", 404);
    return successResponse(tenant);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;

    const roleCheck = requireRole(ctx, ADMIN_ROLES);
    if (roleCheck) return roleCheck;

    const { id } = await params;
    if (ctx.role !== "Owner" && id !== ctx.tenantId) {
      return errorResponse("Forbidden", 403);
    }

    const body = sanitizeBody(await req.json());
    const parsed = updateTenantSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const tenant = await Tenant.findByIdAndUpdate(id, parsed.data, { new: true });
    if (!tenant) return errorResponse("Tenant not found", 404);
    return successResponse(tenant);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
