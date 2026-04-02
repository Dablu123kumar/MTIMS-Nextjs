import { z } from "zod";

export const createBatchSchema = z.object({
  name: z.string().min(1, "Batch name is required"),
  courseCategory: z.string().optional(),
  course: z.string().optional(),
  trainer: z.string().min(1, "Trainer is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
});

export const updateBatchSchema = createBatchSchema.partial();

export const addStudentToBatchSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  subjects: z.array(z.string()).optional(),
});

export const updateSubjectStatusSchema = z.object({
  status: z.enum(["notStarted", "inProgress", "completed"]),
  progress: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
});

export const markAttendanceSchema = z.object({
  type: z.enum(["BATCH", "GLOBAL"]).default("GLOBAL"),
  batchId: z.string().optional(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000),
  students: z.array(
    z.object({
      student: z.string().min(1),
      days: z.record(z.enum(["P", "A"])),
    })
  ),
});

export type CreateBatchInput = z.infer<typeof createBatchSchema>;
export type MarkAttendanceInput = z.infer<typeof markAttendanceSchema>;
