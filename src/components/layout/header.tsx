"use client";

import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import { logout } from "@/store/slices/authSlice";
import { toggleSidebar } from "@/store/slices/uiSlice";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Bell, LogOut, Settings, User, Menu, Sun, Moon, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

function getBreadcrumb(pathname: string): { label: string; parent?: string } {
  const segments = pathname.split("/").filter(Boolean);
  const page = segments[0] || "dashboard";
  const labels: Record<string, string> = {
    dashboard: "Dashboard",
    students: "Students",
    courses: "Courses",
    fees: "Fee Management",
    batches: "Batches",
    attendance: "Attendance",
    subjects: "Subjects",
    marks: "Marks",
    teachers: "Teachers",
    trainers: "Trainers",
    labs: "Labs",
    timings: "Timings",
    daybook: "Day Book",
    companies: "Companies",
    forms: "Forms",
    reports: "Reports",
    "email-settings": "Email Settings",
    "receipt-approval": "Receipt Approval",
    "user-management": "User Management",
    settings: "Settings",
    installments: "Installments",
    "student-alerts": "Student Alerts",
    "course-completions": "Course Completion",
    "batch-categories": "Batch Categories",
    rbac: "Permissions",
    profile: "My Profile",
    "roll-numbers": "Roll Numbers",
  };
  return { label: labels[page] || page, parent: page !== "dashboard" ? "Home" : undefined };
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { theme, setTheme } = useTheme();
  const { user } = useAppSelector((state) => state.auth);
  const { sidebarCollapsed } = useAppSelector((state) => state.ui);

  const breadcrumb = getBreadcrumb(pathname);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  return (
    <header
      className={cn(
        "fixed top-0 z-30 flex h-[70px] items-center justify-between bg-card shadow-toolbar px-6",
        sidebarCollapsed ? "left-[70px]" : "left-[265px]",
        "right-0"
      )}
    >
      {/* Left: Breadcrumb */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => dispatch(toggleSidebar())}>
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2 text-sm">
          {breadcrumb.parent && (
            <>
              <span className="text-muted-foreground">{breadcrumb.parent}</span>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
            </>
          )}
          <span className="font-semibold text-foreground">{breadcrumb.label}</span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-lg text-muted-foreground hover:text-foreground"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-[18px] w-[18px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[18px] w-[18px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg text-muted-foreground hover:text-foreground relative">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-primary" />
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-3 h-10 px-2 rounded-lg hover:bg-accent">
              <Avatar size="sm" className="bg-primary/10 text-primary">
                <AvatarFallback>{user?.fName?.[0]}{user?.lName?.[0]}</AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-semibold leading-tight">
                  {user?.fName} {user?.lName}
                </span>
                <span className="text-[11px] text-muted-foreground leading-tight">
                  {user?.role}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 shadow-dropdown">
            <DropdownMenuLabel className="p-4">
              <div className="flex items-center gap-3">
                <Avatar className="bg-primary/10 text-primary">
                  <AvatarFallback>{user?.fName?.[0]}{user?.lName?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold">{user?.fName} {user?.lName}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  <Badge variant="info" className="w-fit text-[10px] px-1.5 py-0">
                    {user?.role}
                  </Badge>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/profile")} className="py-2.5 px-4 cursor-pointer">
              <User className="mr-3 h-4 w-4 text-muted-foreground" />
              My Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/settings")} className="py-2.5 px-4 cursor-pointer">
              <Settings className="mr-3 h-4 w-4 text-muted-foreground" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="py-2.5 px-4 cursor-pointer text-destructive focus:text-destructive">
              <LogOut className="mr-3 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
