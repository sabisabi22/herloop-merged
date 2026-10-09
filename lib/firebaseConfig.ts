import { initializeApp, getApps, getApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDLlX1zeMxHAPJzSjhstl99ldFJHFiS_R4",
  authDomain: "herloop-32b0a.firebaseapp.com",
  projectId: "herloop-32b0a",
  storageBucket: "herloop-32b0a.firebasestorage.app",
  messagingSenderId: "1007526664266",
  appId: "1:1007526664266:web:c85a8130c1c812c1966eb3",
};

export const app =
  getApps().length ? getApp() : initializeApp(firebaseConfig);