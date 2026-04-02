import mongoose, { Schema, Document } from "mongoose";

export interface IInstallmentDoc extends Document {
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  installmentNumber: number;
  installmentAmount: number;
  dueDate: Date;
  paidDate?: Date;
  isPaid: boolean;
  isDropout: boolean;
  lateFeeAmount: number;
}

const InstallmentSchema = new Schema<IInstallmentDoc>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    installmentNumber: { type: Number, required: true },
    installmentAmount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    paidDate: { type: Date },
    isPaid: { type: Boolean, default: false },
    isDropout: { type: Boolean, default: false },
    lateFeeAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

InstallmentSchema.index({ tenantId: 1, studentId: 1, installmentNumber: 1 }, { unique: true });
InstallmentSchema.index({ tenantId: 1, isPaid: 1, dueDate: 1 });

export default mongoose.models.Installment || mongoose.model<IInstallmentDoc>("Installment", InstallmentSchema);
