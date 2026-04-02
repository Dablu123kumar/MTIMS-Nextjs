import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { sendEmail, replaceTemplateVariables } from "@/lib/mail";
import { successResponse, errorResponse } from "@/lib/api-response";
import Student from "@/models/student.model";
import { EmailReminder, EmailReminderDates, EmailLog } from "@/models/email.model";
import Tenant from "@/models/tenant.model";
import User from "@/models/user.model";
import moment from "moment";

/**
 * API route version of the cron job for serverless environments.
 * Can be triggered by external cron services (e.g., Vercel Cron, external scheduler).
 *
 * Add to vercel.json:
 * { "crons": [{ "path": "/api/cron/fee-reminder", "schedule": "0 9 * * *" }] }
 */
export async function GET(req: NextRequest) {
  // Optional: verify cron secret
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return errorResponse("Unauthorized", 401);
  }

  try {
    await connectDB();
    const tenants = await Tenant.find({ isActive: true }).lean();
    let totalSent = 0;

    for (const tenant of tenants) {
      const tenantId = tenant._id;
      const reminderDates = await EmailReminderDates.findOne({ tenantId }).lean();
      const reminderText = await EmailReminder.findOne({ tenantId }).lean();

      if (!reminderText) continue;

      const firstDueDay = reminderDates?.firstDueDay || 9;
      const secondDueDay = reminderDates?.secondDueDay || 15;
      const thirdDueDay = reminderDates?.thirdDueDay || 20;

      const students = await Student.find({
        tenantId,
        remainingCourseFees: { $gt: 0 },
        dropOutStudent: false,
      }).lean();

      const today = moment();

      for (const student of students) {
        const installmentDate = moment(student.installmentDuration);
        const dueDate = moment().date(installmentDate.date());
        const daysDiff = today.diff(dueDate, "days");

        const reminderDays = [-6, -3, -1, firstDueDay, secondDueDay, thirdDueDay];
        if (!reminderDays.includes(daysDiff)) continue;

        const lateFees = daysDiff > 0 ? daysDiff * 100 : 0;
        const variables = {
          studentName: student.name,
          installment_date: installmentDate.date().toString(),
          DueDates: dueDate.format("DD-MM-YYYY"),
          LateFees: lateFees.toString(),
          InstallmentAmount: (student.noOfInstallmentsAmount || 0).toString(),
          TotalPendingAmount: (student.remainingCourseFees || 0).toString(),
          RemainingFees: (student.remainingCourseFees || 0).toString(),
          DueDateDifference: Math.abs(daysDiff).toString(),
        };

        const emailContent = replaceTemplateVariables(
          daysDiff <= 0 ? reminderText.firstReminder : reminderText.thirdReminder,
          variables
        );

        const superAdmins = await User.find({ tenantId, role: { $in: ["SuperAdmin", "Owner"] } }).select("email").lean();
        const recipients = [student.email, tenant.email, ...superAdmins.map((a: any) => a.email)].filter(Boolean);

        try {
          await sendEmail({ to: recipients, subject: `Fee Reminder - ${student.name}`, html: emailContent });
          await EmailLog.create({ tenantId, recipientEmails: recipients, subject: `Fee Reminder - ${student.name}`, content: emailContent, sentBy: "System (Cron)" });
          totalSent++;
        } catch {}
      }
    }

    return successResponse({ message: `Fee reminders sent: ${totalSent}` });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
