import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getTenantContext } from "@/lib/tenant";
import { successResponse, validationErrorResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/errors";
import { sanitizeBody } from "@/lib/sanitize";
import Profile from "@/models/profile.model";
import { updateProfileSchema } from "@/validations/profile.validation";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;

    let doc = await Profile.findOne({ tenantId: ctx.tenantId, userId: ctx.userId }).lean();

    // Return empty defaults if no profile exists yet
    if (!doc) {
      return successResponse({
        tenantId: ctx.tenantId,
        userId: ctx.userId,
        firstName: "",
        lastName: "",
        company: "",
        contactPhone: "",
        companySite: "",
        country: "",
        language: "en",
        timeZone: "Asia/Kolkata",
        currency: "INR",
        communications: { email: false, phone: false },
        allowMarketing: false,
      });
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

    const body = sanitizeBody(await req.json());
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const doc = await Profile.findOneAndUpdate(
      { tenantId: ctx.tenantId, userId: ctx.userId },
      { $set: parsed.data },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    return successResponse(doc);
  } catch (error) {
    return handleApiError(error);
  }
}
