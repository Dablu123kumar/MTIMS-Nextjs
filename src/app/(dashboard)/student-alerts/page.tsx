"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Bell } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_OPTIONS = ["pending", "sent", "dismissed"] as const;
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  sent: "bg-green-100 text-green-800",
  dismissed: "bg-gray-100 text-gray-800",
};

export default function StudentAlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [form, setForm] = useState({ date: "", reminderDateTime: "", particulars: "", status: "pending" });

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const query = statusFilter ? `?status=${statusFilter}` : "";
      const { data } = await api.get(`/api/student-alerts${query}`);
      setAlerts(data.data?.data || []);
    } catch {
      setAlerts([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchAlerts(); }, [statusFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/api/student-alerts/${editId}`, form);
      } else {
        await api.post("/api/student-alerts", form);
      }
      fetchAlerts();
      closeDialog();
    } catch {}
  };

  const handleEdit = (item: any) => {
    setEditId(item._id);
    setForm({
      date: item.date?.slice(0, 10) || "",
      reminderDateTime: item.reminderDateTime?.slice(0, 16) || "",
      particulars: item.particulars || "",
      status: item.status || "pending",
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this alert?")) return;
    try {
      await api.delete(`/api/student-alerts/${id}`);
      fetchAlerts();
    } catch {}
  };

  const closeDialog = () => {
    setShowDialog(false);
    setEditId(null);
    setForm({ date: "", reminderDateTime: "", particulars: "", status: "pending" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Student Alerts</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage reminders and notifications</p>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Alert
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
                <TableHead>Date</TableHead>
                <TableHead>Reminder</TableHead>
                <TableHead>Particulars</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5}><div className="space-y-3 py-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div></TableCell></TableRow>
              ) : alerts.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-12"><div className="flex flex-col items-center gap-2"><Bell className="h-10 w-10 text-muted-foreground/50" /><p className="text-muted-foreground font-medium">No alerts found</p><p className="text-sm text-muted-foreground/75">Create a new alert to get started</p></div></TableCell></TableRow>
              ) : (
                alerts.map((alert: any) => (
                  <TableRow key={alert._id}>
                    <TableCell>{new Date(alert.date).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(alert.reminderDateTime).toLocaleString()}</TableCell>
                    <TableCell className="max-w-xs truncate">{alert.particulars}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[alert.status] || ""}`}>
                        {alert.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(alert)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(alert._id)}>
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
            <DialogTitle>{editId ? "Edit" : "New"} Student Alert</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label>Reminder Date & Time</Label>
              <Input type="datetime-local" value={form.reminderDateTime} onChange={(e) => setForm((p) => ({ ...p, reminderDateTime: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label>Particulars</Label>
              <textarea
                className="w-full rounded-md border px-3 py-2 text-sm min-h-[80px]"
                value={form.particulars}
                onChange={(e) => setForm((p) => ({ ...p, particulars: e.target.value }))}
                required
              />
            </div>
            {editId && (
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
            )}
            <DialogFooter>
              <Button variant="outline" type="button" onClick={closeDialog}>Cancel</Button>
              <Button type="submit">{editId ? "Update" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
