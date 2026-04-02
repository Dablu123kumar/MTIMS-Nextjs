"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle, XCircle, Receipt } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReceiptApprovalPage() {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchApprovals = async (p = page) => {
    setLoading(true);
    try {
      let url = `/api/approvals?page=${p}&limit=10`;
      if (statusFilter) url += `&status=${statusFilter}`;
      const { data } = await api.get(url);
      setApprovals(data.data.approvals);
      setTotal(data.data.total);
      setTotalPages(data.data.totalPages);
      setPage(data.data.page);
    } catch { setApprovals([]); }
    setLoading(false);
  };

  useEffect(() => { fetchApprovals(1); }, [statusFilter]);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await api.put(`/api/approvals/${id}`, { status, check: status === "Approved" });
      fetchApprovals();
    } catch {}
  };

  const statusBadge = (status: string) => {
    if (status === "Approved") return "success";
    if (status === "Rejected") return "destructive";
    return "warning";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Receipt Approval</h1>
          <p className="text-sm text-muted-foreground mt-1">Review and approve receipts</p>
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base font-semibold">Receipts ({total})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Receipt No</TableHead>
                <TableHead>Amount Paid</TableHead>
                <TableHead>Remaining</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} className="py-4"><div className="space-y-2"><Skeleton className="h-12 w-full rounded-lg" /><Skeleton className="h-12 w-full rounded-lg" /><Skeleton className="h-12 w-full rounded-lg" /><Skeleton className="h-12 w-full rounded-lg" /></div></TableCell></TableRow>
              ) : approvals.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-12"><div className="flex flex-col items-center gap-2"><Receipt className="h-10 w-10 text-muted-foreground/50" /><p className="text-sm font-medium text-muted-foreground">No receipts found</p><p className="text-xs text-muted-foreground/70">Receipts pending approval will appear here</p></div></TableCell></TableRow>
              ) : (
                approvals.map((a, i) => (
                  <TableRow key={a._id}>
                    <TableCell>{(page - 1) * 10 + i + 1}</TableCell>
                    <TableCell className="font-medium">{a.studentId?.name || a.receipt?.studentInfo?.name || "-"}</TableCell>
                    <TableCell>{a.receipt?.receiptNumber || "-"}</TableCell>
                    <TableCell className="text-green-600">{formatCurrency(a.receipt?.amountPaid || 0)}</TableCell>
                    <TableCell className="text-red-600">{formatCurrency(a.receipt?.remainingFees || 0)}</TableCell>
                    <TableCell className="text-muted-foreground">{a.receipt?.amountDate ? new Date(a.receipt.amountDate).toLocaleDateString() : "-"}</TableCell>
                    <TableCell><Badge variant={statusBadge(a.status) as any}>{a.status || "Pending"}</Badge></TableCell>
                    <TableCell className="text-right">
                      {(!a.status || a.status === "Pending") && (
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleStatusUpdate(a._id, "Approved")} title="Approve">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleStatusUpdate(a._id, "Rejected")} title="Reject">
                            <XCircle className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">Page {page} of {totalPages} ({total} receipts)</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => fetchApprovals(page - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => fetchApprovals(page + 1)}>Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
