"use client";

import { useState } from "react";
import { ChevronDown, MessageCircle, HelpCircle } from "lucide-react";

const WSP_URL = `https://wa.me/51958173765?text=${encodeURIComponent(
  "Hola, necesito ayuda con MediCare AI 👋"
)}`;

const FAQS = [
  {
    q: "¿Cómo agendo una cita?",
    a: 'Ve a "Agendar cita" en el menú lateral. Elige una especialidad, luego el médico, selecciona la fecha y el horario disponible, y confirma. Tu cita quedará pendiente hasta que el médico la confirme.',
  },
  {
    q: "¿Cuándo se confirma mi cita?",
    a: 'El médico revisa las solicitudes y la confirma o la cancela. Recibirás el cambio de estado en la sección "Mis citas". Una vez confirmada, ya está agendada.',
  },
  {
    q: "¿Cómo cancelo una cita?",
    a: "Por ahora el proceso de cancelación se gestiona comunicándote con nosotros por WhatsApp. Pronto podrás cancelarla directamente desde la app.",
  },
  {
    q: "¿Dónde veo mi historial médico?",
    a: 'En el menú lateral, entra a "Mi historial". Ahí encontrarás todas las consultas registradas por tus médicos, con diagnóstico, tratamiento y notas.',
  },
  {
    q: "¿Dónde están mis recetas?",
    a: 'En "Mis recetas" puedes ver todos los medicamentos que te han recetado, con dosis, frecuencia y duración del tratamiento.',
  },
  {
    q: "¿Mis datos están seguros?",
    a: "Sí. Tu información está cifrada y almacenada de forma segura. Solo tú y los médicos que te atienden tienen acceso a tu historial clínico.",
  },
  {
    q: "¿Puedo cambiar mi correo o contraseña?",
    a: 'Sí. Ve a "Configuración" en el menú lateral para actualizar tu nombre, correo y cambiar tu contraseña cuando quieras.',
  },
  {
    q: "¿Qué pasa si el médico cancela mi cita?",
    a: 'Si el médico cancela, tu cita aparecerá como Cancelada en la sección "Mis citas". Puedes volver a agendar con otro médico o en otro horario.',
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-2xl overflow-hidden border transition-colors ${open ? "border-blue-200 bg-blue-50/30" : "border-gray-100 bg-white"}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-blue-50/40 transition-colors"
      >
        <span className={`text-sm font-semibold pr-4 transition-colors ${open ? "text-blue-600" : "text-gray-800"}`}>{q}</span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-all duration-200 ${open ? "rotate-180 text-blue-400" : "text-gray-300"}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-4">
          <div className="h-px bg-blue-100 mb-3" />
          <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function SupportPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <header className="bg-white border-b border-gray-100 px-4 md:px-8 py-3 md:py-4">
        <h1 className="text-base font-bold text-gray-800">Soporte</h1>
        <p className="text-xs text-gray-400">Preguntas frecuentes y contacto</p>
      </header>

      <main className="p-4 md:p-8 max-w-2xl mx-auto">

        {/* FAQ */}
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
            <HelpCircle className="w-4 h-4 text-blue-500" />
          </div>
          <h2 className="text-sm font-bold text-gray-700">Preguntas frecuentes</h2>
        </div>

        <div className="flex flex-col gap-2 mb-10">
          {FAQS.map((faq) => (
            <FAQItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>

        {/* WhatsApp CTA */}
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 flex flex-col items-center text-center shadow-lg shadow-blue-200/50">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-3">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">¿No encontraste tu respuesta?</h3>
          <p className="text-xs text-blue-100 mb-4 max-w-xs">
            Escríbenos por WhatsApp y te ayudamos en minutos.
          </p>
          <a
            href={WSP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white text-blue-600 text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm hover:bg-blue-50 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Chatear por WhatsApp
          </a>
          <p className="text-xs text-blue-200 mt-3">+51 958 173 765</p>
        </div>

      </main>
    </div>
  );
}
