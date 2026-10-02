"use client";
import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Sparkles,
  HeartPulse,
  GraduationCap,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  Circle,
  Stethoscope,
  X,
} from "lucide-react";
import { COLORS } from "@/lib/theme";
import type { AccountTier } from "@/lib/auth";

// ---------- Topic 1: cycle phase breakdown ----------
const CYCLE_PHASES = [
  {
    name: "Menstrual",
    days: "Days 1-5",
    hormone: "Estrogen and progesterone are at their lowest point.",
    feel: "Low energy and cramps are common — rest is genuinely useful here, not a luxury.",
  },
  {
    name: "Follicular",
    days: "Days 1-13 (overlaps with menstrual)",
    hormone: "Estrogen starts climbing as follicles in the ovary mature.",
    feel: "Energy and mood usually lift — often the best window for starting new things.",
  },
  {
    name: "Ovulatory",
    days: "Days 14-16 (varies by person)",
    hormone: "A surge in LH triggers the release of an egg.",
    feel: "Often the most energetic, social, and confident-feeling days of the cycle.",
  },
  {
    name: "Luteal",
    days: "Days 17-28",
    hormone: "Progesterone rises, then drops sharply if there's no pregnancy.",
    feel: "PMS — irritability, bloating, cravings — tends to show up in the final week.",
  },
];

// ---------- Topic 2: nutrition by phase ----------
const NUTRITION_BY_PHASE = [
  {
    name: "Menstrual",
    foods: ["Iron-rich: spinach, lentils, red meat", "Warm fluids to ease cramps", "Dark chocolate (magnesium)"],
    why: "Replaces iron lost with bleeding and helps ease cramping.",
  },
  {
    name: "Follicular",
    foods: ["Sprouts & fermented foods", "Citrus fruits and berries", "Eggs and lean protein"],
    why: "Supports rising estrogen and rebuilds energy reserves.",
  },
  {
    name: "Ovulatory",
    foods: ["Fibre: whole grains, vegetables", "Zinc: pumpkin seeds, chickpeas", "Light, fresh meals"],
    why: "Energy tends to peak — light, antioxidant-rich food keeps digestion easy.",
  },
  {
    name: "Luteal",
    foods: ["Complex carbs: oats, sweet potato", "Magnesium: nuts, leafy greens", "Less salt and caffeine"],
    why: "Eases PMS bloating, mood dips, and sugar cravings.",
  },
];

// A distinct color per cycle phase, used for the accent bar, icon, and popup
const PHASE_ACCENT: Record<string, string> = {
  Menstrual: COLORS.rose,
  Follicular: COLORS.sage,
  Ovulatory: COLORS.gold,
  Luteal: COLORS.plumMid,
};

// ---------- Topic 3: education schemes, filtered by age ----------
const EDUCATION_SCHEMES: { name: string; desc: string; url: string; tiers: AccountTier[] }[] = [
  {
    name: "Sukanya Samriddhi Yojana",
    desc: "High-interest savings account for girls under 10 — matures to fund education or marriage.",
    url: "https://www.india.gov.in/category/benefits-social-development/subcategory/women-children/details/sukanya-samriddhi-yojna",
    tiers: ["under10"],
  },
  {
    name: "National Scholarship Portal",
    desc: "Central hub for scholarships across school, college, and professional courses.",
    url: "https://scholarships.gov.in/",
    tiers: ["teen", "adult"],
  },
  {
    name: "National Scheme of Incentives to Girls (NSIGSE)",
    desc: "Cash incentive for girls from disadvantaged groups enrolling in secondary school.",
    url: "https://scholarships.gov.in/",
    tiers: ["teen"],
  },
  {
    name: "CBSE Udaan",
    desc: "Free resources and mentorship for girls in Classes 11-12 preparing for engineering entrance exams.",
    url: "https://udaan.cbse.gov.in/",
    tiers: ["teen"],
  },
  {
    name: "Vidya Lakshmi Portal",
    desc: "Single window to apply for education loans across 40+ banks, for study in India or abroad.",
    url: "https://www.vidyalakshmi.co.in/",
    tiers: ["adult"],
  },
];

// ---------- Topic 4: when to see a doctor — interactive checklist ----------
const DOCTOR_SIGNS = [
  "Periods have stopped for 3+ months (and I'm not pregnant)",
  "A pad or tampon soaks through every hour for several hours",
  "Pain regularly stops me from daily activities",
  "Cycles are consistently shorter than 21 or longer than 35 days",
  "Spotting or bleeding between periods",
  "My periods suddenly became very different from usual",
];

