"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, UserCog, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";


export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ fName: "", lName: "", email: "", password: "", phone: "", role: "Student" });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/auth/users");
      setUsers(data.data || []);
    } catch { setUsers([]); }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/api/auth/users", form);
      fetchUsers();
      setShowAdd(false);
      setForm({ fName: "", lName: "", email: "", password: "", phone: "", role: "Student" });
    } catch {}
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    try {
      await api.delete(`/api/auth/users/${id}`);
      fetchUsers();
    } catch {}
  };

  const roleColors: Record<string, string> = {
    Owner: "default", SuperAdmin: "default", Admin: "default",
    Counsellor: "secondary", Accounts: "secondary",
    Telecaller: "outline", Trainer: "outline", Student: "outline",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage staff and user accounts</p>
        </div>
        <Button onClick={() => setShowAdd(true)}><Plus className="mr-2 h-4 w-4" /> Add User</Button>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base font-semibold"><UserCog className="inline h-5 w-5 mr-2" />Users ({users.length})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="py-4"><div className="space-y-2"><Skeleton className="h-12 w-full rounded-lg" /><Skeleton className="h-12 w-full rounded-lg" /><Skeleton className="h-12 w-full rounded-lg" /><Skeleton className="h-12 w-full rounded-lg" /></div></TableCell></TableRow>
              ) : users.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-12"><div className="flex flex-col items-center gap-2"><Users className="h-10 w-10 text-muted-foreground/50" /><p className="text-sm font-medium text-muted-foreground">No users found</p><p className="text-xs text-muted-foreground/70">Add a user to get started</p></div></TableCell></TableRow>
              ) : (
                users.map((u: any) => (
                  <TableRow key={u._id}>
                    <TableCell className="font-medium">{u.fName} {u.lName}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.phone || "-"}</TableCell>
                    <TableCell><Badge variant={roleColors[u.role] as any || "outline"}>{u.role}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(u._id)}>
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
          <DialogHeader><DialogTitle>Add User</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>First Name</Label><Input value={form.fName} onChange={(e) => setForm((p) => ({ ...p, fName: e.target.value }))} required /></div>
              <div className="space-y-2"><Label>Last Name</Label><Input value={form.lName} onChange={(e) => setForm((p) => ({ ...p, lName: e.target.value }))} required /></div>
            </div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required /></div>
            <div className="space-y-2"><Label>Password</Label><Input type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required minLength={6} /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} /></div>
            <div className="space-y-2">
              <Label>Role</Label>
              <select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {["SuperAdmin", "Admin", "Accounts", "Counsellor", "Telecaller", "Trainer", "Student"].map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button type="submit">Create User</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
