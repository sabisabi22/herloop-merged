"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserCheck, Users } from "lucide-react";
import { COLORS } from "@/lib/theme";
import { getAuth } from "firebase/auth";
import { app } from "@/lib/firebaseConfig";
import { approveTeenRequest, getPendingRequestsForGuardian } from "@/lib/auth";

const auth = getAuth(app);

export default function ManagePanel({ uid }: { uid: string }) {
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const email = auth.currentUser?.email;
    if (!email) { setLoading(false); return; }
    getPendingRequestsForGuardian(email).then((r) => { setPending(r); setLoading(false); });
  }, []);

  async function approve(childId: string) {
    await approveTeenRequest(childId, uid);
    setPending((prev) => prev.filter((p) => p.id !== childId));
  }

  return (
    <div className="pb-4">
      <div className="px-5 pt-4 pb-3">
        <h2 className="font-display text-lg" style={{ color: COLORS.plum }}>Manage family</h2>
        <p className="text-xs font-body mt-0.5" style={{ color: `${COLORS.plum}77` }}>
          Approve teen account requests and oversee linked profiles
        </p>
      </div>

      <div className="px-5">
        <div className="p-5 rounded-2xl bg-white shadow-soft" style={{ border: `1px solid ${COLORS.mist}` }}>
          <div className="flex items-center gap-2 mb-4">
            <Users size={16} style={{ color: COLORS.plumMid }} />
            <h3 className="font-semibold text-sm font-body" style={{ color: COLORS.plum }}>Pending approvals</h3>
          </div>

          {loading && <p className="text-xs font-body" style={{ color: `${COLORS.plum}77` }}>Loading requests...</p>}

          {!loading && pending.length === 0 && (
            <p className="text-xs font-body" style={{ color: `${COLORS.plum}77` }}>
              No pending requests right now.
            </p>
          )}

          <AnimatePresence>
            {pending.map((req) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center justify-between py-3"
                style={{ borderBottom: `1px solid ${COLORS.mist}` }}
              >
                <span className="text-sm font-body" style={{ color: COLORS.plum }}>Teen account request</span>
                <button
                  onClick={() => approve(req.id)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold font-body"
                  style={{ background: COLORS.moss, color: "#fff" }}
                >
                  <UserCheck size={13} /> Approve
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
