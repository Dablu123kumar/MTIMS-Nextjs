"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, GraduationCap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_OPTIONS = ["completed", "withdrawn", "failed"] as const;
const STATUS_COLORS: Record<string, string> = {
  completed: "bg-green-100 text-green-800",
  withdrawn: "bg-yellow-100 text-yellow-800",
  failed: "bg-red-100 text-red-800",
};

export default function CourseCompletionsPage() {
  const [completions, setCompletions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [form, setForm] = useState({
    studentId: "", courseId: "", completionDate: "", certificateNumber: "", remarks: "", status: "completed",
  });

  const fetchCompletions = async () => {
    setLoading(true);
    try {
      const query = statusFilter ? `?status=${statusFilter}` : "";
      const { data } = await api.get(`/api/course-completions${query}`);
      setCompletions(data.data?.data || []);
    } catch {
      setCompletions([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchCompletions(); }, [statusFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/api/course-completions/${editId}`, form);
      } else {
        await api.post("/api/course-completions", form);
      }
      fetchCompletions();
      closeDialog();
    } catch {}
  };

  const handleEdit = (item: any) => {
    setEditId(item._id);
    setForm({
      studentId: item.studentId?._id || item.studentId,
      courseId: item.courseId?._id || item.courseId,
      completionDate: item.completionDate?.slice(0, 10) || "",
      certificateNumber: item.certificateNumber || "",
      remarks: item.remarks || "",
      status: item.status || "completed",
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this completion record?")) return;
    try {
      await api.delete(`/api/course-completions/${id}`);
      fetchCompletions();
    } catch {}
  };

  const closeDialog = () => {
    setShowDialog(false);
    setEditId(null);
    setForm({ studentId: "", courseId: "", completionDate: "", certificateNumber: "", remarks: "", status: "completed" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Course Completions</h1>
          <p className="text-sm text-muted-foreground mt-1">Track graduation and course completion records</p>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="mr-2 h-4 w-4" /> Record Completion
        </Button>
      </div>

      <div className="flex gap-2">
        <select
          className="rounded-md border px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Certificate #</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Remarks</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7}><div className="space-y-3 py-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div></TableCell></TableRow>
              ) : completions.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-12"><div className="flex flex-col items-center gap-2"><GraduationCap className="h-10 w-10 text-muted-foreground/50" /><p className="text-muted-foreground font-medium">No completion records found</p><p className="text-sm text-muted-foreground/75">Record a course completion to get started</p></div></TableCell></TableRow>
              ) : (
                completions.map((comp: any) => (
                  <TableRow key={comp._id}>
                    <TableCell className="font-medium">{comp.studentId?.name || comp.studentId}</TableCell>
                    <TableCell>{comp.courseId?.courseName || comp.courseId}</TableCell>
                    <TableCell>{new Date(comp.completionDate).toLocaleDateString()}</TableCell>
                    <TableCell>{comp.certificateNumber || "-"}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[comp.status] || ""}`}>
                        {comp.status}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{comp.remarks || "-"}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(comp)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(comp._id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? "Edit" : "Record"} Course Completion</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!editId && (
              <>
                <div className="space-y-2">
                  <Label>Student ID</Label>
                  <Input value={form.studentId} onChange={(e) => setForm((p) => ({ ...p, studentId: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label>Course ID</Label>
                  <Input value={form.courseId} onChange={(e) => setForm((p) => ({ ...p, courseId: e.target.value }))} required />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label>Completion Date</Label>
              <Input type="date" value={form.completionDate} onChange={(e) => setForm((p) => ({ ...p, completionDate: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Certificate Number</Label>
              <Input value={form.certificateNumber} onChange={(e) => setForm((p) => ({ ...p, certificateNumber: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                className="w-full rounded-md border px-3 py-2 text-sm"
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Remarks</Label>
              <textarea
                className="w-full rounded-md border px-3 py-2 text-sm min-h-[60px]"
                value={form.remarks}
                onChange={(e) => setForm((p) => ({ ...p, remarks: e.target.value }))}
                maxLength={500}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={closeDialog}>Cancel</Button>
              <Button type="submit">{editId ? "Update" : "Record"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
