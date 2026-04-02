import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getTenantContext, tenantFilter } from "@/lib/tenant";
import Attendance from "@/models/attendance.model";

export async function GET(req: NextRequest, { params }: { params: Promise<{ studentId: string }> }) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;

    const { studentId } = await params;
    const attendance = await Attendance.find(
      tenantFilter(ctx, { "students.student": studentId })
    )
      .populate("batch", "name")
      .lean();

    // Extract only this student's data from each record
    const studentAttendance = attendance.map((record: any) => {
      const studentData = record.students.find(
        (s: any) => s.student?.toString() === studentId || s.student?._id?.toString() === studentId
      );
      return {
        _id: record._id,
        type: record.type,
        batch: record.batch,
        month: record.month,
        year: record.year,
        days: studentData?.days || {},
      };
    });

    return successResponse(studentAttendance);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
