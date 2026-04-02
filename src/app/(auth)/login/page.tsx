"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { login, verifyOtp, clearError } from "@/store/slices/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error, otpSent, otpEmail } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  // Prefetch dashboard so navigation is instant after login
  useEffect(() => {
    router.prefetch("/dashboard");
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result) && result.payload.skipOtp) {
      router.replace("/dashboard");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(verifyOtp({ email: otpEmail!, otp }));
    if (verifyOtp.fulfilled.match(result)) {
      router.replace("/dashboard");
    }
  };

  if (otpSent) {
    return (
      <div className="space-y-8">
        {/* Mobile logo */}
        <div className="flex lg:hidden justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white font-bold text-xl">
            D
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Verify OTP</h1>
          <p className="text-muted-foreground">Enter the verification code sent to <span className="font-medium text-foreground">{otpEmail}</span></p>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleVerifyOtp} className="space-y-5">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">OTP Code</Label>
            <Input
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="text-center text-lg tracking-[0.5em] h-12"
            />
          </div>
          <Button type="submit" className="w-full h-11 text-sm font-semibold" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Verifying..." : "Verify & Sign In"}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Mobile logo */}
      <div className="flex lg:hidden justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white font-bold text-xl">
          D
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Sign In</h1>
        <p className="text-muted-foreground">
          New here?{" "}
          <Link href="/register" className="text-primary font-semibold hover:underline">
            Create an Account
          </Link>
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Email</Label>
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12"
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">Password</Label>
            <Link href="/forgot-password" className="text-sm text-primary hover:underline font-medium">
              Forgot Password?
            </Link>
          </div>
          <Input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12"
            required
          />
        </div>

        <Button type="submit" className="w-full h-11 text-sm font-semibold" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </div>
  );
}
