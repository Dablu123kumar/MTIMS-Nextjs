import { z } from "zod";

export const createStudentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  fatherName: z.string().min(1, "Father's name is required"),
  mobileNumber: z.string().min(10, "Mobile number must be at least 10 digits"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  presentAddress: z.string().min(1, "Address is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  city: z.string().min(1, "City is required"),
  email: z.string().email("Invalid email address"),
  studentStatus: z.string().optional(),
  educationQualification: z.string().min(1, "Education qualification is required"),
  selectCourse: z.string().min(1, "Course selection is required"),
  courseFees: z.number().positive("Course fees must be positive"),
  discount: z.number().min(0, "Discount cannot be negative").default(0),
  netCourseFees: z.number().positive("Net fees must be positive"),
  downPayment: z.number().optional(),
  dateOfJoining: z.string().min(1, "Date of joining is required"),
  installmentDuration: z.string().min(1, "Installment duration is required"),
  noOfInstallments: z.number().int().positive("Number of installments must be positive"),
  noOfInstallmentsAmount: z.number().optional(),
  courseName: z.string().min(1, "Course name is required"),
  message: z.string().optional(),
});

export const updateStudentSchema = createStudentSchema.partial().extend({
  dropOutStudent: z.boolean().optional(),
  studentStatus: z.string().optional(),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
