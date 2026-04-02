"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", company: "", contactPhone: "",
    companySite: "", country: "", language: "en", timeZone: "Asia/Kolkata",
    currency: "INR", communications: { email: false, phone: false }, allowMarketing: false,
  });

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/profile");
      const p = data.data;
      setProfile(p);
      setForm({
        firstName: p.firstName || "", lastName: p.lastName || "",
        company: p.company || "", contactPhone: p.contactPhone || "",
        companySite: p.companySite || "", country: p.country || "",
        language: p.language || "en", timeZone: p.timeZone || "Asia/Kolkata",
        currency: p.currency || "INR",
        communications: p.communications || { email: false, phone: false },
        allowMarketing: p.allowMarketing || false,
      });
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put("/api/profile", form);
      setProfile(data.data);
    } catch {}
    setSaving(false);
  };

  const updateField = (field: string, value: any) => {
    setForm((p) => ({ ...p, [field]: value }));
  };

  if (loading) return <div className="space-y-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full rounded-xl" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your personal information and preferences</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input value={form.firstName} onChange={(e) => updateField("firstName", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input value={form.lastName} onChange={(e) => updateField("lastName", e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={form.contactPhone} onChange={(e) => updateField("contactPhone", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Company Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input value={form.company} onChange={(e) => updateField("company", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Company Website</Label>
              <Input value={form.companySite} onChange={(e) => updateField("companySite", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Preferences</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Country</Label>
                <Input value={form.country} onChange={(e) => updateField("country", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Language</Label>
                <Input value={form.language} onChange={(e) => updateField("language", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Time Zone</Label>
                <Input value={form.timeZone} onChange={(e) => updateField("timeZone", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Input value={form.currency} onChange={(e) => updateField("currency", e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Communications</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.communications?.email || false}
                onChange={(e) => setForm((p) => ({ ...p, communications: { ...p.communications, email: e.target.checked } }))}
                className="rounded"
              />
              <span className="text-sm">Email notifications</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.communications?.phone || false}
                onChange={(e) => setForm((p) => ({ ...p, communications: { ...p.communications, phone: e.target.checked } }))}
                className="rounded"
              />
              <span className="text-sm">Phone notifications</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.allowMarketing}
                onChange={(e) => updateField("allowMarketing", e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Allow marketing communications</span>
            </label>
          </CardContent>
        </Card>

        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Profile"}
        </Button>
      </form>
    </div>
  );
}
