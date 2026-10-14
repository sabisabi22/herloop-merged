"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import {
  BookOpen,
  Search,
  Bookmark,
  ExternalLink,
  HeartPulse,
  GraduationCap,
  Shield,
  Wallet,
  Users,
  Sparkles,
  Clock,
  LoaderCircle,
  CheckCircle2,
  ChevronDown,
  Lightbulb,
  Phone,
  Droplets,
  Brain,
  Dumbbell,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { AccountTier } from "@/lib/auth";
import { app } from "@/lib/firebaseConfig";
import { COLORS } from "@/lib/theme";

type Phase = "Childhood" | "Teen" | "Adult" | "Maternity" | "Elder";

type Category =
  | "Health"
  | "Education"
  | "Safety"
  | "Finance"
  | "Maternity"
  | "Wellbeing";

/**
 * mode controls which topics this panel shows:
 *  - "health"    -> Health, Wellbeing, Maternity only
 *  - "education" -> Education, Finance, Safety only
 *  - "all"       -> everything (your original behaviour)
 */
export type LearnMode = "all" | "health" | "education";

type Article = {
  id: string;
  title: string;
  description: string;
  category: Category;
  url: string;
  readMins: number;
  phases: Phase[];
  Icon: LucideIcon;
  color: string;
  keyPoints: string[];
};

const db = getFirestore(app);

const MODE_CATEGORIES: Record<LearnMode, Category[]> = {
  all: ["Health", "Education", "Safety", "Finance", "Maternity", "Wellbeing"],
  health: ["Health", "Wellbeing", "Maternity"],
  education: ["Education", "Finance", "Safety"],
};

