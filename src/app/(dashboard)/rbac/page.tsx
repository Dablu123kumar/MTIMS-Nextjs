"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Save } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const ROLES = ["Admin", "Accounts", "Counsellor", "Telecaller", "Trainer", "Student"];

const PERMISSION_GROUPS: Record<string, string[]> = {
  Students: ["students.view", "students.create", "students.update", "students.delete"],
  Courses: ["courses.view", "courses.create", "courses.update", "courses.delete"],
  Batches: ["batches.view", "batches.create", "batches.update", "batches.delete"],
  Fees: ["fees.view", "fees.create", "fees.update", "fees.delete"],
  Installments: ["installments.view", "installments.create", "installments.update", "installments.markPaid"],
  Attendance: ["attendance.view", "attendance.create"],
  Marks: ["marks.view", "marks.create", "marks.update"],
  Teachers: ["teachers.view", "teachers.create", "teachers.update", "teachers.delete"],
  Reports: ["reports.view", "reports.export"],
  Settings: ["settings.view", "settings.update"],
  Users: ["users.view", "users.create", "users.update", "users.delete"],
  "Day Book": ["daybook.view", "daybook.create", "daybook.update"],
  Forms: ["forms.view", "forms.create", "forms.update", "forms.delete"],
  Email: ["email.view", "email.send", "email.configure"],
  Alerts: ["alerts.view", "alerts.create", "alerts.update", "alerts.delete"],
  Completions: ["completions.view", "completions.create", "completions.update"],
  Approvals: ["approvals.view", "approvals.manage"],
};

const ALL_PERMISSIONS = Object.values(PERMISSION_GROUPS).flat();

export default function RbacPage() {
  const [roleData, setRoleData] = useState<Record<string, { _id?: string; permissions: Record<string, boolean> }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/rbac");
      const existing = data.data || [];
      const mapped: Record<string, any> = {};
      for (const role of ROLES) {
        const found = existing.find((r: any) => r.role === role);
        mapped[role] = {
          _id: found?._id,
          permissions: found?.permissions || {},
        };
      }
      setRoleData(mapped);
    } catch {
      const empty: Record<string, any> = {};
      for (const role of ROLES) empty[role] = { permissions: {} };
      setRoleData(empty);
    }
    setLoading(false);
  };

  useEffect(() => { fetchPermissions(); }, []);

  const togglePermission = (role: string, permission: string) => {
    setRoleData((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        permissions: {
          ...prev[role]?.permissions,
          [permission]: !prev[role]?.permissions?.[permission],
        },
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const role of ROLES) {
        const entry = roleData[role];
        if (entry._id) {
          await api.put(`/api/rbac/${entry._id}`, { permissions: entry.permissions });
        } else {
          const { data } = await api.post("/api/rbac", { role, permissions: entry.permissions });
          setRoleData((prev) => ({
            ...prev,
            [role]: { ...prev[role], _id: data.data._id },
          }));
        }
      }
      alert("Permissions saved successfully!");
    } catch {
      alert("Failed to save permissions");
    }
    setSaving(false);
  };

  if (loading) return <div className="space-y-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full rounded-xl" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Permissions</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure role-based access control for each role. Owner and SuperAdmin always have full access.</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" /> {saving ? "Saving..." : "Save All"}
        </Button>
      </div>

      {Object.entries(PERMISSION_GROUPS).map(([group, permissions]) => (
        <Card key={group}>
          <CardHeader>
            <CardTitle className="text-lg">{group}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-48">Permission</TableHead>
                  {ROLES.map((role) => (
                    <TableHead key={role} className="text-center">{role}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissions.map((perm) => (
                  <TableRow key={perm}>
                    <TableCell className="font-medium text-sm">
                      {perm.split(".")[1]}
                    </TableCell>
                    {ROLES.map((role) => (
                      <TableCell key={role} className="text-center">
                        <input
                          type="checkbox"
                          checked={roleData[role]?.permissions?.[perm] || false}
                          onChange={() => togglePermission(role, perm)}
                          className="h-4 w-4 rounded"
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
