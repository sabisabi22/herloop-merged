"use client";

import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  getFirestore,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { app } from "@/lib/firebaseConfig";
import { COLORS } from "@/lib/theme";

const db = getFirestore(app);

const MOODS = [
  { id: "happy", emoji: "😊", label: "Happy" },
  { id: "calm", emoji: "😌", label: "Calm" },
  { id: "tired", emoji: "😴", label: "Tired" },
  { id: "anxious", emoji: "😟", label: "Anxious" },
  { id: "sad", emoji: "😢", label: "Sad" },
  { id: "irritable", emoji: "😠", label: "Irritable" },
];

const SYMPTOMS = [
  "Cramps",
  "Headache",
  "Bloating",
  "Back pain",
  "Nausea",
  "Acne",
  "Cravings",
  "Fatigue",
  "Tender breasts",
];

type CheckIn = {
  mood: string | null;
  symptoms: string[];
  note: string;
};

const empty: CheckIn = {
  mood: null,
  symptoms: [],
  note: "",
};

type Props = {
  uid: string;
  date: string;
};

export default function DailyCheckIn({ uid, date }: Props) {
  const [data, setData] = useState<CheckIn>(empty);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load the selected user's check-in for the selected date.
  useEffect(() => {
    let cancelled = false;

    async function loadCheckIn() {
      setLoading(true);
      setSaved(false);
      setError("");
      setData(empty);

      try {
        const checkInRef = doc(
          db,
          "users",
          uid,
          "dailyCheckIns",
          date
        );

        const snapshot = await getDoc(checkInRef);

        if (cancelled) return;

        if (snapshot.exists()) {
          const value = snapshot.data();

          setData({
            mood:
              typeof value.mood === "string"
                ? value.mood
                : null,

            symptoms: Array.isArray(value.symptoms)
              ? value.symptoms.filter(
                  (item): item is string =>
                    typeof item === "string"
                )
              : [],

            note:
              typeof value.note === "string"
                ? value.note
                : "",
          });
        } else {
          setData(empty);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not load your check-in."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadCheckIn();

    return () => {
      cancelled = true;
    };
  }, [uid, date]);

  function toggleMood(moodId: string) {
    setData((current) => ({
      ...current,
      mood: current.mood === moodId ? null : moodId,
    }));

    setSaved(false);
    setError("");
  }

  function toggleSymptom(symptom: string) {
    setData((current) => ({
      ...current,
      symptoms: current.symptoms.includes(symptom)
        ? current.symptoms.filter(
            (item) => item !== symptom
          )
        : [...current.symptoms, symptom],
    }));

    setSaved(false);
    setError("");
  }

  async function saveCheckIn() {
    if (saving) return;

    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const checkInRef = doc(
        db,
        "users",
        uid,
        "dailyCheckIns",
        date
      );

      await setDoc(
        checkInRef,
        {
          mood: data.mood,
          symptoms: data.symptoms,
          note: data.note,
          date,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setSaved(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not save your check-in. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div
        className="mx-5 mt-5 rounded-2xl p-5 text-center text-sm"
        style={{
          background: "#FFFFFF",
          color: COLORS.plum,
          border: `1px solid ${COLORS.mist}`,
        }}
      >
        Loading your check-in...
      </div>
    );
  }

  return (
    <section
      className="mx-5 mt-5 rounded-2xl p-4"
      style={{
        background: "#FFFFFF",
        border: `1px solid ${COLORS.mist}`,
      }}
    >
      <h2
        className="mb-1 text-base font-semibold font-body"
        style={{ color: COLORS.plum }}
      >
        How are you feeling?
      </h2>

      <p
        className="mb-4 text-xs font-body"
        style={{ color: `${COLORS.plum}88` }}
      >
        Daily check-in · {date}
      </p>

      {/* Mood selection */}
      <p
        className="mb-2 text-xs font-semibold font-body"
        style={{ color: `${COLORS.plum}88` }}
      >
        Your mood
      </p>

      <div className="mb-5 flex flex-wrap gap-2">
        {MOODS.map((mood) => {
          const active = data.mood === mood.id;

          return (
            <button
              key={mood.id}
              type="button"
              aria-pressed={active}
              onClick={() => toggleMood(mood.id)}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold font-body transition"
              style={{
                background: active
                  ? COLORS.rose
                  : `${COLORS.plum}0A`,
                color: active ? "#FFFFFF" : COLORS.plum,
                border: `1px solid ${
                  active ? COLORS.rose : COLORS.mist
                }`,
              }}
            >
              <span>{mood.emoji}</span>
              {mood.label}
            </button>
          );
        })}
      </div>

      {/* Symptoms selection */}
      <p
        className="mb-2 text-xs font-semibold font-body"
        style={{ color: `${COLORS.plum}88` }}
      >
        Symptoms (optional)
      </p>

      <div className="mb-5 flex flex-wrap gap-2">
        {SYMPTOMS.map((symptom) => {
          const active = data.symptoms.includes(symptom);

          return (
            <button
              key={symptom}
              type="button"
              aria-pressed={active}
              onClick={() => toggleSymptom(symptom)}
              className="rounded-full px-3 py-1.5 text-xs font-body transition"
              style={{
                background: active
                  ? COLORS.plum
                  : "#FFFFFF",
                color: active ? "#FFFFFF" : COLORS.plum,
                border: `1px solid ${
                  active ? COLORS.plum : COLORS.mist
                }`,
              }}
            >
              {symptom}
            </button>
          );
        })}
      </div>

      {/* Private note */}
      <label
        htmlFor="daily-checkin-note"
        className="mb-2 block text-xs font-semibold font-body"
        style={{ color: `${COLORS.plum}88` }}
      >
        Personal note (optional)
      </label>

      <textarea
        id="daily-checkin-note"
        value={data.note}
        onChange={(event) => {
          setData((current) => ({
            ...current,
            note: event.target.value,
          }));
          setSaved(false);
          setError("");
        }}
        placeholder="Write a note for yourself..."
        rows={3}
        maxLength={2000}
        className="mb-3 w-full rounded-xl border px-3 py-2.5 text-sm font-body"
        style={{
          borderColor: COLORS.mist,
          background: COLORS.cream,
          color: COLORS.plum,
        }}
      />

      {error && (
        <p
          role="alert"
          className="mb-3 rounded-xl p-3 text-sm"
          style={{
            color: "#9F1239",
            background: "#FFF1F2",
          }}
        >
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={saveCheckIn}
        disabled={saving}
        className="w-full rounded-2xl py-3 font-semibold text-sm font-body transition"
        style={{
          background: COLORS.plum,
          color: "#FFFFFF",
          opacity: saving ? 0.7 : 1,
        }}
      >
        {saving
          ? "Saving..."
          : saved
            ? "Saved ✓"
            : "Save check-in"}
      </button>

      <p
        className="mt-3 text-center text-xs leading-5 font-body"
        style={{ color: `${COLORS.plum}77` }}
      >
        Your check-in is stored under your account and selected
        date. Keep your account secure.
      </p>
    </section>
  );
}