const ARTICLES: Article[] = [
  {
    id: "understanding-your-cycle",
    title: "Understanding your cycle",
    description:
      "Learn about menstrual health and understand the changes your body goes through.",
    category: "Health",
    url: "https://www.who.int/news-room/fact-sheets/detail/menstrual-health",
    readMins: 5,
    phases: ["Teen", "Adult"],
    Icon: HeartPulse,
    color: COLORS.rose,
    keyPoints: [
      "A cycle is counted from the first day of one period to the first day of the next.",
      "Cycles of about 21 to 35 days are common in adults, and teens often have longer ones.",
      "Bleeding usually lasts 2 to 7 days.",
      "Tracking a few months helps you learn what is normal for you.",
    ],
  },
  {
    id: "starting-your-periods",
    title: "Puberty, explained simply",
    description:
      "Understand periods, puberty, what to expect, and how to prepare for your first period.",
    category: "Health",
    url: "https://www.nhs.uk/conditions/periods/starting-periods/",
    readMins: 4,
    phases: ["Childhood", "Teen"],
    Icon: Sparkles,
    color: COLORS.gold,
    keyPoints: [
      "Most girls get their first period somewhere between about 9 and 15.",
      "The first few periods can be irregular, and that is normal.",
      "Keep a pad in your school bag so you are always prepared.",
      "Talk to a trusted adult if you have questions or worries.",
    ],
  },
  {
    id: "talking-about-periods",
    title: "Talking about periods",
    description:
      "Helpful guidance for making conversations about periods easier at home.",
    category: "Health",
    url: "https://www.unicef.org/parenting/health/talking-about-periods-at-home",
    readMins: 5,
    phases: ["Childhood", "Teen"],
    Icon: Users,
    color: COLORS.rose,
    keyPoints: [
      "Pick a calm, private moment to talk.",
      "No question is silly. Asking early helps you feel prepared.",
      "A mother, sister, teacher, school nurse or doctor can all help.",
    ],
  },
  {
    id: "menstrual-health-guidance",
    title: "When to see a doctor",
    description:
      "Explore menstrual health guidance and learn when to seek professional advice.",
    category: "Health",
    url: "https://www.nhs.uk/conditions/periods/period-problems/",
    readMins: 5,
    phases: ["Teen", "Adult"],
    Icon: HeartPulse,
    color: COLORS.rose,
    keyPoints: [
      "Periods have stopped for several months and you are not pregnant.",
      "Bleeding is very heavy, such as soaking a pad every 1 to 2 hours.",
      "Pain regularly stops you from doing daily activities.",
      "Bleeding between periods, or cycles that are very irregular.",
      "These signs do not always mean something serious, but a doctor can help.",
    ],
  },
  {
    id: "menstrual-hygiene",
    title: "Menstrual hygiene basics",
    description:
      "Simple habits to stay clean, comfortable and confident during your period.",
    category: "Health",
    url: "https://www.nhs.uk/conditions/periods/",
    readMins: 3,
    phases: ["Childhood", "Teen", "Adult"],
    Icon: Droplets,
    color: COLORS.rose,
    keyPoints: [
      "Change your pad or cloth every 4 to 6 hours, or sooner if it is full.",
      "Wash your hands before and after changing.",
      "Wrap used pads and put them in a bin. Do not flush them.",
      "Wash the outer area with plain water. Avoid scented products.",
      "Wash reusable cloth with soap and dry it fully, ideally in sunlight.",
    ],
  },
  {
    id: "period-pain-relief",
    title: "Easing period pain",
    description:
      "Practical ways to manage cramps, and when pain needs a doctor's attention.",
    category: "Health",
    url: "https://www.nhs.uk/conditions/period-pain/",
    readMins: 3,
    phases: ["Teen", "Adult"],
    Icon: Zap,
    color: COLORS.gold,
    keyPoints: [
      "A warm water bottle or heat pad on the lower belly can help.",
      "Gentle exercise such as walking or stretching can ease cramps.",
      "Rest and drink plenty of water.",
      "Ask a doctor or pharmacist which pain relief is suitable for you.",
      "See a doctor if pain is severe or gets worse over time.",
    ],
  },
  {
    id: "pcos-basics",
    title: "PCOS: what it is",
    description:
      "Understand polycystic ovary syndrome, common signs and how it is managed.",
    category: "Health",
    url: "https://www.who.int/news-room/fact-sheets/detail/polycystic-ovary-syndrome",
    readMins: 5,
    phases: ["Teen", "Adult"],
    Icon: HeartPulse,
    color: COLORS.rose,
    keyPoints: [
      "PCOS is a common hormonal condition.",
      "Signs can include irregular periods, acne and extra hair growth.",
      "Only a doctor can diagnose it, so do not self-diagnose.",
      "Healthy food, regular activity and medical guidance can help manage it.",
    ],
  },
  {
    id: "anaemia-iron",
    title: "Anaemia and iron",
    description:
      "Why iron matters, especially with heavy periods, and how to get enough.",
    category: "Health",
    url: "https://www.who.int/news-room/fact-sheets/detail/anaemia",
    readMins: 4,
    phases: ["Teen", "Adult", "Maternity"],
    Icon: Droplets,
    color: COLORS.gold,
    keyPoints: [
      "Anaemia means low haemoglobin, so the body carries less oxygen.",
      "Common signs are tiredness, looking pale, dizziness and breathlessness.",
      "Heavy periods are one common cause.",
      "Lentils, beans, green leafy vegetables, eggs and meat provide iron.",
      "Vitamin C foods such as lemon or amla help the body absorb iron.",
      "Get tested before taking iron supplements.",
    ],
  },
  {
    id: "nutrition-through-your-cycle",
    title: "Nutrition through your cycle",
    description:
      "Explore balanced eating guidance to support your general health and wellbeing.",
    category: "Wellbeing",
    url: "https://www.nhs.uk/live-well/eat-well/",
    readMins: 3,
    phases: ["Teen", "Adult"],
    Icon: HeartPulse,
    color: COLORS.gold,
    keyPoints: [
      "Eat regular balanced meals with protein, vegetables and whole grains.",
      "Include iron-rich foods, especially during and after your period.",
      "Drink enough water through the day.",
      "Do not skip meals. It can make tiredness and mood swings worse.",
    ],
  },
  {
    id: "mental-wellbeing",
    title: "Looking after your mind",
    description:
      "Five simple steps for better mental wellbeing, and where to get support.",
    category: "Wellbeing",
    url: "https://www.nhs.uk/mental-health/self-help/guides-tools-and-activities/five-steps-to-mental-wellbeing/",
    readMins: 4,
    phases: ["Teen", "Adult", "Elder"],
    Icon: Brain,
    color: COLORS.moss,
    keyPoints: [
      "Stay connected with people you trust.",
      "Be active, even a short daily walk helps.",
      "Learn something new, and do small things for others.",
      "Take a few quiet minutes to notice how you feel.",
      "If you feel low for weeks, talk to someone. Tele-MANAS (14416) offers free support.",
    ],
  },
  {
    id: "physical-activity",
    title: "Staying active",
    description:
      "How much movement your body needs, and easy ways to build it into your day.",
    category: "Wellbeing",
    url: "https://www.who.int/news-room/fact-sheets/detail/physical-activity",
    readMins: 3,
    phases: ["Childhood", "Teen", "Adult", "Elder"],
    Icon: Dumbbell,
    color: COLORS.moss,
    keyPoints: [
      "WHO suggests children and teens get about 60 minutes of activity a day.",
      "Adults are advised about 150 to 300 minutes of moderate activity a week.",
      "Walking, dancing, cycling and yoga all count.",
      "Start small and build up slowly.",
    ],
  },
  {
    id: "pregnancy-care",
    title: "Pregnancy and prenatal care",
    description:
      "Explore trusted health information and resources for pregnancy.",
    category: "Maternity",
    url: "https://www.who.int/health-topics/maternal-health",
    readMins: 5,
    phases: ["Maternity"],
    Icon: HeartPulse,
    color: COLORS.rose,
    keyPoints: [
      "Go for regular antenatal check-ups.",
      "Take iron and folic acid only as advised by your doctor.",
      "Eat balanced meals and stay hydrated.",
      "Contact a doctor quickly if you notice heavy bleeding, severe headache or reduced baby movement.",
    ],
  },
  {
    id: "healthy-aging",
    title: "Healthy aging and wellbeing",
    description:
      "Explore information about healthy aging and wellbeing.",
    category: "Wellbeing",
    url: "https://www.who.int/health-topics/ageing",
    readMins: 5,
    phases: ["Adult", "Elder"],
    Icon: Users,
    color: COLORS.gold,
    keyPoints: [
      "Stay physically active and eat a balanced diet.",
      "Have regular health check-ups.",
      "Stay socially connected to protect your mood.",
    ],
  },
  {
    id: "education-support",
    title: "Scholarships & education loans",
    description:
      "Explore education resources and opportunities to support your studies.",
    category: "Education",
    url: "https://scholarships.gov.in/",
    readMins: 4,
    phases: ["Teen", "Adult"],
    Icon: GraduationCap,
    color: COLORS.moss,
    keyPoints: [
      "The National Scholarship Portal lists many central and state schemes.",
      "Check eligibility and the last date before you apply.",
      "Keep your marksheets and certificates ready as scans.",
    ],
  },
  {
    id: "financial-literacy",
    title: "Building financial independence",
    description:
      "Learn the basics of saving, budgeting, and managing money.",
    category: "Finance",
    url: "https://www.rbi.org.in/financialeducation/",
    readMins: 4,
    phases: ["Teen", "Adult"],
    Icon: Wallet,
    color: COLORS.moss,
    keyPoints: [
      "Save a small amount regularly. The habit matters more than the amount.",
      "Track spending with a simple monthly budget.",
      "Never share your OTP, PIN or password with anyone.",
    ],
  },
  {
    id: "womens-support",
    title: "Staying safe: know the warning signs",
    description:
      "Find official information about women's support and government initiatives in India.",
    category: "Safety",
    url: "https://www.childlineindia.org.in/",
    readMins: 5,
    phases: ["Teen", "Adult", "Maternity"],
    Icon: Shield,
    color: COLORS.rose,
    keyPoints: [
      "Trust your instincts. If a situation feels unsafe, leave and seek help.",
      "Women Helpline: 181. Emergency: 112. Childline (under 18): 1098.",
      "Tell a trusted adult, teacher or friend what is happening.",
    ],
  },
];

