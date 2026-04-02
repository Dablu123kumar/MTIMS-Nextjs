import mongoose, { Schema, Document } from "mongoose";

export interface ICourseFeesDoc extends Document {
  tenantId: mongoose.Types.ObjectId;
  studentInfo: mongoose.Types.ObjectId;
  courseName: mongoose.Types.ObjectId;
  netCourseFees: number;
  remainingFees: number;
  amountPaid: number;
  addedBy: string;
  amountDate: Date;
  noOfInstallments?: number;
  noOfInstallmentsAmount?: number;
  receiptNumber: string;
  paymentOption: mongoose.Types.ObjectId;
  narration?: string;
  lateFees?: number;
  gstPercentage?: number;
}

const CourseFeesSchema = new Schema<ICourseFeesDoc>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    studentInfo: { type: Schema.Types.ObjectId, ref: "Student" },
    courseName: { type: Schema.Types.ObjectId, ref: "Course" },
    netCourseFees: { type: Number, required: true },
    remainingFees: { type: Number, required: true },
    amountPaid: { type: Number, required: true },
    addedBy: { type: String, required: true },
    amountDate: { type: Date, default: Date.now },
    noOfInstallments: { type: Number },
    noOfInstallmentsAmount: { type: Number },
    receiptNumber: { type: String, required: true },
    paymentOption: { type: Schema.Types.ObjectId, ref: "PaymentOption" },
    narration: { type: String },
    lateFees: { type: Number },
    gstPercentage: { type: Number },
  },
  { timestamps: true }
);

CourseFeesSchema.index({ receiptNumber: 1, tenantId: 1 }, { unique: true });

export default mongoose.models.CourseFees ||
  mongoose.model<ICourseFeesDoc>("CourseFees", CourseFeesSchema);
