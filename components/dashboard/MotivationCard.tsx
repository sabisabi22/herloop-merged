"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Sparkles,
  HeartPulse,
  GraduationCap,
  Search,
  Bookmark,
  ChevronDown,
  Clock,
  Shield,
  Wallet,
  Users,
} from "lucide-react";
import { COLORS, PHASES } from "@/lib/theme";

type Phase = (typeof PHASES)[number]["name"];

const TOPICS: {
  title: string;
  desc: string;
  content: string;
  Icon: typeof HeartPulse;
  color: string;
  phases: Phase[];
  readMins: number;
}[] = [
  {
    title: "Understanding your cycle",
    desc: "What each phase of your cycle means for your energy, mood, and body.",
    content:
      "Your cycle moves through four phases — menstrual, follicular, ovulatory, and luteal — each with its own hormone pattern. Energy tends to build through the follicular phase, peak around ovulation, then ease off in the luteal phase before your period. Tracking how you feel phase by phase helps you tell normal fluctuation apart from something worth flagging to a doctor.",
    Icon: HeartPulse,
    color: COLORS.rose,
    phases: ["Teen", "Adult"],
    readMins: 4,
  },
  {
    title: "Nutrition through your cycle",
    desc: "Simple food choices that support you in each phase.",
    content:
      "Iron-rich foods matter most during and right after your period to replace what's lost. Complex carbs and protein help steady energy in the follicular phase. Around ovulation, most people feel naturally more energetic. In the luteal phase, cravings are common — magnesium-rich foods like nuts and leafy greens can help with mood and bloating.",
    Icon: Sparkles,
    color: COLORS.moss,
    phases: ["Teen", "Adult", "Maternity"],
    readMins: 3,
  },
  {
    title: "Scholarships & education loans",
    desc: "A plain-language guide to applying for the schemes listed in your feed.",
    content:
      "Most scholarship portals ask for the same core documents — income certificate, previous marksheets, Aadhaar, and a bank account in the applicant's name. Apply as early as the window opens, since many schemes close once funds are allocated, not on the stated deadline. Keep scanned copies ready in one folder so re-applying next cycle takes minutes, not hours.",
    Icon: GraduationCap,
    color: COLORS.gold,
    phases: ["Teen"],
    readMins: 5,
  },
  {
    title: "When to see a doctor",
    desc: "Signs that irregular cycles or symptoms are worth a medical opinion.",
    content:
      "See a doctor if periods stop for 3+ months without pregnancy, if bleeding soaks a pad or tampon every hour for several hours, if pain regularly stops you from daily activities, or if cycles are consistently shorter than 21 or longer than 35 days. None of these are automatically serious, but they're worth ruling things out for.",
    Icon: BookOpen,
    color: COLORS.plumMid,
    phases: ["Teen", "Adult", "Maternity", "Elder"],
    readMins: 4,
  },
  {
    title: "Puberty, explained simply",
    desc: "What changes to expect in your body and how to talk about them.",
    content:
      "Puberty usually starts with a growth spurt, followed by breast development and, eventually, a first period roughly 2-3 years later. Every body's timeline is different, and that's normal. It helps to have one trusted adult to ask questions — a parent, teacher, or doctor — rather than relying only on friends or the internet for answers.",
    Icon: Sparkles,
    color: COLORS.sage,
    phases: ["Childhood", "Teen"],
    readMins: 3,
  },
  {
    title: "Staying safe: know the warning signs",
    desc: "Recognizing unsafe situations and who to reach out to.",
    content:
      "Trust your discomfort — you don't need a fully formed reason to remove yourself from a situation. Keep a trusted adult's number memorized, not just saved. The Women Helpline (181) and, for younger girls, Childline (1098) are free, confidential, and available 24x7 for guidance, not just emergencies.",
    Icon: Shield,
    color: COLORS.rose,
    phases: ["Childhood", "Teen", "Adult"],
    readMins: 3,
  },
  {
    title: "Building financial independence",
    desc: "Savings accounts, small investments, and habits that compound.",
    content:
      "Starting early matters more than starting big — a small recurring deposit in a scheme like the Mahila Samman Savings Certificate builds both savings and financial confidence. Keep a basic budget of what comes in and out each month, and open your own bank account as soon as you're eligible, even if a parent also has access.",
    Icon: Wallet,
    color: COLORS.gold,
    phases: ["Teen", "Adult"],
    readMins: 4,
  },
  {
    title: "Pregnancy basics: what to expect",
    desc: "Trimester by trimester — appointments, symptoms, and red flags.",
    content:
      "Aim for your first antenatal checkup within the first trimester, then roughly monthly until the third trimester, when visits become more frequent. Common early symptoms — nausea, fatigue, tender breasts — usually ease by the second trimester. Report bleeding, severe headaches, or reduced fetal movement to a doctor right away rather than waiting for the next scheduled visit.",
    Icon: HeartPulse,
    color: COLORS.gold,
    phases: ["Maternity"],
    readMins: 5,
  },
  {
    title: "Postpartum recovery & support",
    desc: "Physical healing, mental health, and asking for help after birth.",
    content:
      "Physical recovery from birth typically takes 6-8 weeks, but that timeline varies a lot and a C-section needs longer. It's normal to feel a mix of emotions in the first weeks — but persistent sadness, anxiety, or trouble bonding beyond two weeks is worth mentioning to a doctor, since postpartum depression is common and very treatable.",
    Icon: HeartPulse,
    color: COLORS.plumMid,
    phases: ["Maternity"],
    readMins: 4,
  },
  {
    title: "Healthy aging & menopause",
    desc: "What changes with menopause and how to manage them.",
    content:
      "Menopause is confirmed after 12 months without a period, usually between ages 45-55. Hot flashes, sleep changes, and mood shifts are common as hormones shift. Bone density starts declining faster after menopause, so calcium, vitamin D, and weight-bearing activity become more important — worth discussing at your next checkup.",
    Icon: BookOpen,
    color: COLORS.moss,
    phases: ["Elder"],
    readMins: 4,
  },
  {
    title: "Staying connected in later life",
    desc: "Community, caregiving support, and avoiding isolation.",
    content:
      "Social isolation is linked to real health risks in later life — regular contact with family, neighbors, or a community group matters as much as any medical checkup. If you're a caregiver too, it's worth building your own support network; caregiver burnout is common and rarely talked about.",
    Icon: Users,
    color: COLORS.sage,
    phases: ["Elder"],
    readMins: 3,
  },
];

