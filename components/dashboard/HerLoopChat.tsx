"use client";

import { useEffect, useRef, useState } from "react";
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  LoaderCircle,
} from "lucide-react";

type Message = {
  role: "user" | "model";
  text: string;
};

const suggestions = [
  "Explain the menstrual cycle simply",
  "How can I find scholarships?",
  "Suggest free coding courses",
  "How can I manage stress during exams?",
];

export default function HerLoopChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: "Hi! 💗 I'm HerLoop Guide. Ask me about wellbeing, learning, scholarships, or personal development.",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages, busy, open]);

  async function sendMessage(text = input) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    const nextMessages: Message[] = [
      ...messages,
      { role: "user", text: trimmed },
    ];

    setMessages(nextMessages);
    setInput("");
    setError("");
    setBusy(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages
            .slice(-10)
            .map(({ role, text }) => ({ role, text })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to get a response.");
      }

      if (typeof data.reply !== "string" || !data.reply.trim()) {
        throw new Error("No response received. Please try again.");
      }

      setMessages((previous) => [
        ...previous,
        { role: "model", text: data.reply },
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* Floating launcher */}
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-label={open ? "Close HerLoop Guide" : "Open HerLoop Guide"}
        aria-expanded={open}
        style={{
          position: "fixed",
          right: "24px",
          bottom: "24px",
          zIndex: 9999,
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          border: "3px solid white",
          background: "linear-gradient(135deg, #e83e8c, #8950c9)",
          color: "#ffffff",
          boxShadow: "0 6px 24px rgba(137, 80, 201, 0.42)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        {open ? <X size={26} /> : <MessageCircle size={27} />}
      </button>

      {/* Chat window */}
      {open && (
        <section
          role="dialog"
          aria-label="HerLoop Guide chat"
          style={{
            position: "fixed",
            right: "20px",
            bottom: "96px",
            zIndex: 9998,
            width: "min(390px, calc(100vw - 24px))",
            height: "min(620px, calc(100dvh - 125px))",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            borderRadius: "26px",
            border: "1px solid #f0d5f0",
            background: "#ffffff",
            boxShadow: "0 16px 50px rgba(74, 35, 86, 0.22)",
            fontFamily: "inherit",
          }}
        >
          {/* Header */}
          <header
            style={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px",
              background: "linear-gradient(120deg, #fce4ef, #eee4ff)",
              borderBottom: "1px solid #f0d5f0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 15,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#a52b78",
                  background: "#ffffff",
                  boxShadow: "0 2px 8px #a52b7818",
                }}
              >
                <Sparkles size={23} />
              </div>

              <div>
                <h2
                  style={{
                    margin: 0,
                    color: "#49304f",
                    fontSize: 17,
                    fontWeight: 700,
                  }}
                >
                  HerLoop Guide
                </h2>
                <p
                  style={{
                    margin: "4px 0 0",
                    color: "#655471",
                    fontSize: 12,
                  }}
                >
                  Your learning and wellbeing companion
                </p>
                <p
                  style={{
                    margin: "5px 0 0",
                    color: "#32845b",
                    fontSize: 11,
                  }}
                >
                  ● Here to help
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              style={{
                border: 0,
                borderRadius: "50%",
                padding: 8,
                background: "transparent",
                color: "#62496e",
                cursor: "pointer",
              }}
            >
              <X size={21} />
            </button>
          </header>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              overscrollBehavior: "contain",
              padding: 15,
              background: "linear-gradient(180deg, #fff8fc, #ffffff)",
            }}
            aria-live="polite"
          >
            <p
              style={{
                textAlign: "center",
                color: "#8b7298",
                fontSize: 10,
                letterSpacing: "0.5px",
                margin: "3px 0 18px",
              }}
            >
              YOUR HERLOOP SPACE 💗
            </p>

            {messages.map((message, index) => {
              const isUser = message.role === "user";

              return (
                <div
                  key={`${index}-${message.role}`}
                  style={{
                    display: "flex",
                    justifyContent: isUser ? "flex-end" : "flex-start",
                    alignItems: "flex-start",
                    gap: 7,
                    marginBottom: 15,
                    width: "100%",
                  }}
                >
                  {!isUser && (
                    <div
                      style={{
                        flexShrink: 0,
                        width: 27,
                        height: 27,
                        marginTop: 5,
                        borderRadius: "50%",
                        background: "#f4e6fb",
                        color: "#8850b4",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Sparkles size={14} />
                    </div>
                  )}

                  <div
                    style={{
                      maxWidth: "84%",
                      minWidth: 0,
                      padding: "11px 14px",
                      borderRadius: isUser
                        ? "18px 18px 5px 18px"
                        : "18px 18px 18px 5px",
                      background: isUser
                        ? "linear-gradient(135deg, #e83e8c, #a343bd)"
                        : "#ffffff",
                      color: isUser ? "#ffffff" : "#493b54",
                      border: isUser ? "none" : "1px solid #f0dced",
                      boxShadow: isUser
                        ? "0 3px 10px rgba(186, 54, 151, 0.18)"
                        : "0 2px 5px rgba(74, 35, 86, 0.04)",
                      fontSize: 14,
                      lineHeight: 1.7,
                      overflowWrap: "anywhere",
                      whiteSpace: "pre-wrap",
                      wordBreak: "normal",
                    }}
                  >
                    {message.text}
                  </div>
                </div>
              );
            })}

            {busy && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  marginBottom: 15,
                  color: "#755982",
                  fontSize: 13,
                }}
              >
                <LoaderCircle
                  size={17}
                  style={{ animation: "herloop-spin 1s linear infinite" }}
                />
                HerLoop Guide is thinking...
              </div>
            )}

            {messages.length === 1 && !busy && (
              <div style={{ marginTop: 20 }}>
                <p
                  style={{
                    color: "#80698a",
                    fontSize: 11,
                    fontWeight: 700,
                    marginBottom: 10,
                  }}
                >
                  WHAT WOULD YOU LIKE TO KNOW?
                </p>

                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => void sendMessage(suggestion)}
                    disabled={busy}
                    style={{
                      display: "block",
                      width: "100%",
                      marginBottom: 9,
                      padding: "11px 12px",
                      borderRadius: 13,
                      border: "1px solid #ead7f1",
                      background: "#ffffff",
                      color: "#69427d",
                      textAlign: "left",
                      fontSize: 13,
                      lineHeight: 1.5,
                      cursor: "pointer",
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {error && (
              <div
                role="alert"
                style={{
                  padding: 12,
                  borderRadius: 12,
                  background: "#fff0f1",
                  color: "#a52b45",
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                {error}
                <button
                  type="button"
                  onClick={() => {
                    const lastUserMessage = [...messages]
                      .reverse()
                      .find((message) => message.role === "user");

                    if (lastUserMessage) {
                      void sendMessage(lastUserMessage.text);
                    }
                  }}
                  disabled={busy}
                  style={{
                    display: "block",
                    marginTop: 7,
                    padding: 0,
                    border: 0,
                    background: "transparent",
                    color: "#a52b78",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Try again
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void sendMessage();
            }}
            style={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "12px",
              borderTop: "1px solid #f0dced",
              background: "#ffffff",
            }}
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask your question..."
              aria-label="Message HerLoop Guide"
              maxLength={2000}
              style={{
                flex: 1,
                minWidth: 0,
                height: 45,
                boxSizing: "border-box",
                padding: "0 13px",
                borderRadius: 13,
                border: "1px solid #e6d9ec",
                outline: "none",
                background: "#fffafd",
                color: "#493b54",
                fontSize: 14,
              }}
            />

            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label="Send message"
              style={{
                flexShrink: 0,
                width: 45,
                height: 45,
                border: 0,
                borderRadius: 13,
                background:
                  busy || !input.trim()
                    ? "#d9c5e2"
                    : "linear-gradient(135deg, #e83e8c, #8950c9)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: busy || !input.trim() ? "not-allowed" : "pointer",
              }}
            >
              <Send size={18} />
            </button>
          </form>

          <p
            style={{
              flexShrink: 0,
              margin: 0,
              padding: "0 8px 10px",
              background: "#ffffff",
              textAlign: "center",
              color: "#8b7894",
              fontSize: 10,
            }}
          >
            Educational support only — not a medical diagnosis.
          </p>
        </section>
      )}

      <style jsx global>{`
        @keyframes herloop-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}