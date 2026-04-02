import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getTenantContext, requireRole, ADMIN_ROLES, tenantFilter } from "@/lib/tenant";
import { Form, FormField } from "@/models/custom-form.model";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;

    const { id } = await params;
    const form = await Form.findOne({ _id: id, ...tenantFilter(ctx) }).populate("fields").lean();
    if (!form) return errorResponse("Form not found", 404);
    return successResponse(form);
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
    const form = await Form.findOneAndDelete({ _id: id, ...tenantFilter(ctx) });
    if (!form) return errorResponse("Form not found", 404);
    // Clean up associated fields
    await FormField.deleteMany({ _id: { $in: form.fields } });
    return successResponse({ message: "Form deleted" });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
