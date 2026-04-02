import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getTenantContext, requireRole, ADMIN_ROLES, tenantFilter } from "@/lib/tenant";
import { Timing } from "@/models/misc.model";
import { sanitizeBody } from "@/lib/sanitize";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;
    const roleCheck = requireRole(ctx, ADMIN_ROLES);
    if (roleCheck) return roleCheck;

    const { id } = await params;
    const body = sanitizeBody(await req.json());
    const timing = await Timing.findOneAndUpdate({ _id: id, ...tenantFilter(ctx) }, body, { new: true }).lean();
    if (!timing) return errorResponse("Timing not found", 404);
    return successResponse(timing);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;
    const roleCheck = requireRole(ctx, ADMIN_ROLES);
    if (roleCheck) return roleCheck;

    const { id } = await params;
    const timing = await Timing.findOneAndDelete({ _id: id, ...tenantFilter(ctx) });
    if (!timing) return errorResponse("Timing not found", 404);
    return successResponse({ message: "Timing deleted" });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
