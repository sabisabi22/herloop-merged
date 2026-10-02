"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import PhaseRing from "@/components/PhaseRing";
import { COLORS, PHASES } from "@/lib/theme";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16" style={{ background: COLORS.cream }}>
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <p className="eyebrow text-center mb-6">herLoop — a lifecycle companion</p>

        <div className="flex justify-center mb-2">
          <PhaseRing size={220} />
        </div>

        <div className="flex justify-center gap-x-4 gap-y-2 flex-wrap mb-10 mt-2">
          {PHASES.map((p, i) => (
            <motion.div
              key={p.name}
              className="flex items-center gap-1.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.06 }}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
              <span className="text-xs font-body" style={{ color: COLORS.plumSoft }}>{p.name}</span>
            </motion.div>
          ))}
        </div>

        <div className="p-8 rounded-3xl bg-white shadow-soft text-center" style={{ border: `1px solid ${COLORS.mist}` }}>
          <h1 className="text-2xl leading-snug mb-3 font-display" style={{ color: COLORS.plum }}>
            Track your cycle, know your stage,<br />find what you're owed.
          </h1>
          <p className="text-sm leading-relaxed mb-7 font-body" style={{ color: COLORS.plumSoft }}>
            Cycle tracking, age-appropriate health guidance, and a direct line to government schemes and scholarships — one account per family, one profile per stage.
          </p>
          <Link href="/signup">
            <motion.button
              whileTap={{ scale: 0.97 }}
              whileHover={{ background: COLORS.rose }}
              className="w-full py-3.5 rounded-2xl font-semibold text-sm font-body mb-3 transition-colors"
              style={{ background: COLORS.plum, color: COLORS.cream }}
            >
              Get started
            </motion.button>
          </Link>
          <Link href="/login" className="text-sm font-semibold font-body" style={{ color: COLORS.rose }}>
            I already have an account
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
