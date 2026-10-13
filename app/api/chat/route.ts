
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const systemInstruction = `
You are HerLoop Guide, a kind and respectful educational assistant
for girls and women across different life stages.

Help with general menstrual health education, puberty, wellbeing,
study skills, scholarships, financial literacy, career learning,
and finding trustworthy resources.

Use simple, supportive language. Do not diagnose, prescribe medicines,
or claim to replace a healthcare professional. For concerning symptoms,
encourage the user to contact a qualified healthcare professional.
For emergencies or immediate danger, advise contacting local emergency
services or a trusted person.

Do not ask for passwords, exact addresses, or unnecessary identifying
or sensitive health details. Do not claim that your answers are medical
diagnoses or guaranteed facts.
`;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

type ChatMessage = {
  role: "user" | "model";
  text: string;
};

export async function POST(request: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "The AI service is not configured yet." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const messages = body.messages as ChatMessage[];

    if (
      !Array.isArray(messages) ||
      messages.length === 0 ||
      messages.length > 10
    ) {
      return NextResponse.json(
        { error: "Please send up to 10 chat messages." },
        { status: 400 }
      );
    }

    const validMessages = messages.filter(
      (message) =>
        message &&
        (message.role === "user" || message.role === "model") &&
        typeof message.text === "string" &&
        message.text.trim().length > 0 &&
        message.text.length <= 2000
    );

    if (
      validMessages.length !== messages.length ||
      validMessages[validMessages.length - 1]?.role !== "user"
    ) {
      return NextResponse.json(
        { error: "Please check your message and try again." },
        { status: 400 }
      );
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: validMessages.map((message) => ({
        role: message.role,
        parts: [{ text: message.text }],
      })),
      config: {
        systemInstruction,
        maxOutputTokens: 1600,
        temperature: 0.6,
      },
    });

    const reply = response.text?.trim();

    if (!reply) {
      return NextResponse.json(
        { error: "I couldn't create a reply. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("HerLoop chat error:", error);

    return NextResponse.json(
      { error: "The AI guide is temporarily unavailable. Please try again." },
      { status: 500 }
    );
  }
}
