import { z } from "zod";

export const createCourseSchema = z.object({
  courseName: z.string().min(1, "Course name is required"),
  courseFees: z.number().positive("Course fees must be positive"),
  courseType: z.string().min(1, "Course type is required"),
  numberOfYears: z.string().min(1, "Number of years is required"),
  category: z.string().min(1, "Category is required"),
});

export const updateCourseSchema = createCourseSchema.partial();

export const createCategorySchema = z.object({
  category: z.string().min(1, "Category name is required"),
});

export const createCourseTypeSchema = z.object({
  courseType: z.string().min(1, "Course type name is required"),
});

export const createNumberOfYearsSchema = z.object({
  numberOfYears: z.number().int().positive("Number of years must be positive"),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
