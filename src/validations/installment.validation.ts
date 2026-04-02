import { z } from "zod";

export const createInstallmentSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  courseId: z.string().min(1, "Course ID is required"),
  installmentNumber: z.number().int().positive("Installment number must be positive"),
  installmentAmount: z.number().positive("Amount must be positive"),
  dueDate: z.string().min(1, "Due date is required"),
});

export const updateInstallmentSchema = z.object({
  installmentAmount: z.number().positive().optional(),
  dueDate: z.string().optional(),
});

export const markPaidSchema = z.object({
  paidDate: z.string().optional(),
});

export const calculateLateFeesSchema = z.object({
  lateFeePerDay: z.number().positive().default(100),
});

export type CreateInstallmentInput = z.infer<typeof createInstallmentSchema>;
export type UpdateInstallmentInput = z.infer<typeof updateInstallmentSchema>;
