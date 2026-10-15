
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { CalendarDays, FileText, HeartPulse, Trash2 } from "lucide-react";

import { app } from "@/lib/firebaseConfig";
import { COLORS } from "@/lib/theme";
import {
  getCycleLogs,
  type CycleLog,
} from "@/lib/cycle";

const db = getFirestore(app);

const RECORD_TYPES = [
  "Appointment",
  "Medicine",
  "Test result",
  "Health note",
] as const;

type MedicalRecord = {
  id: string;
  type: string;
  title: string;
  details: string;
  date: string;
};

type CheckInRecord = {
  id: string;
  date: string;
  mood: string | null;
  symptoms: string[];
  note: string;
};

type Props = {
  uid: string;
};

export default function HealthRecords({ uid }: Props) {
  const [periods, setPeriods] = useState<CycleLog[]>([]);
  const [checkIns, setCheckIns] = useState<CheckInRecord[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);

  const [type, setType] = useState<string>("Appointment");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(() =>
    new Date().toLocaleDateString("en-CA")
  );
  const [details, setDetails] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [cycleData, checkInSnapshot, medicalSnapshot] =
        await Promise.all([
          getCycleLogs(uid),
          getDocs(
            query(
              collection(db, "users", uid, "dailyCheckIns"),
              orderBy("date", "desc")
            )
          ),
          getDocs(
            query(
              collection(db, "users", uid, "medicalRecords"),
              orderBy("date", "desc")
            )
          ),
        ]);

      setPeriods(cycleData);

      setCheckIns(
        checkInSnapshot.docs.map((item) => {
          const value = item.data();

          return {
            id: item.id,
            date: typeof value.date === "string" ? value.date : item.id,
            mood: typeof value.mood === "string" ? value.mood : null,
            symptoms: Array.isArray(value.symptoms)
              ? value.symptoms.filter(
                  (entry): entry is string => typeof entry === "string"
                )
              : [],
            note: typeof value.note === "string" ? value.note : "",
          };
        })
      );

      setMedicalRecords(
        medicalSnapshot.docs.map((item) => {
          const value = item.data();

          return {
            id: item.id,
            type: typeof value.type === "string" ? value.type : "Health note",
            title: typeof value.title === "string" ? value.title : "",
            details: typeof value.details === "string" ? value.details : "",
            date: typeof value.date === "string" ? value.date : "",
          };
        })
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load your health records."
      );
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  async function handleSave() {
    if (!title.trim() || !details.trim() || !date || saving) {
      setError("Please enter a title, date and details.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await addDoc(collection(db, "users", uid, "medicalRecords"), {
        type,
        title: title.trim(),
        details: details.trim(),
        date,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setTitle("");
      setDetails("");
      setMessage("Health record saved successfully.");
      await loadRecords();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not save this record."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(recordId: string) {
    const confirmed = window.confirm(
      "Delete this medical record? This cannot be undone."
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await deleteDoc(
        doc(db, "users", uid, "medicalRecords", recordId)
      );

      setMedicalRecords((current) =>
        current.filter((record) => record.id !== recordId)
      );

      setMessage("Medical record deleted.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not delete this record."
      );
    }
  }

  const cardStyle = {
    background: "#FFFFFF",
    border: `1px solid ${COLORS.mist}`,
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-sm">
        Loading your health records...
      </div>
    );
  }

  return (
    <div className="space-y-5 px-5 pb-8">
      <header>
        <h2
          className="text-xl font-semibold font-display"
          style={{ color: COLORS.plum }}
        >
          Health Records
        </h2>
        <p
          className="mt-1 text-sm"
          style={{ color: `${COLORS.plum}99` }}
        >
          Your period history, daily check-ins and medical notes.
        </p>
      </header>

      {error && (
        <p
          role="alert"
          className="rounded-xl p-3 text-sm"
          style={{ color: "#9F1239", background: "#FFF1F2" }}
        >
          {error}
        </p>
      )}

      {message && (
        <p
          role="status"
          className="rounded-xl p-3 text-sm"
          style={{ color: "#166534", background: "#F0FDF4" }}
        >
          {message}
        </p>
      )}

      {/* Add a medical record */}
      <section className="rounded-2xl p-4 space-y-3" style={cardStyle}>
        <div className="flex items-center gap-2">
          <FileText size={20} color={COLORS.plum} />
          <h3 className="font-semibold" style={{ color: COLORS.plum }}>
            Add a medical record
          </h3>
        </div>

        <label className="block text-sm">
          Record type
          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="mt-1 w-full rounded-xl border p-3"
            style={{ borderColor: COLORS.mist }}
          >
            {RECORD_TYPES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          Title
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={120}
            placeholder="e.g. Doctor appointment"
            className="mt-1 w-full rounded-xl border p-3"
            style={{ borderColor: COLORS.mist }}
          />
        </label>

        <label className="block text-sm">
          Date
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="mt-1 w-full rounded-xl border p-3"
            style={{ borderColor: COLORS.mist }}
          />
        </label>

        <label className="block text-sm">
          Details
          <textarea
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            maxLength={4000}
            rows={4}
            placeholder="Add notes for your own reference..."
            className="mt-1 w-full rounded-xl border p-3"
            style={{ borderColor: COLORS.mist }}
          />
        </label>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-xl p-3 font-semibold text-sm"
          style={{
            background: COLORS.plum,
            color: "#FFFFFF",
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? "Saving..." : "Save medical record"}
        </button>
      </section>

      {/* Period history */}
      <section className="rounded-2xl p-4" style={cardStyle}>
        <div className="mb-3 flex items-center gap-2">
          <CalendarDays size={20} color={COLORS.rose} />
          <h3 className="font-semibold" style={{ color: COLORS.plum }}>
            Period history
          </h3>
        </div>

        {periods.length === 0 ? (
          <p className="text-sm" style={{ color: `${COLORS.plum}99` }}>
            No period logs yet. Use Log today's flow in your tracker.
          </p>
        ) : (
          <div className="space-y-3">
            {[...periods]
              .sort((a, b) => b.startDate.localeCompare(a.startDate))
              .map((period) => (
                <div
                  key={period.id}
                  className="rounded-xl p-3"
                  style={{ background: `${COLORS.rose}10` }}
                >
                  <p className="font-medium text-sm">
                    {period.startDate}
                  </p>
                  <p className="mt-1 text-xs capitalize">
                    Flow: {period.flow}
                  </p>
                </div>
              ))}
          </div>
        )}
      </section>

      {/* Daily check-in history */}
      <section className="rounded-2xl p-4" style={cardStyle}>
        <div className="mb-3 flex items-center gap-2">
          <HeartPulse size={20} color={COLORS.moss} />
          <h3 className="font-semibold" style={{ color: COLORS.plum }}>
            Daily check-in history
          </h3>
        </div>

        {checkIns.length === 0 ? (
          <p className="text-sm" style={{ color: `${COLORS.plum}99` }}>
            No saved check-ins yet.
          </p>
        ) : (
          <div className="space-y-3">
            {checkIns.map((item) => (
              <article
                key={item.id}
                className="rounded-xl p-3"
                style={{ background: `${COLORS.moss}10` }}
              >
                <p className="text-sm font-semibold">{item.date}</p>
                {item.mood && (
                  <p className="mt-1 text-sm">Mood: {item.mood}</p>
                )}
                {item.symptoms.length > 0 && (
                  <p className="mt-1 text-sm">
                    Symptoms: {item.symptoms.join(", ")}
                  </p>
                )}
                {item.note && (
                  <p className="mt-2 whitespace-pre-wrap text-sm">
                    {item.note}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Medical record history */}
      <section className="rounded-2xl p-4" style={cardStyle}>
        <div className="mb-3 flex items-center gap-2">
          <FileText size={20} color={COLORS.plum} />
          <h3 className="font-semibold" style={{ color: COLORS.plum }}>
            Medical record history
          </h3>
        </div>

        {medicalRecords.length === 0 ? (
          <p className="text-sm" style={{ color: `${COLORS.plum}99` }}>
            No medical records added yet.
          </p>
        ) : (
          <div className="space-y-3">
            {medicalRecords.map((record) => (
              <article
                key={record.id}
                className="rounded-xl border p-3"
                style={{ borderColor: COLORS.mist }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs capitalize">
                      {record.type} · {record.date}
                    </p>
                    <h4 className="mt-1 font-semibold text-sm">
                      {record.title}
                    </h4>
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleDelete(record.id)}
                    aria-label={`Delete ${record.title}`}
                    className="rounded-lg p-2"
                    style={{ color: COLORS.rose }}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>

                <p className="mt-2 whitespace-pre-wrap text-sm">
                  {record.details}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <p
        className="text-xs leading-5"
        style={{ color: `${COLORS.plum}88` }}
      >
        Keep medical notes private. These records are for personal tracking
        and are not a substitute for advice from a qualified healthcare
        professional.
      </p>
    </div>
  );
}
