"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Bot, Send, User, AlertTriangle, Plus, Trash2, MessageSquare } from "lucide-react";
import { useRef, useEffect, useState, useCallback, useMemo } from "react";

const SUGGESTIONS = [
  "Paciente con fiebre, tos y dolor torácico",
  "Síntomas de hipertensión no controlada",
  "Diagnóstico diferencial para dolor abdominal agudo",
];

interface SavedChat {
  id: string;
  title: string;
  createdAt: number;
  messages: unknown[];
}

function getMessageText(msg: { parts?: { type: string; text?: string }[]; content?: string }): string {
  if (msg.parts) {
    return msg.parts.filter((p) => p.type === "text").map((p) => p.text ?? "").join("");
  }
  return typeof msg.content === "string" ? msg.content : "";
}

export default function DoctorAssistantChat() {
  const [chatId, setChatId] = useState(() => crypto.randomUUID());
  const [history, setHistory] = useState<SavedChat[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("medicare-doctor-chats") ?? "[]"); } catch { return []; }
  });
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat", body: { mode: "doctor" } }), []);

  const { messages, sendMessage, status, setMessages } = useChat({
    id: chatId,
    transport,
  });

  const prevStatusRef = useRef(status);
  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const wasLoading = prevStatusRef.current === "streaming" || prevStatusRef.current === "submitted";
    prevStatusRef.current = status;
    if (!wasLoading || status !== "ready" || messages.length === 0) return;
    const firstUser = messages.find((m) => m.role === "user");
    const title = firstUser ? getMessageText(firstUser as Parameters<typeof getMessageText>[0]).slice(0, 50) : "Nueva consulta";
    const updated: SavedChat = { id: chatId, title, createdAt: Date.now(), messages };
    setHistory((prev) => {
      const filtered = prev.filter((c) => c.id !== chatId);
      const next = [updated, ...filtered].slice(0, 20);
      localStorage.setItem("medicare-doctor-chats", JSON.stringify(next));
      return next;
    });
  }, [status, messages, chatId]);

  const newChat = useCallback(() => {
    setChatId(crypto.randomUUID());
    setMessages([]);
    setInput("");
  }, [setMessages]);

  const loadChat = useCallback((chat: SavedChat) => {
    setChatId(chat.id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setMessages(chat.messages as any);
    setInput("");
  }, [setMessages]);

  const deleteChat = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory((prev) => {
      const next = prev.filter((c) => c.id !== id);
      localStorage.setItem("medicare-doctor-chats", JSON.stringify(next));
      return next;
    });
    if (id === chatId) newChat();
  }, [chatId, newChat]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    sendMessage({ text });
    setInput("");
  }

  return (
    <div className="flex-1 flex overflow-hidden">

      {/* Sidebar historial */}
      <div className="hidden sm:flex w-56 shrink-0 border-r border-gray-100 flex-col bg-gray-50/50">
        <div className="p-3 border-b border-gray-100">
          <button
            onClick={newChat}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:border-purple-300 hover:text-purple-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva consulta
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
          {history.length === 0 && (
            <p className="text-xs text-gray-400 text-center mt-4 px-3">Sin historial aún</p>
          )}
          {history.map((chat) => (
            <button
              key={chat.id}
              onClick={() => loadChat(chat)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-colors group flex items-start gap-2 ${
                chat.id === chatId ? "bg-purple-50 text-purple-700" : "text-gray-500 hover:bg-white hover:text-gray-700"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span className="flex-1 line-clamp-2 text-left">{chat.title}</span>
              <Trash2
                className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity mt-0.5"
                onClick={(e) => deleteChat(chat.id, e)}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col overflow-hidden p-4 sm:p-5 gap-4">

        {/* Mobile: nueva consulta button */}
        <div className="flex sm:hidden">
          <button
            onClick={newChat}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-50 border border-purple-200 text-sm font-medium text-purple-600 hover:bg-purple-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva consulta
          </button>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">
            Asistente de apoyo clínico con <strong>lenguaje técnico médico</strong>.
            Las sugerencias son de referencia — la decisión clínica final es responsabilidad del médico.
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-4 pr-1">
          {messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-200">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-800 mb-1">Asistente Clínico MediCare</p>
                <p className="text-sm text-gray-400 max-w-sm">
                  Describe el caso clínico y obtén sugerencias de diagnóstico diferencial y tratamiento.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full hover:border-purple-300 hover:text-purple-600 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => {
            const text = getMessageText(m as Parameters<typeof getMessageText>[0]);
            return (
              <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${m.role === "user" ? "bg-purple-500" : "bg-gradient-to-br from-purple-500 to-blue-500"}`}>
                  {m.role === "user" ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                </div>
                <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-purple-500 text-white rounded-tr-sm"
                    : "bg-white border border-gray-100 text-gray-700 rounded-tl-sm shadow-sm"
                }`}>
                  {text}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1 items-center h-5">
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe el caso clínico..."
            disabled={isLoading}
            className="flex-1 text-sm border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-50 transition disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-sm shadow-purple-200 hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
}
