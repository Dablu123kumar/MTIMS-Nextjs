import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getTenantContext, tenantFilter } from "@/lib/tenant";
import { successResponse, errorResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/errors";
import Rbac from "@/models/rbac.model";

export async function GET(req: NextRequest, { params }: { params: Promise<{ role: string }> }) {
  try {
    const { role } = await params;
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;

    const doc = await Rbac.findOne(tenantFilter(ctx, { role })).lean();
    if (!doc) return errorResponse(`No permissions configured for role '${role}'`, 404);

    return successResponse(doc);
  } catch (error) {
    return handleApiError(error);
  }
}
