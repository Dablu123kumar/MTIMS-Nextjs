import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse, validationErrorResponse } from "@/lib/api-response";
import { getTenantContext, tenantFilter } from "@/lib/tenant";
import { createCourseSchema } from "@/validations/course.validation";
import Course from "@/models/course.model";
import { sanitizeBody } from "@/lib/sanitize";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;

    const courses = await Course.find(tenantFilter(ctx))
      .populate("courseType", "courseType")
      .populate("numberOfYears", "numberOfYears")
      .populate("category", "category")
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(courses);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;

    const body = sanitizeBody(await req.json());
    const parsed = createCourseSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const course = await Course.create({
      ...parsed.data,
      tenantId: ctx.tenantId,
      createdBy: ctx.userId,
    });

    return successResponse(course, 201);
  } catch (error: any) {
    if (error.code === 11000) return errorResponse("Course already exists", 409);
    return errorResponse(error.message, 500);
  }
}
