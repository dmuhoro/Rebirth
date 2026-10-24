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

describe("counsel API", () => {
  let server: Server | undefined;
  let baseUrl: string;

  beforeAll(async () => {
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("GEMINI_API_KEY", "test-api-key");
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

  it.each(["/api/counsel", "/api/spiritual-guidance"])(
    "returns static crisis support on %s without calling Gemini",
    async (route) => {
      mockGenerateContent.mockClear();
      const response = await fetch(`${baseUrl}${route}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryText: "I want to kill myself tonight." }),
      });

      expect(response.status).toBe(200);
      const payload = await response.json();
      expect(payload).toMatchObject({ crisisDetected: true });
      expect(payload).not.toHaveProperty("isAIGenerated");
      expect(mockGenerateContent).not.toHaveBeenCalled();
    },
  );

  it("rejects unknown fields and blank reflection text before calling Gemini", async () => {
    const response = await fetch(`${baseUrl}/api/counsel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entryText: "   ", unexpected: true }),
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ code: "VALIDATION_ERROR" });
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });

  it("rejects malformed and oversized JSON with sanitized responses", async () => {
    const malformed = await fetch(`${baseUrl}/api/counsel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: '{"entryText":',
    });
    expect(malformed.status).toBe(400);
    expect(await malformed.json()).toEqual({ error: "invalid_json", code: "INVALID_JSON" });

    const oversized = await fetch(`${baseUrl}/api/counsel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entryText: "x".repeat(33_000) }),
    });
    expect(oversized.status).toBe(413);
    expect(await oversized.json()).toEqual({
      error: "payload_too_large",
      code: "PAYLOAD_TOO_LARGE",
    });
  });

  it("does not return provider errors or fallback-shaped content to clients", async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error("private provider detail"));
    const response = await fetch(`${baseUrl}/api/counsel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entryText: "I would like to reflect on patience." }),
    });

    expect(response.status).toBe(502);
    const payload = await response.json();
    expect(payload).toEqual({
      error: "Could not complete your request. Please try again.",
      code: "INTERNAL_ERROR",
    });
    expect(JSON.stringify(payload)).not.toContain("private provider detail");
    expect(payload).not.toHaveProperty("pastoralCounsel");
  });
});
