import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getTenantContext, requireRole, ADMIN_ROLES, tenantFilter } from "@/lib/tenant";
import { StudentMarks } from "@/models/subject.model";
import { sanitizeBody } from "@/lib/sanitize";

export async function GET(req: NextRequest, { params }: { params: Promise<{ studentId: string }> }) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;

    const { studentId } = await params;
    const marks = await StudentMarks.find({ studentInfo: studentId, ...tenantFilter(ctx) })
      .populate("studentInfo", "name rollNumber")
      .populate("course", "courseName")
      .populate("subjects.subject", "subjectName subjectCode fullMarks passMarks")
      .lean();

    return successResponse(marks);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ studentId: string }> }) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;
    const roleCheck = requireRole(ctx, ADMIN_ROLES);
    if (roleCheck) return roleCheck;

    const { studentId } = await params;
    const body = sanitizeBody(await req.json());
    const record = await StudentMarks.findOneAndUpdate(
      { _id: studentId, ...tenantFilter(ctx) },
      body,
      { new: true }
    ).lean();
    if (!record) return errorResponse("Marks record not found", 404);
    return successResponse(record);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
