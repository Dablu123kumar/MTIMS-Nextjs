import mongoose, { Schema, Document } from "mongoose";

export interface ITenantDoc extends Document {
  name: string;
  slug: string;
  logo?: string;
  email: string;
  phone: string;
  website?: string;
  address: string;
  receiptPrefix: string;
  receiptNumber: number;
  gst?: string;
  isGstBased: boolean;
  isActive: boolean;
  ownerId: mongoose.Types.ObjectId;
}

const TenantSchema = new Schema<ITenantDoc>(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    logo: { type: String },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    website: { type: String },
    address: { type: String, required: true },
    receiptPrefix: { type: String, required: true },
    receiptNumber: { type: Number, default: 1000 },
    gst: { type: String },
    isGstBased: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Tenant || mongoose.model<ITenantDoc>("Tenant", TenantSchema);
