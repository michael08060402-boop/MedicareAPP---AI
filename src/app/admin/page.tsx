import AdminTopbar from "@/components/admin/topbar";
import { Users, Stethoscope, CalendarDays, CheckCircle2, TrendingUp, Clock } from "lucide-react";
import AppointmentsChart from "@/components/admin/appointments-chart";
import SpecialtiesChart from "@/components/admin/specialties-chart";
import { prisma } from "@/lib/prisma";

async function getDashboardData() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    totalPatients,
    totalDoctors,
    todayAppointments,
    completedMonth,
    completedLastMonth,
    pendingToday,
    recentAppointments,
    avgAttendance,
    newPatientsMonth,
    officesTotal,
    officesOccupied,
    appointmentsByMonth,
    topSpecialties,
  ] = await Promise.all([
    prisma.patient.count(),
    prisma.doctor.count({ where: { isActive: true } }),
    prisma.appointment.count({ where: { date: { gte: startOfDay, lt: endOfDay } } }),
    prisma.appointment.count({ where: { status: "COMPLETED", date: { gte: startOfMonth } } }),
    prisma.appointment.count({ where: { status: "COMPLETED", date: { gte: startOfLastMonth, lt: startOfMonth } } }),
    prisma.appointment.count({ where: { status: "PENDING", date: { gte: startOfDay, lt: endOfDay } } }),
    prisma.appointment.findMany({
      where: { date: { gte: startOfDay, lt: endOfDay } },
      include: {
        patient: { include: { user: { select: { name: true } } } },
        doctor: { include: { user: { select: { name: true } }, specialty: { select: { name: true } } } },
      },
      orderBy: { startTime: "asc" },
      take: 8,
    }),
    prisma.appointment.count({ where: { status: { not: "CANCELLED" }, date: { gte: startOfMonth } } }),
    prisma.patient.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.office.count(),
    prisma.office.count({ where: { isActive: true } }),
    // Appointments grouped by month (last 6 months)
    Promise.all(
      Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
        return prisma.appointment.count({ where: { date: { gte: d, lt: end } } }).then((count) => ({
          month: d.toLocaleString("es", { month: "short" }),
          citas: count,
        }));
      })
    ),
    // Top specialties
    prisma.specialty.findMany({
      include: { _count: { select: { doctors: true } } },
      orderBy: { doctors: { _count: "desc" } },
      take: 5,
    }),
  ]);

  const attendanceRate = avgAttendance > 0
    ? Math.round((completedMonth / avgAttendance) * 100)
    : 0;

  const monthChange = completedLastMonth > 0
    ? Math.round(((completedMonth - completedLastMonth) / completedLastMonth) * 100)
    : 0;

  return {
    totalPatients,
    totalDoctors,
    todayAppointments,
    completedMonth,
    pendingToday,
    recentAppointments,
    attendanceRate,
    newPatientsMonth,
    officesTotal,
    officesOccupied,
    appointmentsByMonth,
    topSpecialties,
    monthChange,
  };
}

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

export default async function AdminDashboard() {
  const d = await getDashboardData();

  const STATS = [
    { label: "Total pacientes", value: d.totalPatients.toLocaleString(), change: `+${d.newPatientsMonth} este mes`, up: true, icon: Users, bg: "bg-blue-50", text: "text-blue-600" },
    { label: "Médicos activos", value: d.totalDoctors.toString(), change: `${d.totalDoctors} registrados`, up: true, icon: Stethoscope, bg: "bg-cyan-50", text: "text-cyan-600" },
    { label: "Citas hoy", value: d.todayAppointments.toString(), change: `${d.pendingToday} pendientes`, up: false, icon: CalendarDays, bg: "bg-violet-50", text: "text-violet-600" },
    { label: "Completadas / mes", value: d.completedMonth.toString(), change: d.monthChange >= 0 ? `+${d.monthChange}% vs anterior` : `${d.monthChange}% vs anterior`, up: d.monthChange >= 0, icon: CheckCircle2, bg: "bg-emerald-50", text: "text-emerald-600" },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <AdminTopbar title="Dashboard" />
      <main className="p-4 md:p-8 space-y-8">

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {STATS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${s.text}`} />
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-medium ${s.up ? "text-emerald-500" : "text-amber-500"}`}>
                    <TrendingUp className="w-3 h-3" />
                    {s.change}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-400 mt-0.5">{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-bold text-gray-800">Citas por mes</h2>
                <p className="text-xs text-gray-400 mt-0.5">Últimos 6 meses</p>
              </div>
              <span className="text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1 rounded-full">
                {new Date().getFullYear()}
              </span>
            </div>
            <AppointmentsChart data={d.appointmentsByMonth} />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="mb-6">
              <h2 className="font-bold text-gray-800">Especialidades</h2>
              <p className="text-xs text-gray-400 mt-0.5">Más registradas</p>
            </div>
            <SpecialtiesChart data={d.topSpecialties.map((s) => ({ name: s.name, value: s._count.doctors }))} />
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
          {[
            { label: "Tasa de asistencia", value: `${d.attendanceRate}%`, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
            { label: "Nuevos pacientes (mes)", value: d.newPatientsMonth.toString(), icon: Users, color: "text-violet-500", bg: "bg-violet-50" },
            { label: "Total consultorios", value: d.officesTotal.toString(), icon: CalendarDays, color: "text-cyan-500", bg: "bg-cyan-50" },
            { label: "Citas pendientes hoy", value: d.pendingToday.toString(), icon: Clock, color: "text-blue-500", bg: "bg-blue-50" },
          ].map((q) => {
            const Icon = q.icon;
            return (
              <div key={q.label} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl ${q.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${q.color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{q.value}</p>
                  <p className="text-xs text-gray-400 leading-tight mt-0.5">{q.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Appointments table */}
        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
            <div>
              <h2 className="font-bold text-gray-800">Citas de hoy</h2>
              <p className="text-xs text-gray-400 mt-0.5">{d.todayAppointments} citas programadas</p>
            </div>
          </div>

          {d.recentAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <CalendarDays className="w-10 h-10 text-gray-200 mb-3" />
              <p className="text-sm font-medium text-gray-400">No hay citas para hoy</p>
              <p className="text-xs text-gray-300 mt-1">Las citas agendadas aparecerán aquí</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50">
                    {["Paciente", "Médico", "Especialidad", "Hora", "Estado"].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {d.recentAppointments.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center text-blue-600 text-xs font-bold shrink-0">
                            {a.patient.user.name?.charAt(0) ?? "?"}
                          </div>
                          <span className="text-sm font-medium text-gray-800">{a.patient.user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{a.doctor.user.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{a.doctor.specialty.name}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-700">{a.startTime}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLES[a.status]}`}>
                          {STATUS_LABELS[a.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
