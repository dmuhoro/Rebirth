import type { RequestHandler } from "express";

/**
 * Production security headers for Rebirth.
 *
 * The app serves private journal data, so it must never be framed, sniffed as
 * another content type, or leak referrers to third parties. The Content
 * Security Policy is applied only in production: Vite's dev server relies on
 * inline scripts and eval for HMR.
 */

const CONVEX_CONNECT_SRC = [
  "https://*.convex.cloud",
  "wss://*.convex.cloud",
  "https://*.convex.site",
];

export function buildContentSecurityPolicy(): string {
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "script-src 'self'",
    // Tailwind and React inline style attributes require unsafe-inline.
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob:",
    "manifest-src 'self'",
    "worker-src 'self'",
    "media-src 'self' blob:",
    `connect-src 'self' ${CONVEX_CONNECT_SRC.join(" ")}`,
    "upgrade-insecure-requests",
  ].join("; ");
}

export function buildSecurityHeaders(isProduction: boolean): Record<string, string> {
  const headers: Record<string, string> = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy":
      "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
    "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
  };

  if (isProduction) {
    headers["Strict-Transport-Security"] =
      "max-age=63072000; includeSubDomains";
    headers["Content-Security-Policy"] = buildContentSecurityPolicy();
  }

  return headers;
}

export function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
}

export const securityHeaders: RequestHandler = (_req, res, next) => {
  const headers = buildSecurityHeaders(isProductionRuntime());
  for (const [name, value] of Object.entries(headers)) {
    res.setHeader(name, value);
  }
  next();
};

/**
 * Private reflections and AI counsel must never be stored by browsers or
 * intermediaries. Applies to every API response, including errors.
 */
export const privateApiCacheHeaders: RequestHandler = (_req, res, next) => {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("Pragma", "no-cache");
  next();
};
