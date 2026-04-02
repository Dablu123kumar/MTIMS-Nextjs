import { z } from "zod";

export const createDayBookAccountSchema = z.object({
  accountName: z.string().min(1, "Account name is required"),
  accountType: z.string().min(1, "Account type is required"),
  accountId: z.string().optional(),
});

export const createDayBookDataSchema = z.object({
  studentInfo: z.string().optional(),
  rollNo: z.string().optional(),
  studentName: z.string().optional(),
  receiptNumber: z.string().optional(),
  studentLateFees: z.number().min(0).default(0),
  narration: z.string().optional(),
  dayBookDataDate: z.string().optional(),
  accountName: z.string().optional(),
  commissionPersonName: z.string().optional(),
  debit: z.number().min(0).default(0),
  credit: z.number().min(0).default(0),
  dayBookAccountId: z.string().min(1, "Day book account is required"),
  linkDayBookAccountData: z.string().optional(),
  linkAccountType: z.string().optional(),
  balance: z.number().default(0),
});

export type CreateDayBookAccountInput = z.infer<typeof createDayBookAccountSchema>;
export type CreateDayBookDataInput = z.infer<typeof createDayBookDataSchema>;
