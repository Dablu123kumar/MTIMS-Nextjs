"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";


export default function TeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", qualification: "", experience: 0, address: "" });

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/teachers");
      setTeachers(data.data || []);
    } catch { setTeachers([]); }
    setLoading(false);
  };

  useEffect(() => { fetchTeachers(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/api/teachers", form);
      fetchTeachers();
      setShowAdd(false);
      setForm({ name: "", email: "", phone: "", qualification: "", experience: 0, address: "" });
    } catch {}
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this teacher?")) return;
    try { await api.delete(`/api/teachers/${id}`); fetchTeachers(); } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Teachers</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage teaching staff</p>
        </div>
        <Button onClick={() => setShowAdd(true)}><Plus className="mr-2 h-4 w-4" /> Add Teacher</Button>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead>
                <TableHead>Qualification</TableHead><TableHead>Experience</TableHead><TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="py-4"><div className="space-y-2"><Skeleton className="h-12 w-full rounded-lg" /><Skeleton className="h-12 w-full rounded-lg" /><Skeleton className="h-12 w-full rounded-lg" /><Skeleton className="h-12 w-full rounded-lg" /></div></TableCell></TableRow>
              ) : teachers.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-12"><div className="flex flex-col items-center gap-2"><Users className="h-10 w-10 text-muted-foreground/50" /><p className="text-sm font-medium text-muted-foreground">No teachers found</p><p className="text-xs text-muted-foreground/70">Add a teacher to get started</p></div></TableCell></TableRow>
              ) : (
                teachers.map((t: any) => (
                  <TableRow key={t._id}>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell>{t.email}</TableCell><TableCell>{t.phone}</TableCell>
                    <TableCell>{t.qualification}</TableCell><TableCell>{t.experience} yrs</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(t._id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
          <DialogHeader><DialogTitle>Add Teacher</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} required /></div>
            <div className="space-y-2"><Label>Qualification</Label><Input value={form.qualification} onChange={(e) => setForm((p) => ({ ...p, qualification: e.target.value }))} required /></div>
            <div className="space-y-2"><Label>Experience (years)</Label><Input type="number" value={form.experience} onChange={(e) => setForm((p) => ({ ...p, experience: Number(e.target.value) }))} /></div>
            <div className="space-y-2"><Label>Address</Label><Input value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} required /></div>
            <DialogFooter><Button variant="outline" type="button" onClick={() => setShowAdd(false)}>Cancel</Button><Button type="submit">Create</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
