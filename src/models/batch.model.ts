import mongoose, { Schema, Document } from "mongoose";

export interface IBatchDoc extends Document {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  courseCategory?: mongoose.Types.ObjectId;
  course?: mongoose.Types.ObjectId;
  trainer: mongoose.Types.ObjectId;
  startTime: string;
  endTime: string;
  startDate: Date;
  endDate?: Date;
  status: "completed" | "inProgress";
  students: {
    student: mongoose.Types.ObjectId;
    subjects: {
      subject: mongoose.Types.ObjectId;
      status: "notStarted" | "inProgress" | "completed";
      progress: number;
      startDate?: Date;
      completionDate?: Date;
      notes?: string;
    }[];
    currentSoftware?: string;
  }[];
  isActive: boolean;
}

const BatchSchema = new Schema<IBatchDoc>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    name: { type: String, required: true },
    courseCategory: { type: Schema.Types.ObjectId, ref: "Category" },
    course: { type: Schema.Types.ObjectId, ref: "Course" },
    trainer: { type: Schema.Types.ObjectId, ref: "Trainer", required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    status: { type: String, enum: ["completed", "inProgress"], default: "inProgress" },
    students: [
      {
        student: { type: Schema.Types.ObjectId, ref: "Student" },
        subjects: [
          {
            subject: { type: Schema.Types.ObjectId, ref: "Subject" },
            status: {
              type: String,
              enum: ["notStarted", "inProgress", "completed"],
              default: "notStarted",
            },
            progress: { type: Number, min: 0, max: 100, default: 0 },
            startDate: { type: Date },
            completionDate: { type: Date },
            notes: { type: String },
          },
        ],
        currentSoftware: { type: String },
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Batch || mongoose.model<IBatchDoc>("Batch", BatchSchema);
