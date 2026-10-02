import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { app } from "./firebaseConfig";

const db = getFirestore(app);

export type FlowLevel = "light" | "medium" | "heavy";

export interface CycleLog {
  id: string;
  startDate: string; // "YYYY-MM-DD"
  flow?: FlowLevel;
}

const DEFAULT_CYCLE_LENGTH = 28;
const DEFAULT_PERIOD_LENGTH = 5;
const ENTRY_TYPE = "cycle_start";

// Cycle logs live inside the existing healthLogs collection (most-restricted
// tier in Firestore rules: owner-only once consent-approved, or guardian-only
// for under10 profiles). No separate Firestore rule is needed for this.
function entriesCollection(profileId: string) {
  return collection(db, "healthLogs", profileId, "entries");
}

export async function logPeriodStart(profileId: string, startDate: string, flow?: FlowLevel) {
  await addDoc(entriesCollection(profileId), {
    type: ENTRY_TYPE,
    startDate,
    flow: flow ?? "medium",
    createdAt: serverTimestamp(),
  });
}

export async function deleteCycleLog(profileId: string, logId: string) {
  await deleteDoc(doc(db, "healthLogs", profileId, "entries", logId));
}

export async function getCycleLogs(profileId: string): Promise<CycleLog[]> {
  // Sort by date only (no `where` clause) so this never needs a composite
  // Firestore index. Filter for cycle-start entries in JS instead.
  const q = query(entriesCollection(profileId), orderBy("startDate", "asc"));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as any) }))
    .filter((entry: any) => entry.type === ENTRY_TYPE);
}

// ─── Date helpers (all local-date, no timezone conversion) ────────────────────

export function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseDateStr(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function daysBetween(a: Date, b: Date): number {
  const ms = 24 * 60 * 60 * 1000;
  return Math.round((b.setHours(0, 0, 0, 0) - a.setHours(0, 0, 0, 0)) / ms);
}

function addDays(d: Date, n: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

// ─── Cycle stats ────────────────────────────────────────────────────────────────

export interface CycleStats {
  hasData: boolean;
  avgCycleLength: number;
  periodLength: number;
  lastStart: string | null;
  cycleDay: number | null;
  nextPredicted: string | null;
  ovulationDate: string | null;
  fertileStart: string | null;
  fertileEnd: string | null;
  phase: "period" | "follicular" | "fertile" | "luteal" | "unknown";
  phaseLabel: string;
  daysUntilNextPeriod: number | null;
}

export function computeCycleStats(logs: CycleLog[], today: Date = new Date()): CycleStats {
  if (logs.length === 0) {
    return {
      hasData: false,
      avgCycleLength: DEFAULT_CYCLE_LENGTH,
      periodLength: DEFAULT_PERIOD_LENGTH,
      lastStart: null,
      cycleDay: null,
      nextPredicted: null,
      ovulationDate: null,
      fertileStart: null,
      fertileEnd: null,
      phase: "unknown",
      phaseLabel: "Log your first period to get started",
      daysUntilNextPeriod: null,
    };
  }

  const sorted = [...logs].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const gaps: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const gap = daysBetween(parseDateStr(sorted[i - 1].startDate), parseDateStr(sorted[i].startDate));
    if (gap > 10 && gap < 60) gaps.push(gap); // ignore obviously bad entries
  }
  const avgCycleLength = gaps.length
    ? Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length)
    : DEFAULT_CYCLE_LENGTH;

  const last = sorted[sorted.length - 1];
  const lastStartDate = parseDateStr(last.startDate);
  const cycleDay = daysBetween(new Date(lastStartDate), new Date(today)) + 1;

  const nextPredictedDate = addDays(lastStartDate, avgCycleLength);
  const ovulationDate = addDays(nextPredictedDate, -14);
  const fertileStart = addDays(ovulationDate, -5);
  const fertileEnd = addDays(ovulationDate, 1);

  let phase: CycleStats["phase"] = "unknown";
  let phaseLabel = "";
  if (cycleDay >= 1 && cycleDay <= DEFAULT_PERIOD_LENGTH) {
    phase = "period";
    phaseLabel = `Period day ${cycleDay}`;
  } else if (today >= fertileStart && today <= fertileEnd) {
    phase = "fertile";
    phaseLabel = "In your fertile window";
  } else if (cycleDay > DEFAULT_PERIOD_LENGTH && new Date(today) < fertileStart) {
    phase = "follicular";
    phaseLabel = "Follicular phase";
  } else {
    phase = "luteal";
    phaseLabel = "Luteal phase";
  }

  const daysUntilNextPeriod = daysBetween(new Date(today), new Date(nextPredictedDate));

  return {
    hasData: true,
    avgCycleLength,
    periodLength: DEFAULT_PERIOD_LENGTH,
    lastStart: last.startDate,
    cycleDay,
    nextPredicted: toDateStr(nextPredictedDate),
    ovulationDate: toDateStr(ovulationDate),
    fertileStart: toDateStr(fertileStart),
    fertileEnd: toDateStr(fertileEnd),
    phase,
    phaseLabel,
    daysUntilNextPeriod,
  };
}

/** Classifies a given calendar date for the month-grid UI. */
export function classifyDate(
  dateStr: string,
  logs: CycleLog[],
  stats: CycleStats
): "period" | "fertile" | "predicted" | "none" {
  if (logs.some((l) => {
    if (l.startDate === dateStr) return true;
    const start = parseDateStr(l.startDate);
    const d = parseDateStr(dateStr);
    const diff = daysBetween(new Date(start), new Date(d));
    return diff >= 0 && diff < DEFAULT_PERIOD_LENGTH;
  })) {
    return "period";
  }
  if (stats.fertileStart && stats.fertileEnd && dateStr >= stats.fertileStart && dateStr <= stats.fertileEnd) {
    return "fertile";
  }
  if (
    stats.nextPredicted &&
    dateStr >= stats.nextPredicted &&
    dateStr < toDateStr(addDays(parseDateStr(stats.nextPredicted), DEFAULT_PERIOD_LENGTH))
  ) {
    return "predicted";
  }
  return "none";
}

export { parseDateStr, addDays, daysBetween };
