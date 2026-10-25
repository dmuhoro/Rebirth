/**
 * Executes the REAL public/sw.js inside a Node VM with a minimal Cache/Fetch
 * harness. This is deliberately not a re-implementation: the assertions must
 * exercise the shipped worker, otherwise they prove nothing about production.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";
import { describe, expect, it, vi } from "vitest";

const ORIGIN = "https://rebirth.test";
const SW_SOURCE = readFileSync(resolve(process.cwd(), "public/sw.js"), "utf8");

class FakeResponse {
  body: unknown;
  status: number;
  ok: boolean;
  statusText: string;
  headers: Record<string, string>;

  constructor(
    body: unknown = "",
    init: { status?: number; statusText?: string; headers?: Record<string, string> } = {},
  ) {
    this.body = body;
    this.status = init.status ?? 200;
    this.ok = this.status >= 200 && this.status < 300;
    this.statusText = init.statusText ?? "";
    this.headers = init.headers ?? {};
  }

  clone() {
    return new FakeResponse(this.body, {
      status: this.status,
      statusText: this.statusText,
      headers: { ...this.headers },
    });
  }

  async json() {
    return JSON.parse(String(this.body));
  }

  async text() {
    return String(this.body);
  }
}

type FakeRequest = { method: string; url: string; mode: string };

function request(path: string, init: Partial<FakeRequest> = {}): FakeRequest {
  return {
    method: "GET",
    url: new URL(path, ORIGIN).href,
    mode: "cors",
    ...init,
  };
}

function createHarness() {
  const listeners = new Map<string, (event: unknown) => void>();
  const cacheStore = new Map<string, Map<string, FakeResponse>>();
  const putCalls: Array<{ cache: string; url: string }> = [];
  let fetchImpl: (input: FakeRequest) => Promise<FakeResponse> = async () =>
    new FakeResponse("network");

  const normalize = (input: string | FakeRequest): string => {
    const raw = typeof input === "string" ? input : input.url;
    const parsed = new URL(raw, ORIGIN);
    return parsed.pathname + parsed.search;
  };

  const makeCache = (name: string) => {
    if (!cacheStore.has(name)) cacheStore.set(name, new Map());
    const store = cacheStore.get(name)!;
    return {
      async addAll(assets: string[]) {
        for (const asset of assets) {
          store.set(normalize(asset), new FakeResponse(`precache:${asset}`));
        }
      },
      async put(input: string | FakeRequest, response: FakeResponse) {
        const key = normalize(input);
        putCalls.push({ cache: name, url: key });
        store.set(key, response);
      },
      async match(input: string | FakeRequest) {
        return store.get(normalize(input));
      },
    };
  };

  const caches = {
    async open(name: string) {
      return makeCache(name);
    },
    async match(input: string | FakeRequest) {
      for (const store of cacheStore.values()) {
        const hit = store.get(normalize(input));
        if (hit) return hit;
      }
      return undefined;
    },
    async keys() {
      return [...cacheStore.keys()];
    },
    async delete(name: string) {
      return cacheStore.delete(name);
    },
  };

  const self = {
    location: { origin: ORIGIN },
    addEventListener: (type: string, handler: (event: unknown) => void) => {
      listeners.set(type, handler);
    },
    skipWaiting: vi.fn(async () => undefined),
    clients: {
      claim: vi.fn(async () => undefined),
      matchAll: vi.fn(async () => []),
      openWindow: vi.fn(async () => undefined),
    },
    registration: { showNotification: vi.fn(async () => undefined) },
  };

  const context = vm.createContext({
    self,
    caches,
    fetch: (input: FakeRequest) => fetchImpl(input),
    Response: FakeResponse,
    URL,
    console,
    Date,
    JSON,
    Promise,
    setTimeout,
    clearTimeout,
  });

  vm.runInContext(SW_SOURCE, context, { filename: "public/sw.js" });

  const dispatch = (type: string, event: unknown) => {
    const handler = listeners.get(type);
    if (!handler) throw new Error(`No listener for ${type}`);
    handler(event);
  };

  const fetchEvent = (req: FakeRequest) => {
    let responded: Promise<FakeResponse> | undefined;
    const event = {
      request: req,
      respondWith: (promise: Promise<FakeResponse>) => {
        responded = promise;
      },
    };
    dispatch("fetch", event);
    return responded;
  };

  return {
    fetchEvent,
    putCalls,
    setNetwork: (impl: (input: FakeRequest) => Promise<FakeResponse>) => {
      fetchImpl = impl;
    },
    seed: (cache: string, path: string, response: FakeResponse) => {
      makeCache(cache);
      cacheStore.get(cache)!.set(normalize(path), response);
    },
    hasResponse: (cache: string, path: string) =>
      cacheStore.get(cache)?.has(normalize(path)) ?? false,
  };
}

describe("public/sw.js", () => {
  it("serves navigations network-first and falls back to the cached shell", async () => {
    const harness = createHarness();
    harness.seed("rebirth-static-v3", "/index.html", new FakeResponse("cached-shell"));
    harness.setNetwork(async () => {
      throw new Error("offline");
    });

    const response = await harness.fetchEvent(
      request("/", { mode: "navigate" }),
    );

    expect(response).toBeDefined();
    expect(await response!.text()).toBe("cached-shell");
  });

  it("refreshes the cached shell after a successful navigation", async () => {
    const harness = createHarness();
    harness.setNetwork(async () => new FakeResponse("fresh-shell"));

    const response = await harness.fetchEvent(
      request("/", { mode: "navigate" }),
    );

    expect(await response!.text()).toBe("fresh-shell");
    expect(harness.hasResponse("rebirth-static-v3", "/index.html")).toBe(true);
  });

  it("never caches API responses and returns JSON 503 when offline", async () => {
    const harness = createHarness();
    harness.setNetwork(async () => new FakeResponse('{"ok":true}'));
    await harness.fetchEvent(request("/api/health"));
    expect(harness.putCalls.some((call) => call.url.startsWith("/api/"))).toBe(
      false,
    );

    harness.setNetwork(async () => {
      throw new Error("offline");
    });
    const response = await harness.fetchEvent(request("/api/counsel"));

    expect(response!.status).toBe(503);
    expect((await response!.json()).error).toBe("offline");
  });

  it("serves hashed static assets cache-first", async () => {
    const harness = createHarness();
    harness.seed(
      "rebirth-static-v3",
      "/assets/app-abc123.js",
      new FakeResponse("cached-js"),
    );
    const network = vi.fn(async () => new FakeResponse("network-js"));
    harness.setNetwork(network);

    const response = await harness.fetchEvent(request("/assets/app-abc123.js"));

    expect(await response!.text()).toBe("cached-js");
    expect(network).not.toHaveBeenCalled();
  });

  it("ignores non-GET and cross-origin requests", () => {
    const harness = createHarness();

    expect(harness.fetchEvent(request("/api/sync", { method: "POST" }))).toBeUndefined();
    expect(
      harness.fetchEvent(
        request("https://elsewhere.test/script.js", { mode: "no-cors" }),
      ),
    ).toBeUndefined();
  });
});
