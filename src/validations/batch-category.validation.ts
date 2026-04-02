import { z } from "zod";

export const createBatchCategorySchema = z.object({
  categoryName: z.string().min(1, "Category name is required").max(200),
});

export const updateBatchCategorySchema = createBatchCategorySchema.partial();

export type CreateBatchCategoryInput = z.infer<typeof createBatchCategorySchema>;
export type UpdateBatchCategoryInput = z.infer<typeof updateBatchCategorySchema>;
