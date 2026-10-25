import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildContentSecurityPolicy,
  buildSecurityHeaders,
} from "../utils/securityHeaders";

const repoRoot = process.cwd();

interface VercelHeader {
  key: string;
  value: string;
}

interface VercelConfig {
  headers: Array<{ source: string; headers: VercelHeader[] }>;
}

function readVercelConfig(): VercelConfig {
  return JSON.parse(
    readFileSync(resolve(repoRoot, "vercel.json"), "utf8"),
  ) as VercelConfig;
}

describe("security header configuration", () => {
  it("keeps vercel.json CSP identical to the server CSP", () => {
    const config = readVercelConfig();
    const csp = config.headers
      .flatMap((entry) => entry.headers)
      .find((header) => header.key.toLowerCase() === "content-security-policy");

    expect(csp).toBeDefined();
    expect(csp?.value).toBe(buildContentSecurityPolicy());
  });

  it("marks API responses no-store at the edge", () => {
    const config = readVercelConfig();
    const apiEntry = config.headers.find((entry) => entry.source.startsWith("/api/"));

    expect(apiEntry).toBeDefined();
    const cacheControl = apiEntry?.headers.find(
      (header) => header.key.toLowerCase() === "cache-control",
    );
    expect(cacheControl?.value).toContain("no-store");
  });

  it("fails closed in production and relaxes only in development", () => {
    const production = buildSecurityHeaders(true);
    const development = buildSecurityHeaders(false);

    expect(production["Strict-Transport-Security"]).toBeDefined();
    expect(production["Content-Security-Policy"]).toContain("script-src 'self'");
    expect(production["Content-Security-Policy"]).not.toContain("unsafe-eval");
    expect(development["Content-Security-Policy"]).toBeUndefined();
    expect(development["Strict-Transport-Security"]).toBeUndefined();
    expect(development["X-Frame-Options"]).toBe("DENY");
  });

  it("ships a CSP that allows Convex realtime but blocks framing and plugins", () => {
    const policy = buildContentSecurityPolicy();

    expect(policy).toContain("wss://*.convex.cloud");
    expect(policy).toContain("https://*.convex.site");
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("object-src 'none'");
    expect(policy).toContain("base-uri 'self'");
  });

  it("index.html contains no inline scripts that CSP would block", () => {
    const html = readFileSync(resolve(repoRoot, "index.html"), "utf8");
    const inlineScripts = html.match(/<script(?![^>]*\bsrc=)[^>]*>/gi) ?? [];

    expect(inlineScripts).toEqual([]);
  });
});
