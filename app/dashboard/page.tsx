"use client";



import { useEffect, useState } from "react";

import { motion, AnimatePresence } from "framer-motion";

import {

  getAuth,

  onAuthStateChanged,

} from "firebase/auth";

import {

  Heart,

  HeartPulse,

  BookOpen,

  GraduationCap,

  Sparkles,

  Landmark,

  ArrowUpRight,

  Flower2,

  UserRound,

  ShieldCheck,

} from "lucide-react";



import {

  getUserProfile,

  syncUserLifecycle,

} from "@/lib/auth";



import {

  calculateAge,

  getCurrentTier,

} from "@/lib/age";



import { app } from "@/lib/firebaseConfig";

import { COLORS } from "@/lib/theme";



import BottomNav, {

  TabKey,

} from "@/components/dashboard/BottomNav";



import TrackerPanel from "@/components/dashboard/TrackerPanel";

import SchemesPanel from "@/components/dashboard/SchemesPanel";

import EducationHub from "@/components/dashboard/EducationHub";
import LearnPanel from "@/components/dashboard/LearnPanel";

import ManagePanel from "@/components/dashboard/ManagePanel";

import ProfilePanel from "@/components/dashboard/ProfilePanel";

import HerLoopChat from "@/components/dashboard/HerLoopChat";



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



const DOC_KEYS = [

  "photo",

  "idProof",

  "addressProof",

  "medicalCertificate",

];



function greeting() {

  const hour = new Date().getHours();



  if (hour < 12) return "Good morning";

  if (hour < 17) return "Good afternoon";



  return "Good evening";

}



const dashboardCards = [

  {

    title: "My Health",

    description: "Understand your body and track your wellbeing.",

    tab: "tracker" as TabKey,

    Icon: HeartPulse,

    background: "#FBE7ED",

    accent: "#BE6480",

    label: "YOUR WELLBEING",

  },

  {

    title: "Learn & Grow",

    description: "Discover helpful resources for every life stage.",

    tab: "learn" as TabKey,

    Icon: BookOpen,

    background: "#EAE9FA",

    accent: "#7772B5",

    label: "KNOWLEDGE CORNER",

  },

  {

    title: "Schemes",

    description: "Explore support and opportunities for you.",

    tab: "schemes" as TabKey,

    Icon: Landmark,

    background: "#E5F1E5",

    accent: "#608668",

    label: "YOUR OPPORTUNITIES",

  },

  {

    title: "HerLoop AI",

    description: "Ask questions and explore trusted guidance.",

    tab: "tracker" as TabKey,

    Icon: Sparkles,

    background: "#F9ECD6",

    accent: "#AE8435",

    label: "YOUR AI COMPANION",

    isChat: true,

  },

];



