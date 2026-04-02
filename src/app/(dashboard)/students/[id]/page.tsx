"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { fetchStudent } from "@/store/slices/studentSlice";
import { fetchStudentFees } from "@/store/slices/feesSlice";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Edit,
  DollarSign,
  User,
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Hash,
  BookOpen,
  ClipboardList,
  AlertCircle,
  Award,
  CreditCard,
  Receipt,
} from "lucide-react";

type Tab = "overview" | "payments" | "installments" | "marks" | "issues";

export default function StudentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { selectedStudent: student, loading } = useAppSelector(
    (state) => state.students,
  );
  const { fees } = useAppSelector((state) => state.fees);
  // console.log(student);

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [marks, setMarks] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [installments, setInstallments] = useState<any[]>([]);
  const [completions, setCompletions] = useState<any[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(true);

  useEffect(() => {
    if (id) {
      dispatch(fetchStudent(id as string));
      dispatch(fetchStudentFees(id as string));
      loadRelatedData(id as string);
    }
  }, [dispatch, id]);

  async function loadRelatedData(studentId: string) {
    setRelatedLoading(true);
    try {
      const [marksRes, issuesRes, installmentsRes, completionsRes] =
        await Promise.allSettled([
          api.get(`/api/student-marks/${studentId}`),
          api.get(`/api/student-issues?studentId=${studentId}`),
          api.get(`/api/installments/student/${studentId}`),
          api.get(`/api/course-completions/student/${studentId}`),
        ]);

      if (marksRes.status === "fulfilled")
        setMarks(marksRes.value.data.data || []);
      if (issuesRes.status === "fulfilled")
        setIssues(issuesRes.value.data.data || []);
      if (installmentsRes.status === "fulfilled")
        setInstallments(installmentsRes.value.data.data || []);
      if (completionsRes.status === "fulfilled")
        setCompletions(completionsRes.value.data.data || []);
    } catch {}
    setRelatedLoading(false);
  }

  if (loading || !student) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-80 lg:col-span-2 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  const feesPaidPercent =
    student.netCourseFees > 0
      ? Math.round((student.totalPaid / student.netCourseFees) * 100)
      : 0;

  const statusConfig = student.dropOutStudent
    ? { label: "Drop-out", variant: "destructive" as const }
    : student.remainingCourseFees === 0
      ? { label: "Fees Cleared", variant: "success" as const }
      : { label: "Active", variant: "info" as const };

  const tabs: { key: Tab; label: string; icon: any; count?: number }[] = [
    { key: "overview", label: "Overview", icon: User },
    { key: "payments", label: "Payments", icon: Receipt, count: fees.length },
    {
      key: "installments",
      label: "Installments",
      icon: CreditCard,
      count: installments.length,
    },
    { key: "marks", label: "Marks", icon: ClipboardList, count: marks.length },
    { key: "issues", label: "Issues", icon: AlertCircle, count: issues.length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-bold">
              {student.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{student.name}</h1>
                <Badge variant={statusConfig.variant}>
                  {statusConfig.label}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-0.5">
                <span className="flex items-center gap-1">
                  <Hash className="h-3.5 w-3.5" /> {student.rollNumber}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" /> {student.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" /> {student.mobileNumber}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/students/${id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button onClick={() => router.push(`/fees?studentId=${id}`)}>
            <DollarSign className="mr-2 h-4 w-4" /> Record Payment
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg p-2.5 bg-blue-50 dark:bg-blue-500/10">
              <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Course Fees</p>
              <p className="text-lg font-bold">
                {formatCurrency(student.netCourseFees)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg p-2.5 bg-emerald-50 dark:bg-emerald-500/10">
              <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Paid</p>
              <p className="text-lg font-bold text-emerald-600">
                {formatCurrency(student.totalPaid)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg p-2.5 bg-red-50 dark:bg-red-500/10">
              <DollarSign className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Remaining</p>
              <p className="text-lg font-bold text-red-600">
                {formatCurrency(student.remainingCourseFees || 0)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">Payment Progress</p>
              <span className="text-xs font-bold">{feesPaidPercent}%</span>
            </div>
            <Progress value={feesPaidPercent} className="h-2" />
            <p className="text-[11px] text-muted-foreground mt-1.5">
              {student.noOfInstallments} installments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex gap-1 -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <OverviewTab student={student} completions={completions} />
      )}
      {activeTab === "payments" && <PaymentsTab fees={fees} />}
      {activeTab === "installments" && (
        <InstallmentsTab installments={installments} loading={relatedLoading} />
      )}
      {activeTab === "marks" && (
        <MarksTab marks={marks} loading={relatedLoading} />
      )}
      {activeTab === "issues" && (
        <IssuesTab issues={issues} loading={relatedLoading} />
      )}
    </div>
  );
}

/* ──────────── OVERVIEW TAB ──────────── */
function OverviewTab({
  student,
  completions,
}: {
  student: any;
  completions: any[];
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-y-5 gap-x-8 md:grid-cols-2">
            <InfoField icon={User} label="Full Name" value={student.name} />
            <InfoField
              icon={User}
              label="Father's Name"
              value={student.father_name}
            />
            <InfoField
              icon={Mail}
              label="Email Address"
              value={student.email}
            />
            <InfoField
              icon={Phone}
              label="Mobile Number"
              value={student.mobile_number}
            />
            <InfoField
              icon={Phone}
              label="Phone Number"
              value={student.phone_number || "N/A"}
            />
            <InfoField
              icon={Calendar}
              label="Date of Birth"
              value={
                student.date_of_birth ? formatDate(student.date_of_birth) : "N/A"
              }
            />
            <InfoField icon={MapPin} label="City" value={student.city} />
            <InfoField
              icon={MapPin}
              label="Address"
              value={student.present_address}
            />
            <InfoField
              icon={GraduationCap}
              label="Qualification"
              value={student.education_qualification}
            />
            <InfoField
              icon={Calendar}
              label="Date of Joining"
              value={
                student.date_of_joining
                  ? formatDate(student.date_of_joining)
                  : "N/A"
              }
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">
              Course & Enrollment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="rounded-lg p-2 bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">
                  {student.courseName?.courseName || student.selectCourse}
                </p>
                <p className="text-xs text-muted-foreground">Current Course</p>
              </div>
            </div>
            <Separator />
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Course Fees</span>
                <span className="font-medium">
                  {formatCurrency(student.course_fees)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span className="font-medium text-emerald-600">
                  -{formatCurrency(student.discount || 0)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-medium">Net Fees</span>
                <span className="font-bold">
                  {formatCurrency(student.netCourseFees)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Down Payment</span>
                <span className="font-medium">
                  {formatCurrency(student.down_payment || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Paid</span>
                <span className="font-medium text-emerald-600">
                  {formatCurrency(student.totalPaid)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-medium">Outstanding</span>
                <span className="font-bold text-red-600">
                  {formatCurrency(student.remainingCourseFees || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Installments</span>
                <span>
                  {student.no_of_installments} x{" "}
                  {formatCurrency(student.no_of_installments_amount || 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {completions.length > 0 && (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">
                Completion Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {completions.map((comp: any) => (
                <div key={comp._id} className="flex items-center gap-3">
                  <div className="rounded-lg p-2 bg-emerald-50 dark:bg-emerald-500/10">
                    <Award className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      {comp.status?.charAt(0).toUpperCase() +
                        comp.status?.slice(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {comp.certificateNumber &&
                        `Certificate: ${comp.certificateNumber} · `}
                      {formatDate(comp.completionDate)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {student.message && (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{student.message}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

/* ──────────── PAYMENTS TAB ──────────── */
function PaymentsTab({ fees }: { fees: any[] }) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">
          Payment History ({fees.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Receipt No</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Remaining</TableHead>
              <TableHead>Payment Mode</TableHead>
              <TableHead>Late Fees</TableHead>
              <TableHead>Narration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <Receipt className="h-10 w-10 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">
                      No payments recorded yet
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              fees.map((fee: any) => (
                <TableRow key={fee._id}>
                  <TableCell className="font-mono text-sm font-medium">
                    {fee.receiptNumber}
                  </TableCell>
                  <TableCell>
                    {formatDate(fee.amountDate || fee.createdAt)}
                  </TableCell>
                  <TableCell className="text-emerald-600 font-semibold">
                    {formatCurrency(fee.amountPaid)}
                  </TableCell>
                  <TableCell>{formatCurrency(fee.remainingFees)}</TableCell>
                  <TableCell>{fee.paymentOption?.name || "N/A"}</TableCell>
                  <TableCell>
                    {fee.lateFees ? (
                      <span className="text-red-600">
                        {formatCurrency(fee.lateFees)}
                      </span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-[200px] truncate">
                    {fee.narration || "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

/* ──────────── INSTALLMENTS TAB ──────────── */
function InstallmentsTab({
  installments,
  loading,
}: {
  installments: any[];
  loading: boolean;
}) {
  if (loading)
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Installment Schedule ({installments.length})
          </CardTitle>
          {installments.length > 0 && (
            <div className="flex gap-3 text-sm">
              <span className="text-emerald-600 font-medium">
                {installments.filter((i: any) => i.isPaid).length} paid
              </span>
              <span className="text-red-600 font-medium">
                {installments.filter((i: any) => !i.isPaid).length} pending
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Paid Date</TableHead>
              <TableHead>Late Fee</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {installments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <CreditCard className="h-10 w-10 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">
                      No installments configured
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              installments.map((inst: any) => {
                const isOverdue =
                  !inst.isPaid && new Date(inst.dueDate) < new Date();
                return (
                  <TableRow key={inst._id}>
                    <TableCell className="font-medium">
                      {inst.installmentNumber}
                    </TableCell>
                    <TableCell className="font-medium">
                      Rs. {inst.installmentAmount?.toLocaleString()}
                    </TableCell>
                    <TableCell>{formatDate(inst.dueDate)}</TableCell>
                    <TableCell>
                      {inst.paidDate ? formatDate(inst.paidDate) : "-"}
                    </TableCell>
                    <TableCell>
                      {inst.lateFeeAmount > 0 ? (
                        <span className="text-red-600">
                          Rs. {inst.lateFeeAmount.toLocaleString()}
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          inst.isPaid
                            ? "success"
                            : isOverdue
                              ? "destructive"
                              : "warning"
                        }
                      >
                        {inst.isPaid
                          ? "Paid"
                          : isOverdue
                            ? "Overdue"
                            : "Upcoming"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

/* ──────────── MARKS TAB ──────────── */
function MarksTab({ marks, loading }: { marks: any[]; loading: boolean }) {
  if (loading)
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">
          Marks & Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        {marks.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12">
            <ClipboardList className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No marks recorded yet
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {marks.map((record: any) => (
              <div key={record._id}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-sm">
                      {record.course?.courseName || "Course"}
                    </span>
                  </div>
                  <Badge
                    variant={
                      record.resultStatus === "Completed"
                        ? "success"
                        : record.resultStatus === "InProgress"
                          ? "info"
                          : "secondary"
                    }
                  >
                    {record.resultStatus || "N/A"}
                  </Badge>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead className="text-center">Theory</TableHead>
                      <TableHead className="text-center">Practical</TableHead>
                      <TableHead className="text-center">Total</TableHead>
                      <TableHead className="text-center">Full Marks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {record.subjects?.map((sub: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">
                          {sub.subject?.subjectName || sub.subjectName || "-"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {sub.subject?.subjectCode || sub.subjectCode || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {sub.theory ?? "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {sub.practical ?? "-"}
                        </TableCell>
                        <TableCell className="text-center font-semibold">
                          {sub.totalMarks ??
                            ((sub.theory || 0) + (sub.practical || 0) || "-")}
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground">
                          {sub.subject?.fullMarks || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ──────────── ISSUES TAB ──────────── */
function IssuesTab({ issues, loading }: { issues: any[]; loading: boolean }) {
  if (loading)
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">
          Issues & Notes ({issues.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {issues.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12">
            <AlertCircle className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No issues or notes recorded
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {issues.map((issue: any) => (
              <div
                key={issue._id}
                className="flex gap-4 p-4 rounded-lg border bg-muted/20"
              >
                <div className="rounded-full p-2 h-fit bg-amber-50 dark:bg-amber-500/10">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold">
                      {formatDate(issue.date || issue.createdAt)}
                    </p>
                    {issue.showOnDashboard && (
                      <Badge variant="warning" className="text-[10px]">
                        Dashboard
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {issue.particulars}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ──────────── SHARED ──────────── */
function InfoField({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 py-1">
      <div className="rounded-md p-1.5 bg-muted/60 mt-0.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="text-sm font-medium mt-0.5 truncate">{value || "N/A"}</p>
      </div>
    </div>
  );
}
