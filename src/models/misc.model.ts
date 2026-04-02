import mongoose, { Schema, Document } from "mongoose";

// --- Student Issues ---
export interface IStudentIssueDoc extends Document {
  tenantId: mongoose.Types.ObjectId;
  date: Date;
  particulars: string;
  addedBy: string;
  studentId: string;
  showOnDashboard: boolean;
}

const StudentIssueSchema = new Schema<IStudentIssueDoc>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    date: { type: Date, default: Date.now },
    particulars: { type: String, required: true },
    addedBy: { type: String, required: true },
    studentId: { type: String, required: true },
    showOnDashboard: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const StudentIssue =
  mongoose.models.StudentIssue ||
  mongoose.model<IStudentIssueDoc>("StudentIssue", StudentIssueSchema);

// --- Student Notes ---
export interface IStudentNoteDoc extends Document {
  tenantId: mongoose.Types.ObjectId;
  date: Date;
  particulars: string;
  startTime?: Date;
  addedBy: string;
  userId: string;
}

const StudentNoteSchema = new Schema<IStudentNoteDoc>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    date: { type: Date, default: Date.now },
    particulars: { type: String, required: true },
    startTime: { type: Date, default: null },
    addedBy: { type: String, required: true },
    userId: { type: String, required: true },
  },
  { timestamps: true }
);

export const StudentNote =
  mongoose.models.StudentNote ||
  mongoose.model<IStudentNoteDoc>("StudentNote", StudentNoteSchema);

// --- Student Commission ---
export interface IStudentCommissionDoc extends Document {
  tenantId: mongoose.Types.ObjectId;
  studentName: string;
  commissionPersonName: string;
  voucherNumber?: string;
  commissionAmount: string;
  commissionRemaining?: string;
  commissionPaid: string;
  commissionDate: string;
  commissionNarration: string;
}

const StudentCommissionSchema = new Schema<IStudentCommissionDoc>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    studentName: { type: String, required: true },
    commissionPersonName: { type: String, required: true },
    voucherNumber: { type: String },
    commissionAmount: { type: String, required: true },
    commissionRemaining: { type: String },
    commissionPaid: { type: String, required: true },
    commissionDate: { type: String, required: true },
    commissionNarration: { type: String, required: true },
  },
  { timestamps: true }
);

export const StudentCommission =
  mongoose.models.StudentCommission ||
  mongoose.model<IStudentCommissionDoc>("StudentCommission", StudentCommissionSchema);

// --- Approval Receipt ---
export interface IApprovalDoc extends Document {
  tenantId: mongoose.Types.ObjectId;
  status: string;
  receipt: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  check: boolean;
}

const ApprovalSchema = new Schema<IApprovalDoc>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    status: { type: String },
    receipt: { type: Schema.Types.ObjectId, ref: "CourseFees" },
    studentId: { type: Schema.Types.ObjectId, ref: "Student" },
    check: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Approval =
  mongoose.models.Approval || mongoose.model<IApprovalDoc>("Approval", ApprovalSchema);

// --- User Role Access ---
export interface IUserRoleAccessDoc extends Document {
  tenantId: mongoose.Types.ObjectId;
  role: string;
  companyPermissions: Map<string, boolean>;
  studentControlAccess: Map<string, boolean>;
  studentFeesAccess: Map<string, boolean>;
}

const UserRoleAccessSchema = new Schema<IUserRoleAccessDoc>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    role: {
      type: String,
      enum: ["Student", "Telecaller", "Accounts", "Counsellor", "Trainer", "Admin", "SuperAdmin"],
      required: true,
    },
    companyPermissions: { type: Map, of: Boolean },
    studentControlAccess: { type: Map, of: Boolean },
    studentFeesAccess: { type: Map, of: Boolean },
  },
  { timestamps: true }
);

export const UserRoleAccess =
  mongoose.models.UserRoleAccess ||
  mongoose.model<IUserRoleAccessDoc>("UserRoleAccess", UserRoleAccessSchema);

// --- Lab ---
export interface ILabDoc extends Document {
  tenantId: mongoose.Types.ObjectId;
  labName: string;
}

const LabSchema = new Schema<ILabDoc>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    labName: { type: String, required: true },
  },
  { timestamps: true }
);

export const Lab = mongoose.models.Lab || mongoose.model<ILabDoc>("Lab", LabSchema);

// --- Timing ---
export interface ITimingDoc extends Document {
  tenantId: mongoose.Types.ObjectId;
  startTime: string;
  endTime: string;
}

const TimingSchema = new Schema<ITimingDoc>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { timestamps: true }
);

export const Timing = mongoose.models.Timing || mongoose.model<ITimingDoc>("Timing", TimingSchema);

// --- Installment Expire Time ---
export interface IInstallmentExpireDoc extends Document {
  tenantId: mongoose.Types.ObjectId;
  studentInfo: mongoose.Types.ObjectId;
  courseName: mongoose.Types.ObjectId;
  expirationDate: Date;
  installmentNumber: number;
  installmentAmount: number;
  dropOutStudent: boolean;
}

const InstallmentExpireSchema = new Schema<IInstallmentExpireDoc>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    studentInfo: { type: Schema.Types.ObjectId, ref: "Student" },
    courseName: { type: Schema.Types.ObjectId, ref: "Course" },
    expirationDate: { type: Date, required: true },
    installmentNumber: { type: Number, required: true },
    installmentAmount: { type: Number, required: true },
    dropOutStudent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const InstallmentExpire =
  mongoose.models.InstallmentExpire ||
  mongoose.model<IInstallmentExpireDoc>("InstallmentExpire", InstallmentExpireSchema);

// --- Alert Student Fees ---
export interface IAlertStudentFeesDoc extends Document {
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  date: Date;
  reminderDateAndTime: Date;
  status: string;
  particulars: string;
  isEmailSent: boolean;
}

const AlertStudentFeesSchema = new Schema<IAlertStudentFeesDoc>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: "Student" },
    date: { type: Date, required: true },
    reminderDateAndTime: { type: Date, required: true },
    status: { type: String, required: true },
    particulars: { type: String, required: true },
    isEmailSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const AlertStudentFees =
  mongoose.models.AlertStudentFees ||
  mongoose.model<IAlertStudentFeesDoc>("AlertStudentFees", AlertStudentFeesSchema);
