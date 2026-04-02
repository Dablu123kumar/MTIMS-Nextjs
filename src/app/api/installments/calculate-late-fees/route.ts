import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getTenantContext, tenantFilter, requireRole, ADMIN_ROLES } from "@/lib/tenant";
import { successResponse, validationErrorResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/errors";
import { sanitizeBody } from "@/lib/sanitize";
import Installment from "@/models/installment.model";
import { calculateLateFeesSchema } from "@/validations/installment.validation";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;
    const roleCheck = requireRole(ctx, ADMIN_ROLES);
    if (roleCheck) return roleCheck;

    const body = sanitizeBody(await req.json());
    const parsed = calculateLateFeesSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const lateFeePerDay = parsed.data.lateFeePerDay;
    const now = new Date();

    // Find all overdue unpaid installments for this tenant
    const overdueInstallments = await Installment.find(
      tenantFilter(ctx, {
        isPaid: false,
        isDropout: false,
        dueDate: { $lt: now },
      })
    );

    let updatedCount = 0;

    for (const inst of overdueInstallments) {
      const daysOverdue = Math.ceil(
        (now.getTime() - inst.dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const newLateFee = daysOverdue * lateFeePerDay;

      if (newLateFee !== inst.lateFeeAmount) {
        inst.lateFeeAmount = newLateFee;
        await inst.save();
        updatedCount++;
      }
    }

    return successResponse({
      message: `Late fees calculated for ${updatedCount} overdue installments`,
      totalProcessed: overdueInstallments.length,
      updatedCount,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
