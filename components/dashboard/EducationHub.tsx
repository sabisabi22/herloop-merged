
"use client";

import { useMemo, useState } from "react";
import {
  educationLessons,
  type EducationLesson,
} from "@/lib/educationLessons";

const domains = [
  {
    name: "School Studies",
    icon: "📚",
    description: "Maths, school subjects and foundational learning.",
    color: "bg-violet-50 border-violet-100",
  },
  {
    name: "Science & Discovery",
    icon: "🔬",
    description: "Explore nature, space and scientific ideas.",
    color: "bg-sky-50 border-sky-100",
  },
  {
    name: "Technology & Coding",
    icon: "💻",
    description: "Start coding and understand technology.",
    color: "bg-indigo-50 border-indigo-100",
  },
  {
    name: "Arts & Creativity",
    icon: "🎨",
    description: "Learn design, colour and creative thinking.",
    color: "bg-pink-50 border-pink-100",
  },
  {
    name: "Business & Finance",
    icon: "💰",
    description: "Understand budgeting, saving and business.",
    color: "bg-amber-50 border-amber-100",
  },
  {
    name: "Languages & Communication",
    icon: "🗣️",
    description: "Build language and speaking skills.",
    color: "bg-emerald-50 border-emerald-100",
  },
  {
    name: "History & World Knowledge",
    icon: "🌍",
    description: "Discover maps, history and the wider world.",
    color: "bg-orange-50 border-orange-100",
  },
  {
    name: "Life Skills & Wellbeing",
    icon: "🌱",
    description: "Develop everyday skills and healthy habits.",
    color: "bg-teal-50 border-teal-100",
  },
  {
    name: "Careers & Professional Skills",
    icon: "🚀",
    description: "Explore strengths, goals and future careers.",
    color: "bg-rose-50 border-rose-100",
  },
  {
    name: "Logic & Competitive Exams",
    icon: "🧠",
    description: "Practise patterns, reasoning and problem-solving.",
    color: "bg-fuchsia-50 border-fuchsia-100",
  },
];

const levels = [
  "Class 1–5",
  "Class 6–8",
  "Class 9–10",
  "Class 11–12",
  "College",
  "Beginner",
  "Intermediate",
  "Advanced",
];

type EducationHubProps = {
  onSelectLesson?: (lesson: EducationLesson) => void;
};

export default function EducationHub({
  onSelectLesson,
}: EducationHubProps) {
  const [search, setSearch] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("Beginner");
  const [selectedDomain, setSelectedDomain] = useState("All");

  const filteredDomains = useMemo(() => {
    const query = search.trim().toLowerCase();

    return domains.filter((domain) => {
      const matchesDomain =
        selectedDomain === "All" || domain.name === selectedDomain;

      const matchesSearch =
        !query ||
        domain.name.toLowerCase().includes(query) ||
        domain.description.toLowerCase().includes(query) ||
        educationLessons.some(
          (lesson) =>
            lesson.domain === domain.name &&
            (lesson.title.toLowerCase().includes(query) ||
              lesson.introduction.toLowerCase().includes(query))
        );

      return matchesDomain && matchesSearch;
    });
  }, [search, selectedDomain]);

  const getLesson = (domainName: string) =>
    educationLessons.find((lesson) => lesson.domain === domainName);

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-purple-100 via-pink-50 to-orange-50 p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-purple-700">
          HerLoop Learning Space
        </p>

        <h2 className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl">
          Learn something new, every day.
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
          Explore different subjects at your own pace. Choose a domain,
          study a lesson, try an activity, and test what you have learned.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
        <label
          htmlFor="learning-level"
          className="mb-2 block text-sm font-semibold text-gray-800"
        >
          Choose your learning stage
        </label>

        <select
          id="learning-level"
          value={selectedLevel}
          onChange={(event) => setSelectedLevel(event.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-purple-400 sm:max-w-md"
        >
          {levels.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>

        <p className="mt-2 text-xs leading-5 text-gray-500">
          Selected stage: {selectedLevel}. This currently personalizes your
          learning preference; the starter lessons are not a complete
          class-wise syllabus.
        </p>
      </div>

      <div>
        <label
          htmlFor="education-search"
          className="mb-2 block text-sm font-semibold text-gray-800"
        >
          Find a subject or topic
        </label>

        <input
          id="education-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Try coding, science, maths..."
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-purple-400"
        />
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-xl font-bold text-gray-900">
            Explore learning domains
          </h3>

          <span className="text-xs text-gray-500">
            {filteredDomains.length} domains
          </span>
        </div>

        <div className="mb-5 flex gap-2 overflow-x-auto pb-2">
          {["All", ...domains.map((domain) => domain.name)].map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setSelectedDomain(name)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                selectedDomain === name
                  ? "bg-purple-700 text-white"
                  : "border border-gray-200 bg-white text-gray-700 hover:bg-purple-50"
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        {filteredDomains.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center">
            <p className="font-semibold text-gray-800">
              No matching domains found
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Try a different search word.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filteredDomains.map((domain) => {
              const lesson = getLesson(domain.name);

              return (
                <article
                  key={domain.name}
                  className={`rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:shadow-md ${domain.color}`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-2xl shadow-sm"
                      aria-hidden="true"
                    >
                      {domain.icon}
                    </span>

                    <div className="min-w-0">
                      <h4 className="font-bold text-gray-900">
                        {domain.name}
                      </h4>
                      <p className="mt-1 text-sm leading-5 text-gray-600">
                        {domain.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-black/5 pt-4">
                    <p className="text-xs text-gray-600">
                      {lesson
                        ? `Starter lesson: ${lesson.title}`
                        : "More lessons coming soon"}
                    </p>

                    {lesson && (
                      <button
                        type="button"
                        onClick={() => {
                          if (onSelectLesson) {
                            onSelectLesson(lesson);
                          } else {
                            window.dispatchEvent(
                              new CustomEvent("herloop:open-lesson", {
                                detail: { lessonId: lesson.id },
                              })
                            );
                          }
                        }}
                        className="mt-3 w-full rounded-xl bg-purple-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-purple-800"
                      >
                        Start learning →
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
