import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const systemInstruction = `
You are HerLoop Guide, a kind and respectful educational assistant
for girls and women across different life stages.

Help with:
- General menstrual health education
- Puberty and wellbeing
- Study skills and learning
- Scholarships and educational opportunities
- Financial literacy
- Career development and technology learning
- Finding trustworthy resources

Use simple, supportive language.
For career questions, give practical roadmaps suitable for the user's
current education level and experience.

Do not diagnose medical conditions or prescribe medicines.
For concerning symptoms, encourage the user to contact a qualified
healthcare professional.
For emergencies or immediate danger, advise contacting local emergency
services or a trusted person.

Do not ask for passwords, exact addresses, or unnecessary identifying
or sensitive health details.
Do not claim that your answers are medical diagnoses or guaranteed facts.
`;

type ChatMessage = {
  role: "user" | "model";
  text: string;
};

export async function POST(request: Request) {
  try {
    // 1. Check whether the API key is configured
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("HerLoop chat: GEMINI_API_KEY is missing.");

      return NextResponse.json(
        { error: "The AI service is not configured yet." },
        { status: 503 }
      );
    }

    // 2. Create the Gemini client only after checking the API key
    const ai = new GoogleGenAI({ apiKey });

    // 3. Read the incoming request
    let body: { messages?: unknown };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request. Please try again." },
        { status: 400 }
      );
    }

    const messages = body.messages;

    // 4. Validate the messages array
    if (
      !Array.isArray(messages) ||
      messages.length === 0 ||
      messages.length > 10
    ) {
      return NextResponse.json(
        { error: "Please send between 1 and 10 chat messages." },
        { status: 400 }
      );
    }

    const validMessages = messages.filter(
      (message): message is ChatMessage =>
        message !== null &&
        typeof message === "object" &&
        "role" in message &&
        "text" in message &&
        ((message as ChatMessage).role === "user" ||
          (message as ChatMessage).role === "model") &&
        typeof (message as ChatMessage).text === "string" &&
        (message as ChatMessage).text.trim().length > 0 &&
        (message as ChatMessage).text.length <= 2000
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

    // 5. Send the conversation to Gemini
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

    // 6. Check Gemini's response
    const reply = response.text?.trim();

    if (!reply) {
      console.error("HerLoop chat: Gemini returned an empty response.");

      return NextResponse.json(
        { error: "I couldn't create a reply. Please try again." },
        { status: 502 }
      );
    }

    // 7. Return the reply to the frontend
    return NextResponse.json({ reply });
  } catch (error: unknown) {
    // Log useful error details in your local terminal
    if (error instanceof Error) {
      console.error("HerLoop chat error:", error.name, error.message);
    } else {
      console.error("HerLoop chat error:", error);
    }

    return NextResponse.json(
      { error: "The AI guide is temporarily unavailable. Please try again." },
      { status: 500 }
    );
  }
}
