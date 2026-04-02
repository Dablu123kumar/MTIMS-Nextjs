import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse, validationErrorResponse } from "@/lib/api-response";
import { getTenantContext, requireRole, ADMIN_ROLES, tenantFilter } from "@/lib/tenant";
import { createUserSchema } from "@/validations/auth.validation";
import User from "@/models/user.model";
import { sanitizeBody } from "@/lib/sanitize";

// GET all users for tenant
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;

    const users = await User.find(tenantFilter(ctx))
      .select("-password -otp -otpExpiresAt")
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(users);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

// POST create new user (admin only)
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const ctx = await getTenantContext(req);
    if (ctx instanceof Response) return ctx;

    const roleCheck = requireRole(ctx, ADMIN_ROLES);
    if (roleCheck) return roleCheck;

    const body = sanitizeBody(await req.json());
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const { fName, lName, email, password, phone, role } = parsed.data;

    const existing = await User.findOne({ email: email.toLowerCase(), tenantId: ctx.tenantId });
    if (existing) return errorResponse("User with this email already exists", 409);

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      fName,
      lName,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      role,
      tenantId: ctx.tenantId,
    });

    const userObj = user.toObject();
    delete userObj.password;

    return successResponse(userObj, 201);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
