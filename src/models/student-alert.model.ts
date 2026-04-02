import mongoose, { Schema, Document } from "mongoose";

export interface IStudentAlertDoc extends Document {
  tenantId: mongoose.Types.ObjectId;
  date: Date;
  reminderDateTime: Date;
  status: "pending" | "sent" | "dismissed";
  particulars: string;
  createdBy: string;
}

const StudentAlertSchema = new Schema<IStudentAlertDoc>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    date: { type: Date, required: true },
    reminderDateTime: { type: Date, required: true },
    status: { type: String, enum: ["pending", "sent", "dismissed"], default: "pending" },
    particulars: { type: String, required: true },
    createdBy: { type: String },
  },
  { timestamps: true }
);

StudentAlertSchema.index({ tenantId: 1, status: 1 });

export default mongoose.models.StudentAlert || mongoose.model<IStudentAlertDoc>("StudentAlert", StudentAlertSchema);
