import { z } from "zod";

export const createCourseCompletionSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  courseId: z.string().min(1, "Course ID is required"),
  completionDate: z.string().optional(),
  certificateNumber: z.string().optional(),
  remarks: z.string().max(500).optional(),
  status: z.enum(["completed", "withdrawn", "failed"]).optional(),
});

export const updateCourseCompletionSchema = createCourseCompletionSchema.partial();

export type CreateCourseCompletionInput = z.infer<typeof createCourseCompletionSchema>;
export type UpdateCourseCompletionInput = z.infer<typeof updateCourseCompletionSchema>;
