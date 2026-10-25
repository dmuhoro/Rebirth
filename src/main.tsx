import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { convex, isConvexReady } from "./lib/convex";
import {
  AppErrorBoundary,
  BootConfigurationError,
} from "./components/AppErrorBoundary";
import "./index.css";

/**
 * Service-worker registration moved out of index.html so the production CSP
 * can stay `script-src 'self'` (no inline scripts). Only register for
 * production builds: a cache-first asset worker interferes with Vite HMR.
 */
function registerServiceWorker(): void {
  if (!import.meta.env.PROD || typeof navigator === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .catch((error: unknown) => {
        // eslint-disable-next-line no-console
        console.warn("Rebirth service worker registration failed:", error);
      });
  });
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Rebirth root element is missing from index.html.");
}

const root = createRoot(rootElement);

if (!isConvexReady() || convex === null) {
  root.render(
    <StrictMode>
      <BootConfigurationError detail="Cloud backup and sign-in require a Convex deployment URL." />
    </StrictMode>,
  );
} else {
  root.render(
    <StrictMode>
      <AppErrorBoundary>
        <ConvexAuthProvider client={convex}>
          <App />
        </ConvexAuthProvider>
      </AppErrorBoundary>
    </StrictMode>,
  );
}

registerServiceWorker();
