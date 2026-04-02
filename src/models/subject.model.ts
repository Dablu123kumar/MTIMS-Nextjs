import mongoose, { Schema, Document } from "mongoose";

export interface ISubjectDoc extends Document {
  tenantId: mongoose.Types.ObjectId;
  subjectName: string;
  subjectCode: string;
  fullMarks: number;
  passMarks: number;
  course: mongoose.Types.ObjectId;
  courseType: mongoose.Types.ObjectId;
  addedBy: string;
  semYear: string;
}

const SubjectSchema = new Schema<ISubjectDoc>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    subjectName: { type: String, required: true },
    subjectCode: { type: String, required: true },
    fullMarks: { type: Number, required: true },
    passMarks: { type: Number, required: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    courseType: { type: Schema.Types.ObjectId, ref: "CourseType", required: true },
    addedBy: { type: String, required: true },
    semYear: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Subject || mongoose.model<ISubjectDoc>("Subject", SubjectSchema);

// --- Student Subject Marks ---
export interface IStudentMarksDoc extends Document {
  tenantId: mongoose.Types.ObjectId;
  studentInfo: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  courseCategory: mongoose.Types.ObjectId;
  subjects: {
    subject: mongoose.Types.ObjectId;
    theory: number | null;
    practical: number | null;
    totalMarks: number | null;
    isActive: boolean;
  }[];
  resultStatus: "NotStarted" | "InProgress" | "Completed";
}

const StudentMarksSchema = new Schema<IStudentMarksDoc>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    studentInfo: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    courseCategory: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    subjects: [
      {
        subject: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
        theory: { type: Number, default: null },
        practical: { type: Number, default: null },
        totalMarks: { type: Number, default: null },
        isActive: { type: Boolean, default: true },
      },
    ],
    resultStatus: {
      type: String,
      enum: ["NotStarted", "InProgress", "Completed"],
      default: "NotStarted",
    },
  },
  { timestamps: true }
);

export const StudentMarks =
  mongoose.models.StudentMarks ||
  mongoose.model<IStudentMarksDoc>("StudentMarks", StudentMarksSchema);
