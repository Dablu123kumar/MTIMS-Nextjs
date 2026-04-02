import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse, validationErrorResponse } from "@/lib/api-response";
import { getTenantContext, requireRole } from "@/lib/tenant";
import { createTenantSchema } from "@/validations/tenant.validation";
import Tenant from "@/models/tenant.model";
import { sanitizeBody } from "@/lib/sanitize";

// GET tenant info (own tenant, or all tenants for Owner)
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;

    if (ctx.role === "Owner") {
      // Owner can see all tenants
      const tenants = await Tenant.find().sort({ createdAt: -1 }).lean();
      return successResponse(tenants);
    }

    // Others see only their tenant
    const tenant = await Tenant.findById(ctx.tenantId).lean();
    if (!tenant) return errorResponse("Tenant not found", 404);
    return successResponse(tenant);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

// POST create tenant (only Owner can create additional tenants)
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;

    const roleCheck = requireRole(ctx, ["Owner"]);
    if (roleCheck) return roleCheck;

    const body = sanitizeBody(await req.json());
    const parsed = createTenantSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const slug = parsed.data.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    const tenant = await Tenant.create({
      ...parsed.data,
      slug,
      ownerId: ctx.userId,
    });

    return successResponse(tenant, 201);
  } catch (error: any) {
    if (error.code === 11000) return errorResponse("Organization name already exists", 409);
    return errorResponse(error.message, 500);
  }
}
