"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Phone } from "lucide-react";
import { COLORS } from "@/lib/theme";
import type { AccountTier } from "@/lib/auth";

const SCHEMES = [
  {
    name: "Pradhan Mantri Matru Vandana Yojana",
    short: "PMMVY",
    category: "Maternity",
    catColor: COLORS.gold,
    dept: "Ministry of WCD",
    desc: "Cash incentive for pregnant and lactating women (first live birth). Compensates wage loss and promotes safe delivery.",
    url: "https://pmmvy.wcd.gov.in/",
    tiers: ["adult"] as AccountTier[],
  },
  {
    name: "Beti Bachao Beti Padhao",
    short: "BBBP",
    category: "Girl Child",
    catColor: COLORS.rose,
    dept: "Ministry of WCD",
    desc: "Addresses declining child sex ratio and promotes welfare and education of the girl child nationwide.",
    url: "https://wcd.nic.in/bbbp-schemes",
    tiers: ["under10", "teen", "adult"] as AccountTier[],
  },
  {
    name: "Sukanya Samriddhi Yojana",
    short: "SSY",
    category: "Girl Child",
    catColor: COLORS.rose,
    dept: "Ministry of Finance",
    desc: "High-interest government savings account for girls under 10. Tax-exempt returns fund education and marriage.",
    url: "https://www.india.gov.in/category/benefits-social-development/subcategory/women-children/details/sukanya-samriddhi-yojna",
    tiers: ["under10", "adult"] as AccountTier[],
  },
  {
    name: "Janani Suraksha Yojana",
    short: "JSY",
    category: "Safe Motherhood",
    catColor: COLORS.plumMid,
    dept: "Ministry of Health",
    desc: "Cash assistance for institutional delivery among low-income pregnant women to reduce maternal mortality.",
    url: "https://nhm.gov.in",
    tiers: ["adult"] as AccountTier[],
  },
  {
    name: "National Scholarship Portal",
    short: "NSP",
    category: "Education",
    catColor: COLORS.moss,
    dept: "Ministry of Education",
    desc: "Central hub for government scholarships across school, college, and professional education levels.",
    url: "https://scholarships.gov.in/",
    tiers: ["teen", "adult"] as AccountTier[],
  },
  {
    name: "Women Helpline",
    short: "181",
    category: "Safety",
    catColor: COLORS.rose,
    dept: "Ministry of WCD",
    desc: "24x7 emergency helpline for women facing violence or distress. Free, confidential, always available.",
    url: "tel:181",
    tiers: ["under10", "teen", "adult"] as AccountTier[],
  },
];

type Filter = "All" | "Maternity" | "Girl Child" | "Safe Motherhood" | "Education" | "Safety";
const ALL_FILTERS: Filter[] = ["All", "Maternity", "Girl Child", "Safe Motherhood", "Education", "Safety"];

const TIER_LABEL: Record<AccountTier, string> = {
  under10: "under 10",
  teen: "your age group",
  adult: "adults",
};

export default function SchemesPanel({ tier }: { tier?: AccountTier }) {
  // Guardians (no tier of their own) and any missing tier default to "adult"
  // visibility, since they're most likely browsing on behalf of themselves
  // or applying for a child.
  const effectiveTier: AccountTier = tier ?? "adult";
  const eligible = SCHEMES.filter((s) => s.tiers.includes(effectiveTier));
  const availableFilters = ALL_FILTERS.filter(
    (f) => f === "All" || eligible.some((s) => s.category === f)
  );

  const [filter, setFilter] = useState<Filter>("All");
  const visible = filter === "All" ? eligible : eligible.filter((s) => s.category === filter);

  return (
    <div className="pb-4">
      <div className="px-5 pt-4 pb-3">
        <h2 className="font-display text-lg" style={{ color: COLORS.plum }}>Government schemes</h2>
        <p className="text-xs font-body mt-0.5" style={{ color: `${COLORS.plum}77` }}>
          Showing schemes relevant to {TIER_LABEL[effectiveTier]}
        </p>
      </div>

      <div className="flex gap-2 px-5 pb-4 overflow-x-auto no-scrollbar">
        {availableFilters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="flex-shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold font-body transition-colors"
            style={{
              background: filter === f ? COLORS.plum : `${COLORS.plum}0A`,
              color: filter === f ? "#fff" : COLORS.plum,
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="px-5 flex flex-col gap-3">
        {visible.map((s, i) => (
          <motion.a
            key={s.name}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
            className="block p-4 rounded-2xl bg-white shadow-soft"
            style={{ border: `1px solid ${COLORS.mist}` }}
          >
            <div className="flex items-start justify-between mb-2">
              <span
                className="text-[10px] font-bold font-body px-2 py-1 rounded-full uppercase tracking-wide"
                style={{ background: `${s.catColor}20`, color: s.catColor }}
              >
                {s.category}
              </span>
              {s.short === "181" ? <Phone size={14} style={{ color: `${COLORS.plum}55` }} /> : <ExternalLink size={14} style={{ color: `${COLORS.plum}55` }} />}
            </div>
            <h3 className="font-semibold text-sm font-body mb-1" style={{ color: COLORS.plum }}>{s.name}</h3>
            <p className="text-xs font-body mb-2 leading-relaxed" style={{ color: `${COLORS.plum}77` }}>{s.desc}</p>
            <p className="text-[11px] font-body font-semibold" style={{ color: `${COLORS.plum}55` }}>{s.dept}</p>
          </motion.a>
        ))}

        {visible.length === 0 && (
          <p className="text-xs font-body text-center py-6" style={{ color: `${COLORS.plum}55` }}>
            No schemes in this category for your age group yet.
          </p>
        )}
      </div>

      <p className="text-[11px] font-body text-center mt-4 px-8" style={{ color: `${COLORS.plum}55` }}>
        Always confirm current eligibility on the official site — scheme rules change over time.
      </p>
    </div>
  );
}
