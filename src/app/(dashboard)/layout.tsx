"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/hooks/useRedux";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);
  const { sidebarCollapsed } = useAppSelector((state) => state.ui);

  useEffect(() => {
    if (!token && !isAuthenticated) {
      router.replace("/login");
    }
  }, [token, isAuthenticated, router]);

  // Render immediately if token exists (user data is persisted in localStorage now).
  // No useEffect + setState cycle that adds a blank frame.
  if (!token && !isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />
      <main
        className={cn(
          "pt-[70px] min-h-screen",
          sidebarCollapsed ? "ml-[70px]" : "ml-[265px]"
        )}
      >
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
