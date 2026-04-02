import { z } from "zod";

export const createTeacherSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(1, "Phone is required"),
  subjects: z.array(z.string()).optional(),
  qualification: z.string().min(1, "Qualification is required"),
  experience: z.number().min(0).default(0),
  address: z.string().min(1, "Address is required"),
});

export const createTrainerSchema = z.object({
  trainerName: z.string().min(1, "Trainer name is required"),
  trainerDesignation: z.string().min(1, "Designation is required"),
  trainerEmail: z.string().email("Invalid email"),
  trainerRole: z.string().default("Trainer"),
});

export const createLabSchema = z.object({
  labName: z.string().min(1, "Lab name is required"),
});

export const createTimingSchema = z.object({
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
});

export const createStudentIssueSchema = z.object({
  particulars: z.string().min(1, "Details are required"),
  studentId: z.string().min(1, "Student is required"),
  showOnDashboard: z.boolean().default(false),
});

export const createStudentNoteSchema = z.object({
  particulars: z.string().min(1, "Details are required"),
  startTime: z.string().nullable().optional(),
  userId: z.string().min(1, "User is required"),
});

export const createCommissionSchema = z.object({
  studentName: z.string().min(1, "Student name is required"),
  commissionPersonName: z.string().min(1, "Commission person name is required"),
  voucherNumber: z.string().optional(),
  commissionAmount: z.string().min(1, "Amount is required"),
  commissionRemaining: z.string().optional(),
  commissionPaid: z.string().min(1, "Paid amount is required"),
  commissionDate: z.string().min(1, "Date is required"),
  commissionNarration: z.string().min(1, "Narration is required"),
});

export const emailReminderSchema = z.object({
  firstReminder: z.string().min(1, "First reminder text is required"),
  thirdReminder: z.string().min(1, "Third reminder text is required"),
});

export const emailReminderDatesSchema = z.object({
  firstDueDay: z.number().int().positive(),
  secondDueDay: z.number().int().positive(),
  thirdDueDay: z.number().int().positive(),
});

export const emailTemplateSchema = z.object({
  customTemplate: z.string().min(1),
  cancellationTemplate: z.string().min(1),
  dynamicTemplate: z.string().min(1),
  courseSubjectTemplate: z.string().min(1),
  courseChangeTemplate: z.string().min(1),
});

export type CreateTeacherInput = z.infer<typeof createTeacherSchema>;
export type CreateTrainerInput = z.infer<typeof createTrainerSchema>;
