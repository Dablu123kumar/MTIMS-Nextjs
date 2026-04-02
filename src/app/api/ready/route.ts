import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";

export async function GET() {
  const checks: Record<string, any> = {};

  // Check MongoDB connection
  try {
    await connectDB();
    const start = Date.now();
    await mongoose.connection.db!.admin().ping();
    checks.db = { status: "connected", latencyMs: Date.now() - start };
  } catch {
    checks.db = { status: "disconnected" };
    return NextResponse.json(
      { status: "not_ready", checks },
      { status: 503 }
    );
  }

  // Check memory usage
  const mem = process.memoryUsage();
  const heapUsedMB = Math.round(mem.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(mem.heapTotal / 1024 / 1024);
  const rssMB = Math.round(mem.rss / 1024 / 1024);
  const memoryThreshold = 512; // MB

  checks.memory = {
    heapUsedMB,
    heapTotalMB,
    rssMB,
    status: rssMB < memoryThreshold ? "ok" : "warning",
  };

  const overallStatus = checks.db.status === "connected" ? "ready" : "not_ready";

  return NextResponse.json(
    { status: overallStatus, checks },
    { status: overallStatus === "ready" ? 200 : 503 }
  );
}
