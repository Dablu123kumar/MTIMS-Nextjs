import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse, validationErrorResponse } from "@/lib/api-response";
import { getTenantContext, tenantFilter } from "@/lib/tenant";
import { markAttendanceSchema } from "@/validations/batch.validation";
import Attendance from "@/models/attendance.model";
import { sanitizeBody } from "@/lib/sanitize";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;

    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const filter: any = tenantFilter(ctx);
    if (month) filter.month = parseInt(month);
    if (year) filter.year = parseInt(year);

    const attendance = await Attendance.find(filter)
      .populate("batch", "name")
      .populate("students.student", "name rollNumber")
      .lean();

    return successResponse(attendance);
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
    const parsed = markAttendanceSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const { type, batchId, month, year, students } = parsed.data;

    // Upsert attendance record
    const existing = await Attendance.findOne(
      tenantFilter(ctx, { type, batch: batchId || null, month, year })
    );

    if (existing) {
      // Update existing record
      for (const entry of students) {
        const studentIdx = existing.students.findIndex(
          (s: any) => s.student.toString() === entry.student
        );
        if (studentIdx >= 0) {
          for (const [day, status] of Object.entries(entry.days)) {
            existing.students[studentIdx].days.set(day, status);
          }
        } else {
          existing.students.push({
            student: entry.student as any,
            days: new Map(Object.entries(entry.days)) as any,
          });
        }
      }
      await existing.save();
      return successResponse(existing);
    }

    const attendance = await Attendance.create({
      tenantId: ctx.tenantId,
      type,
      batch: batchId || null,
      month,
      year,
      students: students.map((s) => ({
        student: s.student,
        days: s.days,
      })),
    });

    return successResponse(attendance, 201);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
