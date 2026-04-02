import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getTenantContext, requireRole, ADMIN_ROLES, tenantFilter } from "@/lib/tenant";
import { Category } from "@/models/course.model";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;
    const roleCheck = requireRole(ctx, ADMIN_ROLES);
    if (roleCheck) return roleCheck;

    const { id } = await params;
    const { category } = await req.json();
    const updated = await Category.findOneAndUpdate(tenantFilter(ctx, { _id: id }), { category }, { new: true });
    if (!updated) return errorResponse("Category not found", 404);
    return successResponse(updated);
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
    const deleted = await Category.findOneAndDelete(tenantFilter(ctx, { _id: id }));
    if (!deleted) return errorResponse("Category not found", 404);
    return successResponse({ message: "Category deleted" });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
