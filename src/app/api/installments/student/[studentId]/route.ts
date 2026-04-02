import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getTenantContext, tenantFilter } from "@/lib/tenant";
import { successResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/errors";
import Installment from "@/models/installment.model";

export async function GET(req: NextRequest, { params }: { params: Promise<{ studentId: string }> }) {
  try {
    const { studentId } = await params;
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;

    const data = await Installment.find(tenantFilter(ctx, { studentId }))
      .populate("courseId", "courseName")
      .sort({ installmentNumber: 1 })
      .lean();

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
