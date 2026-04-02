import mongoose, { Schema, Document } from "mongoose";

export interface IRollNumberDoc extends Document {
  tenantId: mongoose.Types.ObjectId;
  prefix: string;
  currentValue: number;
}

const RollNumberSchema = new Schema<IRollNumberDoc>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, unique: true },
    prefix: { type: String, default: "" },
    currentValue: { type: Number, default: 1000 },
  },
  { timestamps: true }
);

export default mongoose.models.RollNumber || mongoose.model<IRollNumberDoc>("RollNumber", RollNumberSchema);
