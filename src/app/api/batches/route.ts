import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse, validationErrorResponse } from "@/lib/api-response";
import { getTenantContext, tenantFilter } from "@/lib/tenant";
import { createBatchSchema } from "@/validations/batch.validation";
import Batch from "@/models/batch.model";
import { sanitizeBody } from "@/lib/sanitize";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const filter: any = tenantFilter(ctx);
    if (status) filter.status = status;

    const batches = await Batch.find(filter)
      .populate("course", "courseName")
      .populate("courseCategory", "category")
      .populate("trainer", "trainerName trainerEmail")
      .populate("students.student", "name rollNumber email")
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(batches);
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
    const parsed = createBatchSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const batch = await Batch.create({
      ...parsed.data,
      tenantId: ctx.tenantId,
    });

    return successResponse(batch, 201);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
