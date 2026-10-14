
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
};

const db = getFirestore(app);

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
  },
];

const CATEGORIES = [
  "All",
  "Health",
  "Education",
  "Safety",
  "Finance",
  "Maternity",
  "Wellbeing",
  "Saved",
  "Completed",
] as const;

type FilterCategory = (typeof CATEGORIES)[number];

function getLifecyclePhase(tier: AccountTier): Phase {
  if (tier === "under10") return "Childhood";
  if (tier === "teen") return "Teen";
  return "Adult";
}

export default function LearnPanel({
  uid,
  tier,
}: {
  uid: string;
  tier?: AccountTier;
}) {
  const effectiveTier: AccountTier = tier ?? "adult";
  const lifecyclePhase = getLifecyclePhase(effectiveTier);

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

    const progressRef = collection(
      db,
      "users",
      uid,
      "completedTopics"
    );

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

    const bookmarkRef = doc(
      db,
      "users",
      uid,
      "bookmarks",
      article.id
    );

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

    const progressRef = doc(
      db,
      "users",
      uid,
      "completedTopics",
      article.id
    );

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

  const lifecycleArticles = useMemo(
    () =>
      ARTICLES.filter((article) =>
        article.phases.includes(lifecyclePhase)
      ),
    [lifecyclePhase]
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
  }, [
    lifecycleArticles,
    query,
    category,
    savedIds,
    completedIds,
  ]);

  const completedCount = lifecycleArticles.filter((article) =>
    completedIds.includes(article.id)
  ).length;

  const progressPercent =
    lifecycleArticles.length > 0
      ? Math.round(
          (completedCount / lifecycleArticles.length) * 100
        )
      : 0;

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
            <BookOpen size={24} style={{ color: COLORS.rose }} />
          </div>

          <div>
            <h2
              className="font-display text-2xl font-bold"
              style={{ color: COLORS.plum }}
            >
              Learn & Grow
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
              style={{
                background: "#FFFFFF",
                color: COLORS.rose,
              }}
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
            placeholder="Search learning topics..."
            aria-label="Search learning topics"
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
          {CATEGORIES.map((item) => {
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
        <p
          className="text-sm"
          style={{ color: `${COLORS.plum}99` }}
        >
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
                  style={{
                    background: `${article.color}20`,
                  }}
                >
                  <article.Icon
                    size={23}
                    style={{ color: article.color }}
                  />
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
                        <LoaderCircle
                          size={20}
                          className="animate-spin"
                        />
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
                        <LoaderCircle
                          size={17}
                          className="animate-spin"
                        />
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

            <p
              className="text-base font-bold"
              style={{ color: COLORS.plum }}
            >
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
