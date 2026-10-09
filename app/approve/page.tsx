"use client";

import { useState } from "react";

export default function ApprovePage({
  searchParams,
}: {
  searchParams: {
    token?: string;
  };
}) {
  const token = searchParams.token;

  const [status, setStatus] = useState(
    token ? "Approval request found." : "Invalid approval link."
  );

  const [busy, setBusy] = useState(false);

  async function handleApprove() {
    if (!token) return;

    setBusy(true);
    setStatus("Approving request...");

    try {
      const response = await fetch("/api/approve-parent-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ?? "Could not approve the request."
        );
      }

      setStatus(
        "Request approved successfully. The teen can now use HerLoop."
      );
    } catch (error: any) {
      setStatus(
        error.message ?? "Something went wrong while approving."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#faf6f1] px-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-lg">
        <h1 className="text-2xl font-semibold text-[#5d2748]">
          HerLoop Parent Approval
        </h1>

        <p className="mt-4 text-sm text-gray-600">
          A teen has requested your permission to use HerLoop.
        </p>

        {token && (
          <button
            onClick={handleApprove}
            disabled={busy}
            className="mt-7 w-full rounded-2xl bg-[#7a315d] px-5 py-3 font-semibold text-white disabled:opacity-60"
          >
            {busy ? "Approving..." : "Approve Request"}
          </button>
        )}

        <p className="mt-5 text-sm text-gray-600">
          {status}
        </p>
      </div>
    </main>
  );
}