import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { triggerHaptic } from "../utils/haptics";

describe("Tactile Mobile Haptics Utility", () => {
  const originalNavigator = globalThis.navigator;
  const originalWindow = (globalThis as any).window;

  beforeEach(() => {
    vi.restoreAllMocks();
    (globalThis as any).window = {};
  });

  afterEach(() => {
    Object.defineProperty(globalThis, "navigator", {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
    (globalThis as any).window = originalWindow;
  });

  it("should safely invoke navigator.vibrate with correct vibration patterns", () => {
    const vibrateMock = vi.fn();
    Object.defineProperty(globalThis, "navigator", {
      value: { vibrate: vibrateMock },
      writable: true,
      configurable: true,
    });

    triggerHaptic("selection");
    expect(vibrateMock).toHaveBeenCalledWith(12);

    triggerHaptic("light");
    expect(vibrateMock).toHaveBeenCalledWith(20);

    triggerHaptic("medium");
    expect(vibrateMock).toHaveBeenCalledWith(35);

    triggerHaptic("heavy");
    expect(vibrateMock).toHaveBeenCalledWith(55);

    triggerHaptic("success");
    expect(vibrateMock).toHaveBeenCalledWith([15, 35, 25]);

    triggerHaptic("warning");
    expect(vibrateMock).toHaveBeenCalledWith([40, 40, 40]);
  });

  it("should never throw an error when navigator or navigator.vibrate is undefined", () => {
    Object.defineProperty(globalThis, "navigator", {
      value: {},
      writable: true,
      configurable: true,
    });

    expect(() => triggerHaptic("medium")).not.toThrow();
  });
});
