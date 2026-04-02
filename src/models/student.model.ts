import mongoose, { Schema, Document } from "mongoose";

export interface IStudentDoc extends Document {
  tenantId: mongoose.Types.ObjectId;
  rollNumber: number;
  image?: string;
  name: string;
  fatherName: string;
  mobileNumber: string;
  phoneNumber: string;
  presentAddress: string;
  dateOfBirth: Date;
  city: string;
  email: string;
  studentStatus?: string;
  educationQualification: string;
  selectCourse: string;
  courseFees: number;
  discount: number;
  netCourseFees: number;
  remainingCourseFees: number;
  downPayment?: number;
  dateOfJoining: Date;
  installmentDuration: Date;
  noOfInstallments: number;
  noOfInstallmentsAmount: number;
  noOfInstallmentsExpireTimeAndAmount?: Date;
  courseName: mongoose.Types.ObjectId;
  totalPaid: number;
  installmentPaymentSkipMonth: number;
  skipMonthIncremented: boolean;
  remainderSent: boolean;
  courseDuration: Date;
  dropOutStudent: boolean;
  message?: string;
  updatedBy?: string;
}

const StudentSchema = new Schema<IStudentDoc>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    rollNumber: { type: Number, required: true },
    image: { type: String },
    name: { type: String, required: true },
    fatherName: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    presentAddress: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    city: { type: String, required: true },
    email: { type: String, required: true },
    studentStatus: { type: String },
    educationQualification: { type: String, required: true },
    selectCourse: { type: String, required: true },
    courseFees: { type: Number, required: true },
    discount: { type: Number, required: true, default: 0 },
    netCourseFees: { type: Number, required: true },
    remainingCourseFees: { type: Number },
    downPayment: { type: Number },
    dateOfJoining: { type: Date, required: true },
    installmentDuration: { type: Date, required: true },
    noOfInstallments: { type: Number, required: true },
    noOfInstallmentsAmount: { type: Number },
    noOfInstallmentsExpireTimeAndAmount: { type: Date },
    courseName: { type: Schema.Types.ObjectId, ref: "Course" },
    totalPaid: { type: Number, default: 0 },
    installmentPaymentSkipMonth: { type: Number, default: 0 },
    skipMonthIncremented: { type: Boolean, default: false },
    remainderSent: { type: Boolean, default: false },
    courseDuration: { type: Date, default: Date.now },
    dropOutStudent: { type: Boolean, default: false },
    message: { type: String },
    updatedBy: { type: String },
  },
  { timestamps: true }
);

// Unique roll number per tenant
StudentSchema.index({ rollNumber: 1, tenantId: 1 }, { unique: true });
// Unique email per tenant
StudentSchema.index({ email: 1, tenantId: 1 }, { unique: true });
// Unique mobile per tenant
StudentSchema.index({ mobileNumber: 1, tenantId: 1 }, { unique: true });

export default mongoose.models.Student || mongoose.model<IStudentDoc>("Student", StudentSchema);
