"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { createStudent } from "@/store/slices/studentSlice";
import { fetchCourses } from "@/store/slices/courseSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

export default function AdmissionPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { courses } = useAppSelector((state) => state.courses);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "", fatherName: "", mobileNumber: "", phoneNumber: "",
    presentAddress: "", dateOfBirth: "", city: "", email: "",
    educationQualification: "", selectCourse: "", courseName: "",
    courseFees: 0, discount: 0, netCourseFees: 0,
    downPayment: 0, dateOfJoining: "", installmentDuration: "",
    noOfInstallments: 1, noOfInstallmentsAmount: 0, message: "",
  });

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      // Auto-calculate net fees
      if (name === "courseFees" || name === "discount") {
        const fees = name === "courseFees" ? Number(value) : Number(prev.courseFees);
        const disc = name === "discount" ? Number(value) : Number(prev.discount);
        updated.netCourseFees = fees - disc;
        if (updated.noOfInstallments > 0) {
          updated.noOfInstallmentsAmount = Math.ceil(updated.netCourseFees / updated.noOfInstallments);
        }
      }
      if (name === "noOfInstallments" && Number(value) > 0) {
        updated.noOfInstallmentsAmount = Math.ceil(updated.netCourseFees / Number(value));
      }
      return updated;
    });
  };

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const courseId = e.target.value;
    const course = courses.find((c: any) => c._id === courseId);
    setForm((prev) => ({
      ...prev,
      courseName: courseId,
      selectCourse: course?.courseName || "",
      courseFees: course?.courseFees || 0,
      netCourseFees: (course?.courseFees || 0) - prev.discount,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const result = await dispatch(createStudent({
        ...form,
        courseFees: Number(form.courseFees),
        discount: Number(form.discount),
        netCourseFees: Number(form.netCourseFees),
        downPayment: Number(form.downPayment),
        noOfInstallments: Number(form.noOfInstallments),
        noOfInstallmentsAmount: Number(form.noOfInstallmentsAmount),
      }));
      if (createStudent.fulfilled.match(result)) {
        router.push("/students");
      } else {
        setError((result.payload as string) || "Failed to create student");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">New Admission</h1>
          <p className="text-sm text-muted-foreground mt-1">Register a new student</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Personal Details */}
          <Card>
            <CardHeader><CardTitle className="text-base font-semibold">Personal Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Student Name *</Label>
                  <Input name="name" value={form.name} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label>Father&apos;s Name *</Label>
                  <Input name="fatherName" value={form.fatherName} onChange={handleChange} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Mobile Number *</Label>
                  <Input name="mobileNumber" value={form.mobileNumber} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number *</Label>
                  <Input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input name="email" type="email" value={form.email} onChange={handleChange} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date of Birth *</Label>
                  <Input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label>City *</Label>
                  <Input name="city" value={form.city} onChange={handleChange} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Present Address *</Label>
                <Input name="presentAddress" value={form.presentAddress} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label>Education Qualification *</Label>
                <Input name="educationQualification" value={form.educationQualification} onChange={handleChange} required />
              </div>
            </CardContent>
          </Card>

          {/* Course & Fee Details */}
          <Card>
            <CardHeader><CardTitle className="text-base font-semibold">Course & Fee Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select Course *</Label>
                <select name="courseName" value={form.courseName} onChange={handleCourseChange} required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Select a course</option>
                  {courses.map((course: any) => (
                    <option key={course._id} value={course._id}>{course.courseName} - {formatCurrency(course.courseFees)}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Course Fees</Label>
                  <Input name="courseFees" type="number" value={form.courseFees} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Discount</Label>
                  <Input name="discount" type="number" value={form.discount} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Net Fees</Label>
                  <Input name="netCourseFees" type="number" value={form.netCourseFees} readOnly className="bg-muted" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Down Payment</Label>
                <Input name="downPayment" type="number" value={form.downPayment} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date of Joining *</Label>
                  <Input name="dateOfJoining" type="date" value={form.dateOfJoining} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label>Installment Duration *</Label>
                  <Input name="installmentDuration" type="date" value={form.installmentDuration} onChange={handleChange} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>No. of Installments *</Label>
                  <Input name="noOfInstallments" type="number" min={1} value={form.noOfInstallments} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label>Installment Amount</Label>
                  <Input name="noOfInstallmentsAmount" type="number" value={form.noOfInstallmentsAmount} readOnly className="bg-muted" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <textarea name="message" value={form.message} onChange={handleChange}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]" />
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Admission"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
}
