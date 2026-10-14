"use client";

import { useEffect, useState } from "react";
import { COLORS } from "@/lib/theme";

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

type CheckIn = { mood: string | null; symptoms: string[]; note: string };

const empty: CheckIn = { mood: null, symptoms: [], note: "" };

type Props = {
  uid: string;
  date: string; // "YYYY-MM-DD"
};

export default function DailyCheckIn({ uid, date }: Props) {
  const key = `herloop-checkin-${uid}-${date}`;
  const [data, setData] = useState<CheckIn>(empty);
  const [saved, setSaved] = useState(false);

  // load whenever the selected date changes
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      setData(raw ? JSON.parse(raw) : empty);
    } catch {
      setData(empty);
    }
    setSaved(false);
  }, [key]);

  const toggleSymptom = (s: string) =>
    setData((d) => ({
      ...d,
      symptoms: d.symptoms.includes(s)
        ? d.symptoms.filter((x) => x !== s)
        : [...d.symptoms, s],
    }));

  // Swap localStorage for your Firestore/API call later.
  const save = () => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      setSaved(true);
    } catch {}
  };

  return (
    <div
      className="mx-5 mt-5 p-4 rounded-2xl"
      style={{ background: "#fff", border: `1px solid ${COLORS.mist}` }}
    >
      <p
        className="text-sm font-semibold font-body mb-0.5"
        style={{ color: COLORS.plum }}
      >
        How are you feeling?
      </p>
      <p className="text-xs font-body mb-3" style={{ color: `${COLORS.plum}88` }}>
        {date}
      </p>

      {/* mood */}
      <div className="flex gap-2 flex-wrap mb-4">
        {MOODS.map((m) => {
          const active = data.mood === m.id;
          return (
            <button
              key={m.id}
              onClick={() => {
                setData({ ...data, mood: active ? null : m.id });
                setSaved(false);
              }}
              className="px-3 py-2 rounded-xl text-xs font-semibold font-body flex items-center gap-1.5"
              style={{
                background: active ? COLORS.rose : `${COLORS.plum}0A`,
                color: active ? "#fff" : COLORS.plum,
              }}
            >
              <span>{m.emoji}</span>
              {m.label}
            </button>
          );
        })}
      </div>

      {/* symptoms */}
      <p className="text-xs font-semibold font-body mb-2" style={{ color: `${COLORS.plum}88` }}>
        Symptoms
      </p>
      <div className="flex gap-2 flex-wrap mb-4">
        {SYMPTOMS.map((s) => {
          const active = data.symptoms.includes(s);
          return (
            <button
              key={s}
              onClick={() => {
                toggleSymptom(s);
                setSaved(false);
              }}
              className="px-3 py-1.5 rounded-full text-xs font-body"
              style={{
                background: active ? COLORS.plum : "transparent",
                color: active ? "#fff" : COLORS.plum,
                border: `1px solid ${active ? COLORS.plum : COLORS.mist}`,
              }}
            >
              {s}
            </button>
          );
        })}
      </div>

      {/* note */}
      <textarea
        value={data.note}
        onChange={(e) => {
          setData({ ...data, note: e.target.value });
          setSaved(false);
        }}
        placeholder="A private note for yourself..."
        rows={3}
        className="w-full px-3 py-2.5 rounded-xl border text-sm font-body mb-3"
        style={{ borderColor: COLORS.mist, background: COLORS.cream, color: COLORS.plum }}
      />

      <button
        onClick={save}
        className="w-full py-3 rounded-2xl font-semibold text-sm font-body"
        style={{ background: COLORS.plum, color: "#fff" }}
      >
        {saved ? "Saved ✓" : "Save check-in"}
      </button>
    </div>
  );
}