import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { verifyRefreshToken, generateTokenPair } from "@/lib/auth";
import { logger } from "@/lib/logger";
import User from "@/models/user.model";
import { sanitizeBody } from "@/lib/sanitize";

export async function POST(req: NextRequest) {
  try {
    const body = sanitizeBody(await req.json());
    const { refreshToken } = body;

    if (!refreshToken) {
      return errorResponse("Refresh token is required", 400);
    }

    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      logger.warn("Invalid refresh token attempt");
      return errorResponse("Invalid or expired refresh token", 401);
    }

    await connectDB();
    const user = await User.findById(payload.userId).select("_id tenantId role isActive").lean();

    if (!user) {
      return errorResponse("User not found", 404);
    }

    if (!(user as any).isActive) {
      return errorResponse("Account is deactivated", 403);
    }

    const tokens = generateTokenPair(
      (user as any)._id.toString(),
      (user as any).tenantId.toString(),
      (user as any).role
    );

    logger.info("Token refreshed", { userId: payload.userId });

    return successResponse({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error: any) {
    logger.error("Token refresh error", { error: error.message });
    return errorResponse("Token refresh failed", 500);
  }
}
