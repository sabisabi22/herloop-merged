import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import { app } from "./firebaseConfig";

const auth = getAuth(app);
const db = getFirestore(app);

export type AccountTier = "under10" | "teen" | "adult";

interface CreateAccountInput {
  email: string;
  password: string;
  name: string;
}

// ===============================
// CREATE ACCOUNT
// ===============================

export async function createAccount({
  email,
  password,
  name,
}: CreateAccountInput) {
  // Create Firebase Authentication account
  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  const uid = credential.user.uid;

  // DO NOT send email verification
  // User can go directly to dashboard.

  // Save user information in Firestore
  await setDoc(doc(db, "users", uid), {
    name,
    email,
    role: "unset",

    createdAt: serverTimestamp(),

    profileCompletion: {
      basicInfo: true,
      age: false,
      periodStart: false,
      emergencyContact: false,
      medicalBasics: false,
    },
  });

  return uid;
}

// ===============================
// SIGN IN
// ===============================

export async function signIn(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  return credential.user.uid;
}

// ===============================
// SIGN OUT
// ===============================

export async function signOutUser() {
  await signOut(auth);
}

// ===============================
// EMAIL VERIFICATION
// ===============================
// Kept only so old pages don't cause import errors.
// It is NOT used during signup.

export async function resendVerificationEmail() {
  return;
}

export async function refreshEmailVerified(): Promise<boolean> {
  return true;
}

export function isEmailVerified(): boolean {
  return true;
}

// ===============================
// ADULT ACCOUNT
// ===============================

export async function setupAdultSelf(uid: string) {
  await updateDoc(doc(db, "users", uid), {
    role: "adult",
    tier: "adult",
  });
}

// ===============================
// GUARDIAN + CHILD
// ===============================

export async function setupGuardianAndChild(
  guardianUid: string,
  childName: string,
  childAge: number
) {
  await updateDoc(doc(db, "users", guardianUid), {
    role: "guardian",
  });

  const tier: AccountTier =
    childAge < 10 ? "under10" : "teen";

  const childId = `${guardianUid}_${childName
    .replace(/\s+/g, "")
    .toLowerCase()}`;

  await setDoc(doc(db, "users", childId), {
    name: childName,
    age: childAge,
    role: "child",
    tier,
    createdAt: serverTimestamp(),
  });

  await setDoc(doc(db, "guardianLinks", childId), {
    guardianId: guardianUid,
    guardianEmail: null,
    tier,
    consentStatus: "approved",
    linkedAt: serverTimestamp(),
  });

  return childId;
}

// ===============================
// TEEN APPROVAL
// ===============================

export async function requestTeenApproval(
  teenUid: string,
  parentEmail: string
) {
  await updateDoc(doc(db, "users", teenUid), {
    role: "teen_pending",
    tier: "teen",
  });

  await setDoc(doc(db, "guardianLinks", teenUid), {
    guardianId: null,
    guardianEmail: parentEmail,
    tier: "teen",
    consentStatus: "pending",
    linkedAt: serverTimestamp(),
  });
}

// ===============================
// GUARDIAN REQUESTS
// ===============================

export async function getPendingRequestsForGuardian(
  guardianEmail: string
) {
  const q = query(
    collection(db, "guardianLinks"),
    where("guardianEmail", "==", guardianEmail),
    where("consentStatus", "==", "pending")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

// ===============================
// APPROVE TEEN
// ===============================

export async function approveTeenRequest(
  childId: string,
  guardianUid: string
) {
  await updateDoc(doc(db, "guardianLinks", childId), {
    guardianId: guardianUid,
    consentStatus: "approved",
    approvedAt: serverTimestamp(),
  });

  await updateDoc(doc(db, "users", childId), {
    role: "child",
  });
}

// ===============================
// GET USER PROFILE
// ===============================

export async function getUserProfile(uid: string) {
  const snapshot = await getDoc(doc(db, "users", uid));

  return snapshot.exists()
    ? snapshot.data()
    : null;
}

// ===============================
// UPDATE PROFILE
// ===============================

export async function updateProfileField(
  uid: string,
  field: string,
  value: any
) {
  await updateDoc(doc(db, "users", uid), {
    [field]: value,
  });
}