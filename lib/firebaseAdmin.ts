import "server-only";

import {
  applicationDefault,
  getApps,
  initializeApp,
} from "firebase-admin/app";

import { getFirestore } from "firebase-admin/firestore";

const adminApp =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: applicationDefault(),
        projectId: "herloop-32b0a",
      });

export const adminDb = getFirestore(adminApp);