import { describe, expect, it } from "vitest";
import {
  ApiTransportStatus,
  evaluateApiTransport,
  resolveApiPath,
} from "../lib/apiTransport";

function status(env: string | undefined, native: boolean) {
  return evaluateApiTransport(
    env === undefined ? {} : { VITE_API_BASE_URL: env },
    native,
  );
}

function reasonOf(rejected: ApiTransportStatus): string {
  if (rejected.state === "ready") {
    throw new Error(
      "expected the transport status to be refused, but it is ready",
    );
  }
  return rejected.reason;
}

describe("apiTransport fail-closed resolution", () => {
  it("uses same-origin relative fetches on the web when no base is configured", () => {
    expect(status(undefined, false)).toEqual({
      state: "ready",
      mode: "same-origin",
      base: "",
    });
    expect(resolveApiPath("/api/counsel")).toBe("/api/counsel");
  });

  it("refuses private API calls in a native build without a configured base", () => {
    const nativeStatus = status(undefined, true);
    expect(nativeStatus.state).toBe("refused");
    expect(reasonOf(nativeStatus)).toContain("VITE_API_BASE_URL");
  });

  it("honors a valid https origin on a native build", () => {
    expect(
      status("https://rebirth-devotional.vercel.app", true),
    ).toEqual({
      state: "ready",
      mode: "configured",
      base: "https://rebirth-devotional.vercel.app",
    });
  });

  it("rejects a configured value with a path", () => {
    expect(
      status("https://rebirth-devotional.vercel.app/subpath", false).state,
    ).toBe("refused");
  });

  it("rejects a configured value with a query string", () => {
    const rejected = status("https://rebirth-devotional.vercel.app?x=1", false);
    expect(rejected.state).toBe("refused");
    expect(reasonOf(rejected)).toContain("https origin");
  });

  it("rejects non-https scheme instead of silently falling back", () => {
    const rejected = status("http://rebirth-devotional.vercel.app", true);
    expect(rejected.state).toBe("refused");
    expect(reasonOf(rejected)).toContain("https origin");
  });

  it("rejects garbage values", () => {
    expect(status("not-a-url-at-all", true).state).toBe("refused");
  });

  it("rejects empty values with an explicit reason", () => {
    const empty = status("   ", false);
    expect(empty.state).toBe("refused");
    expect(reasonOf(empty)).toContain("empty");
  });

  it("rejects non-absolute relative paths defensively", () => {
    expect(() => resolveApiPath("api/counsel")).toThrow(/absolute/);
    expect(() => resolveApiPath("//evil.example.com/api/counsel")).toThrow(
      /absolute/,
    );
  });
});
