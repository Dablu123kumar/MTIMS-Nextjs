import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse, validationErrorResponse } from "@/lib/api-response";
import { getTenantContext, tenantFilter } from "@/lib/tenant";
import { createCategorySchema } from "@/validations/course.validation";
import { Category } from "@/models/course.model";
import { sanitizeBody } from "@/lib/sanitize";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;

    const categories = await Category.find(tenantFilter(ctx)).sort({ createdAt: -1 }).lean();
    return successResponse(categories);
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
    const parsed = createCategorySchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const category = await Category.create({
      ...parsed.data,
      tenantId: ctx.tenantId,
      createdBy: ctx.userId,
    });

    return successResponse(category, 201);
  } catch (error: any) {
    if (error.code === 11000) return errorResponse("Category already exists", 409);
    return errorResponse(error.message, 500);
  }
}
