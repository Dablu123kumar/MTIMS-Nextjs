import mongoose, { Schema, Document } from "mongoose";

export interface IBatchCategoryDoc extends Document {
  tenantId: mongoose.Types.ObjectId;
  categoryName: string;
  createdBy: string;
}

const BatchCategorySchema = new Schema<IBatchCategoryDoc>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    categoryName: { type: String, required: true },
    createdBy: { type: String },
  },
  { timestamps: true }
);

BatchCategorySchema.index({ tenantId: 1, categoryName: 1 }, { unique: true });

export default mongoose.models.BatchCategory || mongoose.model<IBatchCategoryDoc>("BatchCategory", BatchCategorySchema);
