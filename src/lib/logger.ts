/**
 * Structured logger.
 *
 * In production: uses Pino for high-performance structured JSON logging.
 * In development/Edge: uses console-based logger (zero startup overhead).
 *
 * The key insight: Pino with pino-pretty transport spins up a worker thread
 * on initialization, adding 2-5 seconds to cold API route compilation in dev.
 * Console is instant and good enough for development.
 */

type LogMeta = Record<string, any>;

interface Logger {
  debug(msg: string, meta?: LogMeta): void;
  debug(meta: LogMeta, msg: string): void;
  info(msg: string, meta?: LogMeta): void;
  info(meta: LogMeta, msg: string): void;
  warn(msg: string, meta?: LogMeta): void;
  warn(meta: LogMeta, msg: string): void;
  error(msg: string, meta?: LogMeta): void;
  error(meta: LogMeta, msg: string): void;
  child(bindings: LogMeta): Logger;
}

type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVELS: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

const REDACT_KEYS = new Set([
  "password", "otp", "token", "accessToken", "refreshToken",
  "authorization", "secret", "SMTP_PASSWORD",
]);

function redactMeta(meta: LogMeta): LogMeta {
  const clean: LogMeta = {};
  for (const [key, value] of Object.entries(meta)) {
    if (REDACT_KEYS.has(key)) {
      clean[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null && !(value instanceof Error) && !(value instanceof Date)) {
      clean[key] = redactMeta(value as LogMeta);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

function resolveArgs(a: any, b?: any): { msg: string; meta?: LogMeta } {
  if (typeof a === "string") return { msg: a, meta: b };
  if (typeof b === "string") return { msg: b, meta: a };
  return { msg: String(a), meta: undefined };
}

function createConsoleLogger(): Logger {
  const currentLevel = (): number => {
    const level = (process.env.LOG_LEVEL || "info") as LogLevel;
    return LOG_LEVELS[level] ?? LOG_LEVELS.info;
  };

  const log = (level: LogLevel, consoleFn: (...args: any[]) => void, a: any, b?: any) => {
    if (currentLevel() > LOG_LEVELS[level]) return;
    const { msg, meta } = resolveArgs(a, b);
    const ts = new Date().toISOString();
    if (meta) {
      consoleFn(`[${ts}] [${level.toUpperCase()}] ${msg}`, redactMeta(meta));
    } else {
      consoleFn(`[${ts}] [${level.toUpperCase()}] ${msg}`);
    }
  };

  const self: Logger = {
    debug: (a: any, b?: any) => log("debug", console.debug, a, b),
    info: (a: any, b?: any) => log("info", console.info, a, b),
    warn: (a: any, b?: any) => log("warn", console.warn, a, b),
    error: (a: any, b?: any) => log("error", console.error, a, b),
    child: () => self,
  };
  return self;
}

// Lazy Pino — only created when actually used in production
let _pinoLogger: Logger | null = null;

function getPinoLogger(): Logger {
  if (_pinoLogger) return _pinoLogger;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pino = require("pino");
    _pinoLogger = pino({
      level: process.env.LOG_LEVEL || "info",
      timestamp: pino.stdTimeFunctions.isoTime,
      redact: {
        paths: [
          "password", "otp", "token", "accessToken", "refreshToken",
          "authorization", "req.headers.authorization",
          "*.password", "*.otp", "*.token",
        ],
        censor: "[REDACTED]",
      },
    });
    return _pinoLogger!;
  } catch {
    // Pino not available (e.g., edge runtime) — fallback
    _pinoLogger = createConsoleLogger();
    return _pinoLogger;
  }
}

// In development or Edge: console logger (instant startup, zero overhead)
// In production: Pino (structured JSON, high performance)
const isEdge = typeof (globalThis as any).EdgeRuntime === "string";
const isDev = process.env.NODE_ENV !== "production";

export const logger: Logger = (isEdge || isDev)
  ? createConsoleLogger()
  : getPinoLogger();

/**
 * Generate a correlation ID for request tracing.
 */
export function generateCorrelationId(): string {
  return crypto.randomUUID();
}
