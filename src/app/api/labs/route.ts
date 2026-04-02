import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getTenantContext, requireRole, ADMIN_ROLES, tenantFilter } from "@/lib/tenant";
import { Lab } from "@/models/misc.model";
import { sanitizeBody } from "@/lib/sanitize";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;

    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";
    const filter = tenantFilter(ctx);

    if (search) {
      (filter as any).labName = { $regex: search, $options: "i" };
    }

    const [labs, total] = await Promise.all([
      Lab.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Lab.countDocuments(filter),
    ]);

    return successResponse({ labs, total, page, totalPages: Math.ceil(total / limit) });
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
    if (!body.labName) return errorResponse("Lab name is required", 400);

    const lab = await Lab.create({ labName: body.labName, tenantId: ctx.tenantId });
    return successResponse(lab, 201);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
