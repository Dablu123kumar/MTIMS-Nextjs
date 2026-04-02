"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { register, clearError } from "@/store/slices/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    fName: "",
    lName: "",
    email: "",
    password: "",
    phone: "",
    tenantName: "",
    tenantPhone: "",
    tenantAddress: "",
    tenantReceiptPrefix: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(register(formData));
    if (register.fulfilled.match(result)) {
      router.push("/login");
    }
  };

  return (
    <div className="space-y-8">
      {/* Mobile logo */}
      <div className="flex lg:hidden justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white font-bold text-xl">
          D
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Create an Account</h1>
        <p className="text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Details */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Personal Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">First Name</Label>
              <Input name="fName" value={formData.fName} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Last Name</Label>
              <Input name="lName" value={formData.lName} onChange={handleChange} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Email</Label>
            <Input name="email" type="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Password</Label>
            <Input name="password" type="password" value={formData.password} onChange={handleChange} required minLength={6} />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Phone</Label>
            <Input name="phone" value={formData.phone} onChange={handleChange} />
          </div>
        </div>

        {/* Organization Details */}
        <div className="space-y-4 pt-2 border-t">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2">Organization Details</h3>
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Organization Name</Label>
            <Input name="tenantName" value={formData.tenantName} onChange={handleChange} required placeholder="Your Institute Name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Organization Phone</Label>
              <Input name="tenantPhone" value={formData.tenantPhone} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Receipt Prefix</Label>
              <Input name="tenantReceiptPrefix" value={formData.tenantReceiptPrefix} onChange={handleChange} placeholder="e.g., INV" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Organization Address</Label>
            <Input name="tenantAddress" value={formData.tenantAddress} onChange={handleChange} />
          </div>
        </div>

        <Button type="submit" className="w-full h-11 text-sm font-semibold" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? "Creating Account..." : "Create Account"}
        </Button>
      </form>
    </div>
  );
}
