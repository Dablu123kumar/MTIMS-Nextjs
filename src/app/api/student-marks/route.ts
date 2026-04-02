import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getTenantContext, requireRole, ADMIN_ROLES, tenantFilter } from "@/lib/tenant";
import { StudentMarks } from "@/models/subject.model";
import { sanitizeBody } from "@/lib/sanitize";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;

    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const courseId = searchParams.get("courseId");
    const status = searchParams.get("status");
    const filter: any = tenantFilter(ctx);

    if (courseId) filter.course = courseId;
    if (status) filter.resultStatus = status;

    const [marks, total] = await Promise.all([
      StudentMarks.find(filter)
        .populate("studentInfo", "name rollNumber email")
        .populate("course", "courseName")
        .populate("subjects.subject", "subjectName subjectCode fullMarks passMarks")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      StudentMarks.countDocuments(filter),
    ]);

    return successResponse({ marks, total, page, totalPages: Math.ceil(total / limit) });
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
    if (!body.studentInfo || !body.course || !body.subjects) {
      return errorResponse("studentInfo, course, and subjects are required", 400);
    }

    const record = await StudentMarks.create({ ...body, tenantId: ctx.tenantId });
    return successResponse(record, 201);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
