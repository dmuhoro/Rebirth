import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";

const { mockGenerateContent } = vi.hoisted(() => ({
  mockGenerateContent: vi.fn(),
}));

vi.mock("@google/genai", () => ({
  GoogleGenAI: class {
    models = { generateContent: mockGenerateContent };
  },
  Type: { OBJECT: "OBJECT", STRING: "STRING", ARRAY: "ARRAY" },
}));

const SAFE_AI_RESPONSE = {
  text: JSON.stringify({
    pastoralCounsel: "Be still and know that God is near in this season.",
    scriptures: [
      {
        reference: "Psalm 46:10",
        text: "Be still, and know that I am God.",
        theologicalContext: "God's presence steadies the anxious heart.",
      },
    ],
    customPrayer: "Father, quiet my heart and help me rest in you. Amen.",
    breathPrayer: "Inhale: God is near. Exhale: I am held.",
  }),
};

describe("server hardening", () => {
  let server: Server | undefined;
  let baseUrl: string;

  beforeAll(async () => {
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("GEMINI_API_KEY", "test-api-key");
    // Exhaustible budget: exactly one estimated request.
    vi.stubEnv("GEMINI_DAILY_SPEND_CAP_USD", "0.01");
    vi.stubEnv("GEMINI_ESTIMATED_REQUEST_COST_USD", "0.01");
    mockGenerateContent.mockResolvedValue(SAFE_AI_RESPONSE);

    const { default: app } = await import("../../server");
    server = await new Promise<Server>((resolve) => {
      const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
    });
    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  }, 30_000);

  afterAll(async () => {
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server?.close((error) => (error ? reject(error) : resolve()));
      });
    }
    vi.unstubAllEnvs();
  });

  it("sets production security headers and never caches API responses", async () => {
    const response = await fetch(`${baseUrl}/api/health`);

    expect(response.status).toBe(200);
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("x-frame-options")).toBe("DENY");
    expect(response.headers.get("x-powered-by")).toBeNull();
    expect(response.headers.get("strict-transport-security")).toContain(
      "max-age=63072000",
    );
    const policy = response.headers.get("content-security-policy");
    expect(policy).toContain("default-src 'self'");
    expect(policy).toContain("script-src 'self'");
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("https://*.convex.cloud");
    expect(response.headers.get("cache-control")).toContain("no-store");
  });

  it("returns a JSON 404 for unknown API routes instead of the SPA shell", async () => {
    const response = await fetch(`${baseUrl}/api/does-not-exist`);

    expect(response.status).toBe(404);
    expect(response.headers.get("content-type")).toContain("application/json");
    expect(await response.json()).toEqual({
      error: "not_found",
      code: "API_NOT_FOUND",
    });
  });

  it("charges the spend cap and fails closed once it is exhausted", async () => {
    // Crisis support is static and must not consume provider budget.
    const crisis = await fetch(`${baseUrl}/api/counsel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entryText: "I want to kill myself tonight." }),
    });
    expect(crisis.status).toBe(200);
    expect((await crisis.json()).crisisDetected).toBe(true);
    expect(mockGenerateContent).not.toHaveBeenCalled();

    const first = await fetch(`${baseUrl}/api/counsel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entryText: "I need patience with my family." }),
    });
    expect(first.status).toBe(200);
    expect((await first.json()).isAIGenerated).toBe(true);
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);

    const second = await fetch(`${baseUrl}/api/counsel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entryText: "I need patience with my family." }),
    });
    expect(second.status).toBe(503);
    expect(await second.json()).toMatchObject({ code: "SPEND_CAP_REACHED" });
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
  });
});
