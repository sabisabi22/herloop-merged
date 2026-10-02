"use client";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Heart, Leaf, X } from "lucide-react";
import { COLORS } from "@/lib/theme";
import {
  CycleLog,
  FlowLevel,
  classifyDate,
  computeCycleStats,
  deleteCycleLog,
  getCycleLogs,
  logPeriodStart,
  toDateStr,
} from "@/lib/cycle";
import MotivationCard from "./MotivationCard";

const WEEK_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function TrackerPanel({ uid }: { uid: string }) {
  const [logs, setLogs] = useState<CycleLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selected, setSelected] = useState<string | null>(null);
  const [logOpen, setLogOpen] = useState(false);
  const [logDate, setLogDate] = useState(() => toDateStr(new Date()));
  const [flow, setFlow] = useState<FlowLevel>("medium");
  const [saving, setSaving] = useState(false);

  async function refresh() {
    setLoadError(null);
    try {
      const data = await getCycleLogs(uid);
      setLogs(data);
    } catch (err: any) {
      setLoadError(err.message ?? "Couldn't load your cycle data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  const stats = useMemo(() => computeCycleStats(logs), [logs]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = toDateStr(new Date());

  async function handleLogSubmit() {
    setSaving(true);
    try {
      await logPeriodStart(uid, logDate, flow);
      await refresh();
      setLogOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveLog(dateStr: string) {
    const log = logs.find((l) => l.startDate === dateStr);
    if (!log) return;
    await deleteCycleLog(uid, log.id);
    await refresh();
    setSelected(null);
  }

  if (loading) {
    return (
      <div className="px-5 py-10 text-center text-sm" style={{ color: `${COLORS.plum}77` }}>
        Loading your cycle data...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="px-5 py-10 text-center">
        <p className="text-sm font-semibold font-body mb-2" style={{ color: COLORS.rose }}>
          Couldn't load your cycle data
        </p>
        <p className="text-xs font-body mb-4" style={{ color: `${COLORS.plum}77` }}>{loadError}</p>
        <button
          onClick={() => { setLoading(true); refresh(); }}
          className="px-4 py-2 rounded-full text-xs font-semibold font-body"
          style={{ background: COLORS.plum, color: "#fff" }}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="pb-4">
      <MotivationCard />
      {/* Month nav */}
      <div className="flex items-center justify-between px-5 py-4">
        <button
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:brightness-95"
          style={{ background: `${COLORS.plum}0D` }}
        >
          <ChevronLeft size={18} style={{ color: COLORS.plum }} />
        </button>
        <div className="text-center">
          <p className="font-semibold text-lg font-display" style={{ color: COLORS.plum }}>
            {MONTH_LABELS[month]} {year}
          </p>
          <p className="text-xs mt-0.5 font-body" style={{ color: `${COLORS.plum}88` }}>
            {stats.hasData
              ? `Cycle day ${stats.cycleDay ?? "–"} · ${stats.phaseLabel}`
              : "No cycle data yet"}
          </p>
        </div>
        <button
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:brightness-95"
          style={{ background: `${COLORS.plum}0D` }}
        >
          <ChevronRight size={18} style={{ color: COLORS.plum }} />
        </button>
      </div>

      {/* Legend */}
      <div className="flex gap-5 px-5 pb-4">
        {[
          { color: COLORS.rose, label: "Period" },
          { color: COLORS.gold, label: "Fertile" },
          { color: `${COLORS.rose}55`, label: "Predicted" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
            <span className="text-xs font-body" style={{ color: `${COLORS.plum}68` }}>{l.label}</span>
          </div>
        ))}
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 px-3">
        {WEEK_LABELS.map((d, i) => (
          <div key={`${d}-${i}`} className="h-9 flex items-center justify-center text-xs font-semibold font-body" style={{ color: `${COLORS.plum}42` }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 px-3 gap-y-0.5">
        {Array.from({ length: firstDow }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = toDateStr(new Date(year, month, day));
          const kind = classifyDate(dateStr, logs, stats);
          const isToday = dateStr === todayStr;
          const isSel = selected === dateStr;

          let bg: string = "transparent";
          let col: string = COLORS.plum;
          if (kind === "period") { bg = COLORS.rose; col = "#fff"; }
          else if (kind === "fertile") bg = `${COLORS.gold}25`;
          else if (kind === "predicted") bg = `${COLORS.rose}1E`;
          else if (isSel) bg = `${COLORS.plum}12`;

          return (
            <button
              key={day}
              onClick={() => setSelected(dateStr === selected ? null : dateStr)}
              className="relative h-10 flex flex-col items-center justify-center rounded-full text-sm font-medium font-body transition-all"
              style={{
                background: bg,
                color: col,
                outline: isToday && kind !== "period" ? `2px solid ${COLORS.rose}` : "none",
                outlineOffset: 2,
              }}
            >
              {day}
              {(kind === "fertile" || kind === "predicted") && (
                <span
                  className="absolute bottom-1 w-1 h-1 rounded-full"
                  style={{ background: kind === "fertile" ? COLORS.gold : `${COLORS.rose}80` }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day actions */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-5 overflow-hidden"
          >
            <div className="mt-3 p-3 rounded-xl flex items-center justify-between" style={{ background: `${COLORS.plum}08` }}>
              <span className="text-xs font-body" style={{ color: COLORS.plum }}>
                {selected}{logs.some((l) => l.startDate === selected) ? " · logged period start" : ""}
              </span>
              {logs.some((l) => l.startDate === selected) && (
                <button
                  onClick={() => handleRemoveLog(selected)}
                  className="text-xs font-semibold flex items-center gap-1"
                  style={{ color: COLORS.rose }}
                >
                  <X size={12} /> Remove
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Insight card */}
      <div className="mx-5 mt-5 p-4 rounded-2xl" style={{ background: `${COLORS.moss}10`, border: `1px solid ${COLORS.moss}22` }}>
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: COLORS.moss }}>
            <Leaf size={18} color="#fff" />
          </div>
          <div>
            <p className="text-sm font-semibold font-body" style={{ color: COLORS.plum }}>
              {stats.hasData ? stats.phaseLabel : "Log your first period"}
            </p>
            <p className="text-xs mt-0.5 leading-relaxed font-body" style={{ color: `${COLORS.plum}88` }}>
              {stats.hasData
                ? `Fertile window ${stats.fertileStart} – ${stats.fertileEnd}. Ovulation likely around ${stats.ovulationDate}. Next period predicted ${stats.nextPredicted} (${stats.daysUntilNextPeriod} day${stats.daysUntilNextPeriod === 1 ? "" : "s"} away). Based on a ${stats.avgCycleLength}-day average cycle.`
                : "Tap \"Log today's flow\" whenever your period starts. After two logs, herLoop starts predicting your cycle."}
            </p>
          </div>
        </div>
      </div>

      {/* Log button */}
      <div className="px-5 mt-4">
        <button
          onClick={() => { setLogDate(todayStr); setLogOpen(true); }}
          className="w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-transform active:scale-95 font-body"
          style={{ background: COLORS.rose, color: "#fff" }}
        >
          <Heart size={16} /> Log today's flow
        </button>
      </div>

      {/* Log modal */}
      <AnimatePresence>
        {logOpen && (
          <motion.div
            className="fixed inset-0 z-30 flex items-end sm:items-center justify-center bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLogOpen(false)}
          >
            <motion.div
              className="w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-6"
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-display text-lg mb-4" style={{ color: COLORS.plum }}>Log period start</h3>
              <label className="text-xs font-semibold font-body block mb-1.5" style={{ color: `${COLORS.plum}88` }}>Start date</label>
              <input
                type="date"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border font-body text-sm mb-4"
                style={{ borderColor: COLORS.mist, background: COLORS.cream }}
              />
              <label className="text-xs font-semibold font-body block mb-1.5" style={{ color: `${COLORS.plum}88` }}>Flow</label>
              <div className="flex gap-2 mb-6">
                {(["light", "medium", "heavy"] as FlowLevel[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFlow(f)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-semibold capitalize font-body transition-colors"
                    style={{
                      background: flow === f ? COLORS.rose : `${COLORS.plum}0A`,
                      color: flow === f ? "#fff" : COLORS.plum,
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <button
                onClick={handleLogSubmit}
                disabled={saving}
                className="w-full py-3.5 rounded-2xl font-semibold text-sm font-body"
                style={{ background: COLORS.plum, color: "#fff", opacity: saving ? 0.7 : 1 }}
              >
                {saving ? "Saving..." : "Save log"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
