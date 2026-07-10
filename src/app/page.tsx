import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, Sparkles, ShieldCheck,
  Clock, Users, Stethoscope, Bot, MapPin, Phone, Mail,
  Star, CalendarDays, Quote,
} from "lucide-react";
import FaqSection, { WA_NUMBER, WA_MESSAGE, WhatsAppIcon } from "@/components/landing/faq-section";

export default function RootPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
          <div className="flex items-center gap-2.5 shrink-0">
            <Image src="/medicare.png" alt="MediCare AI" width={34} height={34} className="rounded-xl" />
            <span className="font-bold text-gray-800 text-lg tracking-tight">
              Medicare<span className="text-blue-500">AI</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-0.5">
            {[
              { label: "Inicio", href: "#hero" },
              { label: "¿Por qué nosotros?", href: "#why" },
              { label: "La plataforma", href: "#app" },
              { label: "Comentarios", href: "#comments" },
              { label: "Sedes", href: "#location" },
              { label: "FAQ", href: "#faq" },
            ].map((item) => (
              <a key={item.href} href={item.href}
                className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                {item.label}
              </a>
            ))}
          </nav>
          <Link href="/login"
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-opacity shadow-sm shadow-blue-200 shrink-0">
            Iniciar sesión
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section id="hero" className="relative min-h-[92vh] flex items-center scroll-mt-16">
        <div className="absolute inset-0">
          <Image src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1600&q=85"
            alt="Clínica moderna" fill className="object-cover" priority sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 via-blue-900/75 to-cyan-900/40" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-cyan-200 text-xs font-semibold px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Plataforma médica con Inteligencia Artificial
            </div>
            <h1 className="text-5xl sm:text-6xl font-extrabold text-white leading-tight mb-6">
              La salud,<br />
              <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                en tus manos
              </span>
            </h1>
            <p className="text-blue-100 text-lg leading-relaxed mb-10 max-w-lg">
              Agenda citas, consulta síntomas con IA y accede a tu historial clínico — todo en una plataforma segura y fácil de usar.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/login"
                className="flex items-center gap-2 bg-gradient-to-r from-blue-400 to-cyan-400 text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-cyan-500/30 hover:opacity-90 transition-opacity text-sm">
                Reservar cita <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#why"
                className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-white/20 transition-colors text-sm">
                Conocer más
              </a>
            </div>
            <div className="flex flex-wrap gap-5 mt-10">
              {[{ icon: ShieldCheck, text: "Datos seguros" }, { icon: Clock, text: "Disponible 24/7" }, { icon: Users, text: "Médicos certificados" }]
                .map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-cyan-200 text-xs">
                    <Icon className="w-4 h-4" /> {text}
                  </div>
                ))}
            </div>
          </div>
          {/* Hero chat card */}
          <div className="hidden lg:block">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Asistente MediCare AI</p>
                  <p className="text-cyan-200 text-xs">En línea ahora</p>
                </div>
                <div className="ml-auto w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              </div>
              {[
                { role: "ai", text: "Hola, ¿en qué puedo ayudarte hoy?" },
                { role: "user", text: "Tengo dolor de cabeza frecuente y mareos" },
                { role: "ai", text: "Entiendo. ¿Desde hace cuánto tiempo tienes estos síntomas? Te ayudo a orientarte sobre qué especialista visitar." },
              ].map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${m.role === "user" ? "bg-gradient-to-r from-blue-400 to-cyan-400 text-white rounded-tr-sm" : "bg-white/15 text-blue-100 rounded-tl-sm"}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <div className="flex-1 bg-white/10 rounded-xl px-4 py-2.5 text-xs text-blue-300">Describe tus síntomas...</div>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: "+500", label: "Pacientes atendidos" },
            { value: "+30", label: "Médicos especializados" },
            { value: "98%", label: "Satisfacción del paciente" },
            { value: "24/7", label: "Asistente IA disponible" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-extrabold text-white">{s.value}</p>
              <p className="text-sm text-white/70 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Por qué elegirnos ── */}
      <section id="why" className="relative py-24 scroll-mt-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-cyan-50 to-blue-50 pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-cyan-300/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-blue-300/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold text-blue-500 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full mb-3 tracking-widest uppercase">Ventajas</span>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">¿Por qué elegirnos?</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Combinamos tecnología de punta con atención médica humana para ofrecerte la mejor experiencia.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Bot, color: "from-blue-500 to-cyan-500", title: "Asistente IA 24/7", desc: "Obtén orientación sobre tus síntomas a cualquier hora sin necesidad de esperar." },
              { icon: Stethoscope, color: "from-blue-600 to-blue-400", title: "Médicos certificados", desc: "Todos nuestros profesionales están certificados y con amplia experiencia clínica." },
              { icon: ShieldCheck, color: "from-cyan-500 to-blue-400", title: "Privacidad garantizada", desc: "Tu historial clínico está cifrado y protegido. Solo tú y tu médico tienen acceso." },
              { icon: CalendarDays, color: "from-blue-400 to-cyan-400", title: "Agenda en segundos", desc: "Reserva, modifica o cancela citas desde cualquier dispositivo en cualquier momento." },
              { icon: Clock, color: "from-cyan-600 to-blue-500", title: "Tiempos reducidos", desc: "Evita largas esperas. Consulta en línea o presencialmente con horarios flexibles." },
              { icon: Star, color: "from-blue-500 to-cyan-600", title: "Alta satisfacción", desc: "El 98% de nuestros pacientes califica el servicio como excelente o muy bueno." },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="bg-white/80 backdrop-blur-sm border border-blue-50 rounded-3xl p-6 hover:shadow-xl hover:shadow-blue-100/60 transition-all hover:-translate-y-1">
                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg shadow-blue-200/50`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── App Screenshots ── */}
      <section id="app" className="relative py-24 scroll-mt-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-bl from-cyan-100 via-blue-50 to-cyan-50 pointer-events-none" />
        <div className="absolute top-0 left-1/2 w-[600px] h-[400px] -translate-x-1/2 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold text-cyan-600 bg-cyan-50 border border-cyan-100 px-3 py-1.5 rounded-full mb-3 tracking-widest uppercase">La plataforma</span>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Una interfaz diseñada para ti</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Intuitiva, rápida y accesible desde cualquier dispositivo.</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Mockup 1 - Dashboard */}
            <div className="rounded-2xl overflow-hidden border border-blue-100 shadow-xl shadow-blue-100/50">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-3 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-white/30" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/30" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/30" />
                <span className="ml-3 text-white/70 text-xs">Dashboard del paciente</span>
              </div>
              <div className="bg-white p-4 space-y-3">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-4 text-white">
                  <p className="text-xs opacity-80 mb-1">Próxima cita</p>
                  <p className="font-bold text-sm">Dr. Carlos Méndez</p>
                  <p className="text-xs opacity-70">Mañana · 10:00 AM · Consultorio 3</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {["Mis citas", "Historial", "Recetas", "Asistente IA"].map((l) => (
                    <div key={l} className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
                      <p className="text-xs font-semibold text-blue-600">{l}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-200 to-cyan-200 shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-2.5 bg-blue-100 rounded-full w-3/4" />
                        <div className="h-2 bg-gray-100 rounded-full w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mockup 2 - AI Chat */}
            <div className="rounded-2xl overflow-hidden border border-cyan-100 shadow-xl shadow-cyan-100/50">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-3 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-white/30" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/30" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/30" />
                <span className="ml-3 text-white/70 text-xs">Asistente IA · Chat</span>
              </div>
              <div className="bg-white p-4 space-y-3 h-[260px] flex flex-col">
                <div className="flex items-center gap-2 pb-3 border-b border-blue-50">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">Asistente MediCare</p>
                    <p className="text-[10px] text-cyan-500">● En línea</p>
                  </div>
                </div>
                <div className="flex-1 space-y-2 overflow-hidden">
                  <div className="bg-blue-50 rounded-xl rounded-tl-sm px-3 py-2 max-w-[85%]">
                    <p className="text-[11px] text-blue-700">¿Cómo te sientes hoy?</p>
                  </div>
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl rounded-tr-sm px-3 py-2 max-w-[85%] ml-auto">
                    <p className="text-[11px] text-white">Tengo fiebre y dolor de garganta</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl rounded-tl-sm px-3 py-2 max-w-[90%]">
                    <p className="text-[11px] text-blue-700">Entiendo. Esos síntomas podrían indicar una faringitis. Te recomiendo visitar un médico general.</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 bg-blue-50 rounded-xl px-3 py-2 border border-blue-100">
                    <p className="text-[11px] text-blue-300">Escribe aquí...</p>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shrink-0">
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Mockup 3 - Doctor */}
            <div className="rounded-2xl overflow-hidden border border-blue-100 shadow-xl shadow-blue-100/50">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-3 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-white/30" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/30" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/30" />
                <span className="ml-3 text-white/70 text-xs">Agenda del médico</span>
              </div>
              <div className="bg-white p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-gray-800">Agenda de hoy</p>
                  <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full font-semibold">5 citas</span>
                </div>
                <div className="space-y-2">
                  {[
                    { time: "09:00", name: "María González", status: "Completada", bg: "bg-emerald-50", text: "text-emerald-600" },
                    { time: "10:30", name: "Carlos Pérez", status: "En curso", bg: "bg-blue-50", text: "text-blue-600" },
                    { time: "11:00", name: "Ana Rodríguez", status: "Pendiente", bg: "bg-gray-100", text: "text-gray-500" },
                  ].map((a) => (
                    <div key={a.time} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                      <p className="text-[10px] font-bold text-blue-400 w-10 shrink-0">{a.time}</p>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-700">{a.name}</p>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${a.bg} ${a.text}`}>{a.status}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-xl p-3 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <p className="text-[10px] text-blue-700 font-medium">Asistente clínico IA disponible</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Comentarios ── */}
      <section id="comments" className="relative py-24 scroll-mt-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 pointer-events-none" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold text-white/80 bg-white/10 border border-white/20 px-3 py-1.5 rounded-full mb-3 tracking-widest uppercase">Testimonios</span>
            <h2 className="text-3xl font-extrabold text-white mb-3">Lo que dicen nuestros usuarios</h2>
            <p className="text-white/70 max-w-xl mx-auto">Historias reales de pacientes y médicos que confían en MediCare AI.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Dra. Ana Martínez", role: "Directora médica", text: "MediCare AI redujo en un 40% el tiempo administrativo. Ahora me enfoco en lo que importa: mis pacientes.", avatar: "AM" },
              { name: "Juan Pérez", role: "Paciente", text: "Agendar una cita nunca fue tan fácil. El asistente me ayudó a entender mis síntomas antes de ir al médico.", avatar: "JP" },
              { name: "Dr. Carlos Méndez", role: "Internista", text: "El asistente clínico IA me da sugerencias muy útiles durante las consultas. Es un apoyo real en mi día a día.", avatar: "CM" },
            ].map((t) => (
              <div key={t.name} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6">
                <Quote className="w-6 h-6 text-cyan-300 mb-4" />
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                  ))}
                </div>
                <p className="text-sm text-white/85 leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/30 to-white/10 border border-white/30 flex items-center justify-center text-white font-bold text-xs shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{t.name}</p>
                    <p className="text-xs text-white/60">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ubicación / Sedes ── */}
      <section id="location" className="relative py-24 scroll-mt-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 via-cyan-50 to-blue-100 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold text-blue-500 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full mb-3 tracking-widest uppercase">Sedes</span>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Nuestras sedes</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Contamos con tres sedes estratégicamente ubicadas para estar cerca de ti.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              { name: "Sede Central", tag: "Principal", tagGradient: "from-blue-500 to-cyan-500", img: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&q=80", address: "Av. Javier Prado Este 1234, Piso 3", district: "San Isidro", hours: "Lun–Vie: 07:00–20:00 · Sáb: 08:00–14:00" },
              { name: "Sede Norte", tag: "Nuevo", tagGradient: "from-cyan-500 to-blue-400", img: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&q=80", address: "Calle Los Olivos 567, Of. 201", district: "Los Olivos", hours: "Lun–Vie: 08:00–18:00 · Sáb: 09:00–13:00" },
              { name: "Sede Sur", tag: "Disponible", tagGradient: "from-blue-600 to-cyan-600", img: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=600&q=80", address: "Av. Primavera 890, Centro Médico Sur", district: "Surco", hours: "Lun–Vie: 07:30–19:30 · Sáb: 08:00–12:00" },
            ].map((sede) => (
              <div key={sede.name} className="bg-white rounded-3xl overflow-hidden border border-blue-100 shadow-sm hover:shadow-xl hover:shadow-blue-100/60 transition-all hover:-translate-y-1">
                <div className="relative h-44 overflow-hidden">
                  <Image src={sede.img} alt={sede.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent" />
                  <span className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full bg-gradient-to-r ${sede.tagGradient} text-white shadow-sm`}>
                    {sede.tag}
                  </span>
                  <p className="absolute bottom-3 left-4 text-white font-bold text-sm">{sede.name}</p>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{sede.address}</p>
                      <p className="text-xs text-gray-400">{sede.district}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-500">{sede.hours}</p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                    <p className="text-xs text-gray-500">+51 958 173 765</p>
                  </div>
                  <a href={`https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 text-white text-xs font-semibold py-2.5 rounded-xl transition-opacity mt-1">
                    <WhatsAppIcon />
                    Consultar disponibilidad
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Contact bar */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex flex-wrap gap-6 justify-center sm:justify-start">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-600">contacto@medicareai.com</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-cyan-500" />
                <span className="text-sm text-gray-600">+51 958 173 765</span>
              </div>
            </div>
            <a href={`https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-opacity shrink-0 shadow-sm shadow-blue-200">
              <WhatsAppIcon />
              Escríbenos ahora
            </a>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-100 via-blue-50 to-cyan-50 pointer-events-none" />
        <div className="relative">
          <FaqSection />
        </div>
      </div>

      {/* ── CTA Banner ── */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />
          <div className="relative">
            <h2 className="text-3xl font-extrabold text-white mb-3">¿Listo para empezar?</h2>
            <p className="text-white/80 mb-8 text-base max-w-md mx-auto">Únete a MediCare AI y transforma la manera en que cuidas tu salud.</p>
            <Link href="/login"
              className="inline-flex items-center gap-2 bg-white text-blue-600 font-bold px-8 py-3.5 rounded-2xl hover:bg-blue-50 transition-colors text-sm shadow-lg">
              Crear cuenta gratis <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-blue-100 py-10 bg-gradient-to-b from-blue-50 to-cyan-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-2.5">
              <Image src="/medicare.png" alt="MediCare AI" width={28} height={28} className="rounded-lg" />
              <span className="font-bold text-gray-600 text-sm">Medicare<span className="text-blue-500">AI</span></span>
            </div>
            <div className="flex flex-wrap gap-6 justify-center">
              {[
                { label: "¿Por qué nosotros?", href: "#why" },
                { label: "La plataforma", href: "#app" },
                { label: "Comentarios", href: "#comments" },
                { label: "Sedes", href: "#location" },
                { label: "FAQ", href: "#faq" },
                { label: "Iniciar sesión", href: "/login" },
              ].map((l) => (
                <a key={l.label} href={l.href} className="text-xs text-gray-400 hover:text-blue-500 transition-colors">{l.label}</a>
              ))}
            </div>
          </div>
          <div className="border-t border-blue-50 pt-6 text-center">
            <p className="text-xs text-gray-400">© {new Date().getFullYear()} MediCare AI. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* ── WhatsApp Floating Button ── */}
      <a href={`https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`} target="_blank" rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-400/50 hover:shadow-blue-500/60 hover:scale-110 transition-all"
        aria-label="Contactar por WhatsApp">
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>

    </div>
  );
}
