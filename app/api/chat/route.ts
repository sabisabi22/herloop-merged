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
    // 1. Check the API key
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("HerLoop chat: GEMINI_API_KEY is missing.");

      return NextResponse.json(
        { error: "The AI service is not configured yet." },
        { status: 503 }
      );
    }

    // 2. Create the Gemini client
    const ai = new GoogleGenAI({ apiKey });

    // 3. Read the request body
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

    // 4. Validate the messages
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

    // 5. Prepare conversation content
    const contents = validMessages.map((message) => ({
      role: message.role,
      parts: [{ text: message.text }],
    }));

    // 6. Try the primary model, then a fallback for temporary errors
    let response;

    try {
      response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents,
        config: {
          systemInstruction,
          maxOutputTokens: 1600,
          temperature: 0.6,
        },
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      const isTemporary =
        /UNAVAILABLE|503|high demand|overload/i.test(errorMessage);

      if (!isTemporary) {
        throw error;
      }

      console.warn(
        "HerLoop chat: Primary model unavailable; trying fallback."
      );

      response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents,
        config: {
          systemInstruction,
          maxOutputTokens: 1600,
          temperature: 0.6,
        },
      });
    }

    // 7. Check the response
    const reply = response.text?.trim();

    if (!reply) {
      console.error("HerLoop chat: Gemini returned an empty response.");

      return NextResponse.json(
        { error: "I couldn't create a reply. Please try again." },
        { status: 502 }
      );
    }

    // 8. Return the reply
    return NextResponse.json({ reply });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(
        "HerLoop chat error:",
        error.name,
        error.message
      );
    } else {
      console.error("HerLoop chat error:", error);
    }

    return NextResponse.json(
      { error: "The AI guide is temporarily unavailable. Please try again." },
      { status: 500 }
    );
  }
}