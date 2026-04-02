"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";

export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Companies</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage associated companies</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base font-semibold">Companies Management</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <Building2 className="h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">No companies found</p>
            <p className="text-xs text-muted-foreground/70">This module is ready for use. Configure your data through the API endpoints.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
