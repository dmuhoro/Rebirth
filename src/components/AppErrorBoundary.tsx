import { Component, type ErrorInfo, type ReactNode } from "react";

/**
 * Last-resort UI guards.
 *
 * A render error must never leave users with a blank screen, and a missing
 * cloud configuration must be explained instead of crashing during module
 * evaluation. Neither component logs reflection text or account data.
 */

interface AppErrorFallbackProps {
  onReload: () => void;
}

export function AppErrorFallback({ onReload }: AppErrorFallbackProps) {
  return (
    <div
      role="alert"
      className="min-h-screen bg-[#0c0e12] text-[#f7f4ec] flex items-center justify-center p-6"
    >
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-[#353023] bg-[#11141a] p-6 text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="text-sm text-[#b8b3a4]">
          Rebirth could not render this screen. Your saved reflections are
          stored on this device and were not changed.
        </p>
        <button
          type="button"
          onClick={onReload}
          className="min-h-11 w-full rounded-xl bg-[#d4af37] px-4 py-3 font-semibold text-[#0c0e12] hover:bg-[#e5c158]"
        >
          Reload Rebirth
        </button>
        <p className="text-xs text-[#6d685c]">
          If this keeps happening, export a backup from the account panel once
          the app opens, then reinstall.
        </p>
      </div>
    </div>
  );
}

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  // This repo has no @types/react installed, so the base class is untyped.
  // Declaring props type-only keeps `this.props` checked without emitting a
  // field that would overwrite the value React assigns.
  declare props: Readonly<AppErrorBoundaryProps>;

  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log only the error class and component stack. Never log props, state,
    // journal entries, or counsel content.
    // eslint-disable-next-line no-console
    console.error("Rebirth render error:", error.name, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <AppErrorFallback onReload={() => window.location.reload()} />
      );
    }
    return this.props.children;
  }
}

interface BootConfigurationErrorProps {
  detail: string;
}

export function BootConfigurationError({ detail }: BootConfigurationErrorProps) {
  return (
    <div
      role="alert"
      className="min-h-screen bg-[#0c0e12] text-[#f7f4ec] flex items-center justify-center p-6"
    >
      <div className="w-full max-w-md space-y-3 rounded-2xl border border-amber-500/30 bg-[#11141a] p-6">
        <h1 className="text-xl font-semibold">Rebirth is not configured</h1>
        <p className="text-sm text-[#b8b3a4]">{detail}</p>
        <p className="text-sm text-[#b8b3a4]">
          Set <code className="text-[#e5c158]">VITE_CONVEX_URL</code> before
          building, or use the documented setup in the README. No journal data
          was loaded or sent anywhere.
        </p>
      </div>
    </div>
  );
}
