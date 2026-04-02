import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse, validationErrorResponse } from "@/lib/api-response";
import { getTenantContext, requireRole, ADMIN_ROLES, tenantFilter } from "@/lib/tenant";
import { createPaymentOptionSchema } from "@/validations/fees.validation";
import PaymentOption from "@/models/payment-option.model";
import { sanitizeBody } from "@/lib/sanitize";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;

    const options = await PaymentOption.find(tenantFilter(ctx)).sort({ createdAt: -1 }).lean();
    return successResponse(options);
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
    const parsed = createPaymentOptionSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const option = await PaymentOption.create({
      ...parsed.data,
      tenantId: ctx.tenantId,
      createdBy: ctx.userId,
    });
    return successResponse(option, 201);
  } catch (error: any) {
    if (error.code === 11000) return errorResponse("Payment option already exists", 409);
    return errorResponse(error.message, 500);
  }
}
