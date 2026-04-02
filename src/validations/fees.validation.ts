import { z } from "zod";

export const createCourseFeesSchema = z.object({
  studentInfo: z.string().min(1, "Student info is required"),
  courseName: z.string().min(1, "Course name is required"),
  netCourseFees: z.number().positive("Net course fees must be positive"),
  remainingFees: z.number().min(0, "Remaining fees cannot be negative"),
  amountPaid: z.number().positive("Amount paid must be positive"),
  amountDate: z.string().optional(),
  noOfInstallments: z.number().int().optional(),
  noOfInstallmentsAmount: z.number().optional(),
  paymentOption: z.string().min(1, "Payment option is required"),
  narration: z.string().optional(),
  lateFees: z.number().min(0).optional(),
  gstPercentage: z.number().min(0).optional(),
});

export const createPaymentOptionSchema = z.object({
  name: z.string().min(1, "Payment option name is required"),
});

export type CreateCourseFeesInput = z.infer<typeof createCourseFeesSchema>;
export type CreatePaymentOptionInput = z.infer<typeof createPaymentOptionSchema>;
