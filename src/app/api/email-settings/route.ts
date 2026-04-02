import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getTenantContext, requireRole, ADMIN_ROLES, tenantFilter } from "@/lib/tenant";
import { EmailReminder, EmailReminderDates, EmailTemplate, EmailLog } from "@/models/email.model";
import { sanitizeBody } from "@/lib/sanitize";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;

    const filter = tenantFilter(ctx);
    const { searchParams } = req.nextUrl;
    const section = searchParams.get("section");

    if (section === "logs") {
      const page = parseInt(searchParams.get("page") || "1", 10);
      const limit = parseInt(searchParams.get("limit") || "10", 10);
      const [logs, total] = await Promise.all([
        EmailLog.find(filter).sort({ sentAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
        EmailLog.countDocuments(filter),
      ]);
      return successResponse({ logs, total, page, totalPages: Math.ceil(total / limit) });
    }

    const [reminders, reminderDates, templates] = await Promise.all([
      EmailReminder.findOne(filter).lean(),
      EmailReminderDates.findOne(filter).lean(),
      EmailTemplate.findOne(filter).lean(),
    ]);

    return successResponse({ reminders, reminderDates, templates });
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
    const { section, ...data } = body;
    const filter = tenantFilter(ctx);

    if (section === "reminders") {
      const result = await EmailReminder.findOneAndUpdate(
        filter, { ...data, tenantId: ctx.tenantId }, { new: true, upsert: true }
      ).lean();
      return successResponse(result);
    }

    if (section === "dates") {
      const result = await EmailReminderDates.findOneAndUpdate(
        filter, { ...data, tenantId: ctx.tenantId }, { new: true, upsert: true }
      ).lean();
      return successResponse(result);
    }

    if (section === "templates") {
      const result = await EmailTemplate.findOneAndUpdate(
        filter, { ...data, tenantId: ctx.tenantId }, { new: true, upsert: true }
      ).lean();
      return successResponse(result);
    }

    return errorResponse("Invalid section. Use: reminders, dates, or templates", 400);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
