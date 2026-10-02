"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "@/lib/firebaseConfig";
import { COLORS } from "@/lib/theme";
import { setupAdultSelf, setupGuardianAndChild, requestTeenApproval } from "@/lib/auth";

type Step = "age" | "teenParent" | "adultChoice" | "childDetails" | "under10Blocked";

export default function Onboarding() {
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("age");
  const [parentEmail, setParentEmail] = useState("");
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const auth = getAuth(app);
    const unsub = onAuthStateChanged(auth, (user) => setUid(user?.uid ?? null));
    return () => unsub();
  }, []);

  function handleAgeChoice(choice: "under10" | "teen" | "adult") {
    if (choice === "under10") setStep("under10Blocked");
    else if (choice === "teen") setStep("teenParent");
    else setStep("adultChoice");
  }

  async function submitTeenRequest() {
    if (!uid || !parentEmail) return;
    setBusy(true);
    setError("");
    try {
      await requestTeenApproval(uid, parentEmail);
      router.push("/waiting-approval");
    } catch (e: any) {
      setError(e.message ?? "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function chooseMyself() {
    if (!uid) return;
    setBusy(true);
    try {
      await setupAdultSelf(uid);
      router.push("/dashboard");
    } finally {
      setBusy(false);
    }
  }

  async function submitChildDetails() {
    if (!uid || !childName || !childAge) return;
    setBusy(true);
    setError("");
    try {
      await setupGuardianAndChild(uid, childName, parseInt(childAge, 10));
      router.push("/dashboard");
    } catch (e: any) {
      setError(e.message ?? "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16" style={{ background: COLORS.cream }}>
      <div className="w-full max-w-sm p-8 rounded-3xl bg-white shadow-soft" style={{ border: `1px solid ${COLORS.mist}` }}>
        <p className="eyebrow mb-4">Quick setup</p>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.22 }}
          >
            {step === "age" && (
              <>
                <h1 className="text-xl mb-4 font-display" style={{ color: COLORS.plum }}>How old are you?</h1>
                <div className="flex flex-col gap-2.5">
                  <ChoiceButton label="Under 10" onClick={() => handleAgeChoice("under10")} />
                  <ChoiceButton label="10 to 17" onClick={() => handleAgeChoice("teen")} />
                  <ChoiceButton label="18 or older" onClick={() => handleAgeChoice("adult")} />
                </div>
              </>
            )}

            {step === "teenParent" && (
              <>
                <h1 className="text-xl mb-2 font-display" style={{ color: COLORS.plum }}>One more step</h1>
                <p className="text-sm mb-4 font-body" style={{ color: COLORS.plumSoft }}>
                  Since you're under 18, a parent or guardian needs to approve your account. Enter their email and we'll set up the request.
                </p>
                <input
                  className="w-full px-4 py-3 rounded-xl border text-sm font-body mb-3"
                  style={{ borderColor: COLORS.mist, background: COLORS.cream }}
                  placeholder="Parent's email"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                />
                <PrimaryButton label={busy ? "Sending..." : "Send for approval"} onClick={submitTeenRequest} busy={busy} />
              </>
            )}

            {step === "adultChoice" && (
              <>
                <h1 className="text-xl mb-4 font-display" style={{ color: COLORS.plum }}>Who is this account for?</h1>
                <div className="flex flex-col gap-2.5">
                  <ChoiceButton label="Myself" onClick={chooseMyself} />
                  <ChoiceButton label="My child" onClick={() => setStep("childDetails")} />
                </div>
              </>
            )}

            {step === "childDetails" && (
              <>
                <h1 className="text-xl mb-2 font-display" style={{ color: COLORS.plum }}>Tell us about your child</h1>
                <p className="text-sm mb-4 font-body" style={{ color: COLORS.plumSoft }}>You'll manage this profile as their guardian.</p>
                <div className="flex flex-col gap-3 mb-3">
                  <input
                    className="w-full px-4 py-3 rounded-xl border text-sm font-body"
                    style={{ borderColor: COLORS.mist, background: COLORS.cream }}
                    placeholder="Child's name"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                  />
                  <input
                    className="w-full px-4 py-3 rounded-xl border text-sm font-body"
                    style={{ borderColor: COLORS.mist, background: COLORS.cream }}
                    type="number"
                    placeholder="Child's age"
                    value={childAge}
                    onChange={(e) => setChildAge(e.target.value)}
                  />
                </div>
                <PrimaryButton label={busy ? "Setting up..." : "Continue"} onClick={submitChildDetails} busy={busy} />
              </>
            )}

            {step === "under10Blocked" && (
              <>
                <h1 className="text-xl mb-2 font-display" style={{ color: COLORS.plum }}>Almost there</h1>
                <p className="text-sm mb-4 font-body" style={{ color: COLORS.plumSoft }}>
                  For users under 10, a parent or guardian needs to create and manage this account instead. Please have them sign up and add you as a linked profile.
                </p>
                <a className="text-sm font-semibold" style={{ color: COLORS.rose }} href="/">Back to home</a>
              </>
            )}

            {error && <p className="mt-3 text-xs font-body" style={{ color: COLORS.rose }}>{error}</p>}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function ChoiceButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ borderColor: COLORS.rose }}
      onClick={onClick}
      className="w-full py-3.5 rounded-2xl font-semibold text-sm font-body transition-colors"
      style={{ background: COLORS.cream, color: COLORS.plum, border: `1.5px solid ${COLORS.mist}` }}
    >
      {label}
    </motion.button>
  );
}

function PrimaryButton({ label, onClick, busy }: { label: string; onClick: () => void; busy: boolean }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      disabled={busy}
      onClick={onClick}
      className="w-full py-3.5 rounded-2xl font-semibold text-sm font-body"
      style={{ background: COLORS.plum, color: COLORS.cream, opacity: busy ? 0.7 : 1 }}
    >
      {label}
    </motion.button>
  );
}
