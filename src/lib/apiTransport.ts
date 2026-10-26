import { Capacitor } from "@capacitor/core";

/**
 * Private API transport resolution.
 *
 * On the web/PWA the `/api/*` routes are same-origin (the Express proxy on
 * Vercel), so an empty base is correct. In the native Capacitor wrapper the
 * WebView origin is a local sandbox and relative `/api` fetches can never
 * reach the production API, so those builds must bake
 * `VITE_API_BASE_URL=https://<production-origin>` at build time.
 *
 * Fail-closed rules:
 * - A native build without a configured base refuses private API calls with
 *   an explicit reason instead of silently hitting its own WebView origin.
 * - A configured value must parse to an absolute `https` origin with no path,
 *   query, or hash. `http://`, garbage, and embedded paths are rejected on
 *   every platform so a misconfiguration can never silently fall back to a
 *   relative base that may or may not match.
 */
export type ApiTransportMode = "same-origin" | "configured";

/**
 * Discriminated on `state` with string literals. This repo's tsconfig compiles
 * without `strictNullChecks`, and boolean-literal discriminants do not narrow
 * under those settings; string discriminants do (see apiTransport.test.ts).
 */
export type ApiTransportStatus =
  | { state: "ready"; mode: ApiTransportMode; base: string }
  | { state: "refused"; reason: string };

export type ApiTransportEnv = Record<string, string | undefined>;

function parseHttpsOrigin(value: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:") return null;
  if (parsed.pathname !== "" && parsed.pathname !== "/") return null;
  if (parsed.search || parsed.hash || parsed.username || parsed.password) {
    return null;
  }
  return parsed.origin;
}

export function evaluateApiTransport(
  env: ApiTransportEnv | undefined,
  isNativePlatform: boolean,
): ApiTransportStatus {
  const raw = env?.VITE_API_BASE_URL;

  if (raw === undefined) {
    if (isNativePlatform) {
      return {
        state: "refused",
        reason:
          "VITE_API_BASE_URL is not set. Native wrapper builds must bake the production API origin at build time; relative /api routes cannot resolve inside the WebView.",
      };
    }
    return { state: "ready", mode: "same-origin", base: "" };
  }

  const value = typeof raw === "string" ? raw.trim() : "";
  if (!value) {
    return {
      state: "refused",
      reason:
        "VITE_API_BASE_URL is empty. Set it to the production API origin and rebuild.",
    };
  }

  const base = parseHttpsOrigin(value);
  if (!base) {
    return {
      state: "refused",
      reason:
        "VITE_API_BASE_URL must parse to an absolute https origin with no path, query, or non-https scheme, but was: '" +
        value +
        "'.",
    };
  }
  return { state: "ready", mode: "configured", base };
}

const status = evaluateApiTransport(
  (import.meta as { env?: ApiTransportEnv }).env,
  Capacitor.isNativePlatform(),
);

export function getApiTransportStatus(): ApiTransportStatus {
  return status;
}

export function isPrivateApiReady(): boolean {
  return status.state === "ready";
}

export function resolveApiPath(path: string): string {
  if (status.state === "refused") {
    throw new Error(status.reason);
  }
  if (!path.startsWith("/") || path.startsWith("//")) {
    throw new Error("API path must be absolute and start with a single '/'.");
  }
  return status.base + path;
}
