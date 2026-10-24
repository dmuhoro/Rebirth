interface SavedPushSubscription {
  endpoint: string;
  p256dh: string;
  auth: string;
}

type SavePushSubscription = (
  subscription: SavedPushSubscription,
) => Promise<unknown>;

function decodeVapidKey(key: string): Uint8Array {
  const padding = "=".repeat((4 - (key.length % 4)) % 4);
  const base64 = (key + padding).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
}

export async function enableWebPush(
  saveSubscription: SavePushSubscription,
): Promise<void> {
  if (
    !("serviceWorker" in navigator) ||
    !("PushManager" in window) ||
    !("Notification" in window)
  ) {
    throw new Error("This browser does not support push notifications.");
  }

  const publicKey = (import.meta as any).env?.VITE_WEB_PUSH_PUBLIC_KEY as
    | string
    | undefined;
  if (!publicKey) {
    throw new Error("Push notifications are not configured for this app.");
  }
  if (Notification.permission === "denied") {
    throw new Error("Notifications are blocked in this browser's site settings.");
  }

  const permission =
    Notification.permission === "granted"
      ? "granted"
      : await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Notification permission was not granted.");
  }

  const registration =
    (await navigator.serviceWorker.getRegistration()) ??
    (await navigator.serviceWorker.register("/sw.js"));
  const subscription =
    (await registration.pushManager.getSubscription()) ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: decodeVapidKey(publicKey),
    }));
  const json = subscription.toJSON();
  const p256dh = json.keys?.p256dh;
  const auth = json.keys?.auth;
  if (!subscription.endpoint || !p256dh || !auth) {
    throw new Error("The browser returned an incomplete push subscription.");
  }

  await saveSubscription({ endpoint: subscription.endpoint, p256dh, auth });
}

export async function removeWebPushSubscription(): Promise<void> {
  if (
    !("serviceWorker" in navigator) ||
    !("PushManager" in window)
  ) {
    return;
  }
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration?.pushManager.getSubscription();
  if (subscription) {
    const removed = await subscription.unsubscribe();
    if (!removed) {
      throw new Error("The browser could not remove this device's notification subscription.");
    }
  }
}
