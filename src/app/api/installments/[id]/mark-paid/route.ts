import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getTenantContext, tenantFilter, requireRole, ADMIN_ROLES } from "@/lib/tenant";
import { successResponse, errorResponse, validationErrorResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/errors";
import { sanitizeBody } from "@/lib/sanitize";
import Installment from "@/models/installment.model";
import { markPaidSchema } from "@/validations/installment.validation";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;
    const roleCheck = requireRole(ctx, ADMIN_ROLES);
    if (roleCheck) return roleCheck;

    const body = sanitizeBody(await req.json());
    const parsed = markPaidSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const installment = await Installment.findOne(tenantFilter(ctx, { _id: id }));
    if (!installment) return errorResponse("Installment not found", 404);

    if (installment.isPaid) return errorResponse("Installment is already paid", 400);

    const paidDate = parsed.data.paidDate ? new Date(parsed.data.paidDate) : new Date();

    // Calculate late fee if paid after due date
    let lateFeeAmount = 0;
    if (paidDate > installment.dueDate) {
      const daysLate = Math.ceil(
        (paidDate.getTime() - installment.dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      lateFeeAmount = daysLate * 100; // Rs 100 per day late
    }

    installment.isPaid = true;
    installment.paidDate = paidDate;
    installment.lateFeeAmount = lateFeeAmount;
    await installment.save();

    return successResponse(installment.toObject());
  } catch (error) {
    return handleApiError(error);
  }
}
