"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail } from "lucide-react";

export default function EmailSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reminders, setReminders] = useState({ firstReminder: "", thirdReminder: "" });
  const [dates, setDates] = useState({ firstDueDay: 9, secondDueDay: 15, thirdDueDay: 20 });
  const [templates, setTemplates] = useState({ customTemplate: "", cancellationTemplate: "", dynamicTemplate: "", courseSubjectTemplate: "", courseChangeTemplate: "" });
  const [logs, setLogs] = useState<any[]>([]);
  const [logPage, setLogPage] = useState(1);
  const [logTotalPages, setLogTotalPages] = useState(1);
  const [logTotal, setLogTotal] = useState(0);
  const [activeTab, setActiveTab] = useState<"settings" | "logs">("settings");

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/email-settings");
      if (data.data.reminders) setReminders(data.data.reminders);
      if (data.data.reminderDates) setDates(data.data.reminderDates);
      if (data.data.templates) setTemplates(data.data.templates);
    } catch {}
    setLoading(false);
  };

  const fetchLogs = async (p = logPage) => {
    try {
      const { data } = await api.get(`/api/email-settings?section=logs&page=${p}&limit=10`);
      setLogs(data.data.logs);
      setLogTotal(data.data.total);
      setLogTotalPages(data.data.totalPages);
      setLogPage(data.data.page);
    } catch { setLogs([]); }
  };

  useEffect(() => { fetchSettings(); }, []);
  useEffect(() => { if (activeTab === "logs") fetchLogs(1); }, [activeTab]);

  const saveSection = async (section: string, payload: any) => {
    setSaving(true);
    try {
      await api.post("/api/email-settings", { section, ...payload });
    } catch {}
    setSaving(false);
  };

  if (loading) return <div className="space-y-6"><div><h1 className="text-2xl font-bold">Email Settings</h1><p className="text-sm text-muted-foreground mt-1">Configure email templates and reminders</p></div><div className="space-y-2"><Skeleton className="h-12 w-full rounded-lg" /><Skeleton className="h-12 w-full rounded-lg" /><Skeleton className="h-12 w-full rounded-lg" /><Skeleton className="h-12 w-full rounded-lg" /></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Email Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure email templates and reminders</p>
        </div>
        <div className="flex gap-2">
          <Button variant={activeTab === "settings" ? "default" : "outline"} size="sm" onClick={() => setActiveTab("settings")}>Settings</Button>
          <Button variant={activeTab === "logs" ? "default" : "outline"} size="sm" onClick={() => setActiveTab("logs")}>Email Logs ({logTotal})</Button>
        </div>
      </div>

      {activeTab === "settings" ? (
        <div className="grid gap-6">
          {/* Reminder Messages */}
          <Card>
            <CardHeader><CardTitle className="text-base font-semibold">Reminder Messages</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>First Reminder Message</Label><Input value={reminders.firstReminder} onChange={(e) => setReminders((p) => ({ ...p, firstReminder: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Third Reminder Message</Label><Input value={reminders.thirdReminder} onChange={(e) => setReminders((p) => ({ ...p, thirdReminder: e.target.value }))} /></div>
              <Button disabled={saving} onClick={() => saveSection("reminders", reminders)}>{saving ? "Saving..." : "Save Reminders"}</Button>
            </CardContent>
          </Card>

          {/* Due Days */}
          <Card>
            <CardHeader><CardTitle className="text-base font-semibold">Reminder Due Days</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label>1st Due Day</Label><Input type="number" value={dates.firstDueDay} onChange={(e) => setDates((p) => ({ ...p, firstDueDay: Number(e.target.value) }))} /></div>
                <div className="space-y-2"><Label>2nd Due Day</Label><Input type="number" value={dates.secondDueDay} onChange={(e) => setDates((p) => ({ ...p, secondDueDay: Number(e.target.value) }))} /></div>
                <div className="space-y-2"><Label>3rd Due Day</Label><Input type="number" value={dates.thirdDueDay} onChange={(e) => setDates((p) => ({ ...p, thirdDueDay: Number(e.target.value) }))} /></div>
              </div>
              <Button disabled={saving} onClick={() => saveSection("dates", dates)}>{saving ? "Saving..." : "Save Due Days"}</Button>
            </CardContent>
          </Card>

          {/* Templates */}
          <Card>
            <CardHeader><CardTitle className="text-base font-semibold">Email Templates</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Custom Template</Label><Input value={templates.customTemplate} onChange={(e) => setTemplates((p) => ({ ...p, customTemplate: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Cancellation Template</Label><Input value={templates.cancellationTemplate} onChange={(e) => setTemplates((p) => ({ ...p, cancellationTemplate: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Dynamic Template</Label><Input value={templates.dynamicTemplate} onChange={(e) => setTemplates((p) => ({ ...p, dynamicTemplate: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Course Subject Template</Label><Input value={templates.courseSubjectTemplate} onChange={(e) => setTemplates((p) => ({ ...p, courseSubjectTemplate: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Course Change Template</Label><Input value={templates.courseChangeTemplate} onChange={(e) => setTemplates((p) => ({ ...p, courseChangeTemplate: e.target.value }))} /></div>
              <Button disabled={saving} onClick={() => saveSection("templates", templates)}>{saving ? "Saving..." : "Save Templates"}</Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader><CardTitle className="text-base font-semibold">Email Logs</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead>Sent By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-12"><div className="flex flex-col items-center gap-2"><Mail className="h-10 w-10 text-muted-foreground/50" /><p className="text-sm font-medium text-muted-foreground">No email logs found</p><p className="text-xs text-muted-foreground/70">Email logs will appear here once emails are sent</p></div></TableCell></TableRow>
                ) : (
                  logs.map((log, i) => (
                    <TableRow key={log._id}>
                      <TableCell>{(logPage - 1) * 10 + i + 1}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{log.recipientEmails?.join(", ")}</TableCell>
                      <TableCell className="font-medium">{log.subject}</TableCell>
                      <TableCell className="text-muted-foreground">{new Date(log.sentAt).toLocaleString()}</TableCell>
                      <TableCell>{log.sentBy}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {logTotalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">Page {logPage} of {logTotalPages} ({logTotal} logs)</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={logPage <= 1} onClick={() => fetchLogs(logPage - 1)}>Previous</Button>
                  <Button variant="outline" size="sm" disabled={logPage >= logTotalPages} onClick={() => fetchLogs(logPage + 1)}>Next</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
