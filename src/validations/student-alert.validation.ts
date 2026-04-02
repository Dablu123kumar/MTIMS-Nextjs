import { z } from "zod";

export const createStudentAlertSchema = z.object({
  date: z.string().min(1, "Date is required"),
  reminderDateTime: z.string().min(1, "Reminder date/time is required"),
  particulars: z.string().min(1, "Particulars are required"),
  status: z.enum(["pending", "sent", "dismissed"]).optional(),
});

export const updateStudentAlertSchema = createStudentAlertSchema.partial();

export type CreateStudentAlertInput = z.infer<typeof createStudentAlertSchema>;
export type UpdateStudentAlertInput = z.infer<typeof updateStudentAlertSchema>;