/** Myths vs facts (shown in the Health library). */
const MYTHS: { id: string; myth: string; fact: string }[] = [
  {
    id: "m1",
    myth: "You should not exercise or wash your hair during periods.",
    fact: "Light exercise can ease cramps, and bathing and hair wash are completely safe and hygienic.",
  },
  {
    id: "m2",
    myth: "Period blood is dirty or impure.",
    fact: "It is blood and tissue from the lining of the uterus. It is a normal, healthy body process.",
  },
  {
    id: "m3",
    myth: "Painful periods are always normal and must just be tolerated.",
    fact: "Mild cramps are common, but pain that stops your daily activities deserves medical advice.",
  },
  {
    id: "m4",
    myth: "Every cycle must be exactly 28 days.",
    fact: "Cycles vary from person to person and from month to month. Tracking shows what is normal for you.",
  },
  {
    id: "m5",
    myth: "You cannot go to school or do normal activities during periods.",
    fact: "Periods are not a reason to miss school, play or daily life. Good hygiene and rest when needed are enough.",
  },
];

const DAILY_TIPS = [
  "Drink water regularly. Mild dehydration can make cramps and headaches feel worse.",
  "A 10-minute walk can lift your mood and ease period discomfort.",
  "Add a green leafy vegetable or lentils to one meal today for iron.",
  "Aim for a steady sleep time. Good sleep supports hormones and mood.",
  "Take 3 slow, deep breaths when you feel stressed. It really helps.",
  "Tracking your cycle for a few months shows your personal pattern.",
  "Talking to someone you trust about how you feel is a sign of strength.",
];

