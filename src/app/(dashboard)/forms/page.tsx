"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Plus, Trash2, Eye, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function FormsPage() {
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [formName, setFormName] = useState("");

  const fetchForms = async (p = page) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/forms?page=${p}&limit=10`);
      setForms(data.data.forms);
      setTotal(data.data.total);
      setTotalPages(data.data.totalPages);
      setPage(data.data.page);
    } catch { setForms([]); }
    setLoading(false);
  };

  useEffect(() => { fetchForms(1); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/api/forms", { formName });
      setFormName("");
      setShowAdd(false);
      fetchForms(1);
    } catch {}
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/api/forms/${deleteId}`);
      setDeleteId(null);
      fetchForms();
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Forms</h1>
          <p className="text-sm text-muted-foreground mt-1">Custom form builder</p>
        </div>
        <Button onClick={() => { setFormName(""); setShowAdd(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Create Form
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base font-semibold">Custom Forms ({total})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Form Name</TableHead>
                <TableHead>Fields</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="py-4"><div className="space-y-2"><Skeleton className="h-12 w-full rounded-lg" /><Skeleton className="h-12 w-full rounded-lg" /><Skeleton className="h-12 w-full rounded-lg" /></div></TableCell></TableRow>
              ) : forms.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-12"><div className="flex flex-col items-center gap-2"><FileText className="h-10 w-10 text-muted-foreground/50" /><p className="text-sm font-medium text-muted-foreground">No forms found</p><p className="text-xs text-muted-foreground/70">Create a form to get started</p></div></TableCell></TableRow>
              ) : (
                forms.map((f, i) => (
                  <TableRow key={f._id}>
                    <TableCell>{(page - 1) * 10 + i + 1}</TableCell>
                    <TableCell className="font-medium">{f.formName}</TableCell>
                    <TableCell><Badge variant="secondary">{f.fields?.length || 0} fields</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{new Date(f.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => setDetail(f)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(f._id)}>
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
              <p className="text-sm text-muted-foreground">Page {page} of {totalPages} ({total} forms)</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => fetchForms(page - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => fetchForms(page + 1)}>Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Form</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2"><Label>Form Name</Label><Input value={formName} onChange={(e) => setFormName(e.target.value)} required /></div>
            <DialogFooter><Button variant="outline" type="button" onClick={() => setShowAdd(false)}>Cancel</Button><Button type="submit">Create</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{detail?.formName}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {detail?.fields?.length === 0 ? (
              <p className="text-muted-foreground text-sm">No fields added to this form yet.</p>
            ) : (
              detail?.fields?.map((f: any, i: number) => (
                <div key={i} className="flex items-center justify-between border rounded-md p-3">
                  <div>
                    <p className="font-medium">{f.name}</p>
                    <p className="text-xs text-muted-foreground">Type: {f.type}{f.mandatory ? " (Required)" : ""}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Form</DialogTitle>
            <DialogDescription>Are you sure? This will also delete all associated fields.</DialogDescription>
          </DialogHeader>
          <DialogFooter><Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button><Button variant="destructive" onClick={handleDelete}>Delete</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
