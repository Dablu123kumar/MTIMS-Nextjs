import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getTenantContext, tenantFilter } from "@/lib/tenant";
import Student from "@/models/student.model";
import CourseFees from "@/models/course-fees.model";
import { Approval } from "@/models/misc.model";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;

    const { searchParams } = req.nextUrl;
    const type = searchParams.get("type") || "fees";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const filter: any = tenantFilter(ctx);

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to + "T23:59:59.999Z");
    }

    if (type === "fees") {
      const [records, total] = await Promise.all([
        CourseFees.find(filter)
          .populate("studentInfo", "name rollNumber")
          .populate("courseName", "courseName")
          .sort({ amountDate: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        CourseFees.countDocuments(filter),
      ]);

      const summary = await CourseFees.aggregate([
        { $match: filter },
        { $group: { _id: null, totalCollected: { $sum: "$amountPaid" }, totalPending: { $sum: "$remainingFees" }, count: { $sum: 1 } } },
      ]);

      return successResponse({
        records, total, page, totalPages: Math.ceil(total / limit),
        summary: summary[0] || { totalCollected: 0, totalPending: 0, count: 0 },
      });
    }

    if (type === "students") {
      const [records, total] = await Promise.all([
        Student.find(filter)
          .populate("courseName", "courseName")
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        Student.countDocuments(filter),
      ]);

      const activeCount = await Student.countDocuments({ ...filter, dropOutStudent: { $ne: true } });
      const dropOutCount = await Student.countDocuments({ ...filter, dropOutStudent: true });

      return successResponse({
        records, total, page, totalPages: Math.ceil(total / limit),
        summary: { total, active: activeCount, dropOut: dropOutCount },
      });
    }

    return errorResponse("Invalid report type. Use: fees or students", 400);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
