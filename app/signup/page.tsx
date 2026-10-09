"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import PhaseRing from "@/components/PhaseRing";
import { COLORS } from "@/lib/theme";
import { createAccount } from "@/lib/auth";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSignup() {
    setBusy(true);
    setStatus("Creating account...");
    try {
      await createAccount({ email, password, name });
      router.push("/onboarding");
    } catch (err: any) {
      setStatus(err.message ?? "Something went wrong.");
      setBusy(false);
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
        <h1 className="text-2xl mb-2 font-display text-center" style={{ color: COLORS.plum }}>Create your account</h1>
        <p className="text-sm mb-6 font-body text-center" style={{ color: COLORS.plumSoft }}>
          Next you'll answer a couple of quick questions so we set up the right experience for you.
        </p>

        <div className="flex flex-col gap-3">
          <input
            className="px-4 py-3 rounded-xl border text-sm font-body"
            style={{ borderColor: COLORS.mist, background: COLORS.cream }}
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="px-4 py-3 rounded-xl border text-sm font-body"
            style={{ borderColor: COLORS.mist, background: COLORS.cream }}
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="px-4 py-3 rounded-xl border text-sm font-body"
            style={{ borderColor: COLORS.mist, background: COLORS.cream }}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={busy}
          onClick={handleSignup}
          className="w-full py-3.5 rounded-2xl font-semibold text-sm font-body mt-5"
          style={{ background: COLORS.plum, color: COLORS.cream, opacity: busy ? 0.7 : 1 }}
        >
          {busy ? "Creating..." : "Sign up"}
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
          Already have an account?{" "}
          <a className="font-semibold" style={{ color: COLORS.rose }} href="/login">Log in</a>
        </p>
      </motion.div>
    </div>
  );
}
