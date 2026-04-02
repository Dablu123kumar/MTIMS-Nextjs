import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse, validationErrorResponse } from "@/lib/api-response";
import { getTenantContext, requireRole, ADMIN_ROLES, tenantFilter } from "@/lib/tenant";
import { updateStudentSchema } from "@/validations/student.validation";
import Student from "@/models/student.model";
import { sanitizeBody } from "@/lib/sanitize";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;

    const { id } = await params;
    const student = await Student.findOne(tenantFilter(ctx, { _id: id }))
      .populate("courseName", "courseName courseFees courseType category")
      .lean();

    if (!student) return errorResponse("Student not found", 404);
    return successResponse(student);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;

    const roleCheck = requireRole(ctx, ADMIN_ROLES);
    if (roleCheck) return roleCheck;

    const { id } = await params;
    const body = sanitizeBody(await req.json());
    const parsed = updateStudentSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    delete (body as any).tenantId;

    const student = await Student.findOneAndUpdate(
      tenantFilter(ctx, { _id: id }),
      { ...parsed.data, updatedBy: ctx.userId },
      { new: true }
    ).populate("courseName");

    if (!student) return errorResponse("Student not found", 404);
    return successResponse(student);
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
    const student = await Student.findOneAndDelete(tenantFilter(ctx, { _id: id }));
    if (!student) return errorResponse("Student not found", 404);

    return successResponse({ message: "Student deleted" });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
