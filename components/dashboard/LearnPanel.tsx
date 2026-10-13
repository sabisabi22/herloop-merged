
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
} from "lucide-react";

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
  Icon: typeof BookOpen;
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
  const [loadingBookmarks, setLoadingBookmarks] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [bookmarkError, setBookmarkError] = useState("");

  // Load this user's saved articles from Firestore.
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
          "Bookmarks could not be loaded. Check your connection or account permissions."
        );
        setLoadingBookmarks(false);
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
        "Could not update your bookmark. Check your Firestore rules and try again."
      );
    } finally {
      setSavingId(null);
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

      const matchesCategory =
        category === "All" ||
        (category === "Saved" && savedIds.includes(article.id)) ||
        article.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [lifecycleArticles, query, category, savedIds]);

  return (
    <section className="pb-8">
      {/* Header */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm"
            style={{
              background: `linear-gradient(135deg, ${COLORS.rose}22, ${COLORS.plum}18)`,
            }}
          >
            <BookOpen size={22} style={{ color: COLORS.rose }} />
          </div>

          <div>
            <h2
              className="font-display text-lg"
              style={{ color: COLORS.plum }}
            >
              Learning resources
            </h2>
            <p
              className="mt-0.5 text-xs font-body"
              style={{ color: `${COLORS.plum}77` }}
            >
              Guidance for your {lifecyclePhase.toLowerCase()} stage
            </p>
          </div>
        </div>
      </div>

      {/* Lifecycle card */}
      <div className="mb-4 px-5">
        <div
          className="rounded-2xl px-4 py-4 shadow-sm"
          style={{
            background: `linear-gradient(135deg, ${COLORS.rose}12, ${COLORS.plum}0A)`,
            border: `1px solid ${COLORS.rose}30`,
          }}
        >
          <p
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: `${COLORS.plum}77` }}
          >
            Your learning stage
          </p>

          <div className="mt-2 flex items-center justify-between">
            <p
              className="text-sm font-semibold"
              style={{ color: COLORS.plum }}
            >
              {lifecyclePhase}
            </p>

            <span
              className="rounded-full px-3 py-1 text-[10px] font-semibold"
              style={{
                background: `linear-gradient(135deg, ${COLORS.rose}20, ${COLORS.plum}18)`,
                color: COLORS.rose,
              }}
            >
              <Sparkles size={11} className="mr-1 inline" />
              Personalised
            </span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4 px-5">
        <div
          className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 shadow-sm transition focus-within:ring-2"
          style={{
            border: `1px solid ${COLORS.mist}`,
            boxShadow: `0 3px 12px ${COLORS.plum}08`,
          }}
        >
          <Search size={17} style={{ color: COLORS.rose }} />

          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search topics..."
            aria-label="Search Learn articles"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            style={{ color: COLORS.plum }}
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="text-xs font-semibold"
              style={{ color: COLORS.rose }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Category filters */}
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
                className="flex-shrink-0 rounded-full px-4 py-2.5 text-xs font-semibold transition duration-200 hover:-translate-y-0.5"
                style={{
                  background: active
                    ? `linear-gradient(135deg, ${COLORS.rose}, ${COLORS.plum})`
                    : "#ffffff",
                  color: active ? "#ffffff" : COLORS.plum,
                  border: `1px solid ${
                    active ? COLORS.rose : COLORS.mist
                  }`,
                  boxShadow: active
                    ? `0 3px 10px ${COLORS.rose}30`
                    : "none",
                }}
              >
                {item === "Saved" ? "★ Saved" : item}
              </button>
            );
          })}
        </div>
      </div>

      {/* Article count and bookmark status */}
      <div className="mb-3 px-5">
        <div className="flex items-center justify-between gap-2">
          <p
            className="text-xs font-medium"
            style={{ color: `${COLORS.plum}88` }}
          >
            {filteredArticles.length} topic
            {filteredArticles.length === 1 ? "" : "s"} for your stage
          </p>

          {category === "Saved" && (
            <span
              className="rounded-full px-2.5 py-1 text-[10px] font-semibold"
              style={{
                background: `${COLORS.rose}15`,
                color: COLORS.rose,
              }}
            >
              Bookmarked
            </span>
          )}
        </div>

        {loadingBookmarks && (
          <p
            className="mt-2 flex items-center gap-2 text-xs"
            style={{ color: `${COLORS.plum}77` }}
          >
            <LoaderCircle size={13} className="animate-spin" />
            Loading your saved articles...
          </p>
        )}

        {bookmarkError && (
          <p className="mt-2 text-xs text-red-600" role="alert">
            {bookmarkError}
          </p>
        )}
      </div>

      {/* Article cards */}
      <div className="flex flex-col gap-3 px-5">
        {filteredArticles.map((article) => {
          const isSaved = savedIds.includes(article.id);
          const isSaving = savingId === article.id;

          return (
            <article
              key={article.id}
              className="rounded-2xl bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
              style={{
                border: `1px solid ${COLORS.mist}`,
                boxShadow: `0 4px 16px ${COLORS.plum}08`,
              }}
            >
              <div className="flex gap-3">
                <div
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${article.color}24, ${COLORS.plum}0A)`,
                  }}
                >
                  <article.Icon
                    size={20}
                    style={{ color: article.color }}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      className="text-sm font-semibold leading-5"
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
                      className="flex-shrink-0 rounded-xl p-2 transition hover:bg-rose-50 disabled:opacity-50"
                      style={{ color: COLORS.rose }}
                    >
                      {isSaving ? (
                        <LoaderCircle
                          size={18}
                          className="animate-spin"
                        />
                      ) : (
                        <Bookmark
                          size={18}
                          fill={isSaved ? COLORS.rose : "none"}
                        />
                      )}
                    </button>
                  </div>

                  <p
                    className="mt-1 text-xs leading-5"
                    style={{ color: `${COLORS.plum}99` }}
                  >
                    {article.description}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span
                      className="rounded-full px-2.5 py-1 text-[10px] font-semibold"
                      style={{
                        color: article.color,
                        background: `${article.color}15`,
                      }}
                    >
                      {article.category}
                    </span>

                    <span
                      className="flex items-center gap-1 text-[10px]"
                      style={{ color: `${COLORS.plum}80` }}
                    >
                      <Clock size={11} />
                      {article.readMins} min read
                    </span>

                    {isSaved && (
                      <span
                        className="flex items-center gap-1 text-[10px] font-semibold"
                        style={{ color: COLORS.rose }}
                      >
                        <Bookmark size={10} fill={COLORS.rose} />
                        Saved
                      </span>
                    )}
                  </div>

                  {/* Read full article link */}
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Read ${article.title} on its original website (opens in a new tab)`}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition hover:opacity-80"
                    style={{
                      color: COLORS.rose,
                      background: `linear-gradient(135deg, ${COLORS.rose}12, ${COLORS.plum}0A)`,
                    }}
                  >
                    Read full article
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Empty state */}
      {!loadingBookmarks && filteredArticles.length === 0 && (
        <div
          className="mx-5 mt-2 rounded-2xl bg-white p-6 text-center shadow-sm"
          style={{ border: `1px solid ${COLORS.mist}` }}
        >
          <div
            className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{
              background: `linear-gradient(135deg, ${COLORS.rose}20, ${COLORS.plum}15)`,
            }}
          >
            <BookOpen size={24} style={{ color: COLORS.rose }} />
          </div>

          <p
            className="text-sm font-semibold"
            style={{ color: COLORS.plum }}
          >
            {category === "Saved"
              ? "No saved articles yet"
              : "No articles found"}
          </p>

          <p
            className="mt-1 text-xs leading-5"
            style={{ color: `${COLORS.plum}88` }}
          >
            {category === "Saved"
              ? "Tap the bookmark icon on an article to save it here."
              : "Try another search or choose a different category."}
          </p>
        </div>
      )}

      <p
        className="mt-6 px-8 text-center text-[11px] leading-5"
        style={{ color: `${COLORS.plum}77` }}
      >
        Articles open on their original websites. Information is
        educational and does not replace professional advice.
      </p>
    </section>
  );
}
