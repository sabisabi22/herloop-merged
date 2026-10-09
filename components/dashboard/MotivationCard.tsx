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

import { COLORS } from "@/lib/theme";
import type { AccountTier } from "@/lib/auth";

type Phase = "Childhood" | "Teen" | "Adult" | "Maternity" | "Elder";

type Topic = {
  title: string;
  desc: string;
  content: string;
  Icon: typeof HeartPulse;
  color: string;
  phases: Phase[];
  readMins: number;
};

const TOPICS: Topic[] = [
  {
    title: "Understanding your cycle",
    desc: "What each phase of your cycle means for your energy, mood, and body.",
    content:
      "Your cycle moves through four phases — menstrual, follicular, ovulatory, and luteal — each with its own hormone pattern. Energy tends to build through the follicular phase, peak around ovulation, then ease off in the luteal phase before your period. Tracking how you feel phase by phase can help you understand your normal pattern.",
    Icon: HeartPulse,
    color: COLORS.rose,
    phases: ["Teen", "Adult"],
    readMins: 4,
  },

  {
    title: "Nutrition through your cycle",
    desc: "Simple food choices that support you in each phase.",
    content:
      "Iron-rich foods matter during and after your period to help replace iron lost through bleeding. Complex carbohydrates and protein can help support steady energy. Around ovulation, many people feel naturally more energetic. In the luteal phase, cravings and bloating can happen, so balanced meals and enough water can help.",
    Icon: Sparkles,
    color: COLORS.moss,
    phases: ["Teen", "Adult", "Maternity"],
    readMins: 3,
  },

  {
    title: "Scholarships & education loans",
    desc: "A plain-language guide to education support and applications.",
    content:
      "Many scholarship applications ask for documents such as income certificates, previous marksheets, identity documents, and bank account details. Keep your important documents organized so applications are easier to complete when opportunities open.",
    Icon: GraduationCap,
    color: COLORS.gold,
    phases: ["Teen"],
    readMins: 5,
  },

  {
    title: "When to see a doctor",
    desc: "Signs that irregular cycles or symptoms are worth a medical opinion.",
    content:
      "Talk to a doctor if periods stop for several months without pregnancy, bleeding is unusually heavy, pain regularly interferes with daily activities, or cycles are consistently very irregular. These symptoms do not automatically mean something serious, but getting professional advice can help.",
    Icon: BookOpen,
    color: COLORS.plumMid,
    phases: ["Teen", "Adult", "Maternity", "Elder"],
    readMins: 4,
  },

  {
    title: "Puberty, explained simply",
    desc: "What changes to expect in your body and how to talk about them.",
    content:
      "Puberty can involve a growth spurt, breast development, body-hair changes, and eventually the first period. Everyone develops at a different pace. Having a trusted adult, teacher, or doctor to ask questions can make these changes easier to understand.",
    Icon: Sparkles,
    color: COLORS.sage,
    phases: ["Childhood", "Teen"],
    readMins: 3,
  },

  {
    title: "Staying safe: know the warning signs",
    desc: "Recognizing unsafe situations and knowing who to reach out to.",
    content:
      "Trust your discomfort and remove yourself from situations that feel unsafe when you can. Keep a trusted adult's contact information available. If you need help, reach out to someone you trust or an appropriate support service.",
    Icon: Shield,
    color: COLORS.rose,
    phases: ["Childhood", "Teen", "Adult"],
    readMins: 3,
  },

  {
    title: "Building financial independence",
    desc: "Savings, budgeting, and habits that build financial confidence.",
    content:
      "Starting early matters more than starting big. Learn to track what comes in and what goes out each month. As you become eligible, learning about your own bank account, savings, budgeting, and responsible financial decisions can help build independence.",
    Icon: Wallet,
    color: COLORS.gold,
    phases: ["Teen", "Adult"],
    readMins: 4,
  },

  {
    title: "Pregnancy basics: what to expect",
    desc: "Trimester by trimester — appointments, symptoms, and warning signs.",
    content:
      "Pregnancy involves regular antenatal care, monitoring, and changes throughout each trimester. Symptoms can vary from person to person. Any concerning symptoms should be discussed with a qualified healthcare professional.",
    Icon: HeartPulse,
    color: COLORS.gold,
    phases: ["Maternity"],
    readMins: 5,
  },

  {
    title: "Postpartum recovery & support",
    desc: "Physical recovery, emotional wellbeing, and asking for help after birth.",
    content:
      "Recovery after childbirth takes time and varies from person to person. Physical healing, rest, nutrition, emotional support, and medical follow-up are all important. Persistent sadness, anxiety, or difficulty coping should be discussed with a healthcare professional.",
    Icon: HeartPulse,
    color: COLORS.plumMid,
    phases: ["Maternity"],
    readMins: 4,
  },

  {
    title: "Healthy aging & menopause",
    desc: "Understanding menopause and supporting health as you age.",
    content:
      "Menopause involves hormonal changes and can affect periods, sleep, mood, and other aspects of wellbeing. Bone health, nutrition, physical activity, and regular medical checkups become increasingly important.",
    Icon: BookOpen,
    color: COLORS.moss,
    phases: ["Elder"],
    readMins: 4,
  },

  {
    title: "Staying connected in later life",
    desc: "Community, support systems, and avoiding isolation.",
    content:
      "Staying connected with family, friends, neighbors, and community groups can support wellbeing in later life. Caregivers also benefit from having their own support network and taking time to look after themselves.",
    Icon: Users,
    color: COLORS.sage,
    phases: ["Elder"],
    readMins: 3,
  },
];

