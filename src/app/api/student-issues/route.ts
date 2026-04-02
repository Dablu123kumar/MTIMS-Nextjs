import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse, validationErrorResponse } from "@/lib/api-response";
import { getTenantContext, tenantFilter } from "@/lib/tenant";
import { createStudentIssueSchema } from "@/validations/misc.validation";
import { StudentIssue } from "@/models/misc.model";
import { sanitizeBody } from "@/lib/sanitize";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const filter: any = tenantFilter(ctx);
    if (studentId) filter.studentId = studentId;

    const issues = await StudentIssue.find(filter).sort({ createdAt: -1 }).lean();
    return successResponse(issues);
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
    const parsed = createStudentIssueSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const issue = await StudentIssue.create({
      ...parsed.data,
      tenantId: ctx.tenantId,
      addedBy: ctx.userId,
    });
    return successResponse(issue, 201);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
