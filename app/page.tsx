"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import PhaseRing from "@/components/PhaseRing";
import { COLORS, PHASES } from "@/lib/theme";
import { app } from "@/lib/firebaseConfig";

export default function Home() {
  const router = useRouter();

  const [loggedIn, setLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const auth = getAuth(app);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoggedIn(!!user);
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  async function handleLogout() {
    setBusy(true);
    setStatus("");

    try {
      await signOut(getAuth(app));
      setLoggedIn(false);

      // After logout, open the module selection page.
      router.replace("/signup");
    } catch {
      setStatus("Logout failed. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-16"
      style={{ background: COLORS.cream }}
    >
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Header and Logout button */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <p className="eyebrow">
            herLoop — a lifecycle companion
          </p>

          {!checkingAuth && loggedIn && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              whileHover={{ background: COLORS.rose }}
              onClick={handleLogout}
              disabled={busy}
              className="shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
              style={{
                background: COLORS.plum,
                color: COLORS.cream,
                opacity: busy ? 0.6 : 1,
              }}
            >
              {busy ? "Logging out..." : "Logout"}
            </motion.button>
          )}
        </div>

        {/* Logo */}
        <div className="flex justify-center mb-2">
          <PhaseRing size={220} />
        </div>

        {/* Lifecycle phases */}
        <div className="flex justify-center gap-x-4 gap-y-2 flex-wrap mb-10 mt-2">
          {PHASES.map((p, i) => (
            <motion.div
              key={p.name}
              className="flex items-center gap-1.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.06 }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: p.color }}
              />

              <span
                className="text-xs font-body"
                style={{ color: COLORS.plumSoft }}
              >
                {p.name}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Main card */}
        <div
          className="p-8 rounded-3xl bg-white shadow-soft text-center"
          style={{ border: `1px solid ${COLORS.mist}` }}
        >
          <h1
            className="text-2xl leading-snug mb-3 font-display"
            style={{ color: COLORS.plum }}
          >
            Track your cycle, know your stage,
            <br />
            find what you're owed.
          </h1>

          <p
            className="text-sm leading-relaxed mb-7 font-body"
            style={{ color: COLORS.plumSoft }}
          >
            Cycle tracking, age-appropriate health guidance, and a direct
            line to government schemes and scholarships — one account per
            family, one profile per stage.
          </p>

          <Link href="/signup">
            <motion.button
              whileTap={{ scale: 0.97 }}
              whileHover={{ background: COLORS.rose }}
              className="w-full py-3.5 rounded-2xl font-semibold text-sm font-body mb-3 transition-colors"
              style={{
                background: COLORS.plum,
                color: COLORS.cream,
              }}
            >
              Get started
            </motion.button>
          </Link>

          <Link
            href="/login"
            className="text-sm font-semibold font-body"
            style={{ color: COLORS.rose }}
          >
            I already have an account
          </Link>

          {status && (
            <p
              role="alert"
              className="text-sm mt-4 font-body"
              style={{ color: COLORS.plumSoft }}
            >
              {status}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
