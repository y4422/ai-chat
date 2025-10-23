"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type MessageRole = "assistant" | "user";

type Message = {
  id: string;
  role: MessageRole;
  content: string;
  status?: "loading" | "error";
};

const createId = () => Math.random().toString(36).slice(2, 10);

const assistantGreeting: Message = {
  id: "assistant-welcome",
  role: "assistant",
  content: "OpenAI ベクターストアに接続されたチャットです。聞きたいことを入力してください。",
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([assistantGreeting]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatScrollRef.current?.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const canSubmit = useMemo(() => input.trim().length > 0 && !isSending, [input, isSending]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!input.trim()) {
      return;
    }

    const userText = input.trim();
    const userMessage: Message = {
      id: createId(),
      role: "user",
      content: userText,
    };

    const assistantPlaceholder: Message = {
      id: createId(),
      role: "assistant",
      content: "",
      status: "loading",
    };

    setMessages((previous) => [...previous, userMessage, assistantPlaceholder]);
    setInput("");
    setIsSending(true);
    setLastError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(({ role, content }) => ({ role, content })),
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error ?? "Failed to fetch response");
      }

      setMessages((previous) =>
        previous.map((message) =>
          message.id === assistantPlaceholder.id
            ? { id: message.id, role: "assistant", content: payload.output ?? "" }
            : message,
        ),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setLastError(message);
      setMessages((previous) =>
        previous.map((item) =>
          item.id === assistantPlaceholder.id
            ? { ...item, content: "エラーが発生しました。もう一度お試しください。", status: "error" }
            : item,
        ),
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-100 font-sans text-zinc-900">
      <header className="border-b border-zinc-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-4">
          <h1 className="text-lg font-semibold">Vector Store Chat</h1>
          <div className="text-xs text-zinc-500">Powered by OpenAI Responses API</div>
        </div>
      </header>

      <main className="flex flex-1 justify-center px-4 py-6">
        <div className="flex w-full max-w-4xl flex-1 flex-col rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div
            ref={chatScrollRef}
            className="flex-1 overflow-y-auto px-6 py-6"
            role="log"
            aria-live="polite"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-6 flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                    message.role === "assistant"
                      ? "bg-zinc-100 text-zinc-900"
                      : "bg-indigo-600 text-white"
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words">{message.content}</div>
                  {message.status === "loading" && (
                    <div className="mt-1 text-[10px] uppercase tracking-wide text-zinc-500">Thinking…</div>
                  )}
                  {message.status === "error" && (
                    <div className="mt-1 text-[10px] uppercase tracking-wide text-rose-500">Error</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-t border-zinc-200 bg-zinc-50/80 p-4"
          >
            <label htmlFor="message" className="sr-only">
              メッセージを入力
            </label>
            <div className="flex items-end gap-3">
              <textarea
                id="message"
                name="message"
                rows={2}
                className="min-h-[48px] flex-1 resize-none rounded-xl border border-transparent bg-white px-4 py-3 text-sm shadow-sm ring-1 ring-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="ベクターストアに聞きたいことを入力..."
                value={input}
                onChange={(event) => setInput(event.target.value)}
                disabled={isSending}
              />
              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex h-12 w-24 items-center justify-center rounded-xl bg-indigo-600 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-zinc-300"
              >
                送信
              </button>
            </div>
            {lastError && (
              <p className="mt-3 text-xs text-rose-500" role="alert">
                {lastError}
              </p>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}
