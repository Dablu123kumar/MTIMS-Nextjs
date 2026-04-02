"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarCheck } from "lucide-react";

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/attendance?month=${month}&year=${year}`);
      setAttendance(data.data || []);
    } catch {
      setAttendance([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAttendance();
  }, [month, year]);

  const daysInMonth = new Date(year, month, 0).getDate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Attendance</h1>
          <p className="text-sm text-muted-foreground mt-1">Mark and track student attendance</p>
        </div>
        <div className="flex gap-2">
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2000, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            {Array.from({ length: 5 }, (_, i) => {
              const y = new Date().getFullYear() - 2 + i;
              return <option key={y} value={y}>{y}</option>;
            })}
          </select>
        </div>
      </div>

      {loading ? (
        <Card><CardContent className="p-6 space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent></Card>
      ) : attendance.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <CalendarCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            No attendance records for this month
          </CardContent>
        </Card>
      ) : (
        attendance.map((record: any) => (
          <Card key={record._id}>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <CalendarCheck className="h-5 w-5" />
                {record.type === "BATCH" ? `Batch: ${record.batch?.name || "N/A"}` : "Global Attendance"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 sticky left-0 bg-background">Student</th>
                      {Array.from({ length: daysInMonth }, (_, i) => (
                        <th key={i} className="p-2 text-center min-w-[32px]">{i + 1}</th>
                      ))}
                      <th className="p-2 text-center">P</th>
                      <th className="p-2 text-center">A</th>
                    </tr>
                  </thead>
                  <tbody>
                    {record.students?.map((s: any) => {
                      const days = s.days instanceof Map ? Object.fromEntries(s.days) : s.days || {};
                      const present = Object.values(days).filter((v) => v === "P").length;
                      const absent = Object.values(days).filter((v) => v === "A").length;
                      return (
                        <tr key={s.student?._id || s.student} className="border-b">
                          <td className="p-2 sticky left-0 bg-background font-medium">
                            {s.student?.name || "Student"}
                          </td>
                          {Array.from({ length: daysInMonth }, (_, i) => {
                            const day = (i + 1).toString();
                            const status = days[day];
                            return (
                              <td key={i} className="p-1 text-center">
                                {status === "P" ? (
                                  <span className="inline-block w-6 h-6 rounded bg-green-100 text-green-700 text-xs leading-6">P</span>
                                ) : status === "A" ? (
                                  <span className="inline-block w-6 h-6 rounded bg-red-100 text-red-700 text-xs leading-6">A</span>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </td>
                            );
                          })}
                          <td className="p-2 text-center"><Badge variant="success">{present}</Badge></td>
                          <td className="p-2 text-center"><Badge variant="destructive">{absent}</Badge></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