const HELPLINES = [
  { name: "Emergency", number: "112" },
  { name: "Women Helpline", number: "181" },
  { name: "Tele-MANAS (mental health)", number: "14416" },
  { name: "Childline (under 18)", number: "1098" },
];

type FilterCategory = "All" | Category | "Saved" | "Completed";

function getLifecyclePhase(tier: AccountTier): Phase {
  if (tier === "under10") return "Childhood";
  if (tier === "teen") return "Teen";
  return "Adult";
}

export default function LearnPanel({
  uid,
  tier,
  mode = "health",
}: {
  uid: string;
  tier?: AccountTier;
  mode?: LearnMode;
}) {
  const effectiveTier: AccountTier = tier ?? "adult";
  const lifecyclePhase = getLifecyclePhase(effectiveTier);

  const modeCategories = MODE_CATEGORIES[mode];
  const filterOptions: FilterCategory[] = [
    "All",
    ...modeCategories,
    "Saved",
    "Completed",
  ];

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<FilterCategory>("All");

  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  const [loadingBookmarks, setLoadingBookmarks] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(true);

  const [savingId, setSavingId] = useState<string | null>(null);
  const [savingProgressId, setSavingProgressId] = useState<string | null>(
    null
  );

  const [bookmarkError, setBookmarkError] = useState("");
  const [progressError, setProgressError] = useState("");

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [revealedMyths, setRevealedMyths] = useState<string[]>([]);
  const [tipIndex, setTipIndex] = useState(0);

  // Pick a tip based on today's date (set after mount to avoid hydration mismatch).
  useEffect(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor(
      (now.getTime() - start.getTime()) / 86400000
    );
    setTipIndex(dayOfYear % DAILY_TIPS.length);
  }, []);

  // Load saved articles from Firebase.
  useEffect(() => {
    if (!uid) {
      setSavedIds([]);
      setLoadingBookmarks(false);
      return;
    }

    setLoadingBookmarks(true);
    setBookmarkError("");

    const bookmarksRef = collection(db, "users", uid, "bookmarks");

    const unsubscribe = onSnapshot(
      bookmarksRef,
      (snapshot) => {
        setSavedIds(snapshot.docs.map((item) => item.id));
        setLoadingBookmarks(false);
      },
      (error) => {
        console.error("Could not load Learn bookmarks:", error);
        setBookmarkError(
          "Saved articles could not be loaded. Check your connection or Firebase permissions."
        );
        setLoadingBookmarks(false);
      }
    );

    return () => unsubscribe();
  }, [uid]);

  // Load completed topics from Firebase.
  useEffect(() => {
    if (!uid) {
      setCompletedIds([]);
      setLoadingProgress(false);
      return;
    }

    setLoadingProgress(true);
    setProgressError("");

    const progressRef = collection(db, "users", uid, "completedTopics");

    const unsubscribe = onSnapshot(
      progressRef,
      (snapshot) => {
        setCompletedIds(snapshot.docs.map((item) => item.id));
        setLoadingProgress(false);
      },
      (error) => {
        console.error("Could not load learning progress:", error);
        setProgressError(
          "Learning progress could not be loaded. Check your Firebase permissions."
        );
        setLoadingProgress(false);
      }
    );

    return () => unsubscribe();
  }, [uid]);

  async function toggleBookmark(article: Article) {
    if (!uid || savingId) return;

    setSavingId(article.id);
    setBookmarkError("");

    const bookmarkRef = doc(db, "users", uid, "bookmarks", article.id);

    try {
      if (savedIds.includes(article.id)) {
        await deleteDoc(bookmarkRef);
      } else {
        await setDoc(bookmarkRef, {
          articleId: article.id,
          title: article.title,
          url: article.url,
          category: article.category,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Could not update bookmark:", error);
      setBookmarkError(
        "Could not update your bookmark. Check your Firebase rules and try again."
      );
    } finally {
      setSavingId(null);
    }
  }

  async function toggleCompleted(article: Article) {
    if (!uid || savingProgressId) return;

    setSavingProgressId(article.id);
    setProgressError("");

    const progressRef = doc(db, "users", uid, "completedTopics", article.id);

    try {
      if (completedIds.includes(article.id)) {
        await deleteDoc(progressRef);
      } else {
        await setDoc(progressRef, {
          articleId: article.id,
          title: article.title,
          category: article.category,
          completedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Could not update learning progress:", error);
      setProgressError(
        "Could not save your progress. Check your Firebase rules and try again."
      );
    } finally {
      setSavingProgressId(null);
    }
  }

  function toggleMyth(id: string) {
    setRevealedMyths((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  // Articles for this life stage AND this mode.
  const lifecycleArticles = useMemo(
    () =>
      ARTICLES.filter(
        (article) =>
          article.phases.includes(lifecyclePhase) &&
          modeCategories.includes(article.category)
      ),
    [lifecyclePhase, modeCategories]
  );

  const filteredArticles = useMemo(() => {
    const search = query.trim().toLowerCase();

    return lifecycleArticles.filter((article) => {
      const matchesSearch =
        !search ||
        article.title.toLowerCase().includes(search) ||
        article.description.toLowerCase().includes(search) ||
        article.category.toLowerCase().includes(search);

      let matchesCategory = true;

      if (category === "Saved") {
        matchesCategory = savedIds.includes(article.id);
      } else if (category === "Completed") {
        matchesCategory = completedIds.includes(article.id);
      } else if (category !== "All") {
        matchesCategory = article.category === category;
      }

      return matchesSearch && matchesCategory;
    });
  }, [lifecycleArticles, query, category, savedIds, completedIds]);

  const completedCount = lifecycleArticles.filter((article) =>
    completedIds.includes(article.id)
  ).length;

  const progressPercent =
    lifecycleArticles.length > 0
      ? Math.round((completedCount / lifecycleArticles.length) * 100)
      : 0;

  const isHealth = mode === "health";
  const heading = isHealth ? "My Health" : mode === "education" ? "Learn & Grow" : "Learn & Grow";
  const HeaderIcon = isHealth ? HeartPulse : BookOpen;

  const showExtras = isHealth && category === "All" && !query.trim();

  return (
    <section className="pb-8">
      {/* Header */}
      <div className="px-5 pb-5 pt-6">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm"
            style={{
              background: `linear-gradient(135deg, ${COLORS.rose}22, ${COLORS.plum}18)`,
            }}
          >
            <HeaderIcon size={24} style={{ color: COLORS.rose }} />
          </div>

          <div>
            <h2
              className="font-display text-2xl font-bold"
              style={{ color: COLORS.plum }}
            >
              {heading}
            </h2>
            <p
              className="mt-1 text-sm"
              style={{ color: `${COLORS.plum}99` }}
            >
              Resources for your {lifecyclePhase.toLowerCase()} stage
            </p>
          </div>
        </div>
      </div>

      {/* Daily tip (health only) */}
      {isHealth && (
        <div className="mb-5 px-5">
          <div
            className="flex gap-3 rounded-2xl p-4"
            style={{
              background: `${COLORS.gold}18`,
              border: `1px solid ${COLORS.gold}40`,
            }}
          >
            <div
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
              style={{ background: COLORS.gold }}
            >
              <Lightbulb size={19} color="#fff" />
            </div>
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: `${COLORS.plum}88` }}
              >
                Today&apos;s health tip
              </p>
              <p
                className="mt-1 text-sm leading-6"
                style={{ color: COLORS.plum }}
              >
                {DAILY_TIPS[tipIndex]}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Learning progress */}
      <div className="mb-5 px-5">
        <div
          className="rounded-2xl p-5 shadow-sm"
          style={{
            background: `linear-gradient(135deg, ${COLORS.rose}12, ${COLORS.plum}0A)`,
            border: `1px solid ${COLORS.rose}30`,
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p
                className="text-sm font-semibold"
                style={{ color: COLORS.plum }}
              >
                Your learning progress
              </p>
              <p
                className="mt-1 text-sm"
                style={{ color: `${COLORS.plum}99` }}
              >
                {loadingProgress
                  ? "Loading your progress..."
                  : `${completedCount} of ${lifecycleArticles.length} topics completed`}
              </p>
            </div>

            <div
              className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl"
              style={{ background: "#FFFFFF", color: COLORS.rose }}
            >
              <GraduationCap size={25} />
            </div>
          </div>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPercent}%`,
                background: `linear-gradient(90deg, ${COLORS.rose}, ${COLORS.plum})`,
              }}
            />
          </div>

          <p
            className="mt-2 text-sm font-semibold"
            style={{ color: COLORS.rose }}
          >
            {loadingProgress
              ? "Calculating progress..."
              : `${progressPercent}% completed`}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4 px-5">
        <div
          className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 shadow-sm"
          style={{ border: `1px solid ${COLORS.mist}` }}
        >
          <Search size={20} style={{ color: COLORS.rose }} />

          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={isHealth ? "Search health topics..." : "Search learning topics..."}
            aria-label={isHealth ? "Search health topics" : "Search learning topics"}
            className="min-w-0 flex-1 bg-transparent text-base outline-none"
            style={{ color: COLORS.plum }}
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-sm font-semibold"
              style={{ color: COLORS.rose }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="mb-4 px-5">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {filterOptions.map((item) => {
            const active = category === item;

            return (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                aria-pressed={active}
                className="flex-shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition"
                style={{
                  background: active
                    ? `linear-gradient(135deg, ${COLORS.rose}, ${COLORS.plum})`
                    : "#FFFFFF",
                  color: active ? "#FFFFFF" : COLORS.plum,
                  border: `1px solid ${active ? COLORS.rose : COLORS.mist}`,
                }}
              >
                {item === "Saved"
                  ? "★ Saved"
                  : item === "Completed"
                    ? "✓ Completed"
                    : item}
              </button>
            );
          })}
        </div>
      </div>

      {/* Count and errors */}
      <div className="mb-3 px-5">
        <p className="text-sm" style={{ color: `${COLORS.plum}99` }}>
          {filteredArticles.length} topic
          {filteredArticles.length === 1 ? "" : "s"} shown
        </p>

        {loadingBookmarks && (
          <p
            className="mt-2 flex items-center gap-2 text-sm"
            style={{ color: `${COLORS.plum}99` }}
          >
            <LoaderCircle size={16} className="animate-spin" />
            Loading saved articles...
          </p>
        )}

        {bookmarkError && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {bookmarkError}
          </p>
        )}

        {progressError && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {progressError}
          </p>
        )}
      </div>

      {/* Article cards */}
      <div className="flex flex-col gap-4 px-5">
        {filteredArticles.map((article) => {
          const isSaved = savedIds.includes(article.id);
          const isCompleted = completedIds.includes(article.id);
          const isSaving = savingId === article.id;
          const isSavingProgress = savingProgressId === article.id;
          const isExpanded = expandedId === article.id;

          return (
            <article
              key={article.id}
              className="rounded-2xl bg-white p-5 shadow-sm"
              style={{
                border: `1px solid ${COLORS.mist}`,
                boxShadow: `0 4px 16px ${COLORS.plum}08`,
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl"
                  style={{ background: `${article.color}20` }}
                >
                  <article.Icon size={23} style={{ color: article.color }} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      className="text-base font-bold leading-6"
                      style={{ color: COLORS.plum }}
                    >
                      {article.title}
                    </h3>

                    <button
                      type="button"
                      onClick={() => toggleBookmark(article)}
                      disabled={Boolean(savingId) || !uid}
                      aria-label={
                        isSaved
                          ? `Remove ${article.title} from saved articles`
                          : `Save ${article.title}`
                      }
                      title={isSaved ? "Remove bookmark" : "Save article"}
                      className="flex-shrink-0 rounded-xl p-2 disabled:opacity-50"
                      style={{ color: COLORS.rose }}
                    >
                      {isSaving ? (
                        <LoaderCircle size={20} className="animate-spin" />
                      ) : (
                        <Bookmark
                          size={20}
                          fill={isSaved ? COLORS.rose : "none"}
                        />
                      )}
                    </button>
                  </div>

                  <p
                    className="mt-2 text-sm leading-6"
                    style={{ color: `${COLORS.plum}B0` }}
                  >
                    {article.description}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span
                      className="rounded-full px-3 py-1 text-xs font-semibold"
                      style={{
                        color: article.color,
                        background: `${article.color}18`,
                      }}
                    >
                      {article.category}
                    </span>

                    <span
                      className="flex items-center gap-1 text-sm"
                      style={{ color: `${COLORS.plum}99` }}
                    >
                      <Clock size={15} />
                      {article.readMins} min read
                    </span>

                    {isSaved && (
                      <span
                        className="flex items-center gap-1 text-xs font-semibold"
                        style={{ color: COLORS.rose }}
                      >
                        <Bookmark size={13} fill={COLORS.rose} />
                        Saved
                      </span>
                    )}

                    {isCompleted && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-green-700">
                        <CheckCircle2 size={14} />
                        Completed
                      </span>
                    )}
                  </div>

                  {/* Key points (expandable) */}
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedId(isExpanded ? null : article.id)
                    }
                    aria-expanded={isExpanded}
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold"
                    style={{ color: COLORS.plum }}
                  >
                    Key points
                    <ChevronDown
                      size={16}
                      className="transition-transform"
                      style={{
                        transform: isExpanded ? "rotate(180deg)" : "none",
                      }}
                    />
                  </button>

                  {isExpanded && (
                    <ul
                      className="mt-2 space-y-2 rounded-xl p-3"
                      style={{ background: `${COLORS.plum}08` }}
                    >
                      {article.keyPoints.map((point) => (
                        <li
                          key={point}
                          className="flex gap-2 text-sm leading-6"
                          style={{ color: `${COLORS.plum}CC` }}
                        >
                          <span
                            className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full"
                            style={{ background: article.color }}
                          />
                          {point}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Read ${article.title} on its original website (opens in a new tab)`}
                      className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold"
                      style={{
                        color: COLORS.rose,
                        background: `${COLORS.rose}12`,
                      }}
                    >
                      Read resource
                      <ExternalLink size={16} />
                    </a>

                    <button
                      type="button"
                      onClick={() => toggleCompleted(article)}
                      disabled={Boolean(savingProgressId) || !uid}
                      aria-pressed={isCompleted}
                      className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-50"
                      style={{
                        color: isCompleted ? "#166534" : COLORS.plum,
                        background: isCompleted ? "#DCFCE7" : "#F4F0F5",
                      }}
                    >
                      {isSavingProgress ? (
                        <LoaderCircle size={17} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={17} />
                      )}

                      {isSavingProgress
                        ? "Saving..."
                        : isCompleted
                          ? "Mark as not completed"
                          : "Mark as completed"}
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Empty state */}
      {!loadingBookmarks &&
        !loadingProgress &&
        filteredArticles.length === 0 && (
          <div
            className="mx-5 mt-3 rounded-2xl bg-white p-6 text-center shadow-sm"
            style={{ border: `1px solid ${COLORS.mist}` }}
          >
            <BookOpen
              size={30}
              className="mx-auto mb-3"
              style={{ color: COLORS.rose }}
            />

            <p className="text-base font-bold" style={{ color: COLORS.plum }}>
              {category === "Saved"
                ? "No saved articles yet"
                : category === "Completed"
                  ? "No completed topics yet"
                  : "No topics found"}
            </p>

            <p
              className="mt-2 text-sm leading-6"
              style={{ color: `${COLORS.plum}99` }}
            >
              {category === "Saved"
                ? "Tap the bookmark icon on a resource to save it here."
                : category === "Completed"
                  ? "After reading a resource, mark it as completed to track your progress."
                  : "Try another search or choose a different category."}
            </p>
          </div>
        )}

      {/* Myths vs Facts (health only) */}
      {showExtras && (
        <div className="mt-8 px-5">
          <h3
            className="font-display text-lg font-bold"
            style={{ color: COLORS.plum }}
          >
            Myths vs facts
          </h3>
          <p
            className="mb-3 mt-1 text-sm"
            style={{ color: `${COLORS.plum}99` }}
          >
            Tap a myth to see the fact.
          </p>

          <div className="flex flex-col gap-3">
            {MYTHS.map((item) => {
              const open = revealedMyths.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleMyth(item.id)}
                  aria-expanded={open}
                  className="rounded-2xl p-4 text-left transition"
                  style={{
                    background: open ? "#DCFCE7" : "#FFFFFF",
                    border: `1px solid ${open ? "#86EFAC" : COLORS.mist}`,
                  }}
                >
                  <p
                    className="text-xs font-bold uppercase tracking-wide"
                    style={{ color: open ? "#166534" : COLORS.rose }}
                  >
                    {open ? "Fact" : "Myth"}
                  </p>
                  <p
                    className="mt-1 text-sm leading-6"
                    style={{ color: COLORS.plum }}
                  >
                    {open ? item.fact : item.myth}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Helplines (health only) */}
      {isHealth && (
        <div className="mt-8 px-5">
          <h3
            className="font-display text-lg font-bold"
            style={{ color: COLORS.plum }}
          >
            Need to talk to someone?
          </h3>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {HELPLINES.map((line) => (
              <a
                key={line.number}
                href={`tel:${line.number}`}
                className="flex items-center gap-3 rounded-2xl bg-white p-4"
                style={{ border: `1px solid ${COLORS.mist}` }}
              >
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{ background: `${COLORS.rose}18` }}
                >
                  <Phone size={18} style={{ color: COLORS.rose }} />
                </div>
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: COLORS.plum }}
                  >
                    {line.name}
                  </p>
                  <p
                    className="text-base font-bold"
                    style={{ color: COLORS.rose }}
                  >
                    {line.number}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      <p
        className="mt-6 px-8 text-center text-sm leading-6"
        style={{ color: `${COLORS.plum}88` }}
      >
        Resources open on their original websites. Learning progress reflects
        the topics you mark as completed. Health information is educational
        and does not replace professional advice.
      </p>
    </section>
  );
}