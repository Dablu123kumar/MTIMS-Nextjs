import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse, validationErrorResponse } from "@/lib/api-response";
import { registerSchema } from "@/validations/auth.validation";
import User from "@/models/user.model";
import Tenant from "@/models/tenant.model";
import { sanitizeBody } from "@/lib/sanitize";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = sanitizeBody(await req.json());
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) return validationErrorResponse(parsed.error);

    const { fName, lName, email, password, phone, tenantName, tenantSlug, tenantPhone, tenantAddress, tenantReceiptPrefix } = parsed.data;

    // Check if this is a new tenant registration
    if (tenantName) {
      // Create new tenant (organization)
      const slug = tenantSlug || tenantName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

      const existingTenant = await Tenant.findOne({ slug });
      if (existingTenant) {
        return errorResponse("Organization name already taken", 409);
      }

      // Check if email already exists as an owner
      const existingOwner = await User.findOne({ email: email.toLowerCase() });
      if (existingOwner) {
        return errorResponse("Email already registered", 409);
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // Create tenant first with a placeholder owner
      const tenant = await Tenant.create({
        name: tenantName,
        slug,
        email,
        phone: tenantPhone || phone || "",
        address: tenantAddress || "",
        receiptPrefix: tenantReceiptPrefix || slug.toUpperCase().slice(0, 4),
        ownerId: "000000000000000000000000", // placeholder
      });

      // Create owner user
      const user = await User.create({
        fName,
        lName,
        email: email.toLowerCase(),
        password: hashedPassword,
        phone,
        role: "Owner",
        tenantId: tenant._id,
      });

      // Update tenant with actual owner
      tenant.ownerId = user._id;
      await tenant.save();

      return successResponse(
        { message: "Registration successful. Please login.", tenantId: tenant._id },
        201
      );
    }

    // Joining an existing tenant (by invite - needs tenantId in body)
    const { tenantId } = body;
    if (!tenantId) {
      return errorResponse("Organization name is required for new registration, or tenantId to join existing");
    }

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) return errorResponse("Organization not found", 404);

    const existingUser = await User.findOne({ email: email.toLowerCase(), tenantId });
    if (existingUser) return errorResponse("Email already registered in this organization", 409);

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      fName,
      lName,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      role: "Student",
      tenantId,
    });

    return successResponse({ message: "Registration successful. Please login." }, 201);
  } catch (error: any) {
    console.error("Register error:", error);
    return errorResponse(error.message || "Registration failed", 500);
  }
}
