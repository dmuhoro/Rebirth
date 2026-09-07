export type HapticType = "selection" | "light" | "medium" | "heavy" | "success" | "warning";

/**
 * Triggers tactile vibration feedback on supported mobile devices (Android)
 * to provide physical sensory confirmation during prayer, meditation, and navigation.
 */
export function triggerHaptic(type: HapticType = "light"): void {
  if (typeof window === "undefined" || !("vibrate" in navigator)) {
    return;
  }

  try {
    switch (type) {
      case "selection":
        navigator.vibrate(12);
        break;
      case "light":
        navigator.vibrate(20);
        break;
      case "medium":
        navigator.vibrate(35);
        break;
      case "heavy":
        navigator.vibrate(55);
        break;
      case "success":
        navigator.vibrate([15, 35, 25]);
        break;
      case "warning":
        navigator.vibrate([40, 40, 40]);
        break;
      default:
        navigator.vibrate(20);
    }
  } catch {
    // Non-blocking fallback for browsers/environments blocking navigator.vibrate
  }
}
