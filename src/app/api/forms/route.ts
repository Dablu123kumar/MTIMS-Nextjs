import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getTenantContext, requireRole, ADMIN_ROLES, tenantFilter } from "@/lib/tenant";
import { Form, FormField } from "@/models/custom-form.model";
import { sanitizeBody } from "@/lib/sanitize";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;

    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const filter = tenantFilter(ctx);

    const [forms, total] = await Promise.all([
      Form.find(filter)
        .populate("fields")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Form.countDocuments(filter),
    ]);

    return successResponse({ forms, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;
    const roleCheck = requireRole(ctx, ADMIN_ROLES);
    if (roleCheck) return roleCheck;

    const body = sanitizeBody(await req.json());
    if (!body.formName) return errorResponse("Form name is required", 400);

    // Create fields first if provided
    let fieldIds: string[] = [];
    if (body.fields && body.fields.length > 0) {
      const fields = await FormField.insertMany(
        body.fields.map((f: any) => ({ ...f, tenantId: ctx.tenantId }))
      );
      fieldIds = fields.map((f) => f._id.toString());
    }

    const form = await Form.create({ formName: body.formName, fields: fieldIds, tenantId: ctx.tenantId });
    const populated = await Form.findById(form._id).populate("fields").lean();
    return successResponse(populated, 201);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
