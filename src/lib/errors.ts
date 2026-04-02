import { NextResponse } from "next/server";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || "APP_ERROR";
    this.isOperational = true;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(entity: string, id?: string) {
    super(id ? `${entity} with id '${id}' not found` : `${entity} not found`, 404, "NOT_FOUND");
  }
}

export class ValidationError extends AppError {
  public readonly details?: { field: string; message: string }[];

  constructor(message: string, details?: { field: string; message: string }[]) {
    super(message, 422, "VALIDATION_ERROR");
    this.details = details;
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, "CONFLICT");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden: insufficient permissions") {
    super(message, 403, "FORBIDDEN");
  }
}

/**
 * Centralized error handler for API route catch blocks.
 * Usage: catch (error) { return handleApiError(error); }
 */
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    const body: Record<string, any> = {
      success: false,
      error: error.message,
      code: error.code,
    };
    if (error instanceof ValidationError && error.details) {
      body.details = error.details;
    }
    return NextResponse.json(body, { status: error.statusCode });
  }

  // Mongoose duplicate key error
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as any).code === 11000
  ) {
    return NextResponse.json(
      { success: false, error: "Duplicate entry. This record already exists.", code: "CONFLICT" },
      { status: 409 }
    );
  }

  // Unknown error — don't leak internals
  const message = error instanceof Error ? error.message : "Internal server error";
  return NextResponse.json(
    { success: false, error: message, code: "INTERNAL_ERROR" },
    { status: 500 }
  );
}
