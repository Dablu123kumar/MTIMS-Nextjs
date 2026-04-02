import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getTenantContext, tenantFilter } from "@/lib/tenant";
import Student from "@/models/student.model";
import Course from "@/models/course.model";
import CourseFees from "@/models/course-fees.model";
import Batch from "@/models/batch.model";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;

    const filter = tenantFilter(ctx);
    const tenantObjId = ctx.tenantId
      ? new mongoose.Types.ObjectId(ctx.tenantId)
      : undefined;
    const tenantMatch = tenantObjId ? { tenantId: tenantObjId } : {};

    // Run ALL queries in parallel — single round-trip
    const [
      totalStudents,
      activeStudents,
      dropOutStudents,
      totalCourses,
      totalBatches,
      activeBatches,
      feesData,
      pendingFeesData,
      recentStudents,
      monthlyCollection,
    ] = await Promise.all([
      Student.countDocuments(filter),
      Student.countDocuments({ ...filter, dropOutStudent: false }),
      Student.countDocuments({ ...filter, dropOutStudent: true }),
      Course.countDocuments(filter),
      Batch.countDocuments(filter),
      Batch.countDocuments({ ...filter, status: "inProgress" }),
      CourseFees.aggregate([
        { $match: tenantMatch },
        {
          $group: {
            _id: null,
            totalCollected: { $sum: "$amountPaid" },
            totalLateFees: { $sum: { $ifNull: ["$lateFees", 0] } },
          },
        },
      ]),
      // Pending fees — now runs in parallel instead of after
      Student.aggregate([
        {
          $match: {
            ...tenantMatch,
            remainingCourseFees: { $gt: 0 },
            dropOutStudent: false,
          },
        },
        {
          $group: {
            _id: null,
            totalPending: { $sum: "$remainingCourseFees" },
            count: { $sum: 1 },
          },
        },
      ]),
      Student.find(filter)
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email rollNumber courseName createdAt")
        .lean(),
      CourseFees.aggregate([
        {
          $match: {
            ...tenantMatch,
            createdAt: {
              $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: {
              month: { $month: "$createdAt" },
              year: { $year: "$createdAt" },
            },
            total: { $sum: "$amountPaid" },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
    ]);

    return successResponse({
      students: {
        total: totalStudents,
        active: activeStudents,
        dropOut: dropOutStudents,
      },
      courses: { total: totalCourses },
      batches: { total: totalBatches, active: activeBatches },
      fees: {
        totalCollected: feesData[0]?.totalCollected || 0,
        totalLateFees: feesData[0]?.totalLateFees || 0,
        totalPending: pendingFeesData[0]?.totalPending || 0,
        studentsPendingFees: pendingFeesData[0]?.count || 0,
      },
      recentStudents,
      monthlyCollection,
    });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
