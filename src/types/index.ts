export type UserRole =
  | "Owner"
  | "SuperAdmin"
  | "Admin"
  | "Accounts"
  | "Counsellor"
  | "Telecaller"
  | "Trainer"
  | "Student";

export interface ITenant {
  _id: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface IUser {
  _id: string;
  fName: string;
  lName: string;
  email: string;
  phone?: string;
  role: UserRole;
  tenantId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IStudent {
  _id: string;
  tenantId: string;
  rollNumber: number;
  image?: string;
  name: string;
  fatherName: string;
  mobileNumber: string;
  phoneNumber: string;
  presentAddress: string;
  dateOfBirth: string;
  city: string;
  email: string;
  studentStatus?: string;
  educationQualification: string;
  selectCourse: string;
  courseFees: number;
  discount: number;
  netCourseFees: number;
  remainingCourseFees: number;
  downPayment?: number;
  dateOfJoining: string;
  installmentDuration: string;
  noOfInstallments: number;
  noOfInstallmentsAmount: number;
  courseName: string;
  totalPaid: number;
  dropOutStudent: boolean;
  message?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICourse {
  _id: string;
  tenantId: string;
  courseName: string;
  courseFees: number;
  courseType: string;
  numberOfYears: string;
  category: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICourseFees {
  _id: string;
  tenantId: string;
  studentInfo: string;
  courseName: string;
  netCourseFees: number;
  remainingFees: number;
  amountPaid: number;
  addedBy: string;
  amountDate: string;
  receiptNumber: string;
  paymentOption: string;
  narration?: string;
  lateFees?: number;
  gstPercentage?: number;
  createdAt: string;
  updatedAt: string;
}

export interface IBatch {
  _id: string;
  tenantId: string;
  name: string;
  course: string;
  courseCategory?: string;
  trainer: string;
  startTime: string;
  endTime: string;
  startDate: string;
  endDate?: string;
  status: "completed" | "inProgress";
  students: IBatchStudent[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IBatchStudent {
  student: string;
  subjects: {
    subject: string;
    status: "notStarted" | "inProgress" | "completed";
    progress: number;
    startDate?: string;
    completionDate?: string;
    notes?: string;
  }[];
  currentSoftware?: string;
}

export interface IAttendance {
  _id: string;
  tenantId: string;
  type: "BATCH" | "GLOBAL";
  batch?: string;
  month: number;
  year: number;
  students: {
    student: string;
    days: Record<string, "P" | "A">;
  }[];
}

export interface IDayBookAccount {
  _id: string;
  tenantId: string;
  accountName: string;
  accountId?: string;
  accountType: string;
}

export interface IDayBookData {
  _id: string;
  tenantId: string;
  studentInfo?: string;
  rollNo?: string;
  studentName?: string;
  receiptNumber?: string;
  narration?: string;
  debit: number;
  credit: number;
  balance: number;
  dayBookAccountId: string;
  dayBookDataDate: string;
}

export interface ISubject {
  _id: string;
  tenantId: string;
  subjectName: string;
  subjectCode: string;
  fullMarks: number;
  passMarks: number;
  course: string;
  courseType: string;
  semYear: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: { field: string; message: string }[];
}

// --- New module types ---

export interface IInstallment {
  _id: string;
  tenantId: string;
  studentId: string;
  courseId: string;
  installmentNumber: number;
  installmentAmount: number;
  dueDate: string;
  paidDate?: string;
  isPaid: boolean;
  isDropout: boolean;
  lateFeeAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface IRollNumber {
  _id: string;
  tenantId: string;
  prefix: string;
  currentValue: number;
  createdAt: string;
  updatedAt: string;
}

export interface IStudentAlert {
  _id: string;
  tenantId: string;
  date: string;
  reminderDateTime: string;
  status: "pending" | "sent" | "dismissed";
  particulars: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICourseCompletion {
  _id: string;
  tenantId: string;
  studentId: string;
  courseId: string;
  completionDate: string;
  certificateNumber?: string;
  remarks?: string;
  status: "completed" | "withdrawn" | "failed";
  createdAt: string;
  updatedAt: string;
}

export interface IRbacPermission {
  _id: string;
  tenantId: string;
  role: string;
  permissions: Record<string, boolean>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IBatchCategory {
  _id: string;
  tenantId: string;
  categoryName: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface IUserProfile {
  _id: string;
  tenantId: string;
  userId: string;
  firstName: string;
  lastName: string;
  company?: string;
  contactPhone?: string;
  companySite?: string;
  country?: string;
  language?: string;
  timeZone?: string;
  currency?: string;
  communications: Record<string, boolean>;
  allowMarketing: boolean;
  createdAt: string;
  updatedAt: string;
}
