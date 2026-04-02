import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getTenantContext, tenantFilter } from "@/lib/tenant";
import { successResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/errors";
import CourseCompletion from "@/models/course-completion.model";

export async function GET(req: NextRequest, { params }: { params: Promise<{ studentId: string }> }) {
  try {
    const { studentId } = await params;
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;

    const data = await CourseCompletion.find(tenantFilter(ctx, { studentId }))
      .populate("courseId", "courseName")
      .sort({ completionDate: -1 })
      .lean();

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
