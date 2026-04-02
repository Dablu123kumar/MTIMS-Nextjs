"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export default function RollNumbersPage() {
  const [config, setConfig] = useState<{ prefix: string; currentValue: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ prefix: "", currentValue: 1000 });

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/roll-numbers");
      setConfig(data.data);
      setForm({ prefix: data.data.prefix || "", currentValue: data.data.currentValue || 1000 });
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchConfig(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put("/api/roll-numbers", form);
      setConfig(data.data);
    } catch {}
    setSaving(false);
  };

  if (loading) return <div className="space-y-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full rounded-xl" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Roll Number Configuration</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure auto-increment roll number settings</p>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Roll Number Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Prefix</Label>
              <Input
                value={form.prefix}
                onChange={(e) => setForm((p) => ({ ...p, prefix: e.target.value }))}
                placeholder="e.g., STU-, RN-"
              />
              <p className="text-sm text-muted-foreground">Optional prefix before roll numbers (e.g., STU-1001)</p>
            </div>

            <div className="space-y-2">
              <Label>Current Value</Label>
              <Input
                type="number"
                value={form.currentValue}
                onChange={(e) => setForm((p) => ({ ...p, currentValue: Number(e.target.value) }))}
                min={1}
              />
              <p className="text-sm text-muted-foreground">Next roll number will be: <strong>{form.prefix}{form.currentValue + 1}</strong></p>
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Configuration"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
