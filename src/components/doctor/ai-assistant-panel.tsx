"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Bot, X, Send, Sparkles } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";

function getMessageText(msg: { parts?: { type: string; text?: string }[]; content?: string }): string {
  if (msg.parts) {
    return msg.parts.filter((p) => p.type === "text").map((p) => p.text ?? "").join("");
  }
  return typeof msg.content === "string" ? msg.content : "";
}

export default function AIAssistantPanel({ chiefComplaint }: { chiefComplaint: string }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [initialized, setInitialized] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat", body: { mode: "doctor" } }), []);

  const { messages, sendMessage, status, setMessages } = useChat({ transport });

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    if (open && !initialized && chiefComplaint.trim()) {
      setInitialized(true);
      sendMessage({
        text: `Paciente presenta: ${chiefComplaint}. Por favor sugiere diagnósticos diferenciales, opciones de tratamiento y medicamentos apropiados con dosis estándar.`,
      });
    }
  }, [open, initialized, chiefComplaint, sendMessage]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleClose() {
    setOpen(false);
    setInitialized(false);
    setMessages([]);
    setInput("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    sendMessage({ text });
    setInput("");
  }

  const panel = (
    <div className="fixed inset-y-0 right-0 w-[420px] bg-white border-l border-gray-100 shadow-2xl z-[9999] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-sm shadow-purple-200">
            <Bot className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">Asistente Clínico IA</p>
            <p className="text-[11px] text-gray-400">MediCare AI · modo médico</p>
          </div>
        </div>
        <button onClick={handleClose} className="text-gray-300 hover:text-gray-500 transition-colors p-1">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Disclaimer */}
      <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-100">
        <p className="text-[10px] text-amber-700">
          Sugerencias de apoyo clínico. La decisión final es responsabilidad del médico.
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.length === 0 && !isLoading && (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center opacity-20">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <p className="text-xs text-gray-400 max-w-[200px]">
              {chiefComplaint.trim()
                ? "Iniciando análisis clínico..."
                : "Ingresa el motivo de consulta para obtener sugerencias"}
            </p>
          </div>
        )}

        {messages.map((m) => {
          const text = getMessageText(m as Parameters<typeof getMessageText>[0]);
          if (!text) return null;
          return (
            <div key={m.id} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`max-w-[88%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-purple-500 text-white rounded-tr-sm"
                  : "bg-gray-50 border border-gray-100 text-gray-700 rounded-tl-sm"
              }`}>
                {text}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-2">
            <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-sm px-3.5 py-3">
              <div className="flex gap-1 items-center h-4">
                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-100">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pregunta al asistente clínico..."
            disabled={isLoading}
            className="flex-1 text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-50 transition disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40 shrink-0"
          >
            <Send className="w-3.5 h-3.5 text-white" />
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-lg transition-colors"
      >
        <Sparkles className="w-3.5 h-3.5" />
        Sugerir con IA
      </button>

      {open && createPortal(panel, document.body)}
    </>
  );
}
