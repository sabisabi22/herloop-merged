"use client";
import { motion } from "framer-motion";
import PhaseRing from "@/components/PhaseRing";
import { COLORS } from "@/lib/theme";

export default function WaitingApproval() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16" style={{ background: COLORS.cream }}>
      <motion.div
        className="w-full max-w-sm p-8 rounded-3xl bg-white shadow-soft text-center"
        style={{ border: `1px solid ${COLORS.mist}` }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <div className="flex justify-center mb-5">
          <motion.div
            animate={{ rotate: [0, 8, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <PhaseRing size={80} />
          </motion.div>
        </div>
        <p className="eyebrow mb-2">Almost there</p>
        <h1 className="text-xl mb-3 font-display" style={{ color: COLORS.plum }}>Waiting for approval</h1>
        <p className="text-sm leading-relaxed font-body" style={{ color: COLORS.plumSoft }}>
          We've sent a request to your parent or guardian. Once they approve it from their dashboard, log in again and you'll have full access.
        </p>
      </motion.div>
    </div>
  );
}
