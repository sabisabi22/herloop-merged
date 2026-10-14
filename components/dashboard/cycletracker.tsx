"use client";

import { useEffect, useMemo, useState } from "react";

/* ---------- date helpers (local time, no timezone bugs) ---------- */
const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
const parse = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
const diffDays = (a: Date, b: Date) =>
  Math.round((a.getTime() - b.getTime()) / 86400000);
const fmt = (d: Date) =>
  d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

/* ---------- cycle logic ---------- */
const STORAGE_KEY = "herloop-cycle-v1";
const DEFAULT_CYCLE = 28;
const DEFAULT_PERIOD = 5;

type DayKind = "period" | "predicted" | "ovulation" | "fertile" | null;

function averageCycle(starts: string[]): number {
  if (starts.length < 2) return DEFAULT_CYCLE;
  const sorted = [...starts].sort();
  const gaps: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    gaps.push(diffDays(parse(sorted[i]), parse(sorted[i - 1])));
  }
  const avg = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
  return Math.min(40, Math.max(21, avg)); // keep within a sane range
}

function getKind(
  date: Date,
  starts: string[],
  cycleLen: number,
  periodLen: number
): DayKind {
  if (!starts.length) return null;
  const sorted = [...starts].sort();

  // 1. logged periods
  for (const s of sorted) {
    const diff = diffDays(date, parse(s));
    if (diff >= 0 && diff < periodLen) return "period";
  }

  // 2. predictions, based on the last logged start
  const last = parse(sorted[sorted.length - 1]);
  for (let k = 0; k <= 12; k++) {
    const nextStart = addDays(last, (k + 1) * cycleLen);
    const ovulation = addDays(nextStart, -14);

    const dNext = diffDays(date, nextStart);
    if (dNext >= 0 && dNext < periodLen) return "predicted";

    const dOv = diffDays(date, ovulation);
    if (dOv === 0) return "ovulation";
    if (dOv >= -5 && dOv <= 1) return "fertile";
  }
  return null;
}

function currentPhase(
  today: Date,
  starts: string[],
  cycleLen: number,
  periodLen: number
) {
  if (!starts.length) return null;
  const last = parse([...starts].sort().pop()!);
  const since = diffDays(today, last);
  if (since < 0) return null;
  const day = (since % cycleLen) + 1;
  const ovDay = cycleLen - 14;

  let phase = "Luteal phase";
  let tip = "Energy may dip. Rest, stay hydrated and eat iron-rich food.";
  if (day <= periodLen) {
    phase = "Menstrual phase";
    tip = "Take it easy. Warmth, rest and water can help with cramps.";
  } else if (day < ovDay - 5) {
    phase = "Follicular phase";
    tip = "Energy usually rises now. A good time for new things.";
  } else if (day === ovDay) {
    phase = "Ovulation day";
    tip = "Peak fertility. You may feel extra energetic.";
  } else if (day >= ovDay - 5 && day <= ovDay + 1) {
    phase = "Fertile window";
    tip = "Fertility is higher during these days.";
  }
  return { day, phase, tip };
}

/* ---------- colours (HerLoop palette) ---------- */
const C = {
  rose: "#b85c63",
  roseSoft: "#f6dfe1",
  plum: "#2b1b2e",
  lavender: "#e6e0f3",
  lavenderDeep: "#8a78b8",
  cream: "#fbf6f0",
  muted: "#6b5b70",
  border: "#e8dde8",
};

/* ---------- ring (built-in; swap for your <PhaseRing /> if you like) ---------- */
function CycleRing({
  day,
  cycleLen,
  phase,
}: {
  day: number;
  cycleLen: number;
  phase: string;
}) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const progress = Math.min(day / cycleLen, 1);
  return (
    <div style={{ position: "relative", width: 140, height: 140 }}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke={C.lavender} strokeWidth="12" />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke={C.rose}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - progress)}
          transform="rotate(-90 70 70)"
          style={{ transition: "stroke-dashoffset .6s ease" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <span style={{ fontSize: 11, color: C.muted }}>Day</span>
        <span style={{ fontSize: 30, fontWeight: 700, color: C.plum, lineHeight: 1 }}>
          {day}
        </span>
        <span style={{ fontSize: 10, color: C.muted, marginTop: 4, maxWidth: 80 }}>
          {phase}
        </span>
      </div>
    </div>
  );
}

