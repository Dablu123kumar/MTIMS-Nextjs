import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse, validationErrorResponse } from "@/lib/api-response";
import { getTenantContext, requireRole, ADMIN_ROLES, tenantFilter } from "@/lib/tenant";
import { createStudentSchema } from "@/validations/student.validation";
import Student from "@/models/student.model";
import { sanitizeBody } from "@/lib/sanitize";

// GET all students for tenant
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const courseId = searchParams.get("courseId");
    const dropOut = searchParams.get("dropOut");
    const feeStatus = searchParams.get("feeStatus"); // "cleared" | "remaining"

    const filter: any = tenantFilter(ctx);

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { mobileNumber: { $regex: search, $options: "i" } },
      ];
    }
    if (courseId) filter.courseName = courseId;
    if (dropOut === "true") filter.dropOutStudent = true;
    if (dropOut === "false") filter.dropOutStudent = false;
    if (feeStatus === "cleared") filter.remainingCourseFees = 0;
    if (feeStatus === "remaining") filter.remainingCourseFees = { $gt: 0 };

    const skip = (page - 1) * limit;
    const [students, total] = await Promise.all([
      Student.find(filter)
        .populate("courseName", "courseName courseFees")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Student.countDocuments(filter),
    ]);

    return successResponse({
      data: students,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

// POST create student (admission)
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;

    const roleCheck = requireRole(ctx, ADMIN_ROLES);
    if (roleCheck) return roleCheck;

    const body = sanitizeBody(await req.json());
    const parsed = createStudentSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    // Auto-generate roll number
    const lastStudent = await Student.findOne({ tenantId: ctx.tenantId })
      .sort({ rollNumber: -1 })
      .lean();
    const rollNumber = lastStudent ? lastStudent.rollNumber + 1 : 1000;

    const student = await Student.create({
      ...parsed.data,
      tenantId: ctx.tenantId,
      rollNumber,
      remainingCourseFees: parsed.data.netCourseFees,
      totalPaid: 0,
    });

    return successResponse(student, 201);
  } catch (error: any) {
    if (error.code === 11000) {
      return errorResponse("Student with this email or mobile already exists", 409);
    }
    return errorResponse(error.message, 500);
  }
}
