"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { fetchBatches } from "@/store/slices/batchSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Eye, Users } from "lucide-react";

export default function BatchesPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { batches, loading } = useAppSelector((state) => state.batches);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    dispatch(fetchBatches(filter || undefined));
  }, [dispatch, filter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Batches</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage training batches and student groups</p>
        </div>
        <Button onClick={() => router.push("/batches/new")}>
          <Plus className="mr-2 h-4 w-4" /> New Batch
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">All Batches ({batches.length})</CardTitle>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">All</option>
              <option value="inProgress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch Name</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Trainer</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={7}><Skeleton className="h-12 w-full" /></TableCell></TableRow>
                ))
              ) : batches.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="h-10 w-10 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">No batches found. Create your first batch to get started.</p>
                  </div>
                </TableCell></TableRow>
              ) : (
                batches.map((batch: any) => (
                  <TableRow key={batch._id}>
                    <TableCell className="font-medium">{batch.name}</TableCell>
                    <TableCell>{batch.course?.courseName || "-"}</TableCell>
                    <TableCell>{batch.trainer?.trainerName || "-"}</TableCell>
                    <TableCell>{batch.startTime} - {batch.endTime}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {batch.students?.length || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={batch.status === "inProgress" ? "default" : "secondary"}>
                        {batch.status === "inProgress" ? "In Progress" : "Completed"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => router.push(`/batches/${batch._id}`)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
