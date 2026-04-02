import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getTenantContext, tenantFilter, requireRole, ADMIN_ROLES } from "@/lib/tenant";
import { successResponse, validationErrorResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/errors";
import { sanitizeBody } from "@/lib/sanitize";
import StudentAlert from "@/models/student-alert.model";
import { createStudentAlertSchema } from "@/validations/student-alert.validation";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;
    const status = searchParams.get("status");

    const filter = tenantFilter(ctx);
    if (status) (filter as any).status = status;

    const [data, total] = await Promise.all([
      StudentAlert.find(filter).sort({ reminderDateTime: -1 }).skip(skip).limit(limit).lean(),
      StudentAlert.countDocuments(filter),
    ]);

    return successResponse({ data, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    return handleApiError(error);
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
    const parsed = createStudentAlertSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const doc = await StudentAlert.create({
      ...parsed.data,
      tenantId: ctx.tenantId,
      createdBy: ctx.userId,
    });

    return successResponse(doc, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
