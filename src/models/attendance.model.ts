import mongoose, { Schema, Document } from "mongoose";

export interface IAttendanceDoc extends Document {
  tenantId: mongoose.Types.ObjectId;
  type: "BATCH" | "GLOBAL";
  batch?: mongoose.Types.ObjectId;
  month: number;
  year: number;
  students: {
    student: mongoose.Types.ObjectId;
    days: Map<string, "P" | "A">;
  }[];
}

const AttendanceSchema = new Schema<IAttendanceDoc>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    type: { type: String, enum: ["BATCH", "GLOBAL"], default: "GLOBAL" },
    batch: { type: Schema.Types.ObjectId, ref: "Batch", default: null },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    students: [
      {
        student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
        days: { type: Map, of: { type: String, enum: ["P", "A"] }, default: {} },
      },
    ],
  },
  { timestamps: true }
);

AttendanceSchema.index({ tenantId: 1, type: 1, batch: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.models.Attendance ||
  mongoose.model<IAttendanceDoc>("Attendance", AttendanceSchema);
