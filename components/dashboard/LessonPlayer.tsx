
"use client";

import { useEffect, useState } from "react";
import {
  educationLessons,
  type EducationLesson,
} from "@/lib/educationLessons";

const STORAGE_KEY = "herloop_education_completed_v1";

function getCompletedLessons(): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = saved ? JSON.parse(saved) : [];

    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export default function LessonPlayer() {
  const [selectedLesson, setSelectedLesson] =
    useState<EducationLesson | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [activityDone, setActivityDone] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCompletedLessons(getCompletedLessons());
    setReady(true);

    const handleOpenLesson = (event: Event) => {
      const customEvent = event as CustomEvent<{ lessonId?: string }>;
      const lesson = educationLessons.find(
        (item) => item.id === customEvent.detail?.lessonId
      );

      if (lesson) openLesson(lesson);
    };

    window.addEventListener("herloop:open-lesson", handleOpenLesson);

    return () => {
      window.removeEventListener("herloop:open-lesson", handleOpenLesson);
    };
  }, []);

  function openLesson(lesson: EducationLesson) {
    setSelectedLesson(lesson);
    setSelectedAnswer(null);
    setShowResult(false);
    setActivityDone(false);
  }

  function markCompleted() {
    if (!selectedLesson) return;

    const updated = Array.from(
      new Set([...completedLessons, selectedLesson.id])
    );

    setCompletedLessons(updated);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // The lesson remains usable if browser storage is unavailable.
    }
  }

  if (!ready) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-5">
        Loading lessons...
      </section>
    );
  }

  const progress = Math.round(
    (completedLessons.length / educationLessons.length) * 100
  );

  return (
    <section id="lesson-player" className="space-y-5">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-purple-700">
              Your learning progress
            </p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">
              Keep growing 🌱
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              {completedLessons.length} of {educationLessons.length} starter
              lessons completed
            </p>
          </div>

          <span className="rounded-xl bg-purple-50 px-4 py-2 text-lg font-bold text-purple-800">
            {progress}%
          </span>
        </div>

        <div
          className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100"
          role="progressbar"
          aria-label="Learning progress"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-purple-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-3 text-xs text-gray-500">
          Progress is saved in this browser on this device. It is not yet
          synced to your HerLoop account.
        </p>
      </div>

      {!selectedLesson ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
          <h3 className="text-xl font-bold text-gray-900">
            Choose a lesson
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Open one lesson at a time and learn at your own pace.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {educationLessons.map((lesson) => {
              const isComplete = completedLessons.includes(lesson.id);

              return (
                <button
                  type="button"
                  key={lesson.id}
                  onClick={() => openLesson(lesson)}
                  className="rounded-xl border border-gray-200 p-4 text-left transition hover:border-purple-300 hover:bg-purple-50"
                >
                  <span className="text-xs font-medium text-purple-700">
                    {lesson.domain}
                  </span>
                  <span className="mt-1 block font-semibold text-gray-900">
                    {lesson.title}
                  </span>
                  <span className="mt-2 block text-xs text-gray-500">
                    {lesson.duration} · {lesson.level}
                  </span>
                  {isComplete && (
                    <span className="mt-2 inline-block text-xs font-semibold text-green-700">
                      ✓ Completed
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="bg-gradient-to-r from-purple-100 to-pink-50 p-5 sm:p-7">
            <button
              type="button"
              onClick={() => setSelectedLesson(null)}
              className="text-sm font-semibold text-purple-800 hover:underline"
            >
              ← All lessons
            </button>

            <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-purple-700">
              {selectedLesson.domain}
            </p>

            <h2 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
              {selectedLesson.title}
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              {selectedLesson.level} · {selectedLesson.duration}
            </p>
          </div>

          <div className="space-y-7 p-5 sm:p-7">
            <section>
              <h3 className="text-lg font-bold text-gray-900">
                Let&apos;s understand
              </h3>
              <p className="mt-2 whitespace-pre-line text-sm leading-7 text-gray-700">
                {selectedLesson.introduction}
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-900">
                Key things to remember
              </h3>
              <ul className="mt-3 space-y-2">
                {selectedLesson.keyPoints.map((point) => (
                  <li
                    key={point}
                    className="flex gap-3 text-sm leading-6 text-gray-700"
                  >
                    <span className="font-bold text-purple-700">✓</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-xl bg-purple-50 p-4">
              <h3 className="font-bold text-gray-900">Example</h3>
              <pre className="mt-2 whitespace-pre-wrap break-words font-sans text-sm leading-6 text-gray-700">
                {selectedLesson.example}
              </pre>
            </section>

            <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="font-bold text-gray-900">Try it yourself ✍️</h3>
              <p className="mt-2 text-sm leading-6 text-gray-700">
                {selectedLesson.activity}
              </p>
              <label className="mt-4 flex items-start gap-3 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={activityDone}
                  onChange={(event) => setActivityDone(event.target.checked)}
                  className="mt-1 h-4 w-4 accent-purple-700"
                />
                I have tried this activity
              </label>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-900">
                Quick knowledge check
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-700">
                {selectedLesson.question}
              </p>

              <div className="mt-4 space-y-2">
                {selectedLesson.options.map((option, index) => {
                  const isCorrect = index === selectedLesson.answer;
                  const isSelected = selectedAnswer === index;

                  let optionStyle =
                    "border-gray-200 hover:border-purple-300";

                  if (showResult && isCorrect) {
                    optionStyle = "border-green-500 bg-green-50";
                  } else if (showResult && isSelected && !isCorrect) {
                    optionStyle = "border-red-400 bg-red-50";
                  } else if (isSelected) {
                    optionStyle = "border-purple-500 bg-purple-50";
                  }

                  return (
                    <button
                      type="button"
                      key={option}
                      onClick={() => {
                        setSelectedAnswer(index);
                        setShowResult(false);
                      }}
                      className={`w-full rounded-xl border p-3 text-left text-sm text-gray-800 transition ${optionStyle}`}
                    >
                      <span className="mr-2 font-semibold">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      {option}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                disabled={selectedAnswer === null}
                onClick={() => setShowResult(true)}
                className="mt-4 rounded-xl bg-purple-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Check answer
              </button>

              {showResult && selectedAnswer !== null && (
                <div
                  className={`mt-4 rounded-xl p-4 ${
                    selectedAnswer === selectedLesson.answer
                      ? "bg-green-50 text-green-900"
                      : "bg-orange-50 text-orange-900"
                  }`}
                  aria-live="polite"
                >
                  <p className="font-bold">
                    {selectedAnswer === selectedLesson.answer
                      ? "Correct! 🎉"
                      : "Not quite — try again!"}
                  </p>
                  <p className="mt-2 text-sm leading-6">
                    {selectedLesson.explanation}
                  </p>
                </div>
              )}
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-900">
                Explore more
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                These are external resources. Their content and availability
                are managed by their respective providers.
              </p>

              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                  selectedLesson.youtubeSearch
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-gray-200 p-4 text-sm font-semibold text-gray-800 hover:bg-gray-50"
              >
                <span>▶ Find related YouTube videos</span>
                <span aria-hidden="true">↗</span>
              </a>

              <div className="mt-3 space-y-2">
                {selectedLesson.resources.map((resource) => (
                  <a
                    key={resource.url}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 p-4 text-sm text-purple-800 hover:bg-purple-50"
                  >
                    <span>{resource.label}</span>
                    <span aria-hidden="true">↗</span>
                  </a>
                ))}
              </div>
            </section>

            <button
              type="button"
              disabled={
                completedLessons.includes(selectedLesson.id) ||
                !activityDone ||
                selectedAnswer !== selectedLesson.answer ||
                !showResult
              }
              onClick={markCompleted}
              className="w-full rounded-xl bg-purple-700 px-5 py-4 text-sm font-bold text-white transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {completedLessons.includes(selectedLesson.id)
                ? "✓ Lesson completed"
                : "Complete lesson"}
            </button>

            {!activityDone && (
              <p className="text-center text-xs text-gray-500">
                Try the activity and answer the quiz correctly to complete
                this lesson.
              </p>
            )}
          </div>
        </article>
      )}
    </section>
  );
}
