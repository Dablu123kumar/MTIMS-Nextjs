import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse, validationErrorResponse } from "@/lib/api-response";
import { getTenantContext, tenantFilter } from "@/lib/tenant";
import { createCourseFeesSchema } from "@/validations/fees.validation";
import CourseFees from "@/models/course-fees.model";
import Student from "@/models/student.model";
import Tenant from "@/models/tenant.model";
import { DayBookData } from "@/models/daybook.model";
import { InstallmentExpire } from "@/models/misc.model";
import { sanitizeBody } from "@/lib/sanitize";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const filter = tenantFilter(ctx);
    const skip = (page - 1) * limit;

    const [fees, total] = await Promise.all([
      CourseFees.find(filter)
        .populate("studentInfo", "name rollNumber email mobileNumber")
        .populate("courseName", "courseName")
        .populate("paymentOption", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CourseFees.countDocuments(filter),
    ]);

    return successResponse({ data: fees, total, page, limit, totalPages: Math.ceil(total / limit) });
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
    const parsed = createCourseFeesSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const tenant = await Tenant.findById(ctx.tenantId);
    if (!tenant) return errorResponse("Tenant not found", 404);

    // Generate receipt number
    const receiptNumber = `${tenant.receiptPrefix}-${tenant.receiptNumber}`;
    tenant.receiptNumber += 1;
    await tenant.save();

    const student = await Student.findOne(tenantFilter(ctx, { _id: parsed.data.studentInfo }));
    if (!student) return errorResponse("Student not found", 404);

    // Create fee record
    const fees = await CourseFees.create({
      ...parsed.data,
      tenantId: ctx.tenantId,
      receiptNumber,
      addedBy: ctx.userId,
    });

    // Update student's payment info
    student.totalPaid += parsed.data.amountPaid;
    student.remainingCourseFees = parsed.data.remainingFees;
    if (parsed.data.noOfInstallments !== undefined) {
      student.noOfInstallments = parsed.data.noOfInstallments;
    }
    await student.save();

    // Create DayBook entry
    await DayBookData.create({
      tenantId: ctx.tenantId,
      studentInfo: student._id,
      rollNo: student.rollNumber.toString(),
      studentName: student.name,
      receiptNumber,
      narration: parsed.data.narration,
      credit: parsed.data.amountPaid,
      studentLateFees: parsed.data.lateFees || 0,
      dayBookDataDate: parsed.data.amountDate || new Date(),
      dayBookAccountId: body.dayBookAccountId,
    });

    // Create installment expiry record if installments remain
    if (student.remainingCourseFees > 0 && student.noOfInstallments > 0) {
      const nextExpiry = new Date();
      nextExpiry.setMonth(nextExpiry.getMonth() + 1);

      await InstallmentExpire.create({
        tenantId: ctx.tenantId,
        studentInfo: student._id,
        courseName: student.courseName,
        expirationDate: nextExpiry,
        installmentNumber: student.noOfInstallments,
        installmentAmount: student.noOfInstallmentsAmount || 0,
      });
    }

    return successResponse(fees, 201);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
