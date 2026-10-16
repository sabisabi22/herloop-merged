
"use client";

import { useEffect, useState } from "react";
import type { AccountTier } from "@/lib/auth";

import LearnPanel from "@/components/dashboard/LearnPanel";
import EducationHub from "@/components/dashboard/EducationHub";
import LessonPlayer from "@/components/dashboard/LessonPlayer";

type ModuleChoice = "health" | "health_education";

type LearnAndGrowPanelProps = {
  uid: string;
  tier?: AccountTier;
};

export default function LearnAndGrowPanel({
  uid,
  tier,
}: LearnAndGrowPanelProps) {
  const [selectedModule, setSelectedModule] =
    useState<ModuleChoice>("health");

  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const savedModule = localStorage.getItem(
        "herloop_selected_module"
      );

      if (
        savedModule === "health" ||
        savedModule === "health_education"
      ) {
        setSelectedModule(savedModule);
      } else {
        setSelectedModule("health");
      }
    } catch {
      setSelectedModule("health");
    } finally {
      setReady(true);
    }
  }, []);

  if (!ready) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <p className="text-sm text-gray-600">
          Loading your learning space...
        </p>
      </div>
    );
  }

  // HEALTH + EDUCATION:
  // Show all existing health learning content
  // plus the complete education learning space.
  if (selectedModule === "health_education") {
    return (
      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-xl font-bold">
            Health & Wellbeing
          </h2>

          <LearnPanel
            uid={uid}
            tier={tier}
            mode="health"
          />
        </section>

        <section>
          <h2 className="mb-4 text-xl font-bold">
            Education & Skills
          </h2>

          <EducationHub />

          <div className="mt-6">
            <LessonPlayer />
          </div>
        </section>
      </div>
    );
  }

  // HEALTH ONLY:
  // Do not render EducationHub or LessonPlayer.
  return (
    <LearnPanel
      uid={uid}
      tier={tier}
      mode="health"
    />
  );
}
