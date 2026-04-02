import { z } from "zod";

const ROLES = ["Owner", "SuperAdmin", "Admin", "Accounts", "Counsellor", "Telecaller", "Trainer", "Student"] as const;

export const createRbacSchema = z.object({
  role: z.enum(ROLES),
  permissions: z.record(z.boolean()).optional().default({}),
  isActive: z.boolean().optional().default(true),
});

export const updateRbacSchema = z.object({
  role: z.enum(ROLES).optional(),
  permissions: z.record(z.boolean()).optional(),
  isActive: z.boolean().optional(),
});

export type CreateRbacInput = z.infer<typeof createRbacSchema>;
export type UpdateRbacInput = z.infer<typeof updateRbacSchema>;
