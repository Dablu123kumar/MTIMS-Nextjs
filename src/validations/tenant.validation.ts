import { z } from "zod";

export const createTenantSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  website: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  receiptPrefix: z.string().min(1, "Receipt prefix is required"),
  gst: z.string().optional(),
  isGstBased: z.boolean().default(false),
});

export const updateTenantSchema = createTenantSchema.partial();

export type CreateTenantInput = z.infer<typeof createTenantSchema>;
export type UpdateTenantInput = z.infer<typeof updateTenantSchema>;
