import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse, validationErrorResponse } from "@/lib/api-response";
import { verifyOtpSchema } from "@/validations/auth.validation";
import { generateTokenPair, isOTPExpired } from "@/lib/auth";
import { logger } from "@/lib/logger";
import User from "@/models/user.model";
import { sanitizeBody } from "@/lib/sanitize";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = sanitizeBody(await req.json());
    const parsed = verifyOtpSchema.safeParse(body);

    if (!parsed.success) return validationErrorResponse(parsed.error);

    const { email, otp } = parsed.data;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return errorResponse("User not found", 404);

    if (!user.otp || user.otp !== otp) {
      return errorResponse("Invalid OTP", 400);
    }

    if (user.otpExpiresAt && isOTPExpired(user.otpExpiresAt)) {
      return errorResponse("OTP has expired", 400);
    }

    // Mark OTP as verified and clear it
    user.isOtpVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    // Generate JWT token pair
    const tokens = generateTokenPair(
      user._id.toString(),
      user.tenantId.toString(),
      user.role
    );

    logger.info("User authenticated", { userId: user._id.toString(), role: user.role });

    return successResponse({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      // Keep backward compatibility
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
  } catch (error: any) {
    logger.error("Verify OTP error", { error: error.message });
    return errorResponse(error.message || "OTP verification failed", 500);
  }
}
