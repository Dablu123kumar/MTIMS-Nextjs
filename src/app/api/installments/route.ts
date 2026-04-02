import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getTenantContext, tenantFilter, requireRole, ADMIN_ROLES } from "@/lib/tenant";
import { successResponse, validationErrorResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/errors";
import { sanitizeBody } from "@/lib/sanitize";
import Installment from "@/models/installment.model";
import { createInstallmentSchema } from "@/validations/installment.validation";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;
    const studentId = searchParams.get("studentId");
    const courseId = searchParams.get("courseId");
    const isPaid = searchParams.get("isPaid");
    const isOverdue = searchParams.get("isOverdue");

    const filter: any = tenantFilter(ctx);
    if (studentId) filter.studentId = studentId;
    if (courseId) filter.courseId = courseId;
    if (isPaid === "true") filter.isPaid = true;
    if (isPaid === "false") filter.isPaid = false;
    if (isOverdue === "true") {
      filter.isPaid = false;
      filter.dueDate = { $lt: new Date() };
    }

    const [data, total] = await Promise.all([
      Installment.find(filter)
        .populate("studentId", "name rollNumber email")
        .populate("courseId", "courseName")
        .sort({ dueDate: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Installment.countDocuments(filter),
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
    const parsed = createInstallmentSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const doc = await Installment.create({
      ...parsed.data,
      tenantId: ctx.tenantId,
    });

    return successResponse(doc, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
