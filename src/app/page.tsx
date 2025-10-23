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

// Loading dots animation component
function LoadingDots() {
  return (
    <div className="flex items-center gap-1 py-2">
      <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s]"></div>
      <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s]"></div>
      <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400"></div>
    </div>
  );
}

// Avatar icons
function AssistantIcon() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm">
      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    </div>
  );
}

function UserIcon() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 shadow-sm">
      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    </div>
  );
}

// Send icon
function SendIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
  );
}

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
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-zinc-50 to-zinc-100 font-sans text-zinc-900">
      <header className="border-b border-zinc-200/50 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-zinc-900">Vector Store Chat</h1>
              <p className="text-xs text-zinc-500">Powered by OpenAI</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex flex-1 justify-center px-4 py-8">
        <div className="flex w-full max-w-5xl flex-1 flex-col overflow-hidden rounded-3xl border border-zinc-200/50 bg-white shadow-xl">
          <div
            ref={chatScrollRef}
            className="flex-1 space-y-6 overflow-y-auto px-6 py-8"
            role="log"
            aria-live="polite"
          >
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : "flex-row"} animate-fade-in`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {message.role === "assistant" ? <AssistantIcon /> : <UserIcon />}
                <div
                  className={`group relative max-w-[75%] transition-all ${
                    message.role === "assistant"
                      ? "rounded-3xl rounded-tl-md bg-gradient-to-br from-zinc-50 to-zinc-100 px-5 py-4 text-zinc-900 shadow-sm hover:shadow-md"
                      : "rounded-3xl rounded-tr-md bg-gradient-to-br from-indigo-600 to-indigo-700 px-5 py-4 text-white shadow-md hover:shadow-lg"
                  }`}
                >
                  {message.status === "loading" ? (
                    <LoadingDots />
                  ) : (
                    <div className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
                      {message.content}
                    </div>
                  )}
                  {message.status === "error" && (
                    <div className="mt-2 flex items-center gap-1 text-xs font-medium text-rose-500">
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      エラー
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-t border-zinc-200/50 bg-gradient-to-b from-white to-zinc-50/50 p-6"
          >
            <label htmlFor="message" className="sr-only">
              メッセージを入力
            </label>
            <div className="flex items-end gap-3">
              <textarea
                id="message"
                name="message"
                rows={1}
                className="min-h-[52px] flex-1 resize-none rounded-2xl border-0 bg-zinc-100 px-5 py-4 text-[15px] leading-relaxed text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="ベクターストアに聞きたいことを入力..."
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    if (canSubmit) {
                      handleSubmit(event as unknown as FormEvent<HTMLFormElement>);
                    }
                  }
                }}
                disabled={isSending}
              />
              <button
                type="submit"
                disabled={!canSubmit}
                className="group flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
              >
                <SendIcon />
              </button>
            </div>
            {lastError && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-2 text-sm text-rose-600" role="alert">
                <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {lastError}
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}
