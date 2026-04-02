"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Plus, Trash2, Search, Edit, FlaskConical } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function LabsPage() {
  const [labs, setLabs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [labName, setLabName] = useState("");

  const fetchLabs = async (p = page) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/labs?page=${p}&limit=10&search=${search}`);
      setLabs(data.data.labs);
      setTotal(data.data.total);
      setTotalPages(data.data.totalPages);
      setPage(data.data.page);
    } catch { setLabs([]); }
    setLoading(false);
  };

  useEffect(() => { fetchLabs(1); }, [search]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/api/labs", { labName });
      setLabName("");
      setShowAdd(false);
      fetchLabs(1);
    } catch {}
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/api/labs/${editId}`, { labName });
      setLabName("");
      setEditId(null);
      fetchLabs();
    } catch {}
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/api/labs/${deleteId}`);
      setDeleteId(null);
      fetchLabs();
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Labs</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage laboratory facilities</p>
        </div>
        <Button onClick={() => { setLabName(""); setShowAdd(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Lab
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-base font-semibold">Labs ({total})</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search labs..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 w-64" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Lab Name</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="py-4"><div className="space-y-2"><Skeleton className="h-12 w-full rounded-lg" /><Skeleton className="h-12 w-full rounded-lg" /><Skeleton className="h-12 w-full rounded-lg" /></div></TableCell></TableRow>
              ) : labs.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-12"><div className="flex flex-col items-center gap-2"><FlaskConical className="h-10 w-10 text-muted-foreground/50" /><p className="text-sm font-medium text-muted-foreground">No labs found</p><p className="text-xs text-muted-foreground/70">Add a lab to get started</p></div></TableCell></TableRow>
              ) : (
                labs.map((lab, i) => (
                  <TableRow key={lab._id}>
                    <TableCell>{(page - 1) * 10 + i + 1}</TableCell>
                    <TableCell className="font-medium">{lab.labName}</TableCell>
                    <TableCell className="text-muted-foreground">{new Date(lab.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => { setEditId(lab._id); setLabName(lab.labName); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(lab._id)}>
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
              <p className="text-sm text-muted-foreground">Page {page} of {totalPages} ({total} labs)</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => fetchLabs(page - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => fetchLabs(page + 1)}>Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Lab</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2"><Label>Lab Name</Label><Input value={labName} onChange={(e) => setLabName(e.target.value)} required /></div>
            <DialogFooter><Button variant="outline" type="button" onClick={() => setShowAdd(false)}>Cancel</Button><Button type="submit">Create</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editId} onOpenChange={() => setEditId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Lab</DialogTitle></DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2"><Label>Lab Name</Label><Input value={labName} onChange={(e) => setLabName(e.target.value)} required /></div>
            <DialogFooter><Button variant="outline" type="button" onClick={() => setEditId(null)}>Cancel</Button><Button type="submit">Update</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Lab</DialogTitle>
            <DialogDescription>Are you sure you want to delete this lab? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter><Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button><Button variant="destructive" onClick={handleDelete}>Delete</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
