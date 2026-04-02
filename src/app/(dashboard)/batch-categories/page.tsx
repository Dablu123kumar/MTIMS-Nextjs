"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Layers } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function BatchCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ categoryName: "" });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/batch-categories");
      setCategories(data.data?.data || []);
    } catch {
      setCategories([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/api/batch-categories/${editId}`, form);
      } else {
        await api.post("/api/batch-categories", form);
      }
      fetchCategories();
      closeDialog();
    } catch {}
  };

  const handleEdit = (item: any) => {
    setEditId(item._id);
    setForm({ categoryName: item.categoryName });
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this batch category?")) return;
    try {
      await api.delete(`/api/batch-categories/${id}`);
      fetchCategories();
    } catch {}
  };

  const closeDialog = () => {
    setShowDialog(false);
    setEditId(null);
    setForm({ categoryName: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Batch Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">Classify and organize batch types</p>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category Name</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={3}><div className="space-y-3 py-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div></TableCell></TableRow>
              ) : categories.length === 0 ? (
                <TableRow><TableCell colSpan={3} className="text-center py-12"><div className="flex flex-col items-center gap-2"><Layers className="h-10 w-10 text-muted-foreground/50" /><p className="text-muted-foreground font-medium">No batch categories found</p><p className="text-sm text-muted-foreground/75">Add a category to organize your batches</p></div></TableCell></TableRow>
              ) : (
                categories.map((cat: any) => (
                  <TableRow key={cat._id}>
                    <TableCell className="font-medium">{cat.categoryName}</TableCell>
                    <TableCell>{new Date(cat.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(cat)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(cat._id)}>
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
            <DialogTitle>{editId ? "Edit" : "Add"} Batch Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Category Name</Label>
              <Input
                value={form.categoryName}
                onChange={(e) => setForm({ categoryName: e.target.value })}
                placeholder="Enter category name"
                required
              />
            </div>
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
