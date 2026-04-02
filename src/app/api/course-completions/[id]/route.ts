import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getTenantContext, tenantFilter, requireRole, ADMIN_ROLES } from "@/lib/tenant";
import { successResponse, errorResponse, validationErrorResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/errors";
import { sanitizeBody } from "@/lib/sanitize";
import CourseCompletion from "@/models/course-completion.model";
import { updateCourseCompletionSchema } from "@/validations/course-completion.validation";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;

    const doc = await CourseCompletion.findOne(tenantFilter(ctx, { _id: id }))
      .populate("studentId", "name rollNumber email")
      .populate("courseId", "courseName")
      .lean();
    if (!doc) return errorResponse("Course completion record not found", 404);

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
    const roleCheck = requireRole(ctx, ADMIN_ROLES);
    if (roleCheck) return roleCheck;

    const body = sanitizeBody(await req.json());
    const parsed = updateCourseCompletionSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const doc = await CourseCompletion.findOneAndUpdate(
      tenantFilter(ctx, { _id: id }),
      { $set: parsed.data },
      { new: true }
    ).lean();

    if (!doc) return errorResponse("Course completion record not found", 404);
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
    const roleCheck = requireRole(ctx, ADMIN_ROLES);
    if (roleCheck) return roleCheck;

    const doc = await CourseCompletion.findOneAndDelete(tenantFilter(ctx, { _id: id }));
    if (!doc) return errorResponse("Course completion record not found", 404);

    return successResponse({ message: "Course completion record deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}
