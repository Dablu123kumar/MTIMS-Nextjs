import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse, validationErrorResponse } from "@/lib/api-response";
import { getTenantContext, tenantFilter } from "@/lib/tenant";
import { createTrainerSchema } from "@/validations/misc.validation";
import Trainer from "@/models/trainer.model";
import { sanitizeBody } from "@/lib/sanitize";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;

    const trainers = await Trainer.find(tenantFilter(ctx)).sort({ createdAt: -1 }).lean();
    return successResponse(trainers);
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
    const parsed = createTrainerSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const trainer = await Trainer.create({ ...parsed.data, tenantId: ctx.tenantId });
    return successResponse(trainer, 201);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
