"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getUserProfile } from "@/lib/auth";
import { app } from "@/lib/firebaseConfig";
import { COLORS } from "@/lib/theme";
import BottomNav, { TabKey } from "@/components/dashboard/BottomNav";
import TrackerPanel from "@/components/dashboard/TrackerPanel";
import SchemesPanel from "@/components/dashboard/SchemesPanel";
import LearnPanel from "@/components/dashboard/LearnPanel";
import ManagePanel from "@/components/dashboard/ManagePanel";
import ProfilePanel from "@/components/dashboard/ProfilePanel";

const auth = getAuth(app);
const INFO_FIELDS = [
  "age",
  "periodStartDate",
  "menarcheAge",
  "emergencyContactName",
  "emergencyContactPhone",
  "bloodGroup",
  "knownAllergies",
];
const DOC_KEYS = ["photo", "idProof", "addressProof", "medicalCertificate"];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("tracker");
  const [loading, setLoading] = useState(true);
useEffect(() => {
  const unsub = onAuthStateChanged(auth, async (user) => {
    if (!user) {
      setLoading(false);
      return;
    }

    // No email verification required
    setUid(user.uid);

    const p = await getUserProfile(user.uid);
    setProfile(p);

    setLoading(false);
  });

  return () => unsub();
}, []);

  async function refreshProfile() {
    if (!uid) return;
    const p = await getUserProfile(uid);
    setProfile(p);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-body text-sm" style={{ color: `${COLORS.plum}88` }}>
        Loading your dashboard...
      </div>
    );
  }

  if (!profile || !uid) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-sm p-8 rounded-3xl bg-white shadow-soft text-center">
          <p className="font-body text-sm mb-4" style={{ color: `${COLORS.plum}99` }}>You need to be signed in to view this page.</p>
          <a href="/login" className="font-semibold text-sm" style={{ color: COLORS.rose }}>Go to login</a>
        </div>
      </div>
    );
  }

  const isGuardian = profile.role === "guardian";
  const filledInfo = INFO_FIELDS.filter((f) => profile[f] !== undefined && profile[f] !== "").length;
  const filledDocs = DOC_KEYS.filter((k) => profile.documents?.[k]).length;
  const totalFields = INFO_FIELDS.length + DOC_KEYS.length + 1; // +1 for name, set at 
  
  const completionPct = Math.round(((filledInfo + filledDocs + 1) / totalFields) * 100);
  const firstName = profile.name?.split(" ")[0] ?? "there";

  return (
    <div className="min-h-screen flex flex-col" style={{ background: COLORS.cream }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex-shrink-0 bg-white" style={{ boxShadow: `0 1px 0 ${COLORS.plum}08` }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider font-body" style={{ color: `${COLORS.plum}48` }}>
              {isGuardian ? "Guardian dashboard" : greeting()}
            </p>
            <h1 className="text-xl font-display" style={{ color: COLORS.plum }}>
              {isGuardian ? "Family overview" : firstName}
            </h1>
          </div>
          <button
            onClick={() => setActiveTab("profile")}
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm font-display"
            style={{ background: `${COLORS.rose}1C`, color: COLORS.rose }}
          >
            {firstName[0]?.toUpperCase() ?? "?"}
          </button>
        </div>

        {/* Slim completion bar — tap to open the full Profile tab */}
        <button onClick={() => setActiveTab("profile")} className="w-full text-left">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold font-body" style={{ color: `${COLORS.plum}88` }}>Basic info</span>
            <span className="text-xs font-bold font-body" style={{ color: COLORS.plum }}>{completionPct}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: `${COLORS.plum}0E` }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${COLORS.rose} 0%, ${COLORS.gold} 100%)` }}
              initial={{ width: 0 }}
              animate={{ width: `${completionPct}%` }}
              transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
            />
          </div>
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto no-scrollbar" style={{ paddingBottom: 110 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
          >
            {activeTab === "tracker" && <TrackerPanel uid={uid} />}
            {activeTab === "schemes" && <SchemesPanel tier={profile.tier} />}
            {activeTab === "learn" && <LearnPanel />}
            {activeTab === "profile" && <ProfilePanel uid={uid} profile={profile} onSaved={refreshProfile} />}
            {activeTab === "manage" && isGuardian && <ManagePanel uid={uid} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <BottomNav active={activeTab} onChange={setActiveTab} showManage={isGuardian} />
    </div>
  );
}