export default function Dashboard() {

  const [uid, setUid] = useState<string | null>(null);

  const [profile, setProfile] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<TabKey>("tracker");

  const [showHome, setShowHome] = useState(true);

  const [loading, setLoading] = useState(true);

  const [chatOpen, setChatOpen] = useState(false);
  const [healthOpen, setHealthOpen] = useState(false);



  useEffect(() => {

    const unsubscribe = onAuthStateChanged(

      auth,

      async (user) => {

        if (!user) {

          setLoading(false);

          return;

        }



        try {

          setUid(user.uid);



          const initialProfile = await getUserProfile(user.uid);



          if (initialProfile?.dateOfBirth) {

            await syncUserLifecycle(

              user.uid,

              initialProfile.dateOfBirth

            );

          }



          const updatedProfile = await getUserProfile(user.uid);

          setProfile(updatedProfile);

        } catch (error) {

          console.error("Could not load dashboard profile:", error);

        } finally {

          setLoading(false);

        }

      }

    );



    return () => unsubscribe();

  }, []);



  async function refreshProfile() {

    if (!uid) return;



    const updatedProfile = await getUserProfile(uid);

    setProfile(updatedProfile);

  }



  function openTab(tab: TabKey) {
    setActiveTab(tab);
    setHealthOpen(false);
    setShowHome(false);
  }



  if (loading) {

    return (

      <div

        className="flex min-h-screen items-center justify-center"

        style={{

          background: COLORS.cream,

          color: COLORS.plum,

        }}

      >

        <div className="text-center">

          <motion.div

            animate={{ scale: [1, 1.12, 1], rotate: [0, 8, -8, 0] }}

            transition={{ duration: 1.5, repeat: Infinity }}

            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"

            style={{ background: `${COLORS.rose}20` }}

          >

            <Heart size={28} style={{ color: COLORS.rose }} />

          </motion.div>



          <p className="text-base font-semibold">

            Preparing your space...

          </p>

          <p className="mt-1 text-sm opacity-70">

            A little moment just for you 🌷

          </p>

        </div>

      </div>

    );

  }



  if (!profile || !uid) {

    return (

      <div

        className="flex min-h-screen items-center justify-center px-6"

        style={{ background: COLORS.cream }}

      >

        <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-sm">

          <Heart size={36} className="mx-auto mb-4" style={{ color: COLORS.rose }} />



          <p className="mb-4 text-base" style={{ color: COLORS.plum }}>

            You need to be signed in to view this page.

          </p>



          <a

            href="/login"

            className="font-semibold"

            style={{ color: COLORS.rose }}

          >

            Go to login

          </a>

        </div>

      </div>

    );

  }



  const isGuardian = profile.role === "guardian";



  const currentAge = profile.dateOfBirth

    ? calculateAge(profile.dateOfBirth)

    : profile.age ?? 18;



  const currentTier = getCurrentTier(currentAge);



  const filledInfo = INFO_FIELDS.filter(

    (field) =>

      profile[field] !== undefined &&

      profile[field] !== ""

  ).length;



  const filledDocs = DOC_KEYS.filter(

    (key) => profile.documents?.[key]

  ).length;



  const totalFields = INFO_FIELDS.length + DOC_KEYS.length + 1;



  const completionPct = Math.round(

    ((filledInfo + filledDocs + 1) / totalFields) * 100

  );



  const firstName = profile.name?.trim().split(/\s+/)[0] || "there";



  const stageMessage =

    currentTier === "under10"

      ? "Little steps can lead to wonderful discoveries."

      : currentTier === "teen"

        ? "Your journey is unique. Give yourself room to grow."

        : "You deserve care, confidence, and time for yourself.";



  return (

    <div

      className="flex min-h-screen flex-col"

      style={{ background: COLORS.cream }}

    >

      <AnimatePresence mode="wait">

        {showHome ? (

          <motion.main

            key="home"

            initial={{ opacity: 0 }}

            animate={{ opacity: 1 }}

            exit={{ opacity: 0, x: -12 }}

            transition={{ duration: 0.25 }}

            className="flex-1 overflow-y-auto no-scrollbar"

            style={{ paddingBottom: 110 }}

          >

            {/* Welcome header */}

            <motion.section

              initial={{ opacity: 0, y: 18 }}

              animate={{ opacity: 1, y: 0 }}

              transition={{ duration: 0.5 }}

              className="relative overflow-hidden px-5 pb-6 pt-10"

              style={{

                background: `linear-gradient(145deg, #FFF9F5 0%, ${COLORS.cream} 70%, ${COLORS.rose}12 100%)`,

              }}

            >

              <div

                className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full"

                style={{ background: `${COLORS.rose}10` }}

              />



              <div

                className="pointer-events-none absolute right-16 top-24 h-12 w-12 rounded-full"

                style={{ background: `${COLORS.gold}18` }}

              />



              <div className="relative flex items-start justify-between gap-3">

                <div className="flex-1">

                  <div

                    className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold tracking-wide"

                    style={{

                      color: COLORS.rose,

                      background: `${COLORS.rose}12`,

                    }}

                  >

                    <Sparkles size={14} />

                    YOUR PERSONAL SPACE

                  </div>



                  <h1

                    className="font-display text-3xl font-bold leading-tight sm:text-4xl"

                    style={{ color: COLORS.plum }}

                  >

                    {greeting()},

                    <br />

                    {isGuardian ? "Family" : firstName}!

                  </h1>



                  <p

                    className="mt-3 max-w-xs text-base leading-7"

                    style={{ color: `${COLORS.plum}B0` }}

                  >

                    Take a breath. This space is yours. 💗

                  </p>

                </div>



                <motion.button

                  type="button"

                  whileHover={{ scale: 1.06 }}

                  whileTap={{ scale: 0.92 }}

                  onClick={() => openTab("profile")}

                  aria-label="Open profile"

                  className="relative mt-2 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl shadow-sm"

                  style={{

                    background: `linear-gradient(145deg, ${COLORS.rose}25, ${COLORS.plum}15)`,

                    color: COLORS.rose,

                    border: `1px solid ${COLORS.rose}20`,

                  }}

                >

                  <span className="text-xl font-bold">

                    {firstName[0]?.toUpperCase() ?? "?"}

                  </span>

                  <span

                    className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full"

                    style={{

                      background: "#FFFFFF",

                      color: COLORS.rose,

                    }}

                  >

                    <Heart size={12} fill={COLORS.rose} />

                  </span>

                </motion.button>

              </div>

            </motion.section>



            <div className="space-y-7 px-5 pb-5">

              {/* Journey progress card */}

              <motion.button

                type="button"

                onClick={() => openTab("profile")}

                initial={{ opacity: 0, y: 22 }}

                animate={{ opacity: 1, y: 0 }}

                transition={{ delay: 0.1, duration: 0.45 }}

                whileHover={{ y: -2 }}

                whileTap={{ scale: 0.985 }}

                className="w-full overflow-hidden rounded-3xl p-5 text-left shadow-sm"

                style={{

                  background: `linear-gradient(135deg, ${COLORS.plum} 0%, #79516F 100%)`,

                  color: "#FFFFFF",

                }}

              >

                <div className="flex items-start justify-between gap-3">

                  <div>

                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-white/70">

                      YOUR JOURNEY

                    </p>

                    <h2 className="mt-2 text-xl font-bold">

                      Growing every day 🌷

                    </h2>

                  </div>



                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">

                    <Flower2 size={24} />

                  </div>

                </div>



                <div className="mt-5 flex items-center justify-between gap-3">

                  <p className="text-sm text-white/80">

                    Your profile progress

                  </p>

                  <p className="text-lg font-bold">

                    {completionPct}%

                  </p>

                </div>



                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/20">

                  <motion.div

                    initial={{ width: 0 }}

                    animate={{ width: `${completionPct}%` }}

                    transition={{

                      duration: 1,

                      delay: 0.25,

                      ease: "easeOut",

                    }}

                    className="h-full rounded-full"

                    style={{

                      background: `linear-gradient(90deg, #F5C6D5, ${COLORS.gold})`,

                    }}

                  />

                </div>



                <p className="mt-3 text-xs leading-5 text-white/75">

                  {completionPct >= 100

                    ? "Your profile is complete. Keep taking care of yourself."

                    : "A gentle reminder: progress doesn't need to be perfect. Tap to complete your profile."}

                </p>

              </motion.button>



              {/* Feature cards */}

              <section>

                <motion.div

                  initial={{ opacity: 0, y: 12 }}

                  animate={{ opacity: 1, y: 0 }}

                  transition={{ delay: 0.16 }}

                  className="mb-4"

                >

                  <p

                    className="text-xs font-bold uppercase tracking-[0.16em]"

                    style={{ color: `${COLORS.rose}CC` }}

                  >

                    MADE FOR YOU ✨

                  </p>

                  <h2

                    className="mt-1 font-display text-2xl font-bold"

                    style={{ color: COLORS.plum }}

                  >

                    Explore your space

                  </h2>

                  <p

                    className="mt-1 text-sm leading-6"

                    style={{ color: `${COLORS.plum}99` }}

                  >

                    Little things to help you feel informed and supported.

                  </p>

                </motion.div>



                <div className="grid grid-cols-2 gap-3">

                  {dashboardCards.map((card, index) => (

                    <motion.button

                      key={card.title}

                      type="button"

                      onClick={() => {
                        if ("isChat" in card && card.isChat) {
                          setChatOpen(true);
                        } else if (card.title === "My Health") {
                          setActiveTab("tracker");
                          setHealthOpen(true);
                          setShowHome(false);
                        } else {
                          openTab(card.tab);
                        }
                      }}

                      initial={{ opacity: 0, y: 18 }}

                      animate={{ opacity: 1, y: 0 }}

                      transition={{

                        delay: 0.2 + index * 0.08,

                        duration: 0.4,

                      }}

                      whileHover={{

                        y: -4,

                        boxShadow: `0 12px 25px ${card.accent}20`,

                      }}

                      whileTap={{ scale: 0.97 }}

                      className="relative flex min-h-[190px] flex-col overflow-hidden rounded-3xl p-4 text-left shadow-sm"

                      style={{

                        background: card.background,

                        border: `1px solid ${card.accent}18`,

                      }}

                    >

                      <div className="mb-4 flex w-full items-center justify-between">

                        <div

                          className="flex h-12 w-12 items-center justify-center rounded-2xl"

                          style={{

                            background: "#FFFFFFB8",

                            color: card.accent,

                          }}

                        >

                          <card.Icon size={25} strokeWidth={1.9} />

                        </div>



                        <div

                          className="flex h-8 w-8 items-center justify-center rounded-full"

                          style={{

                            background: "#FFFFFF90",

                            color: card.accent,

                          }}

                        >

                          <ArrowUpRight size={17} />

                        </div>

                      </div>



                      <p

                        className="text-[9px] font-bold tracking-[0.12em]"

                        style={{ color: card.accent }}

                      >

                        {card.label}

                      </p>



                      <h3

                        className="mt-1 text-lg font-bold leading-6"

                        style={{ color: COLORS.plum }}

                      >

                        {card.title}

                      </h3>



                      <p

                        className="mt-2 text-xs leading-5"

                        style={{ color: `${COLORS.plum}B0` }}

                      >

                        {card.description}

                      </p>



                      <div

                        className="pointer-events-none absolute -bottom-7 -right-5 h-20 w-20 rounded-full"

                        style={{ background: `${card.accent}0C` }}

                      />

                    </motion.button>

                  ))}

                </div>

              </section>



              {/* Encouraging note */}

              <motion.section

                initial={{ opacity: 0, y: 18 }}

                animate={{ opacity: 1, y: 0 }}

                transition={{ delay: 0.5, duration: 0.45 }}

                className="relative overflow-hidden rounded-3xl p-5"

                style={{

                  background: `linear-gradient(135deg, ${COLORS.rose}18, ${COLORS.gold}12, #FFFFFF)`,

                  border: `1px solid ${COLORS.rose}20`,

                }}

              >

                <div className="flex items-start gap-3">

                  <div

                    className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl"

                    style={{

                      background: "#FFFFFFB8",

                      color: COLORS.rose,

                    }}

                  >

                    <Heart size={22} />

                  </div>



                  <div>

                    <p

                      className="text-xs font-bold uppercase tracking-[0.12em]"

                      style={{ color: COLORS.rose }}

                    >

                      A LITTLE NOTE FOR YOU

                    </p>



                    <p

                      className="mt-2 text-base font-semibold leading-7"

                      style={{ color: COLORS.plum }}

                    >

                      You deserve care, knowledge, and the confidence to grow at your own pace.

                    </p>



                    <p

                      className="mt-2 text-sm"

                      style={{ color: `${COLORS.plum}99` }}

                    >

                      {stageMessage}

                    </p>

                  </div>

                </div>

              </motion.section>



              {/* Quick profile link */}

              <motion.button

                type="button"

                onClick={() => openTab("profile")}

                whileTap={{ scale: 0.98 }}

                className="flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-sm"

                style={{ border: `1px solid ${COLORS.plum}0D` }}

              >

                <div

                  className="flex h-10 w-10 items-center justify-center rounded-xl"

                  style={{

                    background: `${COLORS.rose}14`,

                    color: COLORS.rose,

                  }}

                >

                  {isGuardian ? (

                    <ShieldCheck size={21} />

                  ) : (

                    <UserRound size={21} />

                  )}

                </div>



                <div className="flex-1">

                  <p

                    className="text-sm font-bold"

                    style={{ color: COLORS.plum }}

                  >

                    Your personal details

                  </p>

                  <p

                    className="mt-1 text-xs"

                    style={{ color: `${COLORS.plum}88` }}

                  >

                    Review and update your profile.

                  </p>

                </div>



                <ArrowUpRight size={19} style={{ color: COLORS.rose }} />

              </motion.button>

            </div>

          </motion.main>

        ) : (

          <motion.main

            key={`tab-${activeTab}`}

            initial={{ opacity: 0, x: 12 }}

            animate={{ opacity: 1, x: 0 }}

            exit={{ opacity: 0, x: -12 }}

            transition={{ duration: 0.22 }}

            className="flex-1 overflow-y-auto no-scrollbar"

            style={{ paddingBottom: 110 }}

          >

            <div className="px-5 pt-4">

              <button

                type="button"

                onClick={() => setShowHome(true)}

                className="mb-2 rounded-full px-3 py-2 text-sm font-semibold transition hover:opacity-80"

                style={{

                  background: `${COLORS.rose}12`,

                  color: COLORS.rose,

                }}

              >

                ← Back to home

              </button>

            </div>



            {activeTab === "tracker" && healthOpen && (
              <LearnPanel uid={uid} tier={currentTier} mode="health" />
            )}

            {activeTab === "tracker" && !healthOpen && (
              <TrackerPanel uid={uid} tier={currentTier} />
            )}



            {activeTab === "schemes" && (

              <SchemesPanel tier={currentTier} />

            )}



            {activeTab === "learn" && (

              <EducationHub />

            )}



            {activeTab === "profile" && (

              <ProfilePanel

                uid={uid}

                profile={profile}

                onSaved={refreshProfile}

              />

            )}



            {activeTab === "manage" && isGuardian && (

              <ManagePanel uid={uid} />

            )}

          </motion.main>

        )}

      </AnimatePresence>



      <BottomNav

        active={showHome ? "tracker" : activeTab}

        onChange={(tab) => {
          setActiveTab(tab);
          setHealthOpen(false);
          setShowHome(false);
        }}

        showManage={isGuardian}

      />



      <HerLoopChat />



      {/* Chat shortcut for the home card */}

      {chatOpen && (

        <div className="fixed bottom-24 right-5 z-[10000]">

          <button

            type="button"

            onClick={() => setChatOpen(false)}

            className="mb-2 rounded-full px-4 py-2 text-xs font-semibold shadow-md"

            style={{

              background: COLORS.plum,

              color: "#FFFFFF",

            }}

          >

            Close chat shortcut

          </button>

          <p

            className="max-w-[230px] rounded-2xl bg-white p-3 text-xs shadow-lg"

            style={{ color: COLORS.plum }}

          >

            Use the HerLoop AI chat button on this screen to start chatting.

          </p>

        </div>

      )}

    </div>

  );

}
