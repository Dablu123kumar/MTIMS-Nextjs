import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse, validationErrorResponse } from "@/lib/api-response";
import { getTenantContext, requireRole, ADMIN_ROLES, tenantFilter } from "@/lib/tenant";
import { createSubjectSchema } from "@/validations/subject.validation";
import Subject from "@/models/subject.model";
import { sanitizeBody } from "@/lib/sanitize";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;

    const subjects = await Subject.find(tenantFilter(ctx))
      .populate("course", "courseName")
      .populate("courseType", "courseType")
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(subjects);
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
    const parsed = createSubjectSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const subject = await Subject.create({
      ...parsed.data,
      tenantId: ctx.tenantId,
      addedBy: ctx.userId,
    });

    return successResponse(subject, 201);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
