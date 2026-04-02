import mongoose, { Schema, Document } from "mongoose";

export interface ITeacherDoc extends Document {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  subjects: mongoose.Types.ObjectId[];
  qualification: string;
  experience: number;
  address: string;
  isActive: boolean;
  joiningDate: Date;
}

const TeacherSchema = new Schema<ITeacherDoc>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, required: true },
    subjects: [{ type: Schema.Types.ObjectId, ref: "Subject" }],
    qualification: { type: String, required: true },
    experience: { type: Number, default: 0 },
    address: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    joiningDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

TeacherSchema.index({ email: 1, tenantId: 1 }, { unique: true });

export default mongoose.models.Teacher || mongoose.model<ITeacherDoc>("Teacher", TeacherSchema);
