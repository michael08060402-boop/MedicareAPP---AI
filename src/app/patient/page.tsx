import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CalendarDays, FileText, Clock, CheckCircle2, CalendarPlus } from "lucide-react";
import Link from "next/link";

const STATUS_STYLES: Record<string, string> = {
  PENDING:   "bg-amber-50 text-amber-600 border-amber-100",
  CONFIRMED: "bg-blue-50 text-blue-600 border-blue-100",
  COMPLETED: "bg-emerald-50 text-emerald-600 border-emerald-100",
  CANCELLED: "bg-red-50 text-red-500 border-red-100",
  NO_SHOW:   "bg-gray-50 text-gray-500 border-gray-100",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente", CONFIRMED: "Confirmada",
  COMPLETED: "Completada", CANCELLED: "Cancelada", NO_SHOW: "No asistió",
};

export default async function PatientHomePage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const patient = await prisma.patient.findFirst({
    where: { user: { email: session.user.email } },
    include: {
      appointments: {
        include: {
          doctor: { include: { user: { select: { name: true } }, specialty: { select: { name: true } } } },
          office: { select: { number: true } },
        },
        orderBy: { date: "asc" },
        take: 5,
      },
    },
  });

  if (!patient) redirect("/login");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = patient.appointments.filter(
    (a) => new Date(a.date) >= today && a.status !== "CANCELLED"
  );
  const past = patient.appointments.filter(
    (a) => new Date(a.date) < today || a.status === "COMPLETED"
  );
  const nextAppointment = upcoming[0] ?? null;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Buenos días";
    if (h < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Topbar */}
      <header className="bg-white border-b border-gray-100 px-4 md:px-8 py-3 md:py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-gray-800">{greeting()}, {session.user.name?.split(" ")[0]}</h1>
          <p className="text-xs text-gray-400">Portal del paciente</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center text-blue-600 text-sm font-bold">
          {session.user.name?.charAt(0) ?? "P"}
        </div>
      </header>

      <main className="p-4 md:p-8">

        {/* Next appointment banner */}
        {nextAppointment ? (
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-5 md:p-6 mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-blue-100 text-xs font-semibold uppercase tracking-widest mb-1">Próxima cita</p>
              <p className="text-white font-bold text-lg">
                {new Date(nextAppointment.date).toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" })}
              </p>
              <p className="text-blue-100 text-sm mt-0.5">
                {nextAppointment.startTime} · Dr. {nextAppointment.doctor.user.name} · {nextAppointment.doctor.specialty.name}
              </p>
              {nextAppointment.office && (
                <p className="text-blue-200 text-xs mt-0.5">Consultorio {nextAppointment.office.number}</p>
              )}
            </div>
            <div className="hidden sm:flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20">
              <CalendarDays className="w-8 h-8 text-white" />
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-2xl p-6 mb-6 flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-700 mb-1">No tienes citas próximas</p>
              <p className="text-sm text-gray-400">Agenda una cita con tu médico de preferencia</p>
            </div>
            <Link href="/patient/book"
              className="flex items-center gap-2 bg-blue-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-blue-600 transition-colors">
              <CalendarPlus className="w-4 h-4" />
              Agendar
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon: CalendarDays, label: "Citas próximas", value: upcoming.length, color: "text-blue-500", bg: "bg-blue-50" },
            { icon: CheckCircle2, label: "Citas completadas", value: past.length, color: "text-emerald-500", bg: "bg-emerald-50" },
            { icon: Clock, label: "Total de citas", value: patient.appointments.length, color: "text-violet-500", bg: "bg-violet-50" },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-800">{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Recent appointments */}
        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h2 className="text-sm font-bold text-gray-700">Mis citas recientes</h2>
            <Link href="/patient/appointments" className="text-xs text-blue-500 hover:underline font-medium">Ver todas</Link>
          </div>

          {patient.appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14">
              <CalendarDays className="w-10 h-10 text-gray-200 mb-3" />
              <p className="text-sm text-gray-400">No tienes citas registradas</p>
              <Link href="/patient/book" className="mt-3 text-xs text-blue-500 font-semibold hover:underline">
                Agenda tu primera cita
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {patient.appointments.slice(0, 4).map((a) => (
                <div key={a.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center text-cyan-700 text-xs font-bold shrink-0">
                      {a.doctor.user.name?.charAt(0) ?? "D"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">Dr. {a.doctor.user.name}</p>
                      <p className="text-xs text-gray-400">{a.doctor.specialty.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-gray-600">
                      {new Date(a.date).toLocaleDateString("es", { day: "2-digit", month: "short" })} · {a.startTime}
                    </p>
                    <span className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${STATUS_STYLES[a.status]}`}>
                      {STATUS_LABELS[a.status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          <Link href="/patient/history"
            className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 hover:border-blue-100 hover:shadow-sm transition-all group">
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Mi historial</p>
              <p className="text-xs text-gray-400">Consultas y diagnósticos</p>
            </div>
          </Link>
          <Link href="/patient/prescriptions"
            className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 hover:border-blue-100 hover:shadow-sm transition-all group">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Mis recetas</p>
              <p className="text-xs text-gray-400">Medicamentos y dosis</p>
            </div>
          </Link>
        </div>

      </main>
    </div>
  );
}

function ClipboardList({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  );
}
