"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import { toggleSidebarCollapsed } from "@/store/slices/uiSlice";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  DollarSign,
  CalendarCheck,
  Layers,
  BookOpen,
  UserCog,
  Settings,
  Mail,
  Building2,
  ClipboardList,
  Receipt,
  ChevronsLeft,
  ChevronsRight,
  FlaskConical,
  Clock,
  FileText,
  BarChart3,
  Wallet,
  Bell,
  Award,
  Tag,
  Shield,
  Hash,
  User,
} from "lucide-react";

interface MenuItem {
  title: string;
  href: string;
  icon: any;
}

interface MenuSection {
  label: string;
  items: MenuItem[];
}

const menuSections: MenuSection[] = [
  {
    label: "MAIN",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "ACADEMICS",
    items: [
      { title: "Students", href: "/students", icon: Users },
      { title: "Courses", href: "/courses", icon: GraduationCap },
      { title: "Batches", href: "/batches", icon: Layers },
      { title: "Subjects", href: "/subjects", icon: BookOpen },
      { title: "Attendance", href: "/attendance", icon: CalendarCheck },
      { title: "Marks", href: "/marks", icon: ClipboardList },
    ],
  },
  {
    label: "FINANCE",
    items: [
      { title: "Fees", href: "/fees", icon: DollarSign },
      { title: "Installments", href: "/installments", icon: Wallet },
      { title: "Day Book", href: "/daybook", icon: Receipt },
      { title: "Receipt Approval", href: "/receipt-approval", icon: Receipt },
    ],
  },
  {
    label: "PEOPLE",
    items: [
      { title: "Teachers", href: "/teachers", icon: UserCog },
      { title: "Trainers", href: "/trainers", icon: UserCog },
      { title: "Companies", href: "/companies", icon: Building2 },
    ],
  },
  {
    label: "MANAGEMENT",
    items: [
      { title: "Student Alerts", href: "/student-alerts", icon: Bell },
      { title: "Completion", href: "/course-completions", icon: Award },
      { title: "Reports", href: "/reports", icon: BarChart3 },
      { title: "Forms", href: "/forms", icon: FileText },
    ],
  },
  {
    label: "CONFIGURATION",
    items: [
      { title: "Batch Categories", href: "/batch-categories", icon: Tag },
      { title: "Labs", href: "/labs", icon: FlaskConical },
      { title: "Timings", href: "/timings", icon: Clock },
      { title: "Email Settings", href: "/email-settings", icon: Mail },
      { title: "Permissions", href: "/rbac", icon: Shield },
      { title: "User Management", href: "/user-management", icon: UserCog },
      { title: "Roll Numbers", href: "/roll-numbers", icon: Hash },
      { title: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { sidebarCollapsed } = useAppSelector((state) => state.ui);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-[#1e1e2d] flex flex-col transition-[width] duration-200 ease-out",
        sidebarCollapsed ? "w-[70px]" : "w-[265px]"
      )}
    >
      {/* Logo */}
      <div className="flex h-[70px] items-center justify-between px-5 shrink-0">
        {!sidebarCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white font-bold text-lg">
              D
            </div>
            <span className="text-[17px] font-bold text-white tracking-wide">DABIMS</span>
          </Link>
        )}
        {sidebarCollapsed && (
          <Link href="/dashboard" className="mx-auto">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white font-bold text-lg">
              D
            </div>
          </Link>
        )}
      </div>

      {/* Separator */}
      <div className="mx-4 h-px bg-white/5 shrink-0" />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto sidebar-scroll px-3 py-4">
        {menuSections.map((section) => (
          <div key={section.label} className="mb-3">
            {/* Section label */}
            {!sidebarCollapsed && (
              <div className="px-3 mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[#636674]">
                  {section.label}
                </span>
              </div>
            )}
            {sidebarCollapsed && <div className="mx-auto w-5 h-px bg-white/10 my-2" />}

            {/* Menu items */}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      prefetch={false}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-150",
                        isActive
                          ? "bg-[#2a2a3c] text-white"
                          : "text-[#9899ac] hover:text-white hover:bg-white/[0.04]",
                        sidebarCollapsed && "justify-center px-0"
                      )}
                      title={sidebarCollapsed ? item.title : undefined}
                    >
                      <item.icon className={cn(
                        "h-[18px] w-[18px] shrink-0 transition-colors",
                        isActive ? "text-primary" : ""
                      )} />
                      {!sidebarCollapsed && <span>{item.title}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="shrink-0 border-t border-white/5 p-3">
        <button
          onClick={() => dispatch(toggleSidebarCollapsed())}
          className="flex w-full items-center justify-center rounded-lg py-2 text-[#636674] hover:text-white hover:bg-white/[0.04] transition-colors"
        >
          {sidebarCollapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}
