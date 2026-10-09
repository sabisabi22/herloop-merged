"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, CheckCircle2 } from "lucide-react";
import PhaseRing from "@/components/PhaseRing";
import { COLORS } from "@/lib/theme";
import { signIn, getUserProfile, isEmailVerified, sendResetEmail } from "@/lib/auth";

// Firebase's raw error codes ("auth/wrong-password", etc.) aren't something
// to show someone trying to log in — translate the common ones.
function friendlyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("auth/invalid-credential") || m.includes("auth/wrong-password") || m.includes("auth/user-not-found")) {
    return "That email and password don't match an account.";
  }
  if (m.includes("auth/invalid-email")) return "That doesn't look like a valid email address.";
  if (m.includes("auth/too-many-requests")) return "Too many attempts. Please wait a moment and try again.";
  if (m.includes("auth/network-request-failed")) return "Network error — check your connection and try again.";
  return "Something went wrong. Please try again.";
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [status, setStatus] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [busy, setBusy] = useState(false);

  // Forgot-password flow, shown inline in place of the login form
  const [mode, setMode] = useState<"login" | "reset">("login");
  const [resetEmail, setResetEmail] = useState("");
  const [resetStatus, setResetStatus] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);

  async function handleLogin(e?: FormEvent) {
    e?.preventDefault();
    setFieldError("");

    if (!email.trim() || !password) {
      setFieldError("Enter both your email and password.");
      return;
    }
    if (!isValidEmail(email)) {
      setFieldError("Enter a valid email address.");
      return;
    }

    setBusy(true);
    setStatus("Signing in...");
    try {
     const uid = await signIn(email.trim(), password);
      if (!isEmailVerified()) {
        router.push("/verify-email");
        return;
      }
      const profile = await getUserProfile(uid);
      if (!profile || profile.role === "unset") {
        router.push("/onboarding");
      } else if (profile.role === "teen_pending") {
        router.push("/waiting-approval");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setStatus("");
      setFieldError(friendlyError(err?.message ?? ""));
      setBusy(false);
    }
  }

  async function handleReset(e: FormEvent) {
    e.preventDefault();
    setResetStatus("");
    if (!isValidEmail(resetEmail)) {
      setResetStatus("Enter a valid email address.");
      return;
    }
    setResetBusy(true);
    try {
      await sendResetEmail(resetEmail.trim());
      setResetSent(true);
    } catch (err: any) {
      setResetStatus(friendlyError(err?.message ?? ""));
    } finally {
      setResetBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16" style={{ background: COLORS.cream }}>
      <motion.div
        className="w-full max-w-sm p-8 rounded-3xl bg-white shadow-soft"
        style={{ border: `1px solid ${COLORS.mist}` }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <div className="flex justify-center mb-5">
          <PhaseRing size={72} />
        </div>

        <AnimatePresence mode="wait">
          {mode === "login" ? (
            <motion.form
              key="login"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleLogin}
              noValidate
            >
              <h1 className="text-2xl mb-6 font-display text-center" style={{ color: COLORS.plum }}>
                Welcome back
              </h1>

              <div className="flex flex-col gap-3">
                <input
                  className="px-4 py-3 rounded-xl border text-sm font-body"
                  style={{ borderColor: COLORS.mist, background: COLORS.cream }}
                  placeholder="Email"
                  type="email"
                  autoFocus
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="relative">
                  <input
                    className="px-4 py-3 pr-11 rounded-xl border text-sm font-body w-full"
                    style={{ borderColor: COLORS.mist, background: COLORS.cream }}
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff size={16} style={{ color: `${COLORS.plum}66` }} />
                    ) : (
                      <Eye size={16} style={{ color: `${COLORS.plum}66` }} />
                    )}
                  </button>
                </div>
              </div>

              {fieldError && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2.5 text-xs font-body"
                  style={{ color: COLORS.rose }}
                >
                  {fieldError}
                </motion.p>
              )}

              <div className="flex items-center justify-between mt-3.5">
                <label className="flex items-center gap-2 text-xs font-body cursor-pointer" style={{ color: `${COLORS.plum}99` }}>
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-3.5 h-3.5 rounded"
                    style={{ accentColor: COLORS.plum }}
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setResetSent(false);
                    setResetStatus("");
                    setMode("reset");
                  }}
                  className="text-xs font-semibold font-body"
                  style={{ color: COLORS.rose }}
                >
                  Forgot password?
                </button>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                disabled={busy}
                type="submit"
                className="w-full py-3.5 rounded-2xl font-semibold text-sm font-body mt-4"
                style={{ background: COLORS.plum, color: COLORS.cream, opacity: busy ? 0.7 : 1 }}
              >
                {busy ? "Signing in..." : "Log in"}
              </motion.button>

              {status && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 text-sm text-center font-body"
                  style={{ color: COLORS.plumSoft }}
                >
                  {status}
                </motion.p>
              )}

              <p className="mt-6 text-sm text-center font-body" style={{ color: COLORS.plum }}>
                New here?{" "}
                <a className="font-semibold" style={{ color: COLORS.rose }} href="/signup">
                  Create an account
                </a>
              </p>
            </motion.form>
          ) : (
            <motion.div
              key="reset"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.2 }}
            >
              {resetSent ? (
                <div className="text-center py-2">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                    style={{ background: `${COLORS.moss}20` }}
                  >
                    <CheckCircle2 size={22} style={{ color: COLORS.moss }} />
                  </div>
                  <h1 className="text-xl mb-2 font-display" style={{ color: COLORS.plum }}>
                    Check your inbox
                  </h1>
                  <p className="text-sm font-body mb-6" style={{ color: `${COLORS.plum}88` }}>
                    If an account exists for <span className="font-semibold">{resetEmail}</span>, a reset link is on its way.
                  </p>
                  <button
                    onClick={() => setMode("login")}
                    className="w-full py-3.5 rounded-2xl font-semibold text-sm font-body"
                    style={{ background: COLORS.plum, color: COLORS.cream }}
                  >
                    Back to log in
                  </button>
                </div>
              ) : (
                <form onSubmit={handleReset} noValidate>
                  <h1 className="text-2xl mb-2 font-display text-center" style={{ color: COLORS.plum }}>
                    Reset password
                  </h1>
                  <p className="text-xs font-body text-center mb-6" style={{ color: `${COLORS.plum}77` }}>
                    Enter your account email and we'll send a link to reset it.
                  </p>

                  <div className="relative">
                    <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: `${COLORS.plum}55` }} />
                    <input
                      className="pl-11 pr-4 py-3 rounded-xl border text-sm font-body w-full"
                      style={{ borderColor: COLORS.mist, background: COLORS.cream }}
                      placeholder="Email"
                      type="email"
                      autoFocus
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                    />
                  </div>

                  {resetStatus && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-2.5 text-xs font-body"
                      style={{ color: COLORS.rose }}
                    >
                      {resetStatus}
                    </motion.p>
                  )}

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    disabled={resetBusy}
                    type="submit"
                    className="w-full py-3.5 rounded-2xl font-semibold text-sm font-body mt-4"
                    style={{ background: COLORS.plum, color: COLORS.cream, opacity: resetBusy ? 0.7 : 1 }}
                  >
                    {resetBusy ? "Sending..." : "Send reset link"}
                  </motion.button>

                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="w-full mt-3 text-sm font-semibold font-body text-center"
                    style={{ color: COLORS.plumSoft }}
                  >
                    Back to log in
                  </button>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}