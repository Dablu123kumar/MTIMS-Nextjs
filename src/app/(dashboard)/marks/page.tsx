"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, ClipboardList } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function MarksPage() {
  const [marks, setMarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [detail, setDetail] = useState<any>(null);

  const fetchMarks = async (p = page) => {
    setLoading(true);
    try {
      let url = `/api/student-marks?page=${p}&limit=10`;
      if (statusFilter) url += `&status=${statusFilter}`;
      const { data } = await api.get(url);
      setMarks(data.data.marks);
      setTotal(data.data.total);
      setTotalPages(data.data.totalPages);
      setPage(data.data.page);
    } catch { setMarks([]); }
    setLoading(false);
  };

  useEffect(() => { fetchMarks(1); }, [statusFilter]);

  const statusColor = (s: string) => {
    if (s === "Completed") return "success";
    if (s === "InProgress") return "warning";
    return "secondary";
  };

  const getTotalMarks = (subjects: any[]) => {
    return subjects?.reduce((sum: number, s: any) => sum + (s.totalMarks || 0), 0) || 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Marks & Results</h1>
          <p className="text-sm text-muted-foreground mt-1">Record and manage student marks</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-base font-semibold">Marks Records ({total})</CardTitle>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">All Status</option>
              <option value="NotStarted">Not Started</option>
              <option value="InProgress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Roll No</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Subjects</TableHead>
                <TableHead>Total Marks</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={8}><Skeleton className="h-12 w-full" /></TableCell></TableRow>
                ))
              ) : marks.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <ClipboardList className="h-10 w-10 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">No marks records found. Results will appear once marks are entered.</p>
                  </div>
                </TableCell></TableRow>
              ) : (
                marks.map((m, i) => (
                  <TableRow key={m._id}>
                    <TableCell>{(page - 1) * 10 + i + 1}</TableCell>
                    <TableCell className="font-medium">{m.studentInfo?.name || "-"}</TableCell>
                    <TableCell>{m.studentInfo?.rollNumber ? `#${m.studentInfo.rollNumber}` : "-"}</TableCell>
                    <TableCell>{m.course?.courseName || "-"}</TableCell>
                    <TableCell>{m.subjects?.length || 0}</TableCell>
                    <TableCell className="font-medium">{getTotalMarks(m.subjects)}</TableCell>
                    <TableCell><Badge variant={statusColor(m.resultStatus) as any}>{m.resultStatus}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => setDetail(m)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">Page {page} of {totalPages} ({total} records)</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => fetchMarks(page - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => fetchMarks(page + 1)}>Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Marks Detail - {detail?.studentInfo?.name || "Student"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Course:</span> {detail?.course?.courseName || "-"}</div>
              <div><span className="text-muted-foreground">Status:</span> <Badge variant={statusColor(detail?.resultStatus) as any}>{detail?.resultStatus}</Badge></div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Theory</TableHead>
                  <TableHead>Practical</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Full Marks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detail?.subjects?.map((s: any, i: number) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{s.subject?.subjectName || "-"}</TableCell>
                    <TableCell>{s.subject?.subjectCode || "-"}</TableCell>
                    <TableCell>{s.theory ?? "-"}</TableCell>
                    <TableCell>{s.practical ?? "-"}</TableCell>
                    <TableCell className="font-medium">{s.totalMarks ?? "-"}</TableCell>
                    <TableCell>{s.subject?.fullMarks || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
