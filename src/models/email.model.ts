import mongoose, { Schema, Document } from "mongoose";

// --- Email Reminder Config ---
export interface IEmailReminderDoc extends Document {
  tenantId: mongoose.Types.ObjectId;
  firstReminder: string;
  thirdReminder: string;
}

const EmailReminderSchema = new Schema<IEmailReminderDoc>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    firstReminder: { type: String, required: true },
    thirdReminder: { type: String, required: true },
  },
  { timestamps: true }
);

export const EmailReminder =
  mongoose.models.EmailReminder ||
  mongoose.model<IEmailReminderDoc>("EmailReminder", EmailReminderSchema);

// --- Email Reminder Dates ---
export interface IEmailReminderDatesDoc extends Document {
  tenantId: mongoose.Types.ObjectId;
  firstDueDay: number;
  secondDueDay: number;
  thirdDueDay: number;
}

const EmailReminderDatesSchema = new Schema<IEmailReminderDatesDoc>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    firstDueDay: { type: Number, default: 9 },
    secondDueDay: { type: Number, default: 15 },
    thirdDueDay: { type: Number, default: 20 },
  },
  { timestamps: true }
);

export const EmailReminderDates =
  mongoose.models.EmailReminderDates ||
  mongoose.model<IEmailReminderDatesDoc>("EmailReminderDates", EmailReminderDatesSchema);

// --- Email Template ---
export interface IEmailTemplateDoc extends Document {
  tenantId: mongoose.Types.ObjectId;
  customTemplate: string;
  cancellationTemplate: string;
  dynamicTemplate: string;
  courseSubjectTemplate: string;
  courseChangeTemplate: string;
}

const EmailTemplateSchema = new Schema<IEmailTemplateDoc>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    customTemplate: { type: String, required: true },
    cancellationTemplate: { type: String, required: true },
    dynamicTemplate: { type: String, required: true },
    courseSubjectTemplate: { type: String, required: true },
    courseChangeTemplate: { type: String, required: true },
  },
  { timestamps: true }
);

export const EmailTemplate =
  mongoose.models.EmailTemplate ||
  mongoose.model<IEmailTemplateDoc>("EmailTemplate", EmailTemplateSchema);

// --- Email Log ---
export interface IEmailLogDoc extends Document {
  tenantId: mongoose.Types.ObjectId;
  recipientEmails: string[];
  subject: string;
  content?: string;
  sentAt: Date;
  sentBy: string;
}

const EmailLogSchema = new Schema<IEmailLogDoc>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    recipientEmails: [{ type: String, required: true }],
    subject: { type: String, required: true },
    content: { type: String },
    sentAt: { type: Date, default: Date.now },
    sentBy: { type: String, required: true },
  },
  { timestamps: true }
);

export const EmailLog =
  mongoose.models.EmailLog || mongoose.model<IEmailLogDoc>("EmailLog", EmailLogSchema);

// --- Email Suggestion ---
export interface IEmailSuggestionDoc extends Document {
  tenantId: mongoose.Types.ObjectId;
  emailSuggestionStatus: boolean;
}

const EmailSuggestionSchema = new Schema<IEmailSuggestionDoc>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    emailSuggestionStatus: { type: Boolean, required: true },
  },
  { timestamps: true }
);

export const EmailSuggestion =
  mongoose.models.EmailSuggestion ||
  mongoose.model<IEmailSuggestionDoc>("EmailSuggestion", EmailSuggestionSchema);
