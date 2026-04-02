"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";


export default function TrainersPage() {
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ trainerName: "", trainerDesignation: "", trainerEmail: "", trainerRole: "Trainer" });

  const fetchTrainers = async () => { setLoading(true); try { const { data } = await api.get("/api/trainers"); setTrainers(data.data || []); } catch {} setLoading(false); };
  useEffect(() => { fetchTrainers(); }, []);

  const handleAdd = async (e: React.FormEvent) => { e.preventDefault(); try { await api.post("/api/trainers", form); fetchTrainers(); setShowAdd(false); } catch {} };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Trainers</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage training staff</p>
        </div>
        <Button onClick={() => setShowAdd(true)}><Plus className="mr-2 h-4 w-4" /> Add Trainer</Button>
      </div>
      <Card><CardContent className="pt-6">
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Designation</TableHead><TableHead>Role</TableHead></TableRow></TableHeader>
          <TableBody>
            {loading ? <TableRow><TableCell colSpan={4} className="py-4"><div className="space-y-2"><Skeleton className="h-12 w-full rounded-lg" /><Skeleton className="h-12 w-full rounded-lg" /><Skeleton className="h-12 w-full rounded-lg" /></div></TableCell></TableRow> :
            trainers.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center py-12"><div className="flex flex-col items-center gap-2"><Users className="h-10 w-10 text-muted-foreground/50" /><p className="text-sm font-medium text-muted-foreground">No trainers found</p><p className="text-xs text-muted-foreground/70">Add a trainer to get started</p></div></TableCell></TableRow> :
            trainers.map((t: any) => (
              <TableRow key={t._id}><TableCell className="font-medium">{t.trainerName}</TableCell><TableCell>{t.trainerEmail}</TableCell><TableCell>{t.trainerDesignation}</TableCell><TableCell>{t.trainerRole}</TableCell></TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Trainer</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input value={form.trainerName} onChange={(e) => setForm((p) => ({ ...p, trainerName: e.target.value }))} required /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.trainerEmail} onChange={(e) => setForm((p) => ({ ...p, trainerEmail: e.target.value }))} required /></div>
            <div className="space-y-2"><Label>Designation</Label><Input value={form.trainerDesignation} onChange={(e) => setForm((p) => ({ ...p, trainerDesignation: e.target.value }))} required /></div>
            <DialogFooter><Button variant="outline" type="button" onClick={() => setShowAdd(false)}>Cancel</Button><Button type="submit">Create</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
