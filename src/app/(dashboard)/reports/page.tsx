"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText } from "lucide-react";

export default function ReportsPage() {
  const [reportType, setReportType] = useState<"fees" | "students">("fees");
  const [records, setRecords] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const fetchReport = async (p = 1) => {
    setLoading(true);
    try {
      let url = `/api/reports?type=${reportType}&page=${p}&limit=10`;
      if (from) url += `&from=${from}`;
      if (to) url += `&to=${to}`;
      const { data } = await api.get(url);
      setRecords(data.data.records);
      setSummary(data.data.summary);
      setTotal(data.data.total);
      setTotalPages(data.data.totalPages);
      setPage(data.data.page);
    } catch { setRecords([]); }
    setLoading(false);
  };

  useEffect(() => { fetchReport(1); }, [reportType]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Generate and export reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant={reportType === "fees" ? "default" : "outline"} size="sm" onClick={() => setReportType("fees")}>Fees Report</Button>
          <Button variant={reportType === "students" ? "default" : "outline"} size="sm" onClick={() => setReportType("students")}>Students Report</Button>
        </div>
      </div>

      {/* Summary Cards */}
      {reportType === "fees" && summary && (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total Collected</p><p className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalCollected || 0)}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total Pending</p><p className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalPending || 0)}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total Transactions</p><p className="text-2xl font-bold">{summary.count || 0}</p></CardContent></Card>
        </div>
      )}
      {reportType === "students" && summary && (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total Students</p><p className="text-2xl font-bold">{summary.total || 0}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Active</p><p className="text-2xl font-bold text-green-600">{summary.active || 0}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Drop-out</p><p className="text-2xl font-bold text-red-600">{summary.dropOut || 0}</p></CardContent></Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2"><Label>From Date</Label><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
            <div className="space-y-2"><Label>To Date</Label><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
            <Button onClick={() => fetchReport(1)}>Apply Filter</Button>
            <Button variant="outline" onClick={() => { setFrom(""); setTo(""); setTimeout(() => fetchReport(1), 0); }}>Clear</Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader><CardTitle className="text-base font-semibold">{reportType === "fees" ? "Fee Transactions" : "Student Records"} ({total})</CardTitle></CardHeader>
        <CardContent>
          {reportType === "fees" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Receipt No</TableHead>
                  <TableHead>Amount Paid</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} className="py-4"><div className="space-y-2"><Skeleton className="h-12 w-full rounded-lg" /><Skeleton className="h-12 w-full rounded-lg" /><Skeleton className="h-12 w-full rounded-lg" /></div></TableCell></TableRow>
                ) : records.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-12"><div className="flex flex-col items-center gap-2"><FileText className="h-10 w-10 text-muted-foreground/50" /><p className="text-sm font-medium text-muted-foreground">No records found</p><p className="text-xs text-muted-foreground/70">Try adjusting your filters</p></div></TableCell></TableRow>
                ) : (
                  records.map((r, i) => (
                    <TableRow key={r._id}>
                      <TableCell>{(page - 1) * 10 + i + 1}</TableCell>
                      <TableCell className="font-medium">{r.studentInfo?.name || "-"}</TableCell>
                      <TableCell>{r.courseName?.courseName || "-"}</TableCell>
                      <TableCell>{r.receiptNumber}</TableCell>
                      <TableCell className="text-green-600">{formatCurrency(r.amountPaid)}</TableCell>
                      <TableCell className="text-red-600">{formatCurrency(r.remainingFees)}</TableCell>
                      <TableCell className="text-muted-foreground">{new Date(r.amountDate).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Roll No</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} className="py-4"><div className="space-y-2"><Skeleton className="h-12 w-full rounded-lg" /><Skeleton className="h-12 w-full rounded-lg" /><Skeleton className="h-12 w-full rounded-lg" /></div></TableCell></TableRow>
                ) : records.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-12"><div className="flex flex-col items-center gap-2"><FileText className="h-10 w-10 text-muted-foreground/50" /><p className="text-sm font-medium text-muted-foreground">No records found</p><p className="text-xs text-muted-foreground/70">Try adjusting your filters</p></div></TableCell></TableRow>
                ) : (
                  records.map((r, i) => (
                    <TableRow key={r._id}>
                      <TableCell>{(page - 1) * 10 + i + 1}</TableCell>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell>#{r.rollNumber}</TableCell>
                      <TableCell className="text-muted-foreground">{r.email}</TableCell>
                      <TableCell>{r.courseName?.courseName || r.selectCourse || "-"}</TableCell>
                      <TableCell>{r.dropOutStudent ? <Badge variant="destructive">Drop-out</Badge> : <Badge variant="success">Active</Badge>}</TableCell>
                      <TableCell className="text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">Page {page} of {totalPages} ({total} records)</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => fetchReport(page - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => fetchReport(page + 1)}>Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
