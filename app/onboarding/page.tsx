"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import { app } from "@/lib/firebaseConfig";
import { COLORS } from "@/lib/theme";

import {
  setupAdultSelf,
  setupGuardianAndChild,
  requestTeenApproval,
  updateProfileField,
} from "@/lib/auth";

type Step =
  | "dob"
  | "teenParent"
  | "adultChoice"
  | "childDetails";

export default function Onboarding() {
  const router = useRouter();

  const [uid, setUid] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("dob");

  const [dateOfBirth, setDateOfBirth] = useState("");
  const [age, setAge] = useState<number | null>(null);

  const [parentEmail, setParentEmail] = useState("");
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const auth = getAuth(app);

    const unsub = onAuthStateChanged(auth, (user) => {
      setUid(user?.uid ?? null);
    });

    return () => unsub();
  }, []);

  function calculateAge(dob: string) {
    const [year, month, day] = dob.split("-").map(Number);

    const today = new Date();

    let calculatedAge = today.getFullYear() - year;

    const birthdayPassed =
      today.getMonth() + 1 > month ||
      (today.getMonth() + 1 === month &&
        today.getDate() >= day);

    if (!birthdayPassed) {
      calculatedAge--;
    }

    return calculatedAge;
  }

  async function handleDobSubmit() {
    if (!uid) {
      setError("Your account is not ready yet. Please try again.");
      return;
    }

    if (!dateOfBirth) {
      setError("Please select your date of birth.");
      return;
    }

    const selectedDate = new Date(dateOfBirth);
    const today = new Date();

    if (selectedDate > today) {
      setError("Date of birth cannot be in the future.");
      return;
    }

    const calculatedAge = calculateAge(dateOfBirth);

    if (calculatedAge < 0 || calculatedAge > 120) {
      setError("Please enter a valid date of birth.");
      return;
    }

    setBusy(true);
    setError("");
    setAge(calculatedAge);

    try {
      await updateProfileField(uid, "dateOfBirth", dateOfBirth);
      await updateProfileField(uid, "age", calculatedAge);

      if (calculatedAge < 18) {
        setStep("teenParent");
      } else {
        setStep("adultChoice");
      }
    } catch (e: any) {
      setError(e.message ?? "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function submitTeenRequest() {
    if (!uid) {
      setError("Your account is not ready yet.");
      return;
    }

    if (!parentEmail.trim()) {
      setError("Please enter your parent or guardian's email.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      // 1. Save the approval request in Firestore
      const approvalToken = await requestTeenApproval(
        uid,
        parentEmail.trim()
      );

      // 2. Send the parent/guardian email
      const response = await fetch("/api/send-parent-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parentEmail: parentEmail.trim(),
          teenName: "HerLoop user",
          approvalToken: approvalToken,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ?? "Could not send the parent approval email."
        );
      }

      // 3. Email sent successfully → waiting page
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
    setError("");

    try {
      await setupAdultSelf(uid);
      router.push("/dashboard");
    } catch (e: any) {
      setError(e.message ?? "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function submitChildDetails() {
    if (!uid) return;

    if (!childName.trim() || !childAge) {
      setError("Please enter your child's name and age.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      await setupGuardianAndChild(
        uid,
        childName.trim(),
        parseInt(childAge, 10)
      );

      router.push("/dashboard");
    } catch (e: any) {
      setError(e.message ?? "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-16"
      style={{ background: COLORS.cream }}
    >
      <div
        className="w-full max-w-sm p-8 rounded-3xl bg-white shadow-soft"
        style={{ border: `1px solid ${COLORS.mist}` }}
      >
        <p className="eyebrow mb-4">Quick setup</p>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.22 }}
          >
            {/* DATE OF BIRTH */}
            {step === "dob" && (
              <>
                <h1
                  className="text-xl mb-2 font-display"
                  style={{ color: COLORS.plum }}
                >
                  When were you born?
                </h1>

                <p
                  className="text-sm mb-5 font-body"
                  style={{ color: COLORS.plumSoft }}
                >
                  Your age helps us set up the right experience and support
                  options for you.
                </p>

                <input
                  type="date"
                  className="w-full px-4 py-3 rounded-xl border text-sm font-body mb-4"
                  style={{
                    borderColor: COLORS.mist,
                    background: COLORS.cream,
                  }}
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />

                <PrimaryButton
                  label={busy ? "Checking..." : "Continue"}
                  onClick={handleDobSubmit}
                  busy={busy}
                />
              </>
            )}

            {/* PARENT / GUARDIAN APPROVAL */}
            {step === "teenParent" && (
              <>
                <h1
                  className="text-xl mb-2 font-display"
                  style={{ color: COLORS.plum }}
                >
                  Parent or guardian approval
                </h1>

                <p
                  className="text-sm mb-4 font-body"
                  style={{ color: COLORS.plumSoft }}
                >
                  Since you're under 18, a parent or guardian needs to
                  approve this account.
                </p>

                {age !== null && (
                  <p
                    className="text-xs mb-4 font-body"
                    style={{ color: COLORS.plumSoft }}
                  >
                    We detected your age as {age}.
                  </p>
                )}

                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-xl border text-sm font-body mb-3"
                  style={{
                    borderColor: COLORS.mist,
                    background: COLORS.cream,
                  }}
                  placeholder="Parent or guardian's email"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                />

                <PrimaryButton
                  label={busy ? "Sending..." : "Send for approval"}
                  onClick={submitTeenRequest}
                  busy={busy}
                />
              </>
            )}

            {/* ADULT ACCOUNT */}
            {step === "adultChoice" && (
              <>
                <h1
                  className="text-xl mb-4 font-display"
                  style={{ color: COLORS.plum }}
                >
                  Who is this account for?
                </h1>

                <div className="flex flex-col gap-2.5">
                  <ChoiceButton
                    label="Myself"
                    onClick={chooseMyself}
                  />

                  <ChoiceButton
                    label="My child"
                    onClick={() => setStep("childDetails")}
                  />
                </div>
              </>
            )}

            {/* GUARDIAN ACCOUNT */}
            {step === "childDetails" && (
              <>
                <h1
                  className="text-xl mb-2 font-display"
                  style={{ color: COLORS.plum }}
                >
                  Tell us about your child
                </h1>

                <p
                  className="text-sm mb-4 font-body"
                  style={{ color: COLORS.plumSoft }}
                >
                  You'll manage this profile as their guardian.
                </p>

                <div className="flex flex-col gap-3 mb-3">
                  <input
                    className="w-full px-4 py-3 rounded-xl border text-sm font-body"
                    style={{
                      borderColor: COLORS.mist,
                      background: COLORS.cream,
                    }}
                    placeholder="Child's name"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                  />

                  <input
                    className="w-full px-4 py-3 rounded-xl border text-sm font-body"
                    style={{
                      borderColor: COLORS.mist,
                      background: COLORS.cream,
                    }}
                    type="number"
                    placeholder="Child's age"
                    value={childAge}
                    onChange={(e) => setChildAge(e.target.value)}
                  />
                </div>

                <PrimaryButton
                  label={busy ? "Setting up..." : "Continue"}
                  onClick={submitChildDetails}
                  busy={busy}
                />
              </>
            )}

            {error && (
              <p
                className="mt-3 text-xs font-body"
                style={{ color: COLORS.rose }}
              >
                {error}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function ChoiceButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ borderColor: COLORS.rose }}
      onClick={onClick}
      className="w-full py-3.5 rounded-2xl font-semibold text-sm font-body transition-colors"
      style={{
        background: COLORS.cream,
        color: COLORS.plum,
        border: `1.5px solid ${COLORS.mist}`,
      }}
    >
      {label}
    </motion.button>
  );
}

function PrimaryButton({
  label,
  onClick,
  busy,
}: {
  label: string;
  onClick: () => void;
  busy: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      disabled={busy}
      onClick={onClick}
      className="w-full py-3.5 rounded-2xl font-semibold text-sm font-body"
      style={{
        background: COLORS.plum,
        color: COLORS.cream,
        opacity: busy ? 0.7 : 1,
      }}
    >
      {label}
    </motion.button>
  );
}