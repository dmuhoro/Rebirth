import React, { useState, useCallback, type FormEvent } from "react";
import { useQuery } from "convex/react";
import { useConvexAuth as useAuth, useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { triggerHaptic } from "../utils/haptics";

/**
 * Rebirth AuthView (Phase 3).
 *
 * Sign-in via email magic link (passwordless).
 * Users may also continue as guest (localStorage only, no Convex sync).
 *
 * Theological boundary: this view contains no theological claims — it is a
 * pure identity gate. All AI pastoral content remains guarded by the three
 * pillars regardless of auth state.
 */
interface AuthViewProps {
  onContinueAsGuest: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  onContinueAsGuest,
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { signIn, signOut } = useAuthActions();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch the signed-in user's profile for a personalized welcome.
  const profile = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? {} : "skip",
  );

  const handleSignInMagicLink = useCallback(async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    triggerHaptic("selection");
    setIsSubmitting(true);
    try {
      await signIn("email", { email: email.trim() });
      setNotice("If this address can sign in, a secure link will arrive shortly.");
    } catch (err) {
      setError("Magic link could not be sent. Please try again.");
      // eslint-disable-next-line no-console
      console.error("Magic link error:", err);
    } finally {
      setIsSubmitting(false);
    }
  }, [email, signIn]);

  const handleGoogleSignIn = useCallback(async () => {
    setError(null);
    setNotice(null);
    triggerHaptic("selection");
    setIsSubmitting(true);
    try {
      await signIn("google");
    } catch (err) {
      setError("Google sign-in could not be started. Please try again.");
      // eslint-disable-next-line no-console
      console.error("Google sign-in error:", err);
    } finally {
      setIsSubmitting(false);
    }
  }, [signIn]);

  const handleSignOut = useCallback(async () => {
    setError(null);
    triggerHaptic("selection");
    try {
      await signOut();
    } catch (err) {
      setError("Sign-out failed. Please try again.");
      // eslint-disable-next-line no-console
      console.error("Sign-out error:", err);
    }
  }, [signOut]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0c0e12] text-[#f7f4ec] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#d4af37]/30 border-t-[#d4af37] rounded-full animate-spin" />
          <p className="text-xs text-[#b8b3a4]">Signing in…</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0c0e12] text-[#f7f4ec] p-4 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#d4af37]/20 flex items-center justify-center border border-[#d4af37]/30">
          <span className="text-[#e5c158] font-bold text-lg">🕊️</span>
        </div>
        <h2 className="text-xl font-semibold text-[#f7f4ec]">
          Welcome back
        </h2>
        {profile && profile.email && (
          <p className="text-sm text-[#b8b3a4]">{profile.email}</p>
        )}
        <p className="text-sm text-[#b8b3a4] text-center max-w-sm">
          Your reflections, bookmarks, and progress are syncing securely across
          devices.
        </p>
        <button
          onClick={handleSignOut}
          className="px-6 py-2 rounded-xl bg-[#d4af37] text-[#0c0e12] font-semibold hover:bg-[#e5c158] active:scale-95 transition-all"
        >
          Sign Out
        </button>
        <button
          onClick={onContinueAsGuest}
          className="px-6 py-2 rounded-xl bg-transparent text-[#b8b3a4] border border-[#252c3c] hover:text-white hover:border-[#c5c0b0] active:scale-95 transition-all mt-2"
        >
          Continue as Guest
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0e12] text-[#f7f4ec] p-4 flex flex-col items-center justify-center">
      <div className="max-w-md w-full space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#d4af37]/20 flex items-center justify-center border border-[#d4af37]/30">
            <span className="text-[#e5c158] font-bold text-lg">🕊️</span>
          </div>
          <h2 className="text-2xl font-semibold text-[#f7f4ec]">Rebirth</h2>
          <p className="text-sm text-[#b8b3a4] text-center">
            Meet God in the Word every day, in the state you are actually in.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-amber-900/20 border border-amber-500/30 text-amber-200 text-sm flex items-start gap-2">
            <span className="mt-0.5">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {notice && (
          <p role="status" className="p-3 rounded-xl bg-emerald-900/20 border border-emerald-500/30 text-emerald-200 text-sm">
            {notice}
          </p>
        )}

        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleGoogleSignIn}
          className="w-full py-3 rounded-xl border border-[#252c3c] bg-[#181d26] text-[#f7f4ec] font-medium hover:border-[#d4af37]/50 disabled:opacity-50 transition-all"
        >
          Continue with Google
        </button>

        <div className="flex items-center gap-3 text-xs text-[#6d685c]">
          <span className="h-px flex-1 bg-[#252c3c]" />
          <span>or use email</span>
          <span className="h-px flex-1 bg-[#252c3c]" />
        </div>

        <div className="space-y-3">
          <form onSubmit={handleSignInMagicLink} className="space-y-3">
            <input
              id="auth-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl border border-[#252c3c] bg-[#0c0e12] text-[#f7f4ec] placeholder-[#6d685c] focus:outline-none focus:border-[#d4af37]"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-[#d4af37] text-[#0c0e12] font-semibold hover:bg-[#e5c158] disabled:opacity-50 transition-all"
            >
              {isSubmitting ? "Sending…" : "Send magic link"}
            </button>
          </form>

          <p className="text-xs text-[#6d685c] text-center">
            A magic link will be sent to your email. Click it to sign in.
          </p>
        </div>

        <div className="border-t border-[#252c3c] pt-4 mt-4">
          <p className="text-xs text-[#6d685c] text-center mb-4">
            Prefer to keep your reflections private on this device only?
          </p>
          <button
            onClick={onContinueAsGuest}
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl border border-[#d4af37]/30 bg-transparent text-[#e5c158] font-medium hover:bg-[#d4af37]/10 active:scale-95 transition-all"
          >
            Continue as Guest
          </button>
        </div>

        <div className="text-center pt-4">
          <p className="text-[10px] text-[#6d685c] uppercase tracking-wider">
            Theological pillars: Qavah & Meno · Lev Tahor & Metanoia · Divinity of Christ
          </p>
        </div>
      </div>
    </div>
  );
};
