import mongoose, { Schema, Document } from "mongoose";

// --- Form Field ---
export interface IFormFieldDoc extends Document {
  tenantId: mongoose.Types.ObjectId;
  type: string;
  name: string;
  value?: string;
  mandatory: boolean;
  headerView: boolean;
  options: { label: string; value: string }[];
  formId: string[];
}

const FormFieldSchema = new Schema<IFormFieldDoc>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    type: { type: String, required: true },
    name: { type: String, required: true },
    value: { type: String },
    mandatory: { type: Boolean, default: false },
    headerView: { type: Boolean, default: false },
    options: [{ label: String, value: String }],
    formId: [{ type: String }],
  },
  { timestamps: true }
);

export const FormField =
  mongoose.models.FormField || mongoose.model<IFormFieldDoc>("FormField", FormFieldSchema);

// --- Form ---
export interface IFormDoc extends Document {
  tenantId: mongoose.Types.ObjectId;
  formName: string;
  fields: mongoose.Types.ObjectId[];
}

const FormSchema = new Schema<IFormDoc>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    formName: { type: String, required: true },
    fields: [{ type: Schema.Types.ObjectId, ref: "FormField" }],
  },
  { timestamps: true }
);

export const Form = mongoose.models.Form || mongoose.model<IFormDoc>("Form", FormSchema);

// --- Form Column ---
export interface IFormColumnDoc extends Document {
  tenantId: mongoose.Types.ObjectId;
  formId: mongoose.Types.ObjectId;
  columns: { name: string; order: number }[];
  formFieldValue: any[];
  role: string;
}

const FormColumnSchema = new Schema<IFormColumnDoc>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    formId: { type: Schema.Types.ObjectId, ref: "Form", required: true },
    columns: [{ name: { type: String, required: true }, order: { type: Number, required: true } }],
    formFieldValue: [Schema.Types.Mixed],
    role: { type: String, required: true },
  },
  { timestamps: true }
);

export const FormColumn =
  mongoose.models.FormColumn || mongoose.model<IFormColumnDoc>("FormColumn", FormColumnSchema);

// --- Form Row ---
export interface IFormRowDoc extends Document {
  tenantId: mongoose.Types.ObjectId;
  formId: mongoose.Types.ObjectId;
  rows: { id: string; fields: any[] }[];
  role?: string;
}

const FormRowSchema = new Schema<IFormRowDoc>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    formId: { type: Schema.Types.ObjectId, ref: "Form", required: true },
    rows: [
      {
        id: { type: String, required: true },
        fields: [Schema.Types.Mixed],
      },
    ],
    role: { type: String },
  },
  { timestamps: true }
);

export const FormRow =
  mongoose.models.FormRow || mongoose.model<IFormRowDoc>("FormRow", FormRowSchema);
