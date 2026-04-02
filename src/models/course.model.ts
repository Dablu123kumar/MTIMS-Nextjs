import mongoose, { Schema, Document } from "mongoose";

export interface ICourseDoc extends Document {
  tenantId: mongoose.Types.ObjectId;
  courseName: string;
  courseFees: number;
  courseType: mongoose.Types.ObjectId;
  numberOfYears: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  createdBy: string;
}

const CourseSchema = new Schema<ICourseDoc>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    courseName: { type: String, required: true },
    courseFees: { type: Number, required: true },
    courseType: { type: Schema.Types.ObjectId, ref: "CourseType", required: true },
    numberOfYears: { type: Schema.Types.ObjectId, ref: "NumberOfYears", required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

CourseSchema.index({ courseName: 1, tenantId: 1 }, { unique: true });

export default mongoose.models.Course || mongoose.model<ICourseDoc>("Course", CourseSchema);

// --- CourseType ---
export interface ICourseTypeDoc extends Document {
  tenantId: mongoose.Types.ObjectId;
  courseType: string;
  createdBy: string;
}

const CourseTypeSchema = new Schema<ICourseTypeDoc>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    courseType: { type: String, required: true },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

CourseTypeSchema.index({ courseType: 1, tenantId: 1 }, { unique: true });

export const CourseType =
  mongoose.models.CourseType || mongoose.model<ICourseTypeDoc>("CourseType", CourseTypeSchema);

// --- Category ---
export interface ICategoryDoc extends Document {
  tenantId: mongoose.Types.ObjectId;
  category: string;
  createdBy: string;
}

const CategorySchema = new Schema<ICategoryDoc>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    category: { type: String, required: true },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

CategorySchema.index({ category: 1, tenantId: 1 }, { unique: true });

export const Category =
  mongoose.models.Category || mongoose.model<ICategoryDoc>("Category", CategorySchema);

// --- NumberOfYears ---
export interface INumberOfYearsDoc extends Document {
  tenantId: mongoose.Types.ObjectId;
  numberOfYears: number;
  createdBy: string;
}

const NumberOfYearsSchema = new Schema<INumberOfYearsDoc>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    numberOfYears: { type: Number, required: true },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

NumberOfYearsSchema.index({ numberOfYears: 1, tenantId: 1 }, { unique: true });

export const NumberOfYears =
  mongoose.models.NumberOfYears ||
  mongoose.model<INumberOfYearsDoc>("NumberOfYears", NumberOfYearsSchema);
