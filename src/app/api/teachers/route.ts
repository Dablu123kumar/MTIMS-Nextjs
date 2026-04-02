import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse, validationErrorResponse } from "@/lib/api-response";
import { getTenantContext, tenantFilter } from "@/lib/tenant";
import { createTeacherSchema } from "@/validations/misc.validation";
import Teacher from "@/models/teacher.model";
import { sanitizeBody } from "@/lib/sanitize";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;

    const teachers = await Teacher.find(tenantFilter(ctx))
      .populate("subjects", "subjectName")
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(teachers);
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
    const parsed = createTeacherSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const teacher = await Teacher.create({ ...parsed.data, tenantId: ctx.tenantId });
    return successResponse(teacher, 201);
  } catch (error: any) {
    if (error.code === 11000) return errorResponse("Teacher with this email already exists", 409);
    return errorResponse(error.message, 500);
  }
}
