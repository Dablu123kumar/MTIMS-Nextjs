"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { fetchStudent } from "@/store/slices/studentSlice";
import { fetchStudentFees } from "@/store/slices/feesSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, Edit, DollarSign, User, GraduationCap, Phone, Mail, MapPin } from "lucide-react";

export default function StudentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { selectedStudent: student, loading } = useAppSelector((state) => state.students);
  const { fees } = useAppSelector((state) => state.fees);

  useEffect(() => {
    if (id) {
      dispatch(fetchStudent(id as string));
      dispatch(fetchStudentFees(id as string));
    }
  }, [dispatch, id]);

  if (loading || !student) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse bg-muted rounded" />
        <div className="h-64 animate-pulse bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{student.name}</h1>
            <p className="text-muted-foreground">Roll No: #{student.rollNumber}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/students/${id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button onClick={() => router.push(`/fees?studentId=${id}`)}>
            <DollarSign className="mr-2 h-4 w-4" /> Record Payment
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Personal Info */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base font-semibold">Personal Information</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <InfoRow icon={User} label="Father's Name" value={student.fatherName} />
              <InfoRow icon={Mail} label="Email" value={student.email} />
              <InfoRow icon={Phone} label="Mobile" value={student.mobileNumber} />
              <InfoRow icon={Phone} label="Phone" value={student.phoneNumber} />
              <InfoRow icon={MapPin} label="City" value={student.city} />
              <InfoRow icon={MapPin} label="Address" value={student.presentAddress} />
              <InfoRow icon={User} label="DOB" value={formatDate(student.dateOfBirth)} />
              <InfoRow icon={GraduationCap} label="Qualification" value={student.educationQualification} />
            </div>
          </CardContent>
        </Card>

        {/* Fee Summary */}
        <Card>
          <CardHeader><CardTitle className="text-base font-semibold">Fee Summary</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Course Fees</span>
              <span className="font-medium">{formatCurrency(student.courseFees)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Discount</span>
              <span className="font-medium text-green-600">-{formatCurrency(student.discount)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-sm font-medium">Net Fees</span>
              <span className="font-bold">{formatCurrency(student.netCourseFees)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Paid</span>
              <span className="font-medium text-green-600">{formatCurrency(student.totalPaid)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-sm font-medium">Remaining</span>
              <span className="font-bold text-red-600">{formatCurrency(student.remainingCourseFees || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Installments</span>
              <span>{student.noOfInstallments}</span>
            </div>
            <div className="pt-2">
              {student.dropOutStudent ? (
                <Badge variant="destructive" className="w-full justify-center">Drop-out</Badge>
              ) : student.remainingCourseFees === 0 ? (
                <Badge variant="success" className="w-full justify-center">Fees Cleared</Badge>
              ) : (
                <Badge variant="warning" className="w-full justify-center">Fees Pending</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader><CardTitle className="text-base font-semibold">Payment History</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt No</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Remaining</TableHead>
                <TableHead>Payment Mode</TableHead>
                <TableHead>Narration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fees.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No payments recorded</TableCell></TableRow>
              ) : (
                fees.map((fee: any) => (
                  <TableRow key={fee._id}>
                    <TableCell className="font-medium">{fee.receiptNumber}</TableCell>
                    <TableCell>{formatDate(fee.amountDate || fee.createdAt)}</TableCell>
                    <TableCell className="text-green-600 font-medium">{formatCurrency(fee.amountPaid)}</TableCell>
                    <TableCell>{formatCurrency(fee.remainingFees)}</TableCell>
                    <TableCell>{fee.paymentOption?.name || "N/A"}</TableCell>
                    <TableCell className="text-muted-foreground">{fee.narration || "-"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