const TOPICS = [
  {
    id: "cycle",
    title: "Understanding your cycle",
    desc: "What each phase of your cycle means for your energy, mood, and body.",
    Icon: HeartPulse,
    color: COLORS.rose,
  },
  {
    id: "nutrition",
    title: "Nutrition through your cycle",
    desc: "Which foods help in which phase, and why.",
    Icon: Sparkles,
    color: COLORS.moss,
  },
  {
    id: "scholarships",
    title: "Scholarships & education loans",
    desc: "Schemes matched to your age, with a direct link to apply.",
    Icon: GraduationCap,
    color: COLORS.gold,
  },
  {
    id: "doctor",
    title: "When to see a doctor",
    desc: "Check your symptoms against common warning signs.",
    Icon: BookOpen,
    color: COLORS.plumMid,
  },
] as const;

export default function LearnPanel({ tier }: { tier?: AccountTier }) {
  const effectiveTier: AccountTier = tier ?? "adult";
  const [expanded, setExpanded] = useState<string | null>(null);
  const [checked, setChecked] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [popup, setPopup] = useState<
    | { kind: "cycle"; phase: (typeof CYCLE_PHASES)[number] }
    | { kind: "nutrition"; phase: (typeof NUTRITION_BY_PHASE)[number] }
    | null
  >(null);

  const toggleSign = (sign: string) => {
    setSubmitted(false);
    setChecked((prev) => (prev.includes(sign) ? prev.filter((s) => s !== sign) : [...prev, sign]));
  };

  const matchedSchemes = EDUCATION_SCHEMES.filter((s) => s.tiers.includes(effectiveTier));

  return (
    <div className="pb-4">
      <div className="px-5 pt-4 pb-3">
        <h2 className="font-display text-lg" style={{ color: COLORS.plum }}>Learn</h2>
        <p className="text-xs font-body mt-0.5" style={{ color: `${COLORS.plum}77` }}>
          Age-appropriate guidance, built with your stage in mind
        </p>
      </div>

      <div className="px-5 flex flex-col gap-3">
        {TOPICS.map((t, i) => {
          const isOpen = expanded === t.id;
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="rounded-2xl bg-white shadow-soft overflow-hidden"
              style={{ border: `1px solid ${COLORS.mist}` }}
            >
              <button
                onClick={() => setExpanded(isOpen ? null : t.id)}
                className="w-full flex gap-3 p-4 text-left"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${t.color}20` }}
                >
                  <t.Icon size={18} style={{ color: t.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-sm font-body mb-0.5" style={{ color: COLORS.plum }}>
                      {t.title}
                    </h3>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex-shrink-0 mt-0.5"
                    >
                      <ChevronDown size={15} style={{ color: `${COLORS.plum}55` }} />
                    </motion.span>
                  </div>
                  <p className="text-xs font-body leading-relaxed" style={{ color: `${COLORS.plum}77` }}>
                    {t.desc}
                  </p>
                </div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pl-[68px]">
                      {/* ---- Understanding your cycle ---- */}
                      {t.id === "cycle" && (
                        <div className="flex flex-col gap-2.5">
                          {CYCLE_PHASES.map((p) => {
                            const accent = PHASE_ACCENT[p.name];
                            return (
                              <button
                                key={p.name}
                                onClick={() => setPopup({ kind: "cycle", phase: p })}
                                className="w-full flex items-center justify-between gap-3 p-3.5 rounded-xl text-left transition-transform active:scale-[0.98]"
                                style={{ background: `${accent}14`, borderLeft: `3px solid ${accent}` }}
                              >
                                <div className="min-w-0">
                                  <div className="flex items-baseline gap-2 mb-1">
                                    <span className="text-[15px] font-extrabold font-body" style={{ color: COLORS.plum }}>
                                      {p.name}
                                    </span>
                                    <span className="text-[10px] font-semibold font-body" style={{ color: `${COLORS.plum}66` }}>
                                      {p.days}
                                    </span>
                                  </div>
                                  <p className="text-xs font-body leading-relaxed truncate" style={{ color: `${COLORS.plum}88` }}>
                                    {p.feel}
                                  </p>
                                </div>
                                <ChevronRight size={16} className="flex-shrink-0" style={{ color: accent }} />
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* ---- Nutrition through your cycle ---- */}
                      {t.id === "nutrition" && (
                        <div className="flex flex-col gap-2.5">
                          {NUTRITION_BY_PHASE.map((p) => {
                            const accent = PHASE_ACCENT[p.name];
                            return (
                              <button
                                key={p.name}
                                onClick={() => setPopup({ kind: "nutrition", phase: p })}
                                className="w-full flex items-center justify-between gap-3 p-3.5 rounded-xl text-left transition-transform active:scale-[0.98]"
                                style={{ background: `${accent}14`, borderLeft: `3px solid ${accent}` }}
                              >
                                <div className="min-w-0">
                                  <span className="text-[15px] font-extrabold font-body" style={{ color: COLORS.plum }}>
                                    {p.name}
                                  </span>
                                  <p className="text-xs font-body leading-relaxed truncate mt-0.5" style={{ color: `${COLORS.plum}88` }}>
                                    {p.foods.length} food tips · tap for details
                                  </p>
                                </div>
                                <ChevronRight size={16} className="flex-shrink-0" style={{ color: accent }} />
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* ---- Scholarships & education loans ---- */}
                      {t.id === "scholarships" && (
                        <div className="flex flex-col gap-2.5">
                          {matchedSchemes.map((s) => (
                            <a
                              key={s.name}
                              href={s.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between gap-3 p-3 rounded-xl transition-colors"
                              style={{ background: `${COLORS.gold}0D` }}
                            >
                              <div className="min-w-0">
                                <p className="text-xs font-bold font-body mb-0.5" style={{ color: COLORS.plum }}>
                                  {s.name}
                                </p>
                                <p className="text-[11px] font-body leading-relaxed" style={{ color: `${COLORS.plum}88` }}>
                                  {s.desc}
                                </p>
                              </div>
                              <span
                                className="flex-shrink-0 flex items-center gap-1 text-[11px] font-bold font-body px-2.5 py-1.5 rounded-full"
                                style={{ background: COLORS.gold, color: COLORS.plum }}
                              >
                                Apply
                                <ExternalLink size={11} />
                              </span>
                            </a>
                          ))}
                          {matchedSchemes.length === 0 && (
                            <p className="text-xs font-body" style={{ color: `${COLORS.plum}77` }}>
                              No education schemes matched to this age group yet.
                            </p>
                          )}
                        </div>
                      )}

                      {/* ---- When to see a doctor ---- */}
                      {t.id === "doctor" && (
                        <div>
                          <p className="text-xs font-body leading-relaxed mb-2.5" style={{ color: `${COLORS.plum}88` }}>
                            Tap anything you're currently experiencing:
                          </p>
                          <div className="flex flex-col gap-1.5 mb-3">
                            {DOCTOR_SIGNS.map((sign) => {
                              const isChecked = checked.includes(sign);
                              return (
                                <button
                                  key={sign}
                                  onClick={() => toggleSign(sign)}
                                  className="flex items-start gap-2 p-2.5 rounded-xl text-left transition-colors"
                                  style={{ background: isChecked ? `${COLORS.plumMid}1A` : `${COLORS.plum}06` }}
                                >
                                  {isChecked ? (
                                    <CheckCircle2 size={15} className="flex-shrink-0 mt-0.5" style={{ color: COLORS.plumMid }} />
                                  ) : (
                                    <Circle size={15} className="flex-shrink-0 mt-0.5" style={{ color: `${COLORS.plum}33` }} />
                                  )}
                                  <span className="text-xs font-body leading-relaxed" style={{ color: COLORS.plum }}>
                                    {sign}
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          <button
                            onClick={() => setSubmitted(true)}
                            className="w-full py-2.5 rounded-xl text-xs font-bold font-body transition-colors"
                            style={{ background: COLORS.plum, color: COLORS.cream }}
                          >
                            Check my symptoms
                          </button>

                          <AnimatePresence>
                            {submitted && (
                              <motion.div
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="mt-3 p-3.5 rounded-xl"
                                style={{ background: `${COLORS.plumMid}12` }}
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <Stethoscope size={15} style={{ color: COLORS.plumMid }} />
                                  <span className="text-xs font-bold font-body" style={{ color: COLORS.plum }}>
                                    {checked.length === 0 ? "Nothing flagged right now" : "Worth discussing with a doctor"}
                                  </span>
                                </div>
                                {checked.length === 0 ? (
                                  <p className="text-xs font-body leading-relaxed" style={{ color: `${COLORS.plum}88` }}>
                                    Nothing you've selected points to an urgent visit — but trust your body if something still feels off.
                                  </p>
                                ) : (
                                  <ul className="flex flex-col gap-1 mb-2">
                                    {checked.map((c) => (
                                      <li key={c} className="text-xs font-body leading-relaxed flex gap-1.5" style={{ color: `${COLORS.plum}99` }}>
                                        <span style={{ color: COLORS.plumMid }}>•</span>
                                        {c}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                                <p className="text-[11px] font-body italic leading-relaxed" style={{ color: `${COLORS.plum}66` }}>
                                  This is general guidance, not a diagnosis — a doctor can give you a proper answer.
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {popup && (
              <motion.div
                key="overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setPopup(null)}
                className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
                style={{ background: "rgba(43,27,51,0.55)", backdropFilter: "blur(3px)" }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 28, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 28, scale: 0.96 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-sm rounded-3xl bg-white overflow-hidden"
                  style={{ boxShadow: "0 24px 64px rgba(43,27,51,0.35)" }}
                >
                  <div className="p-5" style={{ background: `${PHASE_ACCENT[popup.phase.name]}1F` }}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span
                          className="text-[10px] font-extrabold font-body uppercase tracking-wider"
                          style={{ color: PHASE_ACCENT[popup.phase.name] }}
                        >
                          {popup.kind === "cycle" ? "Cycle phase" : "Nutrition"}
                        </span>
                        <h3 className="text-2xl font-display mt-0.5" style={{ color: COLORS.plum }}>
                          {popup.phase.name}
                        </h3>
                        {popup.kind === "cycle" && (
                          <p className="text-xs font-bold font-body mt-1" style={{ color: `${COLORS.plum}77` }}>
                            {popup.phase.days}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => setPopup(null)}
                        aria-label="Close"
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: `${COLORS.plum}0F` }}
                      >
                        <X size={16} style={{ color: COLORS.plum }} />
                      </button>
                    </div>
                  </div>

                  <div className="p-5 pt-4">
                    {popup.kind === "cycle" ? (
                      <>
                        <div className="mb-4">
                          <p
                            className="text-[11px] font-extrabold font-body uppercase tracking-wide mb-1"
                            style={{ color: PHASE_ACCENT[popup.phase.name] }}
                          >
                            What's happening
                          </p>
                          <p className="text-sm font-body leading-relaxed" style={{ color: COLORS.plum }}>
                            {popup.phase.hormone}
                          </p>
                        </div>
                        <div>
                          <p
                            className="text-[11px] font-extrabold font-body uppercase tracking-wide mb-1"
                            style={{ color: PHASE_ACCENT[popup.phase.name] }}
                          >
                            How it can feel
                          </p>
                          <p className="text-sm font-body leading-relaxed" style={{ color: COLORS.plum }}>
                            {popup.phase.feel}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <p
                          className="text-[11px] font-extrabold font-body uppercase tracking-wide mb-2"
                          style={{ color: PHASE_ACCENT[popup.phase.name] }}
                        >
                          Eat more of
                        </p>
                        <ul className="flex flex-col gap-2 mb-4">
                          {popup.phase.foods.map((f) => (
                            <li
                              key={f}
                              className="flex items-start gap-2 text-sm font-body leading-relaxed"
                              style={{ color: COLORS.plum }}
                            >
                              <CheckCircle2
                                size={15}
                                className="flex-shrink-0 mt-0.5"
                                style={{ color: PHASE_ACCENT[popup.phase.name] }}
                              />
                              {f}
                            </li>
                          ))}
                        </ul>
                        <div className="p-3 rounded-xl" style={{ background: `${PHASE_ACCENT[popup.phase.name]}14` }}>
                          <p className="text-xs font-body leading-relaxed italic" style={{ color: `${COLORS.plum}99` }}>
                            {popup.phase.why}
                          </p>
                        </div>
                      </>
                    )}

                    <button
                      onClick={() => setPopup(null)}
                      className="w-full mt-5 py-3 rounded-2xl text-sm font-extrabold font-body"
                      style={{ background: COLORS.plum, color: COLORS.cream }}
                    >
                      Got it
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

      <p className="text-[11px] font-body text-center mt-4 px-8" style={{ color: `${COLORS.plum}55` }}>
        Full articles and a curated news feed are coming soon.
      </p>
    </div>
  );
}