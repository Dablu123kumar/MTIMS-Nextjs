/**
 * NoSQL injection prevention.
 * Recursively strips MongoDB operators ($-prefixed keys) and dot-notation keys
 * from untrusted input before it reaches Mongoose/Zod.
 */

export function sanitizeInput(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitizeInput);
  }

  if (typeof obj === "object" && !(obj instanceof Date)) {
    const clean: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      // Strip keys starting with $ (MongoDB operators like $ne, $gt, $regex, $where)
      if (key.startsWith("$")) continue;
      // Strip keys containing . (path traversal in MongoDB)
      if (key.includes(".")) continue;
      clean[key] = sanitizeInput(value);
    }
    return clean;
  }

  return obj;
}

/**
 * Convenience wrapper: sanitize a request body object.
 * Usage: const body = sanitizeBody(await req.json());
 */
export function sanitizeBody<T extends Record<string, any>>(body: T): T {
  return sanitizeInput(body) as T;
}
