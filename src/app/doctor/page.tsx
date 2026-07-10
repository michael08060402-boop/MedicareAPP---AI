import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CalendarDays, Clock, Stethoscope, ChevronRight } from "lucide-react";
import Link from "next/link";
import AppointmentStatusButtons from "./appointment-status-buttons";

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

function AppointmentRow({ a }: { a: {
  id: string;
  startTime: string;
  status: string;
  office: { number: string } | null;
  patient: { user: { name: string | null; email: string } };
  consultation: { id: string } | null;
} }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 md:px-6 py-4 hover:bg-gray-50/50 transition-colors gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-sm font-bold shrink-0">
          {a.patient.user.name?.charAt(0) ?? "?"}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">{a.patient.user.name}</p>
          <p className="text-xs text-gray-400">{a.patient.user.email}</p>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 flex-wrap">
        <div className="text-left sm:text-right">
          <p className="text-sm font-medium text-gray-700">{a.startTime}</p>
          {a.office && <p className="text-xs text-gray-400">Consultorio {a.office.number}</p>}
        </div>
        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLES[a.status]}`}>
          {STATUS_LABELS[a.status]}
        </span>
        <div className="flex items-center gap-2">
          {(a.status === "PENDING" || a.status === "CONFIRMED") && (
            <AppointmentStatusButtons appointmentId={a.id} status={a.status} />
          )}
          {a.status === "CONFIRMED" && !a.consultation && (
            <Link href={`/doctor/consultations/${a.id}`}
              className="text-xs font-semibold bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors whitespace-nowrap">
              Atender
            </Link>
          )}
          {a.consultation && (
            <Link href={`/doctor/consultations/${a.id}`}
              className="text-xs font-semibold text-blue-500 hover:underline whitespace-nowrap">
              Ver consulta
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default async function DoctorAgendaPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const doctor = await prisma.doctor.findFirst({
    where: { user: { email: session.user.email } },
    include: { specialty: { select: { name: true } } },
  });
  if (!doctor) redirect("/login");

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const tomorrowStart = new Date(todayEnd);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  tomorrowStart.setHours(0, 0, 0, 0);

  const include = {
    patient: { include: { user: { select: { name: true, email: true } } } },
    office: { select: { number: true } },
    consultation: { select: { id: true } },
  } as const;

  const [todayAppointments, upcomingAppointments] = await Promise.all([
    prisma.appointment.findMany({
      where: { doctorId: doctor.id, date: { gte: todayStart, lte: todayEnd } },
      include,
      orderBy: { startTime: "asc" },
    }),
    prisma.appointment.findMany({
      where: {
        doctorId: doctor.id,
        date: { gte: tomorrowStart },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      include,
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      take: 20,
    }),
  ]);

  const pendingCount = todayAppointments.filter((a) => a.status === "PENDING" || a.status === "CONFIRMED").length;
  const completedCount = todayAppointments.filter((a) => a.status === "COMPLETED").length;
  const todayLabel = new Date().toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" });

  // Group upcoming by date
  const upcomingByDate = upcomingAppointments.reduce<Record<string, typeof upcomingAppointments>>((acc, a) => {
    const key = new Date(a.date).toISOString().split("T")[0];
    if (!acc[key]) acc[key] = [];
    acc[key].push(a);
    return acc;
  }, {});

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="bg-white border-b border-gray-100 px-4 md:px-8 py-3 md:py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-gray-800">Agenda de hoy</h1>
          <p className="text-xs text-gray-400 capitalize">{todayLabel}</p>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <span className="text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-100 px-2 md:px-3 py-1.5 rounded-full">
            {pendingCount} por atender
          </span>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center text-cyan-700 text-sm font-bold">
            {session.user.name?.charAt(0) ?? "D"}
          </div>
        </div>
      </header>

      <main className="p-4 md:p-8 flex flex-col gap-6">

        {/* Doctor card */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-xs font-semibold uppercase tracking-widest mb-1">Bienvenido</p>
            <p className="text-white font-bold text-lg">Dr. {session.user.name}</p>
            <p className="text-blue-100 text-sm mt-0.5">{doctor.specialty.name}</p>
          </div>
          <div className="hidden sm:flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Quick counts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Citas de hoy",  value: todayAppointments.length, color: "text-blue-500",    bg: "bg-blue-50",    icon: CalendarDays },
            { label: "Por atender",   value: pendingCount,              color: "text-amber-500",   bg: "bg-amber-50",   icon: Clock },
            { label: "Completadas",   value: completedCount,            color: "text-emerald-500", bg: "bg-emerald-50", icon: CalendarDays },
          ].map(({ label, value, color, bg, icon: Icon }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-800">{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Today's appointments */}
        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="text-sm font-bold text-gray-700">Citas de hoy</h2>
          </div>
          {todayAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14">
              <CalendarDays className="w-10 h-10 text-gray-200 mb-3" />
              <p className="text-sm text-gray-400 font-medium">No tienes citas programadas para hoy</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {todayAppointments.map((a) => <AppointmentRow key={a.id} a={a} />)}
            </div>
          )}
        </div>

        {/* Upcoming appointments */}
        {Object.keys(upcomingByDate).length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-bold text-gray-700">Próximas citas</h2>
              <span className="ml-auto text-xs text-gray-400">{upcomingAppointments.length} pendiente{upcomingAppointments.length !== 1 ? "s" : ""}</span>
            </div>
            {Object.entries(upcomingByDate).map(([dateKey, appts]) => (
              <div key={dateKey}>
                <div className="px-6 py-2 bg-gray-50/70 border-b border-gray-50">
                  <p className="text-xs font-bold text-gray-500 capitalize">
                    {new Date(dateKey + "T12:00:00").toLocaleDateString("es", {
                      weekday: "long", day: "numeric", month: "long",
                    })}
                  </p>
                </div>
                <div className="divide-y divide-gray-50">
                  {appts.map((a) => <AppointmentRow key={a.id} a={a} />)}
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