const BOOKMARKS_KEY = "herloop_saved_topics";

function getLifecyclePhase(tier: AccountTier): Phase {
  if (tier === "under10") {
    return "Childhood";
  }

  if (tier === "teen") {
    return "Teen";
  }

  return "Adult";
}

interface MotivationCardProps {
  tier: AccountTier;
}

export default function MotivationCard({
  tier,
}: MotivationCardProps) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saved, setSaved] = useState<string[]>([]);
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  const lifecyclePhase = getLifecyclePhase(tier);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(BOOKMARKS_KEY);

      if (raw) {
        setSaved(JSON.parse(raw));
      }
    } catch {
      // Ignore localStorage errors.
    }
  }, []);

  function toggleSaved(title: string) {
    setSaved((previous) => {
      const next = previous.includes(title)
        ? previous.filter((item) => item !== title)
        : [...previous, title];

      try {
        window.localStorage.setItem(
          BOOKMARKS_KEY,
          JSON.stringify(next)
        );
      } catch {
        // Ignore localStorage errors.
      }

      return next;
    });
  }

  const lifecycleTopics = TOPICS.filter((topic) =>
    topic.phases.includes(lifecyclePhase)
  );

  const filtered = lifecycleTopics.filter((topic) => {
    if (showSavedOnly && !saved.includes(topic.title)) {
      return false;
    }

    if (query.trim()) {
      const searchText = query.trim().toLowerCase();

      if (
        !topic.title.toLowerCase().includes(searchText) &&
        !topic.desc.toLowerCase().includes(searchText)
      ) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="px-5 pt-4 pb-3">
        <h2
          className="font-display text-lg"
          style={{ color: COLORS.plum }}
        >
          Learn
        </h2>

        <p
          className="text-xs font-body mt-0.5"
          style={{ color: `${COLORS.plum}77` }}
        >
          Guidance for your {lifecyclePhase.toLowerCase()} stage
        </p>
      </div>

      {/* Current lifecycle */}
      <div className="px-5 pb-3">
        <div
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold font-body"
          style={{
            background: `${COLORS.rose}18`,
            color: COLORS.plum,
          }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: COLORS.rose }}
          />

          {lifecyclePhase}
        </div>
      </div>

      {/* Search */}
      <div className="px-5 pb-3">
        <div
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl"
          style={{
            background: `${COLORS.plum}0A`,
            border: `1px solid ${COLORS.mist}`,
          }}
        >
          <Search
            size={15}
            style={{ color: `${COLORS.plum}55` }}
          />

          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search topics..."
            className="flex-1 bg-transparent text-sm font-body outline-none"
            style={{ color: COLORS.plum }}
          />
        </div>
      </div>

      {/* Saved-only */}
      <div className="px-5 pb-4">
        <button
          onClick={() => setShowSavedOnly((value) => !value)}
          className="flex items-center gap-1.5 text-xs font-semibold font-body"
          style={{
            color: showSavedOnly
              ? COLORS.rose
              : `${COLORS.plum}77`,
          }}
        >
          <Bookmark
            size={13}
            fill={showSavedOnly ? COLORS.rose : "none"}
          />

          {showSavedOnly
            ? "Showing saved only"
            : `Saved (${saved.length})`}
        </button>
      </div>

      {/* Topic count */}
      <div className="px-5 pb-3">
        <p
          className="text-[11px] font-body"
          style={{ color: `${COLORS.plum}55` }}
        >
          {filtered.length} topic
          {filtered.length === 1 ? "" : "s"} for your stage
        </p>
      </div>

      {/* Topics */}
      <div className="px-5 flex flex-col gap-3">
        {filtered.map((topic, index) => {
          const isOpen = expanded === topic.title;
          const isSaved = saved.includes(topic.title);

          return (
            <motion.div
              key={topic.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.05,
                duration: 0.3,
              }}
              className="rounded-2xl bg-white shadow-soft overflow-hidden"
              style={{
                border: `1px solid ${COLORS.mist}`,
              }}
            >
              <button
                onClick={() =>
                  setExpanded(
                    isOpen ? null : topic.title
                  )
                }
                className="w-full flex gap-3 p-4 text-left"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `${topic.color}20`,
                  }}
                >
                  <topic.Icon
                    size={18}
                    style={{ color: topic.color }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      className="font-semibold text-sm font-body mb-0.5"
                      style={{ color: COLORS.plum }}
                    >
                      {topic.title}
                    </h3>

                    <motion.span
                      animate={{
                        rotate: isOpen ? 180 : 0,
                      }}
                      transition={{ duration: 0.2 }}
                      className="flex-shrink-0 mt-0.5"
                    >
                      <ChevronDown
                        size={15}
                        style={{
                          color: `${COLORS.plum}55`,
                        }}
                      />
                    </motion.span>
                  </div>

                  <p
                    className="text-xs font-body leading-relaxed"
                    style={{
                      color: `${COLORS.plum}77`,
                    }}
                  >
                    {topic.desc}
                  </p>

                  <div className="flex items-center gap-1 mt-1.5">
                    <Clock
                      size={11}
                      style={{
                        color: `${COLORS.plum}55`,
                      }}
                    />

                    <span
                      className="text-[11px] font-body"
                      style={{
                        color: `${COLORS.plum}55`,
                      }}
                    >
                      {topic.readMins} min read
                    </span>
                  </div>
                </div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{
                      height: 0,
                      opacity: 0,
                    }}
                    animate={{
                      height: "auto",
                      opacity: 1,
                    }}
                    exit={{
                      height: 0,
                      opacity: 0,
                    }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pl-[68px]">
                      <p
                        className="text-xs font-body leading-relaxed mb-3"
                        style={{
                          color: `${COLORS.plum}99`,
                        }}
                      >
                        {topic.content}
                      </p>

                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleSaved(topic.title);
                        }}
                        className="flex items-center gap-1.5 text-xs font-semibold font-body"
                        style={{
                          color: isSaved
                            ? COLORS.rose
                            : `${COLORS.plum}77`,
                        }}
                      >
                        <Bookmark
                          size={13}
                          fill={
                            isSaved
                              ? COLORS.rose
                              : "none"
                          }
                        />

                        {isSaved
                          ? "Saved"
                          : "Save for later"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {filtered.length === 0 && (
          <p
            className="text-xs font-body text-center py-6"
            style={{ color: `${COLORS.plum}55` }}
          >
            {showSavedOnly
              ? "You haven't saved any topics yet."
              : "No topics match your search."}
          </p>
        )}
      </div>
    </div>
  );
}