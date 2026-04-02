import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getTenantContext, tenantFilter } from "@/lib/tenant";
import { successResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/errors";
import Installment from "@/models/installment.model";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    const filter = tenantFilter(ctx, {
      isPaid: false,
      isDropout: false,
      dueDate: { $lt: new Date() },
    });

    const [data, total] = await Promise.all([
      Installment.find(filter)
        .populate("studentId", "name rollNumber email mobileNumber")
        .populate("courseId", "courseName")
        .sort({ dueDate: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Installment.countDocuments(filter),
    ]);

    // Enrich with calculated days overdue
    const enriched = data.map((inst: any) => {
      const daysOverdue = Math.ceil(
        (Date.now() - new Date(inst.dueDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      return { ...inst, daysOverdue };
    });

    return successResponse({ data: enriched, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    return handleApiError(error);
  }
}
