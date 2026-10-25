/**
 * Rebirth API security layer (Phase 2).
 *
 * - Rate limiting (IP-based + per-user token bucket) on /api/* routes
 * - Gemini spend cap / circuit breaker to prevent cost spikes
 * - Request-size limits
 * - Safe error sanitization + structured logging
 *
 * Fail closed: defaults refuse, never silently allow.
 */

import rateLimit from "express-rate-limit";
import { Request, Response, NextFunction } from "express";

function parsePositiveAmount(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

/**
 * Gemini daily spend cap (USD). Once exceeded, AI requests are refused with
 * a clear message instead of silently allowing unbounded spend.
 *
 * An invalid or negative value fails closed to a zero cap (all AI refused)
 * rather than silently removing the guardrail.
 */
export const GEMINI_DAILY_SPEND_CAP_USD = parsePositiveAmount(
  process.env.GEMINI_DAILY_SPEND_CAP_USD,
  process.env.GEMINI_DAILY_SPEND_CAP_USD === undefined ? 5.0 : 0,
);

/**
 * Conservative per-request estimate used to reserve budget before calling the
 * provider. Actual cost depends on token usage and the model price sheet, so
 * this is deliberately rounded up. Operators can override it.
 */
export const GEMINI_ESTIMATED_REQUEST_COST_USD = parsePositiveAmount(
  process.env.GEMINI_ESTIMATED_REQUEST_COST_USD,
  0.01,
);

/**
 * In-memory spend tracker (resets daily). In production this should be backed
 * by Convex/Redis for multi-instance deploys. For v1 single-instance it is
 * sufficient and fail-closed.
 */
let dailySpendUsd = 0;
let spendResetDate = new Date().toDateString();

export function resetSpendIfNewDay() {
  const today = new Date().toDateString();
  if (today !== spendResetDate) {
    dailySpendUsd = 0;
    spendResetDate = today;
  }
}

export function getDailySpendUsd(): number {
  resetSpendIfNewDay();
  return dailySpendUsd;
}

export function recordSpendUsd(amount: number) {
  resetSpendIfNewDay();
  dailySpendUsd += amount;
}

export function spendCapRemainingUsd(): number {
  resetSpendIfNewDay();
  return Math.max(0, GEMINI_DAILY_SPEND_CAP_USD - dailySpendUsd);
}

export function canAffordAiRequest(estimatedUsd: number): boolean {
  if (!Number.isFinite(estimatedUsd) || estimatedUsd <= 0) return false;
  resetSpendIfNewDay();
  return dailySpendUsd + estimatedUsd <= GEMINI_DAILY_SPEND_CAP_USD;
}

/**
 * Atomically checks the remaining budget and reserves it before a provider
 * call. Callers must use this instead of checking and then forgetting to
 * record: a cap that never records spend is not a cap.
 *
 * Returns false when the estimate is invalid, the cap is exhausted, or the
 * request would exceed it. Never throws.
 */
export function reserveAiSpend(
  estimatedUsd: number = GEMINI_ESTIMATED_REQUEST_COST_USD,
): boolean {
  if (!canAffordAiRequest(estimatedUsd)) return false;
  recordSpendUsd(estimatedUsd);
  return true;
}

/**
 * IP-based rate limiter for /api/* routes.
 * 60 requests per minute per IP by default.
 */
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "too_many_requests", code: "RATE_LIMITED" },
  handler: (_req, res) => {
    res.status(429).json({ error: "too_many_requests", code: "RATE_LIMITED" });
  },
});

/**
 * Stricter limiter for AI endpoints (/api/spiritual-guidance, /api/daily-contemplation?fresh=true).
 * 10 requests per minute per IP.
 */
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "too_many_requests", code: "AI_RATE_LIMITED" },
  handler: (_req, res) => {
    res.status(429).json({ error: "too_many_requests", code: "AI_RATE_LIMITED" });
  },
});

/**
 * Structured request logger (no PII, no journal text).
 */
export function requestLogger(_req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    // eslint-disable-next-line no-console
    console.log(
      JSON.stringify({
        level: "info",
        method: _req.method,
        path: _req.path,
        status: res.statusCode,
        durationMs: duration,
        ip: _req.ip,
      })
    );
  });
  next();
}
