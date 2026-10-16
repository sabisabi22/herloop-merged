
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

type ModuleChoice = "health" | "health_education";

type Step =
  | "modules"
  | "dob"
  | "teenParent"
  | "adultChoice"
  | "childDetails"
  | "healthPreferences";

export default function Onboarding() {
  const router = useRouter();

  const [uid, setUid] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("modules");

  const [moduleChoice, setModuleChoice] =
    useState<ModuleChoice>("health");

  const [dateOfBirth, setDateOfBirth] = useState("");
  const [age, setAge] = useState<number | null>(null);

  const [parentEmail, setParentEmail] = useState("");
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");

  const [periodTracking, setPeriodTracking] = useState<
    "yes" | "no" | "later"
  >("later");

  const [pregnancySupport, setPregnancySupport] = useState<
    "yes" | "no" | "later"
  >("later");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const auth = getAuth(app);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUid(user?.uid ?? null);
    });

    return () => unsubscribe();
  }, []);

  function calculateAge(dob: string) {
    const [year, month, day] = dob.split("-").map(Number);
    const today = new Date();

    let calculatedAge = today.getFullYear() - year;

    const birthdayPassed =
      today.getMonth() + 1 > month ||
      (today.getMonth() + 1 === month &&
        today.getDate() >= day);

    if (!birthdayPassed) calculatedAge--;

    return calculatedAge;
  }

  async function saveField(field: string, value: unknown) {
    if (!uid) {
      throw new Error(
        "Your account is not ready yet. Please try again."
      );
    }

    await updateProfileField(uid, field as never, value as never);
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

    const selectedDate = new Date(`${dateOfBirth}T00:00:00`);
    const today = new Date();

    if (
      Number.isNaN(selectedDate.getTime()) ||
      selectedDate > today
    ) {
      setError("Please enter a valid date of birth.");
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
      // Save the selected module to the user profile.
      await saveField("selectedModules", moduleChoice);

      await saveField("dateOfBirth", dateOfBirth);
      await saveField("age", calculatedAge);

      if (calculatedAge < 18) {
        // Keep the existing guardian approval requirement.
        setStep("teenParent");
      } else {
        setStep("adultChoice");
      }
    } catch (e: unknown) {
      setError(
        e instanceof Error ? e.message : "Something went wrong."
      );
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
      await requestTeenApproval(uid, parentEmail.trim());
      router.push("/waiting-approval");
    } catch (e: unknown) {
      setError(
        e instanceof Error ? e.message : "Something went wrong."
      );
    } finally {
      setBusy(false);
    }
  }

  async function chooseMyself() {
    if (!uid) {
      setError("Your account is not ready yet.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      await setupAdultSelf(uid);
      setStep("healthPreferences");
    } catch (e: unknown) {
      setError(
        e instanceof Error ? e.message : "Something went wrong."
      );
    } finally {
      setBusy(false);
    }
  }

  async function submitChildDetails() {
    if (!uid) {
      setError("Your account is not ready yet.");
      return;
    }

    if (!childName.trim() || !childAge) {
      setError("Please enter your child's name and age.");
      return;
    }

    const parsedAge = Number(childAge);

    if (
      !Number.isInteger(parsedAge) ||
      parsedAge < 0 ||
      parsedAge > 120
    ) {
      setError("Please enter a valid age for your child.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      await setupGuardianAndChild(
        uid,
        childName.trim(),
        parsedAge
      );

      router.push("/dashboard");
    } catch (e: unknown) {
      setError(
        e instanceof Error ? e.message : "Something went wrong."
      );
    } finally {
      setBusy(false);
    }
  }

  async function finishHealthSetup() {
    if (!uid) {
      setError("Your account is not ready yet.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      await saveField(
        "periodTrackingEnabled",
        periodTracking === "yes"
      );

      await saveField(
        "pregnancySupportEnabled",
        pregnancySupport === "yes"
      );

      await saveField("healthPreferencesCompleted", true);

      router.push("/dashboard");
    } catch (e: unknown) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not save your preferences."
      );
    } finally {
      setBusy(false);
    }
  }

  const showPeriodQuestion =
    age !== null && age >= 10 && age <= 55;

  return (
    <main
      className="min-h-screen flex items-center justify-center px-5 py-10"
      style={{ background: COLORS.cream }}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-soft"
        style={{ border: `1px solid ${COLORS.mist}` }}
      >
        <p className="eyebrow mb-3">Welcome to HerLoop</p>

        <div className="mb-6 flex items-center gap-2">
          {(["modules", "dob"] as Step[]).map((item, index) => (
            <div
              key={item}
              className="h-1.5 flex-1 rounded-full"
              style={{
                background:
                  step === item ||
                  (index === 0 && step !== "modules")
                    ? COLORS.rose
                    : COLORS.mist,
              }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
          >
            {step === "modules" && (
              <>
                <h1
                  className="mb-2 font-display text-2xl font-bold"
                  style={{ color: COLORS.plum }}
                >
                  Choose your HerLoop experience
                </h1>

                <p
                  className="mb-6 text-sm leading-6"
                  style={{ color: COLORS.plumSoft }}
                >
                  Select the support you would like. You can update
                  your preferences later.
                </p>

                <div className="flex flex-col gap-3">
                  <ModuleCard
                    selected={moduleChoice === "health"}
                    icon="♡"
                    title="Health"
                    description="Period tracking, health education, personal notes and optional wellbeing reminders."
                    onClick={() => setModuleChoice("health")}
                  />

                  <ModuleCard
                    selected={moduleChoice === "health_education"}
                    icon="✦"
                    title="Health + Education"
                    description="Everything in Health, plus learning resources, scholarships, eligibility details and career opportunities."
                    onClick={() =>
                      setModuleChoice("health_education")
                    }
                  />
                </div>

                <PrimaryButton
                  label="Continue"
                  busy={busy}
                  onClick={() => {
                    setError("");

                    try {
                      localStorage.setItem(
                        "herloop_selected_module",
                        moduleChoice
                      );
                    } catch (e) {
                      console.error(
                        "Unable to save selected module:",
                        e
                      );
                      setError(
                        "Could not save your module selection. Please check your browser settings and try again."
                      );
                      return;
                    }

                    setStep("dob");
                  }}
                />
              </>
            )}

            {step === "dob" && (
              <>
                <h1
                  className="mb-2 font-display text-2xl font-bold"
                  style={{ color: COLORS.plum }}
                >
                  Let's personalise your experience
                </h1>

                <p
                  className="mb-5 text-sm leading-6"
                  style={{ color: COLORS.plumSoft }}
                >
                  Your date of birth helps us provide age-appropriate
                  information and features.
                </p>

                <label
                  htmlFor="dateOfBirth"
                  className="mb-2 block text-sm font-semibold"
                  style={{ color: COLORS.plum }}
                >
                  Date of birth
                </label>

                <input
                  id="dateOfBirth"
                  type="date"
                  max={new Date().toISOString().split("T")[0]}
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="mb-4 w-full rounded-xl border px-4 py-3 text-sm"
                  style={{
                    borderColor: COLORS.mist,
                    background: COLORS.cream,
                  }}
                />

                <PrimaryButton
                  label={busy ? "Saving..." : "Continue"}
                  busy={busy}
                  onClick={handleDobSubmit}
                />

                <BackButton onClick={() => setStep("modules")} />
              </>
            )}

            {step === "teenParent" && (
              <>
                <h1
                  className="mb-2 font-display text-2xl font-bold"
                  style={{ color: COLORS.plum }}
                >
                  Parent or guardian approval
                </h1>

                <p
                  className="mb-4 text-sm leading-6"
                  style={{ color: COLORS.plumSoft }}
                >
                  Since you're under 18, a parent or guardian needs
                  to approve this account before you continue.
                </p>

                {age !== null && (
                  <p
                    className="mb-4 text-sm"
                    style={{ color: COLORS.plumSoft }}
                  >
                    Your calculated age: {age}
                  </p>
                )}

                <label
                  htmlFor="parentEmail"
                  className="mb-2 block text-sm font-semibold"
                  style={{ color: COLORS.plum }}
                >
                  Parent or guardian email
                </label>

                <input
                  id="parentEmail"
                  type="email"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="mb-4 w-full rounded-xl border px-4 py-3 text-sm"
                  style={{
                    borderColor: COLORS.mist,
                    background: COLORS.cream,
                  }}
                />

                <PrimaryButton
                  label={busy ? "Sending..." : "Request approval"}
                  busy={busy}
                  onClick={submitTeenRequest}
                />
              </>
            )}

            {step === "adultChoice" && (
              <>
                <h1
                  className="mb-2 font-display text-2xl font-bold"
                  style={{ color: COLORS.plum }}
                >
                  Who is this account for?
                </h1>

                <p
                  className="mb-5 text-sm leading-6"
                  style={{ color: COLORS.plumSoft }}
                >
                  Choose whether you are setting up your own account
                  or managing a profile for your child.
                </p>

                <div className="flex flex-col gap-3">
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

            {step === "childDetails" && (
              <>
                <h1
                  className="mb-2 font-display text-2xl font-bold"
                  style={{ color: COLORS.plum }}
                >
                  Tell us about your child
                </h1>

                <p
                  className="mb-5 text-sm leading-6"
                  style={{ color: COLORS.plumSoft }}
                >
                  You'll manage this profile as their guardian.
                </p>

                <input
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="Child's name"
                  className="mb-3 w-full rounded-xl border px-4 py-3 text-sm"
                  style={{ borderColor: COLORS.mist }}
                />

                <input
                  value={childAge}
                  onChange={(e) => setChildAge(e.target.value)}
                  type="number"
                  min="0"
                  max="120"
                  placeholder="Child's age"
                  className="mb-4 w-full rounded-xl border px-4 py-3 text-sm"
                  style={{ borderColor: COLORS.mist }}
                />

                <PrimaryButton
                  label={busy ? "Setting up..." : "Continue"}
                  busy={busy}
                  onClick={submitChildDetails}
                />
              </>
            )}

            {step === "healthPreferences" && (
              <>
                <h1
                  className="mb-2 font-display text-2xl font-bold"
                  style={{ color: COLORS.plum }}
                >
                  Your health preferences
                </h1>

                <p
                  className="mb-6 text-sm leading-6"
                  style={{ color: COLORS.plumSoft }}
                >
                  These optional choices help personalise your health
                  experience. You can skip either question.
                </p>

                {showPeriodQuestion && (
                  <section className="mb-6">
                    <h2
                      className="mb-2 text-base font-semibold"
                      style={{ color: COLORS.plum }}
                    >
                      Would you like to use period tracking?
                    </h2>

                    <p
                      className="mb-3 text-sm leading-6"
                      style={{ color: COLORS.plumSoft }}
                    >
                      You can record period dates and symptoms and
                      receive optional cycle reminders.
                    </p>

                    <div className="flex flex-col gap-2">
                      <PreferenceButton
                        selected={periodTracking === "yes"}
                        label="Yes, set up my period tracker"
                        onClick={() => setPeriodTracking("yes")}
                      />

                      <PreferenceButton
                        selected={periodTracking === "no"}
                        label="No, not right now"
                        onClick={() => setPeriodTracking("no")}
                      />

                      <PreferenceButton
                        selected={periodTracking === "later"}
                        label="Decide later"
                        onClick={() => setPeriodTracking("later")}
                      />
                    </div>
                  </section>
                )}

                {age !== null && age >= 18 && (
                  <section className="mb-6">
                    <h2
                      className="mb-2 text-base font-semibold"
                      style={{ color: COLORS.plum }}
                    >
                      Would pregnancy-related support be helpful to you?
                    </h2>

                    <p
                      className="mb-3 text-sm leading-6"
                      style={{ color: COLORS.plumSoft }}
                    >
                      If relevant, we can provide pregnancy education,
                      appointment reminders and wellbeing resources.
                      This choice is optional and does not confirm a
                      pregnancy.
                    </p>

                    <div className="flex flex-col gap-2">
                      <PreferenceButton
                        selected={pregnancySupport === "yes"}
                        label="Yes, show me pregnancy support"
                        onClick={() => setPregnancySupport("yes")}
                      />

                      <PreferenceButton
                        selected={pregnancySupport === "no"}
                        label="No, continue with general health resources"
                        onClick={() => setPregnancySupport("no")}
                      />

                      <PreferenceButton
                        selected={pregnancySupport === "later"}
                        label="Prefer to decide later"
                        onClick={() => setPregnancySupport("later")}
                      />
                    </div>
                  </section>
                )}

                <p
                  className="mb-4 text-xs leading-5"
                  style={{ color: COLORS.plumSoft }}
                >
                  Your preferences should be changeable later. Health
                  information is educational and does not replace
                  professional care.
                </p>

                <PrimaryButton
                  label={busy ? "Saving..." : "Finish setup"}
                  busy={busy}
                  onClick={finishHealthSetup}
                />
              </>
            )}

            {error && (
              <p
                role="alert"
                className="mt-4 rounded-xl p-3 text-sm"
                style={{
                  color: "#9F1239",
                  background: "#FFF1F2",
                }}
              >
                {error}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}

function ModuleCard({
  selected,
  icon,
  title,
  description,
  onClick,
}: {
  selected: boolean;
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className="w-full rounded-2xl p-4 text-left transition"
      style={{
        border: `1.5px solid ${selected ? COLORS.rose : COLORS.mist}`,
        background: selected ? `${COLORS.rose}0D` : "#FFFFFF",
      }}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <span
          className="text-lg font-bold"
          style={{ color: COLORS.rose }}
        >
          {icon}
        </span>

        <span
          className="text-sm font-semibold"
          style={{
            color: selected ? COLORS.rose : COLORS.plumSoft,
          }}
        >
          {selected ? "Selected ✓" : "Select"}
        </span>
      </div>

      <span
        className="block text-base font-bold"
        style={{ color: COLORS.plum }}
      >
        {title}
      </span>

      <span
        className="mt-1 block text-sm leading-6"
        style={{ color: COLORS.plumSoft }}
      >
        {description}
      </span>
    </button>
  );
}

function PreferenceButton({
  selected,
  label,
  onClick,
}: {
  selected: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className="w-full rounded-xl px-4 py-3 text-left text-sm font-medium"
      style={{
        color: COLORS.plum,
        border: `1px solid ${selected ? COLORS.rose : COLORS.mist}`,
        background: selected ? `${COLORS.rose}10` : "#FFFFFF",
      }}
    >
      {selected ? "✓ " : ""}
      {label}
    </button>
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
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full rounded-2xl py-3.5 text-sm font-semibold"
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

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-4 w-full py-2 text-sm font-medium"
      style={{ color: COLORS.plumSoft }}
    >
      ← Back
    </button>
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
      type="button"
      whileTap={{ scale: 0.98 }}
      disabled={busy}
      onClick={onClick}
      className="mt-4 w-full rounded-2xl py-3.5 text-sm font-semibold"
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
