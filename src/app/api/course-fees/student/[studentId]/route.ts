import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getTenantContext, tenantFilter } from "@/lib/tenant";
import CourseFees from "@/models/course-fees.model";

export async function GET(req: NextRequest, { params }: { params: Promise<{ studentId: string }> }) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;

    const { studentId } = await params;
    const fees = await CourseFees.find(tenantFilter(ctx, { studentInfo: studentId }))
      .populate("courseName", "courseName")
      .populate("paymentOption", "name")
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(fees);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
