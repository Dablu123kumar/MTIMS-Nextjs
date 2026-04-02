import mongoose, { Schema, Document } from "mongoose";

export interface IRbacDoc extends Document {
  tenantId: mongoose.Types.ObjectId;
  role: string;
  permissions: Map<string, boolean>;
  isActive: boolean;
}

const RbacSchema = new Schema<IRbacDoc>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    role: {
      type: String,
      required: true,
      enum: ["Owner", "SuperAdmin", "Admin", "Accounts", "Counsellor", "Telecaller", "Trainer", "Student"],
    },
    permissions: { type: Map, of: Boolean, default: {} },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

RbacSchema.index({ tenantId: 1, role: 1 }, { unique: true });

export default mongoose.models.Rbac || mongoose.model<IRbacDoc>("Rbac", RbacSchema);
