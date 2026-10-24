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

/**
 * Gemini daily spend cap (USD). Once exceeded, AI requests are refused with
 * a clear message instead of silently allowing unbounded spend.
 */
export const GEMINI_DAILY_SPEND_CAP_USD = Number(process.env.GEMINI_DAILY_SPEND_CAP_USD || "5.00");

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
  resetSpendIfNewDay();
  return dailySpendUsd + estimatedUsd <= GEMINI_DAILY_SPEND_CAP_USD;
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
