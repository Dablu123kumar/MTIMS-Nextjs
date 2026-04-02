"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { fetchDashboardStats } from "@/store/slices/dashboardSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Users, GraduationCap, DollarSign, Layers, TrendingUp, TrendingDown, UserX, Clock, ArrowUpRight, ArrowRight } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { stats, loading } = useAppSelector((state) => state.dashboard);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  if (loading || !stats) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-24 rounded-xl" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const statCards = [
    {
      title: "Total Students",
      value: stats.students.total,
      description: `${stats.students.active} active students`,
      icon: Users,
      accent: "border-l-primary",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      title: "Total Courses",
      value: stats.courses.total,
      description: "Courses available",
      icon: GraduationCap,
      accent: "border-l-success",
      iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Fees Collected",
      value: formatCurrency(stats.fees.totalCollected),
      description: `${formatCurrency(stats.fees.totalPending)} pending`,
      icon: DollarSign,
      accent: "border-l-warning",
      iconBg: "bg-amber-50 dark:bg-amber-500/10",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
    {
      title: "Active Batches",
      value: stats.batches.active,
      description: `${stats.batches.total} total batches`,
      icon: Layers,
      accent: "border-l-info",
      iconBg: "bg-sky-50 dark:bg-sky-500/10",
      iconColor: "text-sky-600 dark:text-sky-400",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <Card className="border-0 bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">
                {greeting()}, {user?.fName}!
              </h1>
              <p className="text-white/80 text-sm">
                Here&apos;s what&apos;s happening with your institute today.
              </p>
            </div>
            <div className="hidden md:block">
              <Button
                variant="secondary"
                className="bg-white/20 text-white border-white/20 hover:bg-white/30"
                onClick={() => router.push("/students/admission")}
              >
                New Admission <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stat Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className={`border-l-4 ${stat.accent}`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </div>
                <div className={`rounded-xl p-3 ${stat.iconBg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="rounded-xl p-3 bg-red-50 dark:bg-red-500/10">
              <UserX className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Drop-outs</p>
              <p className="text-xl font-bold">{stats.students.dropOut}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="rounded-xl p-3 bg-orange-50 dark:bg-orange-500/10">
              <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pending Fees</p>
              <p className="text-xl font-bold">{stats.fees.studentsPendingFees} students</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="rounded-xl p-3 bg-yellow-50 dark:bg-yellow-500/10">
              <TrendingDown className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Late Fees</p>
              <p className="text-xl font-bold">{formatCurrency(stats.fees.totalLateFees)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Students & Monthly Collection */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Recent Admissions</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary text-xs" onClick={() => router.push("/students")}>
              View All <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentStudents?.map((student: any) => (
                <div key={student._id} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                      {student.name?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-[11px] font-mono">#{student.rollNumber}</Badge>
                    <p className="text-[11px] text-muted-foreground mt-1">{formatDate(student.createdAt)}</p>
                  </div>
                </div>
              ))}
              {(!stats.recentStudents || stats.recentStudents.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-8">No recent admissions</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Monthly Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.monthlyCollection?.map((month: any) => {
                const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                return (
                  <div key={`${month._id.year}-${month._id.month}`} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10">
                        <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span className="text-sm font-semibold">
                        {monthNames[month._id.month]} {month._id.year}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{formatCurrency(month.total)}</p>
                      <p className="text-[11px] text-muted-foreground">{month.count} payments</p>
                    </div>
                  </div>
                );
              })}
              {(!stats.monthlyCollection || stats.monthlyCollection.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-8">No collection data yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
