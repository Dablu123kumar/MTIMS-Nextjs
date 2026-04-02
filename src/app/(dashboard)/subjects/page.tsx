"use client";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, BookOpen } from "lucide-react";


export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ subjectName: "", subjectCode: "", fullMarks: 100, passMarks: 33, course: "", courseType: "", semYear: "1" });

  const fetchSubjects = async () => { setLoading(true); try { const { data } = await api.get("/api/subjects"); setSubjects(data.data || []); } catch {} setLoading(false); };
  useEffect(() => { fetchSubjects(); }, []);

  const handleAdd = async (e: React.FormEvent) => { e.preventDefault(); try { await api.post("/api/subjects", { ...form, fullMarks: Number(form.fullMarks), passMarks: Number(form.passMarks) }); fetchSubjects(); setShowAdd(false); } catch {} };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Subjects</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage course subjects and grading</p>
        </div>
        <Button onClick={() => setShowAdd(true)}><Plus className="mr-2 h-4 w-4" /> Add Subject</Button>
      </div>
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">All Subjects ({subjects.length})</CardTitle>
        </CardHeader>
        <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>Subject</TableHead><TableHead>Code</TableHead><TableHead>Course</TableHead><TableHead>Full Marks</TableHead><TableHead>Pass Marks</TableHead><TableHead>Sem/Year</TableHead></TableRow></TableHeader>
          <TableBody>
            {loading ? Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-12 w-full" /></TableCell></TableRow>
            )) :
            subjects.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-12">
              <div className="flex flex-col items-center gap-2">
                <BookOpen className="h-10 w-10 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No subjects found. Add your first subject to get started.</p>
              </div>
            </TableCell></TableRow> :
            subjects.map((s: any) => (
              <TableRow key={s._id}><TableCell className="font-medium">{s.subjectName}</TableCell><TableCell>{s.subjectCode}</TableCell><TableCell>{s.course?.courseName || "-"}</TableCell><TableCell>{s.fullMarks}</TableCell><TableCell>{s.passMarks}</TableCell><TableCell>{s.semYear}</TableCell></TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      </Card>
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Subject</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2"><Label>Subject Name</Label><Input value={form.subjectName} onChange={(e) => setForm((p) => ({ ...p, subjectName: e.target.value }))} required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Subject Code</Label><Input value={form.subjectCode} onChange={(e) => setForm((p) => ({ ...p, subjectCode: e.target.value }))} required /></div>
              <div className="space-y-2"><Label>Sem/Year</Label><Input value={form.semYear} onChange={(e) => setForm((p) => ({ ...p, semYear: e.target.value }))} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Full Marks</Label><Input type="number" value={form.fullMarks} onChange={(e) => setForm((p) => ({ ...p, fullMarks: Number(e.target.value) }))} /></div>
              <div className="space-y-2"><Label>Pass Marks</Label><Input type="number" value={form.passMarks} onChange={(e) => setForm((p) => ({ ...p, passMarks: Number(e.target.value) }))} /></div>
            </div>
            <DialogFooter><Button variant="outline" type="button" onClick={() => setShowAdd(false)}>Cancel</Button><Button type="submit">Create</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
