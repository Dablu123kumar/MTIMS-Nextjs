import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse, validationErrorResponse } from "@/lib/api-response";
import { getTenantContext, requireRole, ADMIN_ROLES, tenantFilter } from "@/lib/tenant";
import { updateCourseSchema } from "@/validations/course.validation";
import Course from "@/models/course.model";
import { sanitizeBody } from "@/lib/sanitize";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;

    const { id } = await params;
    const course = await Course.findOne(tenantFilter(ctx, { _id: id }))
      .populate("courseType numberOfYears category")
      .lean();

    if (!course) return errorResponse("Course not found", 404);
    return successResponse(course);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;

    const { id } = await params;
    const body = sanitizeBody(await req.json());
    const parsed = updateCourseSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const course = await Course.findOneAndUpdate(
      tenantFilter(ctx, { _id: id }),
      parsed.data,
      { new: true }
    );

    if (!course) return errorResponse("Course not found", 404);
    return successResponse(course);
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
    const course = await Course.findOneAndDelete(tenantFilter(ctx, { _id: id }));
    if (!course) return errorResponse("Course not found", 404);

    return successResponse({ message: "Course deleted" });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
