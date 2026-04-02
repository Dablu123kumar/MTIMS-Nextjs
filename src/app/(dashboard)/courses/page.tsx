"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { fetchCourses, fetchCategories, fetchCourseTypes, createCourse, deleteCourse } from "@/store/slices/courseSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, BookOpen } from "lucide-react";

export default function CoursesPage() {
  const dispatch = useAppDispatch();
  const { courses, categories, courseTypes, loading } = useAppSelector((state) => state.courses);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ courseName: "", courseFees: "", courseType: "", numberOfYears: "", category: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchCourses());
    dispatch(fetchCategories());
    dispatch(fetchCourseTypes());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await dispatch(createCourse({ ...form, courseFees: Number(form.courseFees) }));
    if (createCourse.fulfilled.match(result)) {
      setShowAdd(false);
      setForm({ courseName: "", courseFees: "", courseType: "", numberOfYears: "", category: "" });
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Courses</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage course offerings and curriculum</p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Course
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4"><CardTitle className="text-base font-semibold">All Courses ({courses.length})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Name</TableHead>
                <TableHead>Fees</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-12 w-full" /></TableCell></TableRow>
                ))
              ) : courses.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <BookOpen className="h-10 w-10 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">No courses found. Add your first course to get started.</p>
                  </div>
                </TableCell></TableRow>
              ) : (
                courses.map((course: any) => (
                  <TableRow key={course._id}>
                    <TableCell className="font-medium">{course.courseName}</TableCell>
                    <TableCell>{formatCurrency(course.courseFees)}</TableCell>
                    <TableCell>{course.courseType?.courseType || "-"}</TableCell>
                    <TableCell>{course.category?.category || "-"}</TableCell>
                    <TableCell>{course.numberOfYears?.numberOfYears || "-"} yrs</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => dispatch(deleteCourse(course._id))}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Course</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Course Name</Label>
              <Input value={form.courseName} onChange={(e) => setForm((p) => ({ ...p, courseName: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label>Course Fees</Label>
              <Input type="number" value={form.courseFees} onChange={(e) => setForm((p) => ({ ...p, courseFees: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label>Course Type</Label>
              <select value={form.courseType} onChange={(e) => setForm((p) => ({ ...p, courseType: e.target.value }))} required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Select type</option>
                {courseTypes.map((t: any) => <option key={t._id} value={t._id}>{t.courseType}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Select category</option>
                {categories.map((c: any) => <option key={c._id} value={c._id}>{c.category}</option>)}
              </select>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Creating..." : "Create Course"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
