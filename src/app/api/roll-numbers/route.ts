import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getTenantContext, requireRole, ADMIN_ROLES } from "@/lib/tenant";
import { successResponse, validationErrorResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/errors";
import { sanitizeBody } from "@/lib/sanitize";
import RollNumber from "@/models/roll-number.model";
import { updateRollNumberSchema } from "@/validations/roll-number.validation";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;

    let doc: any = await RollNumber.findOne({ tenantId: ctx.tenantId }).lean();
    if (!doc) {
      const created = await RollNumber.create({ tenantId: ctx.tenantId, prefix: "", currentValue: 1000 });
      doc = created.toObject();
    }

    return successResponse(doc);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;
    const roleCheck = requireRole(ctx, ADMIN_ROLES);
    if (roleCheck) return roleCheck;

    const body = sanitizeBody(await req.json());
    const parsed = updateRollNumberSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const doc = await RollNumber.findOneAndUpdate(
      { tenantId: ctx.tenantId },
      { $set: parsed.data },
      { new: true, upsert: true }
    ).lean();

    return successResponse(doc);
  } catch (error) {
    return handleApiError(error);
  }
}
