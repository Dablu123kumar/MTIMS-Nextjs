"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { fetchFees } from "@/store/slices/feesSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Receipt } from "lucide-react";

export default function FeesPage() {
  const dispatch = useAppDispatch();
  const { fees, loading, total, page, totalPages } = useAppSelector((state) => state.fees);

  useEffect(() => {
    dispatch(fetchFees({}));
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Fee Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Track payments and outstanding fees</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Receipt className="h-5 w-5" /> Payment Records ({total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt No</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Amount Paid</TableHead>
                <TableHead>Remaining</TableHead>
                <TableHead>Payment Mode</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Late Fees</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={8}><Skeleton className="h-12 w-full" /></TableCell></TableRow>
                ))
              ) : fees.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <DollarSign className="h-10 w-10 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">No fee records found. Payments will appear here once recorded.</p>
                  </div>
                </TableCell></TableRow>
              ) : (
                fees.map((fee: any) => (
                  <TableRow key={fee._id}>
                    <TableCell className="font-medium">{fee.receiptNumber}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{fee.studentInfo?.name || "N/A"}</p>
                        <p className="text-xs text-muted-foreground">#{fee.studentInfo?.rollNumber}</p>
                      </div>
                    </TableCell>
                    <TableCell>{fee.courseName?.courseName || "N/A"}</TableCell>
                    <TableCell className="font-medium text-green-600">{formatCurrency(fee.amountPaid)}</TableCell>
                    <TableCell className="text-red-600">{formatCurrency(fee.remainingFees)}</TableCell>
                    <TableCell>{fee.paymentOption?.name || "Cash"}</TableCell>
                    <TableCell>{formatDate(fee.amountDate || fee.createdAt)}</TableCell>
                    <TableCell>
                      {fee.lateFees > 0 ? (
                        <Badge variant="warning">{formatCurrency(fee.lateFees)}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => dispatch(fetchFees({ page: page - 1 }))}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => dispatch(fetchFees({ page: page + 1 }))}>Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
