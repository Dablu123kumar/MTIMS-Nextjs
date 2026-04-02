import mongoose, { Schema, Document } from "mongoose";

export interface IPaymentOptionDoc extends Document {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  createdBy: string;
}

const PaymentOptionSchema = new Schema<IPaymentOptionDoc>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    name: { type: String, default: "Cash" },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

PaymentOptionSchema.index({ name: 1, tenantId: 1 }, { unique: true });

export default mongoose.models.PaymentOption ||
  mongoose.model<IPaymentOptionDoc>("PaymentOption", PaymentOptionSchema);
