
"use client";

import { useEffect, useState } from "react";
import type { AccountTier } from "@/lib/auth";
import LearnPanel from "@/components/dashboard/LearnPanel";
import EducationHub from "@/components/dashboard/EducationHub";
import LessonPlayer from "@/components/dashboard/LessonPlayer";

type LearnAndGrowPanelProps = {
  uid: string;
  tier?: AccountTier;
};

export default function LearnAndGrowPanel({
  uid,
  tier,
}: LearnAndGrowPanelProps) {
  const [selectedModule, setSelectedModule] = useState("health");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const savedModule = localStorage.getItem(
        "herloop_selected_module"
      );

      setSelectedModule(savedModule || "health");
    } catch {
      setSelectedModule("health");
    }

    setReady(true);
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

  if (selectedModule === "health_education") {
    return (
      <div className="space-y-8">
        <EducationHub />
        <LessonPlayer />
      </div>
    );
  }

  return <LearnPanel uid={uid} tier={tier} />;
}
