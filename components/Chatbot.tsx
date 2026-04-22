"use client";

import { useMemo, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi — I’m Reloop Assistant. Ask me about buying, selling, sizing, shipping, or how the app works.",
    },
  ]);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const canSend = useMemo(() => input.trim().length > 0 && !busy, [input, busy]);

  const send = async () => {
    if (!canSend) return;

    const userMsg: ChatMessage = { role: "user", content: input.trim() };
    const nextMessages = [...messages, userMsg];
    setInput("");
    setBusy(true);
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await res.text().catch(() => "");
        throw new Error(
          text
            ? `Server returned non-JSON. (${text.slice(0, 120)}...)`
            : "Server returned non-JSON."
        );
      }

      const data = (await res.json()) as { message?: string; error?: string };
      if (!res.ok || !data.message) throw new Error(data.error || "Chat failed.");

      setMessages((prev) => [...prev, { role: "assistant", content: data.message! }]);
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Chat failed.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Sorry — ${msg}` },
      ]);
    } finally {
      setBusy(false);
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
      });
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-ivory-100 text-stone-900 px-4 py-3 shadow-lg hover:bg-white transition"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-xs tracking-widest uppercase">Chat</span>
        </button>
      ) : (
        <div className="w-[92vw] max-w-sm bg-stone-950/95 border border-white/10 shadow-2xl backdrop-blur">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div>
              <div className="text-ivory-100 text-sm tracking-widest uppercase">Reloop Assistant</div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-stone-400 hover:text-ivory-100 transition"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div
            ref={scrollRef}
            className="max-h-[55vh] overflow-auto px-4 py-3 space-y-3"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "flex justify-end"
                    : "flex justify-start"
                }
              >
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[85%] bg-ivory-100 text-stone-900 text-sm px-3 py-2"
                      : "max-w-[85%] bg-white/5 text-ivory-100 text-sm px-3 py-2 border border-white/10"
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-white/10">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Ask something…"
                className="flex-1 bg-transparent border border-white/15 text-ivory-100 placeholder:text-stone-500 px-3 py-2 text-sm outline-none focus:border-white/30"
                disabled={busy}
              />
              <button
                type="button"
                onClick={send}
                disabled={!canSend}
                className="bg-ivory-100 text-stone-900 px-3 py-2 disabled:opacity-40 hover:bg-white transition"
                aria-label="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="text-[11px] text-stone-500 mt-2">
              Tip: Press Enter to send.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

