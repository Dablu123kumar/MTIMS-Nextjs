"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { useAppSelector } from "@/hooks/useRedux";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Save } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";


export default function SettingsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        const { data } = await api.get("/api/tenants");
        setTenant(data.data);
      } catch {}
      setLoading(false);
    };
    fetchTenant();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const tenantId = Array.isArray(tenant) ? tenant[0]?._id : tenant?._id;
      await api.put(`/api/tenants/${tenantId}`, tenant);
    } catch {}
    setSaving(false);
  };

  const tenantData = Array.isArray(tenant) ? tenant[0] : tenant;

  if (loading) return <div className="space-y-6"><div><h1 className="text-2xl font-bold">Settings</h1><p className="text-sm text-muted-foreground mt-1">Configure your organization</p></div><div className="space-y-2"><Skeleton className="h-12 w-full rounded-lg" /><Skeleton className="h-12 w-full rounded-lg" /><Skeleton className="h-12 w-full rounded-lg" /><Skeleton className="h-12 w-full rounded-lg" /><Skeleton className="h-12 w-full rounded-lg" /></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure your organization</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Building2 className="h-5 w-5" /> Organization Settings
            </CardTitle>
            <CardDescription>Manage your organization details</CardDescription>
          </CardHeader>
          <CardContent>
            {tenantData && (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <Label>Organization Name</Label>
                  <Input value={tenantData.name || ""} onChange={(e) => setTenant({ ...tenantData, name: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={tenantData.email || ""} onChange={(e) => setTenant({ ...tenantData, email: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input value={tenantData.phone || ""} onChange={(e) => setTenant({ ...tenantData, phone: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input value={tenantData.address || ""} onChange={(e) => setTenant({ ...tenantData, address: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input value={tenantData.website || ""} onChange={(e) => setTenant({ ...tenantData, website: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Receipt Prefix</Label>
                    <Input value={tenantData.receiptPrefix || ""} onChange={(e) => setTenant({ ...tenantData, receiptPrefix: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>GST Number</Label>
                    <Input value={tenantData.gst || ""} onChange={(e) => setTenant({ ...tenantData, gst: e.target.value })} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="gstBased" checked={tenantData.isGstBased || false}
                    onChange={(e) => setTenant({ ...tenantData, isGstBased: e.target.checked })}
                    className="rounded border-input" />
                  <Label htmlFor="gstBased">GST Based Billing</Label>
                </div>
                <Button type="submit" disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />{saving ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Account Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={`${user?.fName} ${user?.lName}`} readOnly className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ""} readOnly className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input value={user?.role || ""} readOnly className="bg-muted" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