/* ---------- main component ---------- */
export default function CycleTracker() {
  const [starts, setStarts] = useState<string[]>([]);
  const [periodLen, setPeriodLen] = useState(DEFAULT_PERIOD);
  const [month, setMonth] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });
  const [logDate, setLogDate] = useState(iso(new Date()));
  const [loaded, setLoaded] = useState(false);

  // load / save (swap localStorage for your API / Supabase / Firebase later)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        setStarts(saved.starts ?? []);
        setPeriodLen(saved.periodLen ?? DEFAULT_PERIOD);
      }
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ starts, periodLen }));
    } catch {}
  }, [starts, periodLen, loaded]);

  const cycleLen = useMemo(() => averageCycle(starts), [starts]);
  const today = useMemo(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  }, []);
  const phase = useMemo(
    () => currentPhase(today, starts, cycleLen, periodLen),
    [today, starts, cycleLen, periodLen]
  );

  const nextPeriod = useMemo(() => {
    if (!starts.length) return null;
    const last = parse([...starts].sort().pop()!);
    let next = addDays(last, cycleLen);
    while (diffDays(next, today) < 0) next = addDays(next, cycleLen);
    return next;
  }, [starts, cycleLen, today]);

  const daysToNext = nextPeriod ? diffDays(nextPeriod, today) : null;

  const addLog = () => {
    if (!logDate || starts.includes(logDate)) return;
    setStarts([...starts, logDate].sort());
  };
  const undoLast = () => setStarts(starts.slice(0, -1));

  // calendar grid
  const cells = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const out: (Date | null)[] = Array(first.getDay()).fill(null);
    for (let d = 1; d <= daysInMonth; d++)
      out.push(new Date(month.getFullYear(), month.getMonth(), d));
    return out;
  }, [month]);

  const styleFor = (kind: DayKind): React.CSSProperties => {
    switch (kind) {
      case "period":
        return { background: C.rose, color: "#fff" };
      case "predicted":
        return { background: C.roseSoft, color: C.rose, border: `1.5px dashed ${C.rose}` };
      case "ovulation":
        return { background: C.lavenderDeep, color: "#fff" };
      case "fertile":
        return { background: C.lavender, color: C.plum };
      default:
        return { background: "transparent", color: C.plum };
    }
  };

  const card: React.CSSProperties = {
    background: "#fff",
    border: `1px solid ${C.border}`,
    borderRadius: 20,
    padding: 20,
  };

  return (
    <div style={{ display: "grid", gap: 16, maxWidth: 520, margin: "0 auto" }}>
      {/* summary */}
      <div style={{ ...card, display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
        {phase ? (
          <CycleRing day={phase.day} cycleLen={cycleLen} phase={phase.phase} />
        ) : (
          <div style={{ width: 140, height: 140, borderRadius: "50%", background: C.cream, display: "grid", placeItems: "center", textAlign: "center", fontSize: 12, color: C.muted, padding: 16 }}>
            Log your first period to begin
          </div>
        )}
        <div style={{ flex: 1, minWidth: 180 }}>
          <p style={{ margin: 0, fontSize: 11, letterSpacing: 1, color: C.muted }}>NEXT PERIOD</p>
          <p style={{ margin: "2px 0 6px", fontSize: 22, fontWeight: 700, color: C.plum }}>
            {nextPeriod ? fmt(nextPeriod) : "-"}
          </p>
          {daysToNext !== null && (
            <p style={{ margin: 0, fontSize: 13, color: C.rose }}>
              {daysToNext === 0 ? "Expected today" : `In ${daysToNext} day${daysToNext === 1 ? "" : "s"}`}
            </p>
          )}
          {phase && <p style={{ margin: "10px 0 0", fontSize: 13, color: C.muted }}>{phase.tip}</p>}
          <p style={{ margin: "10px 0 0", fontSize: 11, color: C.muted }}>
            Cycle length: {cycleLen} days{starts.length < 2 ? " (default)" : " (your average)"}
          </p>
        </div>
      </div>

      {/* log period */}
      <div style={card}>
        <p style={{ margin: "0 0 10px", fontWeight: 600, color: C.plum }}>Log a period</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <input
            type="date"
            value={logDate}
            max={iso(new Date())}
            onChange={(e) => setLogDate(e.target.value)}
            style={{ padding: "10px 12px", borderRadius: 12, border: `1px solid ${C.border}`, fontSize: 14 }}
          />
          <button
            onClick={addLog}
            style={{ padding: "10px 16px", borderRadius: 12, border: "none", background: C.plum, color: "#fff", fontWeight: 600, cursor: "pointer" }}
          >
            Period started
          </button>
          {starts.length > 0 && (
            <button
              onClick={undoLast}
              style={{ padding: "10px 14px", borderRadius: 12, border: `1px solid ${C.border}`, background: "#fff", color: C.muted, cursor: "pointer" }}
            >
              Undo last
            </button>
          )}
        </div>
        <label style={{ display: "block", marginTop: 12, fontSize: 13, color: C.muted }}>
          Usual period length:{" "}
          <select
            value={periodLen}
            onChange={(e) => setPeriodLen(Number(e.target.value))}
            style={{ padding: "4px 8px", borderRadius: 8, border: `1px solid ${C.border}` }}
          >
            {[2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>{n} days</option>
            ))}
          </select>
        </label>
      </div>

      {/* calendar */}
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <button
            aria-label="Previous month"
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
            style={{ border: "none", background: C.cream, borderRadius: 10, width: 34, height: 34, cursor: "pointer" }}
          >
            ‹
          </button>
          <strong style={{ color: C.plum }}>
            {month.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
          </strong>
          <button
            aria-label="Next month"
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
            style={{ border: "none", background: C.cream, borderRadius: 10, width: 34, height: 34, cursor: "pointer" }}
          >
            ›
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, textAlign: "center" }}>
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <span key={i} style={{ fontSize: 11, color: C.muted }}>{d}</span>
          ))}
          {cells.map((date, i) => {
            if (!date) return <span key={i} />;
            const kind = getKind(date, starts, cycleLen, periodLen);
            const isToday = diffDays(date, today) === 0;
            return (
              <div
                key={i}
                style={{
                  aspectRatio: "1",
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "50%",
                  fontSize: 13,
                  fontWeight: isToday ? 700 : 500,
                  outline: isToday ? `2px solid ${C.plum}` : "none",
                  outlineOffset: 1,
                  ...styleFor(kind),
                }}
              >
                {date.getDate()}
              </div>
            );
          })}
        </div>

        {/* legend */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 14, fontSize: 11, color: C.muted }}>
          <Legend color={C.rose} label="Period" />
          <Legend color={C.roseSoft} label="Predicted" dashed />
          <Legend color={C.lavender} label="Fertile window" />
          <Legend color={C.lavenderDeep} label="Ovulation" />
        </div>
      </div>

      <p style={{ fontSize: 11, color: C.muted, textAlign: "center", margin: 0 }}>
        Predictions are estimates, not medical advice. Cycles vary, so talk to a doctor if something feels off.
      </p>
    </div>
  );
}

function Legend({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <i
        style={{
          width: 12,
          height: 12,
          borderRadius: "50%",
          background: color,
          border: dashed ? `1.5px dashed ${C.rose}` : "none",
          display: "inline-block",
        }}
      />
      {label}
    </span>
  );
}