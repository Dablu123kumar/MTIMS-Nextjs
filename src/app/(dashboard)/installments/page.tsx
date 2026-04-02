"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, CheckCircle, Trash2, CreditCard } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function InstallmentsPage() {
  const [installments, setInstallments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState({ isPaid: "", isOverdue: "" });
  const [form, setForm] = useState({
    studentId: "", courseId: "", installmentNumber: 1, installmentAmount: 0, dueDate: "",
  });

  const fetchInstallments = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (filter.isPaid) query.set("isPaid", filter.isPaid);
      if (filter.isOverdue === "true") query.set("isOverdue", "true");
      const { data } = await api.get(`/api/installments?${query}`);
      setInstallments(data.data?.data || []);
    } catch {
      setInstallments([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchInstallments(); }, [filter]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/api/installments", form);
      fetchInstallments();
      setShowAdd(false);
      setForm({ studentId: "", courseId: "", installmentNumber: 1, installmentAmount: 0, dueDate: "" });
    } catch {}
  };

  const handleMarkPaid = async (id: string) => {
    if (!confirm("Mark this installment as paid?")) return;
    try {
      await api.put(`/api/installments/${id}/mark-paid`, {});
      fetchInstallments();
    } catch {}
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this installment?")) return;
    try {
      await api.delete(`/api/installments/${id}`);
      fetchInstallments();
    } catch {}
  };

  const isOverdue = (inst: any) => !inst.isPaid && new Date(inst.dueDate) < new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Installments</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage fee installment plans and payments</p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Installment
        </Button>
      </div>

      <div className="flex gap-2">
        <select
          className="rounded-md border px-3 py-2 text-sm"
          value={filter.isPaid}
          onChange={(e) => setFilter((p) => ({ ...p, isPaid: e.target.value, isOverdue: "" }))}
        >
          <option value="">All</option>
          <option value="true">Paid</option>
          <option value="false">Unpaid</option>
        </select>
        <select
          className="rounded-md border px-3 py-2 text-sm"
          value={filter.isOverdue}
          onChange={(e) => setFilter((p) => ({ ...p, isOverdue: e.target.value, isPaid: "" }))}
        >
          <option value="">All Due Status</option>
          <option value="true">Overdue Only</option>
        </select>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>#</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Paid Date</TableHead>
                <TableHead>Late Fee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={9}><div className="space-y-3 py-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div></TableCell></TableRow>
              ) : installments.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center py-12"><div className="flex flex-col items-center gap-2"><CreditCard className="h-10 w-10 text-muted-foreground/50" /><p className="text-muted-foreground font-medium">No installments found</p><p className="text-sm text-muted-foreground/75">Create a new installment to get started</p></div></TableCell></TableRow>
              ) : (
                installments.map((inst: any) => (
                  <TableRow key={inst._id}>
                    <TableCell className="font-medium">{inst.studentId?.name || inst.studentId}</TableCell>
                    <TableCell>{inst.courseId?.courseName || inst.courseId}</TableCell>
                    <TableCell>{inst.installmentNumber}</TableCell>
                    <TableCell>Rs. {inst.installmentAmount?.toLocaleString()}</TableCell>
                    <TableCell>{new Date(inst.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>{inst.paidDate ? new Date(inst.paidDate).toLocaleDateString() : "-"}</TableCell>
                    <TableCell>{inst.lateFeeAmount > 0 ? `Rs. ${inst.lateFeeAmount.toLocaleString()}` : "-"}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        inst.isPaid
                          ? "bg-green-100 text-green-800"
                          : isOverdue(inst)
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {inst.isPaid ? "Paid" : isOverdue(inst) ? "Overdue" : "Upcoming"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      {!inst.isPaid && (
                        <Button variant="ghost" size="icon" onClick={() => handleMarkPaid(inst._id)} title="Mark Paid">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(inst._id)}>
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

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Installment</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2">
              <Label>Student ID</Label>
              <Input value={form.studentId} onChange={(e) => setForm((p) => ({ ...p, studentId: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label>Course ID</Label>
              <Input value={form.courseId} onChange={(e) => setForm((p) => ({ ...p, courseId: e.target.value }))} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Installment #</Label>
                <Input type="number" value={form.installmentNumber} onChange={(e) => setForm((p) => ({ ...p, installmentNumber: Number(e.target.value) }))} min={1} required />
              </div>
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input type="number" value={form.installmentAmount} onChange={(e) => setForm((p) => ({ ...p, installmentAmount: Number(e.target.value) }))} min={1} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input type="date" value={form.dueDate} onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))} required />
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
