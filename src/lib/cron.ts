import cron from "node-cron";
import { connectDB } from "./db";
import { sendEmail, replaceTemplateVariables } from "./mail";
import Student from "@/models/student.model";
import { EmailReminder, EmailReminderDates, EmailLog } from "@/models/email.model";
import Tenant from "@/models/tenant.model";
import User from "@/models/user.model";
import moment from "moment";
import { logger } from "./logger";

// --- SchedulerService: managed singleton for cron tasks ---

type TaskHandler = () => Promise<void>;

interface RegisteredTask {
  name: string;
  schedule: string;
  handler: TaskHandler;
  job: cron.ScheduledTask | null;
  lastRun?: Date;
  lastError?: string;
}

class SchedulerService {
  private static instance: SchedulerService;
  private tasks = new Map<string, RegisteredTask>();
  private runningTasks = new Set<Promise<void>>();

  private constructor() {}

  static getInstance(): SchedulerService {
    if (!SchedulerService.instance) {
      SchedulerService.instance = new SchedulerService();
    }
    return SchedulerService.instance;
  }

  register(name: string, schedule: string, handler: TaskHandler): void {
    if (this.tasks.has(name)) {
      logger.warn({ task: name }, "Task already registered, replacing");
      this.tasks.get(name)?.job?.stop();
    }

    this.tasks.set(name, { name, schedule, handler, job: null });
    logger.info({ task: name, schedule }, "Task registered");
  }

  start(): void {
    for (const [name, task] of this.tasks) {
      const wrappedHandler = async () => {
        const start = Date.now();
        logger.info({ task: name }, "Task execution started");

        const promise = task.handler()
          .then(() => {
            task.lastRun = new Date();
            logger.info({ task: name, durationMs: Date.now() - start }, "Task execution completed");
          })
          .catch((err) => {
            task.lastError = err instanceof Error ? err.message : String(err);
            logger.error({ task: name, err: task.lastError, durationMs: Date.now() - start }, "Task execution failed");
          })
          .finally(() => {
            this.runningTasks.delete(promise);
          });

        this.runningTasks.add(promise);
      };

      task.job = cron.schedule(task.schedule, wrappedHandler, {
        timezone: process.env.SCHEDULER_TIMEZONE || "Asia/Kolkata",
      });

      logger.info({ task: name, schedule: task.schedule }, "Task started");
    }
  }

  async stop(): Promise<void> {
    // Stop scheduling new runs
    for (const task of this.tasks.values()) {
      task.job?.stop();
    }

    // Wait for in-flight tasks (max 25s)
    if (this.runningTasks.size > 0) {
      logger.info({ count: this.runningTasks.size }, "Waiting for in-flight tasks to complete");
      await Promise.race([
        Promise.all(this.runningTasks),
        new Promise((resolve) => setTimeout(resolve, 25000)),
      ]);
    }

    logger.info("Scheduler stopped");
  }

  getStatus(): { name: string; schedule: string; lastRun?: Date; lastError?: string }[] {
    return Array.from(this.tasks.values()).map((t) => ({
      name: t.name,
      schedule: t.schedule,
      lastRun: t.lastRun,
      lastError: t.lastError,
    }));
  }
}

// --- Fee Reminder Task ---

async function feeReminderHandler() {
  await connectDB();

  const tenants = await Tenant.find({ isActive: true }).lean();

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
      const dayOfMonth = installmentDate.date();
      const dueDate = moment().date(dayOfMonth);

      const reminderDays = [-6, -3, -1, firstDueDay, secondDueDay, thirdDueDay];
      const daysDiff = today.diff(dueDate, "days");
      const shouldSend = reminderDays.includes(daysDiff);

      if (!shouldSend) continue;

      const lateFees = daysDiff > 0 ? daysDiff * 100 : 0;

      const variables = {
        studentName: student.name,
        installment_date: dayOfMonth.toString(),
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

      const superAdmins = await User.find({
        tenantId,
        role: { $in: ["SuperAdmin", "Owner"] },
      }).select("email").lean();

      const recipients = [
        student.email,
        tenant.email,
        ...superAdmins.map((a: any) => a.email),
      ].filter(Boolean);

      try {
        await sendEmail({
          to: recipients,
          subject: `Fee Reminder - ${student.name}`,
          html: emailContent,
        });

        await EmailLog.create({
          tenantId,
          recipientEmails: recipients,
          subject: `Fee Reminder - ${student.name}`,
          content: emailContent,
          sentBy: "System (Cron Job)",
        });

        logger.info({ student: student.name, email: student.email }, "Sent fee reminder");
      } catch (emailError) {
        logger.error({ email: student.email, err: emailError }, "Failed to send fee reminder");
      }
    }
  }
}

// --- Export & Initialization ---

export const scheduler = SchedulerService.getInstance();

export function startFeeReminderCron() {
  scheduler.register("fee-reminder", "0 9 * * *", feeReminderHandler);
  scheduler.start();
  logger.info("Scheduler initialized with fee-reminder task (daily at 9:00 AM)");
}
