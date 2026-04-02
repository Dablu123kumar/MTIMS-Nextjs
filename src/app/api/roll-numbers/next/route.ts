import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getTenantContext, requireRole, ADMIN_ROLES } from "@/lib/tenant";
import { successResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/errors";
import RollNumber from "@/models/roll-number.model";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;
    const roleCheck = requireRole(ctx, ADMIN_ROLES);
    if (roleCheck) return roleCheck;

    // Atomic increment — prevents race conditions
    const doc: any = await RollNumber.findOneAndUpdate(
      { tenantId: ctx.tenantId },
      { $inc: { currentValue: 1 } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    if (!doc) return successResponse({ rollNumber: "1001" });
    const rollNumber = `${doc.prefix}${doc.currentValue}`;
    return successResponse({ prefix: doc.prefix, currentValue: doc.currentValue, rollNumber });
  } catch (error) {
    return handleApiError(error);
  }
}
