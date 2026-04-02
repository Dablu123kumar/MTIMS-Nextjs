import mongoose, { Schema, Document } from "mongoose";

export interface ICourseCompletionDoc extends Document {
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  completionDate: Date;
  certificateNumber: string;
  remarks: string;
  status: "completed" | "withdrawn" | "failed";
}

const CourseCompletionSchema = new Schema<ICourseCompletionDoc>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    completionDate: { type: Date, required: true, default: Date.now },
    certificateNumber: { type: String, default: "" },
    remarks: { type: String, default: "" },
    status: { type: String, enum: ["completed", "withdrawn", "failed"], default: "completed" },
  },
  { timestamps: true }
);

CourseCompletionSchema.index({ tenantId: 1, studentId: 1, courseId: 1 }, { unique: true });

export default mongoose.models.CourseCompletion || mongoose.model<ICourseCompletionDoc>("CourseCompletion", CourseCompletionSchema);
