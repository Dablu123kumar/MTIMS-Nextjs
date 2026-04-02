import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse, validationErrorResponse } from "@/lib/api-response";
import { loginSchema } from "@/validations/auth.validation";
import { generateTokenPair, generateOTP, getOTPExpiration } from "@/lib/auth";
import { logger } from "@/lib/logger";
import User from "@/models/user.model";
import { sanitizeBody } from "@/lib/sanitize";

export async function POST(req: NextRequest) {
  try {
    const [body] = await Promise.all([
      req.json().then(sanitizeBody),
      connectDB(),
    ]);

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const { email, password } = parsed.data;

    // Use lean() for faster query — returns plain object
    // Select only the fields we need + password for comparison
    const user = await User.findOne({ email: email.toLowerCase() })
      .select("_id fName lName email phone role tenantId isActive password otp otpExpiresAt isOtpVerified")
      .lean() as any;

    if (!user) return errorResponse("Invalid email or password", 401);
    if (!user.isActive) return errorResponse("Account is deactivated", 403);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return errorResponse("Invalid email or password", 401);

    const isDev = process.env.NODE_ENV === "development";

    if (isDev) {
      // Dev mode: skip OTP, return tokens directly
      // Use updateOne instead of save() to avoid fetching full document
      User.updateOne(
        { _id: user._id },
        { $set: { isOtpVerified: true }, $unset: { otp: 1, otpExpiresAt: 1 } }
      ).exec(); // Fire-and-forget — don't await, not critical for login response

      const tokens = generateTokenPair(
        user._id.toString(),
        user.tenantId.toString(),
        user.role
      );

      logger.info({ userId: user._id.toString() }, "Dev mode: direct login");

      return successResponse({
        skipOtp: true,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        token: tokens.accessToken,
        user: {
          _id: user._id,
          fName: user.fName,
          lName: user.lName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          tenantId: user.tenantId,
        },
      });
    }

    // Production: generate and send OTP
    const otp = generateOTP();

    // Update user with OTP — fire-and-forget the DB write
    const otpExpiry = getOTPExpiration();
    User.updateOne(
      { _id: user._id },
      { $set: { otp, otpExpiresAt: otpExpiry, isOtpVerified: false } }
    ).exec(); // Don't await — send response faster

    // Send OTP email in background (don't block response)
    import("@/lib/mail").then(({ sendEmail }) => {
      sendEmail({
        to: user.email,
        subject: "Your Login OTP - DABIMS",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Login Verification</h2>
            <p>Your OTP code is:</p>
            <h1 style="color: #2563eb; font-size: 32px; letter-spacing: 8px;">${otp}</h1>
            <p>This code expires in 5 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        `,
      }).catch(() => {
        logger.error({ email: user.email }, "Failed to send OTP email");
      });
    });

    return successResponse({
      skipOtp: false,
      message: "OTP sent to your email",
      email: user.email,
      requireOtp: true,
    });
  } catch (error: any) {
    logger.error({ err: error.message }, "Login error");
    return errorResponse(error.message || "Login failed", 500);
  }
}
