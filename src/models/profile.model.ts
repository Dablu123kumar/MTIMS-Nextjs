import mongoose, { Schema, Document } from "mongoose";

export interface IProfileDoc extends Document {
  tenantId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  company: string;
  contactPhone: string;
  companySite: string;
  country: string;
  language: string;
  timeZone: string;
  currency: string;
  communications: Map<string, boolean>;
  allowMarketing: boolean;
}

const ProfileSchema = new Schema<IProfileDoc>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    company: { type: String, default: "" },
    contactPhone: { type: String, default: "" },
    companySite: { type: String, default: "" },
    country: { type: String, default: "" },
    language: { type: String, default: "en" },
    timeZone: { type: String, default: "Asia/Kolkata" },
    currency: { type: String, default: "INR" },
    communications: { type: Map, of: Boolean, default: new Map([["email", false], ["phone", false]]) },
    allowMarketing: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ProfileSchema.index({ tenantId: 1, userId: 1 }, { unique: true });

export default mongoose.models.Profile || mongoose.model<IProfileDoc>("Profile", ProfileSchema);
