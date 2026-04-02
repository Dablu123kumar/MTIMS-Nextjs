import { z } from "zod";

export const createSubjectSchema = z.object({
  subjectName: z.string().min(1, "Subject name is required"),
  subjectCode: z.string().min(1, "Subject code is required"),
  fullMarks: z.number().positive("Full marks must be positive"),
  passMarks: z.number().positive("Pass marks must be positive"),
  course: z.string().min(1, "Course is required"),
  courseType: z.string().min(1, "Course type is required"),
  semYear: z.string().min(1, "Semester/Year is required"),
});

export const updateSubjectSchema = createSubjectSchema.partial();

export const addStudentMarksSchema = z.object({
  studentInfo: z.string().min(1, "Student is required"),
  course: z.string().min(1, "Course is required"),
  courseCategory: z.string().min(1, "Course category is required"),
  subjects: z.array(
    z.object({
      subject: z.string().min(1),
      theory: z.number().nullable().optional(),
      practical: z.number().nullable().optional(),
      totalMarks: z.number().nullable().optional(),
    })
  ),
});

export const updateStudentMarksSchema = z.object({
  subjects: z.array(
    z.object({
      subject: z.string().min(1),
      theory: z.number().nullable().optional(),
      practical: z.number().nullable().optional(),
      totalMarks: z.number().nullable().optional(),
      isActive: z.boolean().optional(),
    })
  ),
  resultStatus: z.enum(["NotStarted", "InProgress", "Completed"]).optional(),
});

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type AddStudentMarksInput = z.infer<typeof addStudentMarksSchema>;
