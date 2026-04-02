import mongoose, { Schema, Document } from "mongoose";

// --- DayBook Account ---
export interface IDayBookAccountDoc extends Document {
  tenantId: mongoose.Types.ObjectId;
  accountName: string;
  accountId?: string;
  accountType: string;
}

const DayBookAccountSchema = new Schema<IDayBookAccountDoc>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    accountName: { type: String, required: true },
    accountId: { type: String },
    accountType: { type: String, required: true },
  },
  { timestamps: true }
);

DayBookAccountSchema.index({ accountName: 1, tenantId: 1 }, { unique: true });

export const DayBookAccount =
  mongoose.models.DayBookAccount ||
  mongoose.model<IDayBookAccountDoc>("DayBookAccount", DayBookAccountSchema);

// --- DayBook Data ---
export interface IDayBookDataDoc extends Document {
  tenantId: mongoose.Types.ObjectId;
  studentInfo?: mongoose.Types.ObjectId;
  rollNo?: string;
  studentName?: string;
  receiptNumber?: string;
  studentLateFees: number;
  narration?: string;
  dayBookDataDate: Date;
  accountName?: string;
  commissionPersonName?: string;
  debit: number;
  credit: number;
  dayBookAccountId: mongoose.Types.ObjectId;
  linkDayBookAccountData?: mongoose.Types.ObjectId;
  linkAccountType?: string;
  balance: number;
}

const DayBookDataSchema = new Schema<IDayBookDataDoc>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    studentInfo: { type: Schema.Types.ObjectId, ref: "Student" },
    rollNo: { type: String },
    studentName: { type: String },
    receiptNumber: { type: String },
    studentLateFees: { type: Number, default: 0 },
    narration: { type: String },
    dayBookDataDate: { type: Date, default: Date.now },
    accountName: { type: String },
    commissionPersonName: { type: String },
    debit: { type: Number, default: 0 },
    credit: { type: Number, default: 0 },
    dayBookAccountId: { type: Schema.Types.ObjectId, ref: "DayBookAccount" },
    linkDayBookAccountData: { type: Schema.Types.ObjectId, ref: "DayBookAccount" },
    linkAccountType: { type: String },
    balance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const DayBookData =
  mongoose.models.DayBookData ||
  mongoose.model<IDayBookDataDoc>("DayBookData", DayBookDataSchema);
