import mongoose, { Schema, Document } from "mongoose";

export interface ITrainerDoc extends Document {
  tenantId: mongoose.Types.ObjectId;
  trainerImage?: string;
  trainerName: string;
  trainerDesignation: string;
  trainerEmail: string;
  trainerRole: string;
}

const TrainerSchema = new Schema<ITrainerDoc>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    trainerImage: { type: String },
    trainerName: { type: String, required: true },
    trainerDesignation: { type: String, required: true },
    trainerEmail: { type: String, required: true },
    trainerRole: { type: String, required: true, default: "Trainer" },
  },
  { timestamps: true }
);

export default mongoose.models.Trainer || mongoose.model<ITrainerDoc>("Trainer", TrainerSchema);
