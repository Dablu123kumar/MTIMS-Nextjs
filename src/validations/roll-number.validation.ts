import { z } from "zod";

export const updateRollNumberSchema = z.object({
  prefix: z.string().max(20).optional(),
  currentValue: z.number().int().min(1).optional(),
});

export type UpdateRollNumberInput = z.infer<typeof updateRollNumberSchema>;
