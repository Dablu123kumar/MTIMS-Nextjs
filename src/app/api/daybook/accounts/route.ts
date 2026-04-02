import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse, validationErrorResponse } from "@/lib/api-response";
import { getTenantContext, tenantFilter } from "@/lib/tenant";
import { createDayBookAccountSchema } from "@/validations/daybook.validation";
import { DayBookAccount } from "@/models/daybook.model";
import { sanitizeBody } from "@/lib/sanitize";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;

    const accounts = await DayBookAccount.find(tenantFilter(ctx)).sort({ createdAt: -1 }).lean();
    return successResponse(accounts);
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
    const parsed = createDayBookAccountSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const account = await DayBookAccount.create({ ...parsed.data, tenantId: ctx.tenantId });
    return successResponse(account, 201);
  } catch (error: any) {
    if (error.code === 11000) return errorResponse("Account name already exists", 409);
    return errorResponse(error.message, 500);
  }
}
