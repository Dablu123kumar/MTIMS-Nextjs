import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getTenantContext, tenantFilter } from "@/lib/tenant";
import Batch from "@/models/batch.model";
import { sanitizeBody } from "@/lib/sanitize";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;

    const { id } = await params;
    const batch = await Batch.findOne(tenantFilter(ctx, { _id: id }))
      .populate("course trainer students.student students.subjects.subject")
      .lean();

    if (!batch) return errorResponse("Batch not found", 404);
    return successResponse(batch);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;

    const { id } = await params;
    const body = sanitizeBody(await req.json());
    delete body.tenantId;

    const batch = await Batch.findOneAndUpdate(tenantFilter(ctx, { _id: id }), body, { new: true });
    if (!batch) return errorResponse("Batch not found", 404);
    return successResponse(batch);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;

    const { id } = await params;
    const batch = await Batch.findOneAndDelete(tenantFilter(ctx, { _id: id }));
    if (!batch) return errorResponse("Batch not found", 404);
    return successResponse({ message: "Batch deleted" });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
