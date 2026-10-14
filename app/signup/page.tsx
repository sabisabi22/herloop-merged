
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import PhaseRing from "@/components/PhaseRing";
import { COLORS } from "@/lib/theme";
import { createAccount } from "@/lib/auth";

type ModuleChoice = "health" | "health_education";

export default function SignupPage() {
  const router = useRouter();

  const [selectedModule, setSelectedModule] =
    useState<ModuleChoice | null>(null);
  const [showSignup, setShowSignup] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  function continueToSignup() {
    if (!selectedModule) {
      setStatus("Please select a module to continue.");
      return;
    }

    setStatus("");
    setShowSignup(true);
  }

  async function handleSignup() {
    if (!selectedModule) {
      setStatus("Please select a module first.");
      return;
    }

    if (!name.trim() || !email.trim() || !password) {
      setStatus("Please fill in all the fields.");
      return;
    }

    if (password.length < 6) {
      setStatus("Password must be at least 6 characters.");
      return;
    }

    setBusy(true);
    setStatus("Creating account...");

    try {
      await createAccount({
        email: email.trim(),
        password,
        name: name.trim(),
      });

      // Keep the selected module for onboarding.
      localStorage.setItem("herloop_selected_module", selectedModule);

      router.push("/onboarding");
    } catch (err: unknown) {
      setStatus(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
      setBusy(false);
    }
  }

  const modules = [
    {
      id: "health" as const,
      title: "Health",
      subtitle: "Your health, your pace.",
      description:
        "Health guidance, optional period tracking, wellness reminders and supportive resources.",
      icon: "♡",
    },
    {
      id: "health_education" as const,
      title: "Health + Education",
      subtitle: "Care for yourself. Grow your future.",
      description:
        "Everything in Health, plus learning resources, course progress and scholarship opportunities.",
      icon: "✿",
    },
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center px-5 py-12"
      style={{ background: COLORS.cream }}
    >
      <motion.div
        className="w-full max-w-2xl p-6 sm:p-9 rounded-3xl bg-white shadow-soft"
        style={{ border: `1px solid ${COLORS.mist}` }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <div className="flex justify-center mb-5">
          <PhaseRing size={72} />
        </div>

        {!showSignup ? (
          <>
            <h1
              className="text-2xl sm:text-3xl mb-2 font-display text-center"
              style={{ color: COLORS.plum }}
            >
              Welcome to HerLoop
            </h1>

            <p
              className="text-sm mb-7 font-body text-center"
              style={{ color: COLORS.plumSoft }}
            >
              Choose the experience that feels right for you. You can continue
              to create your account next.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {modules.map((module) => {
                const isSelected = selectedModule === module.id;

                return (
                  <motion.button
                    key={module.id}
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedModule(module.id);
                      setStatus("");
                    }}
                    aria-pressed={isSelected}
                    className="text-left p-5 sm:p-6 rounded-2xl border-2 transition-all"
                    style={{
                      borderColor: isSelected ? COLORS.plum : COLORS.mist,
                      background: isSelected ? "#FFF0F5" : "#FFFFFF",
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-3xl mb-4"
                      style={{
                        background: isSelected ? "#F8DCE8" : COLORS.cream,
                        color: COLORS.plum,
                      }}
                    >
                      {module.icon}
                    </div>

                    <h2
                      className="text-lg font-semibold font-display mb-1"
                      style={{ color: COLORS.plum }}
                    >
                      {module.title}
                    </h2>

                    <p
                      className="text-sm font-semibold mb-3"
                      style={{ color: COLORS.rose }}
                    >
                      {module.subtitle}
                    </p>

                    <p
                      className="text-sm leading-6 font-body"
                      style={{ color: COLORS.plumSoft }}
                    >
                      {module.description}
                    </p>

                    <div
                      className="mt-5 text-sm font-semibold"
                      style={{ color: COLORS.plum }}
                    >
                      {isSelected ? "✓ Selected" : "Select this module"}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={continueToSignup}
              className="w-full py-3.5 rounded-2xl font-semibold text-sm font-body mt-6"
              style={{ background: COLORS.plum, color: COLORS.cream }}
            >
              Continue
            </motion.button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => {
                setShowSignup(false);
                setStatus("");
              }}
              className="text-sm font-semibold mb-4"
              style={{ color: COLORS.rose }}
            >
              ← Change module
            </button>

            <h1
              className="text-2xl mb-2 font-display text-center"
              style={{ color: COLORS.plum }}
            >
              Create your account
            </h1>

            <p
              className="text-sm mb-6 font-body text-center"
              style={{ color: COLORS.plumSoft }}
            >
              Selected:{" "}
              <strong>
                {selectedModule === "health"
                  ? "Health"
                  : "Health + Education"}
              </strong>
              <br />
              Next, we’ll ask a few questions to personalize your experience.
            </p>

            <div className="flex flex-col gap-3">
              <input
                className="px-4 py-3 rounded-xl border text-sm font-body"
                style={{
                  borderColor: COLORS.mist,
                  background: COLORS.cream,
                }}
                placeholder="Your name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <input
                className="px-4 py-3 rounded-xl border text-sm font-body"
                style={{
                  borderColor: COLORS.mist,
                  background: COLORS.cream,
                }}
                placeholder="Email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                className="px-4 py-3 rounded-xl border text-sm font-body"
                style={{
                  borderColor: COLORS.mist,
                  background: COLORS.cream,
                }}
                placeholder="Password (at least 6 characters)"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              disabled={busy}
              onClick={handleSignup}
              className="w-full py-3.5 rounded-2xl font-semibold text-sm font-body mt-5"
              style={{
                background: COLORS.plum,
                color: COLORS.cream,
                opacity: busy ? 0.7 : 1,
              }}
            >
              {busy ? "Creating..." : "Create account"}
            </motion.button>
          </>
        )}

        {status && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            role="status"
            className="mt-4 text-sm text-center font-body"
            style={{ color: COLORS.plumSoft }}
          >
            {status}
          </motion.p>
        )}

        <p
          className="mt-6 text-sm text-center font-body"
          style={{ color: COLORS.plum }}
        >
          Already have an account?{" "}
          <a
            className="font-semibold"
            style={{ color: COLORS.rose }}
            href="/login"
          >
            Log in
          </a>
        </p>
      </motion.div>
    </div>
  );
}
