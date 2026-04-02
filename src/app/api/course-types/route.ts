import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse, validationErrorResponse } from "@/lib/api-response";
import { getTenantContext, tenantFilter } from "@/lib/tenant";
import { createCourseTypeSchema } from "@/validations/course.validation";
import { CourseType } from "@/models/course.model";
import { sanitizeBody } from "@/lib/sanitize";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;
    const types = await CourseType.find(tenantFilter(ctx)).sort({ createdAt: -1 }).lean();
    return successResponse(types);
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
    const parsed = createCourseTypeSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const courseType = await CourseType.create({
      ...parsed.data,
      tenantId: ctx.tenantId,
      createdBy: ctx.userId,
    });
    return successResponse(courseType, 201);
  } catch (error: any) {
    if (error.code === 11000) return errorResponse("Course type already exists", 409);
    return errorResponse(error.message, 500);
  }
}
