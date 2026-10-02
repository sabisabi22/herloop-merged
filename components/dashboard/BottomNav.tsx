"use client";
import { motion } from "framer-motion";
import { Calendar, Shield, BookOpen, Users, UserCircle2, type LucideIcon } from "lucide-react";
import { COLORS } from "@/lib/theme";

export type TabKey = "tracker" | "schemes" | "learn" | "profile" | "manage";

const ALL_TABS: { key: TabKey; label: string; Icon: LucideIcon; color: string }[] = [
  { key: "tracker", label: "Tracker", Icon: Calendar, color: COLORS.rose },
  { key: "schemes", label: "Schemes", Icon: Shield, color: COLORS.moss },
  { key: "learn", label: "Learn", Icon: BookOpen, color: COLORS.gold },
  { key: "profile", label: "Profile", Icon: UserCircle2, color: COLORS.plumSoft },
  { key: "manage", label: "Manage", Icon: Users, color: COLORS.plumMid },
];

export default function BottomNav({
  active,
  onChange,
  showManage,
}: {
  active: TabKey;
  onChange: (t: TabKey) => void;
  showManage: boolean;
}) {
  const tabs = showManage ? ALL_TABS : ALL_TABS.filter((t) => t.key !== "manage");

  return (
    <nav
      className="fixed bottom-5 left-1/2 -translate-x-1/2 flex gap-1 p-1.5 rounded-full shadow-nav z-20"
      style={{ background: COLORS.plum }}
    >
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className="relative flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold font-body"
            style={{ color: isActive ? COLORS.plum : COLORS.cream }}
          >
            {isActive && (
              <motion.div
                layoutId="active-tab-pill"
                className="absolute inset-0 rounded-full -z-10"
                style={{ background: COLORS.gold }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <tab.Icon size={15} />
            <span className="hidden xs:inline">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
