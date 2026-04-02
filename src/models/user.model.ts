import mongoose, { Schema, Document } from "mongoose";

export interface IUserDoc extends Document {
  fName: string;
  lName: string;
  email: string;
  password: string;
  phone?: string;
  role: string;
  tenantId: mongoose.Types.ObjectId;
  isActive: boolean;
  otp?: string;
  otpExpiresAt?: Date;
  isOtpVerified: boolean;
}

const UserSchema = new Schema<IUserDoc>(
  {
    fName: { type: String, required: true },
    lName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    password: { type: String, required: true },
    phone: { type: String },
    role: {
      type: String,
      enum: ["Owner", "SuperAdmin", "Admin", "Accounts", "Counsellor", "Telecaller", "Trainer", "Student"],
      default: "Student",
    },
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true },
    isActive: { type: Boolean, default: true },
    otp: { type: String },
    otpExpiresAt: { type: Date },
    isOtpVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Compound unique: email must be unique per tenant
UserSchema.index({ email: 1, tenantId: 1 }, { unique: true });
// Single-field index for login lookups (email-only queries)
UserSchema.index({ email: 1 });

export default mongoose.models.User || mongoose.model<IUserDoc>("User", UserSchema);
