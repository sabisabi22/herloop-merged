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

import type { AccountTier } from "@/lib/auth";
import { COLORS } from "@/lib/theme";

type Phase =
  | "Childhood"
  | "Teen"
  | "Adult"
  | "Maternity"
  | "Elder";

type Topic = {
  title: string;
  desc: string;
  content: string;
  Icon: typeof BookOpen;
  color: string;
  phases: Phase[];
  readMins: number;
};

const TOPICS: Topic[] = [
  {
    title: "Understanding your cycle",
    desc: "Learn the basics of periods, cycle changes, and what is normal.",
    content:
      "Your menstrual cycle can change during the teenage years while your body is still developing. Periods may not always arrive on the exact same day each month. Tracking your cycle can help you understand your own pattern and notice changes that may need attention.",
    Icon: HeartPulse,
    color: COLORS.rose,
    phases: ["Teen", "Adult"],
    readMins: 4,
  },

  {
    title: "Nutrition through your cycle",
    desc: "Simple nutrition habits to support energy and wellbeing.",
    content:
      "A balanced diet with vegetables, fruits, whole grains, protein, and enough water can support your energy. During periods, iron-rich foods can be especially useful. Try to maintain regular meals rather than skipping them.",
    Icon: Sparkles,
    color: COLORS.gold,
    phases: ["Teen", "Adult", "Maternity"],
    readMins: 4,
  },

  {
    title: "Scholarships & education loans",
    desc: "Understand common ways students can get financial support.",
    content:
      "Students may have access to scholarships, fee assistance, education loans, and other financial-support programs. Check eligibility requirements, application deadlines, required documents, and official sources before applying.",
    Icon: GraduationCap,
    color: COLORS.moss,
    phases: ["Teen"],
    readMins: 3,
  },

  {
    title: "When to see a doctor",
    desc: "Know when a health concern should be discussed with a professional.",
    content:
      "Some changes during adolescence are normal, but persistent or severe pain, unusually heavy bleeding, fainting, or other concerning symptoms should be discussed with a qualified healthcare professional.",
    Icon: HeartPulse,
    color: COLORS.rose,
    phases: ["Teen", "Adult", "Maternity", "Elder"],
    readMins: 4,
  },

  {
    title: "Puberty, explained simply",
    desc: "Understand the physical and emotional changes during puberty.",
    content:
      "Puberty is a normal stage of development. Changes can include growth, body shape changes, skin changes, body hair, periods, and emotional changes. Everyone develops at a different pace, so comparing yourself with friends is not always useful.",
    Icon: Sparkles,
    color: COLORS.gold,
    phases: ["Childhood", "Teen"],
    readMins: 4,
  },

  {
    title: "Staying safe: know the warning signs",
    desc: "Learn simple habits for personal safety and seeking help.",
    content:
      "Trust your instincts when a situation feels unsafe. Stay connected with trusted people, avoid sharing sensitive personal information unnecessarily, and seek help from a trusted adult or appropriate authority when you feel threatened or uncomfortable.",
    Icon: Shield,
    color: COLORS.rose,
    phases: ["Childhood", "Teen", "Adult"],
    readMins: 3,
  },

  {
    title: "Building financial independence",
    desc: "Start learning practical money habits early.",
    content:
      "Learning how to budget, save, understand bank accounts, and make informed spending decisions can help build financial confidence. Starting with small habits can make managing money easier later.",
    Icon: Wallet,
    color: COLORS.moss,
    phases: ["Teen", "Adult"],
    readMins: 4,
  },

  {
    title: "Pregnancy basics",
    desc: "Understand pregnancy, prenatal care, and common changes.",
    content:
      "Pregnancy involves major physical and emotional changes. Prenatal care helps monitor the health of both the pregnant person and baby. Questions or concerns should be discussed with a qualified healthcare professional.",
    Icon: HeartPulse,
    color: COLORS.rose,
    phases: ["Maternity"],
    readMins: 4,
  },

  {
    title: "Postpartum recovery & support",
    desc: "Learn about recovery and support after childbirth.",
    content:
      "Recovery after childbirth takes time. Rest, nutrition, emotional support, and appropriate medical follow-up are important. New or severe physical or emotional symptoms should be discussed with a healthcare professional.",
    Icon: HeartPulse,
    color: COLORS.rose,
    phases: ["Maternity"],
    readMins: 4,
  },

  {
    title: "Healthy aging & menopause",
    desc: "Understand common changes during menopause and later life.",
    content:
      "Menopause is a natural stage of life. Changes can include menstrual changes, hot flashes, sleep changes, and mood changes. Support and medical advice can help when symptoms affect daily life.",
    Icon: Users,
    color: COLORS.gold,
    phases: ["Elder"],
    readMins: 4,
  },

  {
    title: "Staying connected in later life",
    desc: "Community, caregiving support, and avoiding isolation.",
    content:
      "Regular contact with family, friends, neighbours, or community groups can support wellbeing in later life. Building a support network can also help caregivers manage responsibilities and avoid burnout.",
    Icon: Users,
    color: COLORS.moss,
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

export default function LearnPanel({
  tier,
}: {
  tier?: AccountTier;
}) {
  /*
   * The dashboard passes the user's current account tier.
   *
   * Teen  -> Teen
   * under10 -> Childhood
   * adult -> Adult
   */
  const effectiveTier: AccountTier = tier ?? "adult";

  const lifecyclePhase = getLifecyclePhase(effectiveTier);

  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saved, setSaved] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(BOOKMARKS_KEY);

      if (raw) {
        const parsed: unknown = JSON.parse(raw);

        if (Array.isArray(parsed)) {
          setSaved(
            parsed.filter(
              (item): item is string => typeof item === "string"
            )
          );
        }
      }
    } catch {
      // Ignore localStorage errors.
    }
  }, []);

  function toggleSaved(title: string) {
    setSaved((previousSaved: string[]) => {
      const nextSaved = previousSaved.includes(title)
        ? previousSaved.filter((item: string) => item !== title)
        : [...previousSaved, title];

      try {
        window.localStorage.setItem(
          BOOKMARKS_KEY,
          JSON.stringify(nextSaved)
        );
      } catch {
        // Ignore localStorage errors.
      }

      return nextSaved;
    });
  }

  /*
   * IMPORTANT:
   *
   * We ALWAYS filter by lifecyclePhase first.
   *
   * Therefore a Teen user can never see:
   * - Maternity
   * - Elder
   * - Adult-only
   * - Childhood-only
   *
   * even if the search box is used.
   */
  const lifecycleTopics = TOPICS.filter((topic) =>
    topic.phases.includes(lifecyclePhase)
  );

  const filteredTopics = lifecycleTopics.filter((topic) => {
    const searchText = query.trim().toLowerCase();

    if (!searchText) {
      return true;
    }

    return (
      topic.title.toLowerCase().includes(searchText) ||
      topic.desc.toLowerCase().includes(searchText) ||
      topic.content.toLowerCase().includes(searchText)
    );
  });

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: `${COLORS.rose}18`,
            }}
          >
            <BookOpen
              size={18}
              style={{ color: COLORS.rose }}
            />
          </div>

          <div>
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
              Guidance for your current life stage
            </p>
          </div>
        </div>
      </div>

      {/* Current lifecycle */}
      <div className="px-5 mb-4">
        <div
          className="rounded-2xl px-4 py-3"
          style={{
            background: `${COLORS.rose}10`,
            border: `1px solid ${COLORS.rose}18`,
          }}
        >
          <p
            className="text-[10px] uppercase tracking-wider font-semibold"
            style={{ color: `${COLORS.plum}66` }}
          >
            Your learning stage
          </p>

          <div className="flex items-center justify-between mt-1">
            <p
              className="text-sm font-semibold font-body"
              style={{ color: COLORS.plum }}
            >
              {lifecyclePhase}
            </p>

            <span
              className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
              style={{
                background: `${COLORS.rose}18`,
                color: COLORS.rose,
              }}
            >
              Personalised
            </span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-5 mb-4">
        <div
          className="flex items-center gap-2 rounded-2xl px-4 py-3 bg-white"
          style={{
            border: `1px solid ${COLORS.mist}`,
          }}
        >
          <Search
            size={16}
            style={{ color: `${COLORS.plum}55` }}
          />

          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${lifecyclePhase.toLowerCase()} topics...`}
            className="flex-1 outline-none bg-transparent text-sm font-body"
            style={{ color: COLORS.plum }}
          />
        </div>
      </div>

      {/* Topic count */}
      <div className="px-5 mb-3">
        <p
          className="text-xs font-body"
          style={{ color: `${COLORS.plum}66` }}
        >
          {filteredTopics.length} topic
          {filteredTopics.length === 1 ? "" : "s"} for your stage
        </p>
      </div>

      {/* Topics */}
      <div className="px-5 flex flex-col gap-3">
        {filteredTopics.map((topic, index) => {
          const isOpen = expanded === topic.title;
          const isSaved = saved.includes(topic.title);

          return (
            <motion.div
              key={topic.title}
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: index * 0.04,
                duration: 0.25,
              }}
              className="rounded-2xl bg-white shadow-soft overflow-hidden"
              style={{
                border: `1px solid ${COLORS.mist}`,
              }}
            >
              {/* Topic header */}
              <button
                onClick={() =>
                  setExpanded(isOpen ? null : topic.title)
                }
                className="w-full flex items-center gap-3 p-4 text-left"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `${topic.color}18`,
                  }}
                >
                  <topic.Icon
                    size={18}
                    style={{ color: topic.color }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3
                    className="font-semibold text-sm font-body"
                    style={{ color: COLORS.plum }}
                  >
                    {topic.title}
                  </h3>

                  <p
                    className="text-xs font-body mt-0.5 line-clamp-2"
                    style={{ color: `${COLORS.plum}70` }}
                  >
                    {topic.desc}
                  </p>

                  <div className="flex items-center gap-1 mt-2">
                    <Clock
                      size={11}
                      style={{
                        color: `${COLORS.plum}55`,
                      }}
                    />

                    <span
                      className="text-[10px] font-body"
                      style={{
                        color: `${COLORS.plum}55`,
                      }}
                    >
                      {topic.readMins} min read
                    </span>
                  </div>
                </div>

                <motion.div
                  animate={{
                    rotate: isOpen ? 180 : 0,
                  }}
                  transition={{
                    duration: 0.2,
                  }}
                  className="flex-shrink-0"
                >
                  <ChevronDown
                    size={17}
                    style={{
                      color: `${COLORS.plum}66`,
                    }}
                  />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
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
                    transition={{
                      duration: 0.2,
                    }}
                  >
                    <div
                      className="px-4 pb-4 pt-1"
                      style={{
                        borderTop: `1px solid ${COLORS.mist}`,
                      }}
                    >
                      <p
                        className="text-sm font-body leading-6"
                        style={{
                          color: `${COLORS.plum}B0`,
                        }}
                      >
                        {topic.content}
                      </p>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="text-[10px] font-semibold px-2 py-1 rounded-full"
                            style={{
                              background: `${topic.color}15`,
                              color: topic.color,
                            }}
                          >
                            {lifecyclePhase}
                          </span>
                        </div>

                        <button
                          onClick={() =>
                            toggleSaved(topic.title)
                          }
                          className="flex items-center gap-1.5 text-xs font-semibold"
                          style={{
                            color: isSaved
                              ? COLORS.rose
                              : `${COLORS.plum}70`,
                          }}
                        >
                          <Bookmark
                            size={14}
                            fill={
                              isSaved
                                ? COLORS.rose
                                : "none"
                            }
                          />

                          {isSaved ? "Saved" : "Save"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Empty search state */}
      {filteredTopics.length === 0 && (
        <div className="px-5">
          <div
            className="rounded-2xl bg-white p-6 text-center"
            style={{
              border: `1px solid ${COLORS.mist}`,
            }}
          >
            <Search
              size={24}
              className="mx-auto mb-2"
              style={{
                color: `${COLORS.plum}45`,
              }}
            />

            <p
              className="text-sm font-semibold font-body"
              style={{
                color: COLORS.plum,
              }}
            >
              No topics found
            </p>

            <p
              className="text-xs font-body mt-1"
              style={{
                color: `${COLORS.plum}66`,
              }}
            >
              Try another search for your {lifecyclePhase.toLowerCase()} stage.
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <p
        className="text-[11px] font-body text-center mt-5 px-8"
        style={{
          color: `${COLORS.plum}55`,
        }}
      >
        More personalised articles and resources are coming soon.
      </p>
    </div>
  );
}