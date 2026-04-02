import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getTenantContext, requireRole, ADMIN_ROLES, tenantFilter } from "@/lib/tenant";
import User from "@/models/user.model";
import { sanitizeBody } from "@/lib/sanitize";

// GET single user
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;

    const { id } = await params;
    const user = await User.findOne(tenantFilter(ctx, { _id: id }))
      .select("-password -otp -otpExpiresAt")
      .lean();

    if (!user) return errorResponse("User not found", 404);
    return successResponse(user);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

// PUT update user
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;

    const roleCheck = requireRole(ctx, ADMIN_ROLES);
    if (roleCheck) return roleCheck;

    const { id } = await params;
    const body = sanitizeBody(await req.json());

    // Don't allow changing tenantId
    delete body.tenantId;
    delete body.password;

    const user = await User.findOneAndUpdate(
      tenantFilter(ctx, { _id: id }),
      body,
      { new: true }
    ).select("-password -otp -otpExpiresAt");

    if (!user) return errorResponse("User not found", 404);
    return successResponse(user);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

// DELETE user
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;

    const roleCheck = requireRole(ctx, ADMIN_ROLES);
    if (roleCheck) return roleCheck;

    const { id } = await params;
    const user = await User.findOneAndDelete(tenantFilter(ctx, { _id: id }));
    if (!user) return errorResponse("User not found", 404);

    return successResponse({ message: "User deleted" });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