const BOOKMARKS_KEY = "herloop_saved_topics";

export default function LearnPanel() {
  const [query, setQuery] = useState("");
  const [phase, setPhase] = useState<Phase | "All">("All");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saved, setSaved] = useState<string[]>([]);
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(BOOKMARKS_KEY);
      if (raw) setSaved(JSON.parse(raw));
    } catch {
      // localStorage unavailable — fail silently
    }
  }, []);

  const toggleSaved = (title: string) => {
    setSaved((prev) => {
      const next = prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title];
      try {
        window.localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next));
      } catch {
        // best-effort persistence only
      }
      return next;
    });
  };

  const filtered = TOPICS.filter((t) => {
    if (showSavedOnly && !saved.includes(t.title)) return false;
    if (phase !== "All" && !t.phases.includes(phase)) return false;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      if (!t.title.toLowerCase().includes(q) && !t.desc.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="pb-4">
      <div className="px-5 pt-4 pb-3">
        <h2 className="font-display text-lg" style={{ color: COLORS.plum }}>Learn</h2>
        <p className="text-xs font-body mt-0.5" style={{ color: `${COLORS.plum}77` }}>
          Age-appropriate guidance, built with your stage in mind
        </p>
      </div>

      {/* Search */}
      <div className="px-5 pb-3">
        <div
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl"
          style={{ background: `${COLORS.plum}0A`, border: `1px solid ${COLORS.mist}` }}
        >
          <Search size={15} style={{ color: `${COLORS.plum}55` }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search topics..."
            className="flex-1 bg-transparent text-sm font-body outline-none"
            style={{ color: COLORS.plum }}
          />
        </div>
      </div>

      {/* Phase filter */}
      <div className="flex gap-2 px-5 pb-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setPhase("All")}
          className="flex-shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold font-body transition-colors"
          style={{
            background: phase === "All" ? COLORS.plum : `${COLORS.plum}0A`,
            color: phase === "All" ? "#fff" : COLORS.plum,
          }}
        >
          All
        </button>
        {PHASES.map((p) => {
          const active = phase === p.name;
          return (
            <button
              key={p.name}
              onClick={() => setPhase(p.name as Phase)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold font-body transition-colors"
              style={{
                background: active ? p.color : `${p.color}1A`,
                color: active ? "#fff" : COLORS.plum,
              }}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: active ? "#fff" : p.color }} />
              {p.name}
            </button>
          );
        })}
      </div>

      {/* Saved-only toggle */}
      <div className="px-5 pb-4">
        <button
          onClick={() => setShowSavedOnly((v) => !v)}
          className="flex items-center gap-1.5 text-xs font-semibold font-body"
          style={{ color: showSavedOnly ? COLORS.rose : `${COLORS.plum}77` }}
        >
          <Bookmark size={13} fill={showSavedOnly ? COLORS.rose : "none"} />
          {showSavedOnly ? "Showing saved only" : `Saved (${saved.length})`}
        </button>
      </div>

      <div className="px-5 flex flex-col gap-3">
        {filtered.map((t, i) => {
          const isOpen = expanded === t.title;
          const isSaved = saved.includes(t.title);
          return (
            <motion.div
              key={t.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="rounded-2xl bg-white shadow-soft overflow-hidden"
              style={{ border: `1px solid ${COLORS.mist}` }}
            >
              <button
                onClick={() => setExpanded(isOpen ? null : t.title)}
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
                  <div className="flex items-center gap-1 mt-1.5">
                    <Clock size={11} style={{ color: `${COLORS.plum}55` }} />
                    <span className="text-[11px] font-body" style={{ color: `${COLORS.plum}55` }}>
                      {t.readMins} min read
                    </span>
                  </div>
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
                      <p className="text-xs font-body leading-relaxed mb-3" style={{ color: `${COLORS.plum}99` }}>
                        {t.content}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSaved(t.title);
                        }}
                        className="flex items-center gap-1.5 text-xs font-semibold font-body"
                        style={{ color: isSaved ? COLORS.rose : `${COLORS.plum}77` }}
                      >
                        <Bookmark size={13} fill={isSaved ? COLORS.rose : "none"} />
                        {isSaved ? "Saved" : "Save for later"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {filtered.length === 0 && (
          <p className="text-xs font-body text-center py-6" style={{ color: `${COLORS.plum}55` }}>
            {showSavedOnly ? "You haven't saved any topics yet." : "No topics match your search."}
          </p>
        )}
      </div>

      <p className="text-[11px] font-body text-center mt-4 px-8" style={{ color: `${COLORS.plum}55` }}>
        Full articles and a curated news feed are coming soon.
      </p>
    </div>
  );
}