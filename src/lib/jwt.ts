import { jwtVerify } from "jose";

export interface JWTPayload {
  userId: string;
  tenantId: string;
  role: string;
}

const secret = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || ""
);

export async function verifyAccessToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}
