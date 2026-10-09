import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Approval token is required",
        },
        { status: 400 }
      );
    }

    const snapshot = await adminDb
      .collection("guardianLinks")
      .where("approvalToken", "==", token)
      .where("consentStatus", "==", "pending")
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or already used approval link.",
        },
        { status: 404 }
      );
    }

    const linkDoc = snapshot.docs[0];

    const childId = linkDoc.id;

    const userRef = adminDb.collection("users").doc(childId);
    const linkRef = linkDoc.ref;

    const batch = adminDb.batch();

    batch.update(linkRef, {
      consentStatus: "approved",
      approvedAt: FieldValue.serverTimestamp(),
      approvalToken: FieldValue.delete(),
    });

    batch.update(userRef, {
      role: "child",
    });

    await batch.commit();

    return NextResponse.json({
      success: true,
      message: "Request approved",
    });
  } catch (error) {
    console.error("Approval API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while approving the request.",
      },
      { status: 500 }
    );
  }
}