import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse, validationErrorResponse } from "@/lib/api-response";
import { getTenantContext, tenantFilter } from "@/lib/tenant";
import { createDayBookDataSchema } from "@/validations/daybook.validation";
import { DayBookData } from "@/models/daybook.model";
import { sanitizeBody } from "@/lib/sanitize";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;

    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("accountId");

    const filter: any = tenantFilter(ctx);
    if (accountId) filter.dayBookAccountId = accountId;

    const data = await DayBookData.find(filter)
      .populate("studentInfo", "name rollNumber")
      .populate("dayBookAccountId", "accountName accountType")
      .sort({ dayBookDataDate: -1 })
      .lean();

    return successResponse(data);
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
    const parsed = createDayBookDataSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const entry = await DayBookData.create({ ...parsed.data, tenantId: ctx.tenantId });
    return successResponse(entry, 201);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
