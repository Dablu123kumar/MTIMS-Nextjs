import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { generateOTP, getOTPExpiration } from "@/lib/auth";
import { sendEmail } from "@/lib/mail";
import User from "@/models/user.model";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email } = await req.json();

    if (!email) return errorResponse("Email is required");

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return errorResponse("User not found", 404);

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiresAt = getOTPExpiration();
    await user.save();

    try {
      await sendEmail({
        to: user.email,
        subject: "Your Login OTP - DABIMS",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Login Verification</h2>
            <p>Your new OTP code is:</p>
            <h1 style="color: #2563eb; font-size: 32px; letter-spacing: 8px;">${otp}</h1>
            <p>This code expires in 5 minutes.</p>
          </div>
        `,
      });
    } catch {
      console.error("Failed to send OTP email");
    }

    return successResponse({ message: "OTP resent successfully" });
  } catch (error: any) {
    return errorResponse(error.message || "Failed to resend OTP", 500);
  }
}
