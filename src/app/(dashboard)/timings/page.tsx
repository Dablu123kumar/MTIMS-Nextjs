"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Plus, Trash2, Edit, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function TimingsPage() {
  const [timings, setTimings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ startTime: "", endTime: "" });

  const fetchTimings = async (p = page) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/timings?page=${p}&limit=10`);
      setTimings(data.data.timings);
      setTotal(data.data.total);
      setTotalPages(data.data.totalPages);
      setPage(data.data.page);
    } catch { setTimings([]); }
    setLoading(false);
  };

  useEffect(() => { fetchTimings(1); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/api/timings", form);
      setForm({ startTime: "", endTime: "" });
      setShowAdd(false);
      fetchTimings(1);
    } catch {}
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/api/timings/${editId}`, form);
      setForm({ startTime: "", endTime: "" });
      setEditId(null);
      fetchTimings();
    } catch {}
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/api/timings/${deleteId}`);
      setDeleteId(null);
      fetchTimings();
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Timings</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure class schedule</p>
        </div>
        <Button onClick={() => { setForm({ startTime: "", endTime: "" }); setShowAdd(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Timing
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base font-semibold">Time Slots ({total})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="py-4"><div className="space-y-2"><Skeleton className="h-12 w-full rounded-lg" /><Skeleton className="h-12 w-full rounded-lg" /><Skeleton className="h-12 w-full rounded-lg" /></div></TableCell></TableRow>
              ) : timings.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-12"><div className="flex flex-col items-center gap-2"><Clock className="h-10 w-10 text-muted-foreground/50" /><p className="text-sm font-medium text-muted-foreground">No timings found</p><p className="text-xs text-muted-foreground/70">Add a time slot to get started</p></div></TableCell></TableRow>
              ) : (
                timings.map((t, i) => (
                  <TableRow key={t._id}>
                    <TableCell>{(page - 1) * 10 + i + 1}</TableCell>
                    <TableCell className="font-medium">{t.startTime}</TableCell>
                    <TableCell className="font-medium">{t.endTime}</TableCell>
                    <TableCell className="text-muted-foreground">{new Date(t.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => { setEditId(t._id); setForm({ startTime: t.startTime, endTime: t.endTime }); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(t._id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">Page {page} of {totalPages} ({total} timings)</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => fetchTimings(page - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => fetchTimings(page + 1)}>Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Timing</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2"><Label>Start Time</Label><Input type="time" value={form.startTime} onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))} required /></div>
            <div className="space-y-2"><Label>End Time</Label><Input type="time" value={form.endTime} onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))} required /></div>
            <DialogFooter><Button variant="outline" type="button" onClick={() => setShowAdd(false)}>Cancel</Button><Button type="submit">Create</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editId} onOpenChange={() => setEditId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Timing</DialogTitle></DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2"><Label>Start Time</Label><Input type="time" value={form.startTime} onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))} required /></div>
            <div className="space-y-2"><Label>End Time</Label><Input type="time" value={form.endTime} onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))} required /></div>
            <DialogFooter><Button variant="outline" type="button" onClick={() => setEditId(null)}>Cancel</Button><Button type="submit">Update</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Timing</DialogTitle>
            <DialogDescription>Are you sure? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter><Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button><Button variant="destructive" onClick={handleDelete}>Delete</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
