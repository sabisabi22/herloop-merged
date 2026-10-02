"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "@/lib/firebaseConfig";

const auth = getAuth(app);

export default function VerifyEmail() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in.
        // Email verification is not required.
        router.replace("/dashboard");
      } else {
        // No user is signed in.
        router.replace("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <p className="text-lg font-semibold">
          Loading...
        </p>

        <p className="mt-2 text-sm text-gray-500">
          Redirecting you to your account...
        </p>
      </div>
    </div>
  );
}