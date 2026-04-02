import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getTenantContext, requireRole, ADMIN_ROLES, tenantFilter } from "@/lib/tenant";
import { Approval } from "@/models/misc.model";
import { sanitizeBody } from "@/lib/sanitize";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;

    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const status = searchParams.get("status");
    const filter: any = tenantFilter(ctx);

    if (status) filter.status = status;

    const [approvals, total] = await Promise.all([
      Approval.find(filter)
        .populate({ path: "receipt", populate: { path: "studentInfo", select: "name rollNumber" } })
        .populate("studentId", "name rollNumber email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Approval.countDocuments(filter),
    ]);

    return successResponse({ approvals, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;
    const roleCheck = requireRole(ctx, ADMIN_ROLES);
    if (roleCheck) return roleCheck;

    const body = sanitizeBody(await req.json());
    const approval = await Approval.create({ ...body, tenantId: ctx.tenantId });
    return successResponse(approval, 201);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
