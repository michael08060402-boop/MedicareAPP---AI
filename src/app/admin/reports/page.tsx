import AdminTopbar from "@/components/admin/topbar";
import { prisma } from "@/lib/prisma";
import { BarChart2, TrendingUp, Users, CalendarCheck, Stethoscope } from "lucide-react";

export default async function ReportsPage() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [
    totalPatients,
    totalDoctors,
    totalAppointments,
    completedAppointments,
    cancelledAppointments,
    byStatus,
    bySpecialty,
    byMonth,
  ] = await Promise.all([
    prisma.patient.count(),
    prisma.doctor.count({ where: { isActive: true } }),
    prisma.appointment.count(),
    prisma.appointment.count({ where: { status: "COMPLETED" } }),
    prisma.appointment.count({ where: { status: "CANCELLED" } }),
    prisma.appointment.groupBy({ by: ["status"], _count: { id: true } }),
    prisma.appointment.groupBy({
      by: ["doctorId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    }),
    prisma.appointment.findMany({
      where: { date: { gte: startOfYear } },
      select: { date: true, status: true },
    }),
  ]);

  const completionRate = totalAppointments > 0
    ? Math.round((completedAppointments / totalAppointments) * 100)
    : 0;

  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const monthlyData: Record<number, number> = {};
  byMonth.forEach((a) => {
    const m = new Date(a.date).getMonth();
    monthlyData[m] = (monthlyData[m] ?? 0) + 1;
  });
  const maxMonthly = Math.max(...Object.values(monthlyData), 1);

  const statusLabels: Record<string, string> = {
    PENDING: "Pendiente", CONFIRMED: "Confirmada", COMPLETED: "Completada",
    CANCELLED: "Cancelada", NO_SHOW: "No asistió",
  };
  const statusColors: Record<string, string> = {
    PENDING: "bg-amber-400", CONFIRMED: "bg-blue-400",
    COMPLETED: "bg-emerald-400", CANCELLED: "bg-red-400", NO_SHOW: "bg-gray-300",
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <AdminTopbar title="Reportes" />
      <main className="p-4 md:p-8">

        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-800">Reportes generales</h2>
          <p className="text-sm text-gray-400">Resumen del año {now.getFullYear()}</p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Pacientes totales", value: totalPatients, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
            { label: "Médicos activos", value: totalDoctors, icon: Stethoscope, color: "text-cyan-600", bg: "bg-cyan-50" },
            { label: "Citas totales", value: totalAppointments, icon: CalendarCheck, color: "text-violet-500", bg: "bg-violet-50" },
            { label: "Tasa de completadas", value: `${completionRate}%`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-800">{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid xl:grid-cols-2 gap-6">
          {/* Monthly bar chart */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-5">
              <BarChart2 className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-gray-700">Citas por mes ({now.getFullYear()})</h3>
            </div>
            {Object.keys(monthlyData).length === 0 ? (
              <div className="h-40 flex items-center justify-center text-sm text-gray-300">Sin datos este año</div>
            ) : (
              <div className="flex items-end gap-1.5 h-40">
                {monthNames.map((name, i) => {
                  const count = monthlyData[i] ?? 0;
                  const height = maxMonthly > 0 ? Math.round((count / maxMonthly) * 100) : 0;
                  const isCurrentMonth = i === now.getMonth();
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs text-gray-400">{count > 0 ? count : ""}</span>
                      <div className="w-full relative" style={{ height: "100px" }}>
                        <div
                          className={`absolute bottom-0 w-full rounded-t-md transition-all ${isCurrentMonth ? "bg-blue-500" : "bg-blue-100"}`}
                          style={{ height: `${height}%`, minHeight: count > 0 ? "4px" : "0" }}
                        />
                      </div>
                      <span className="text-[9px] text-gray-400">{name}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Status breakdown */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-gray-700">Estado de citas</h3>
            </div>
            {byStatus.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-sm text-gray-300">Sin datos</div>
            ) : (
              <div className="flex flex-col gap-3">
                {byStatus.map((s) => {
                  const pct = totalAppointments > 0 ? Math.round((s._count.id / totalAppointments) * 100) : 0;
                  return (
                    <div key={s.status}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-600">{statusLabels[s.status] ?? s.status}</span>
                        <span className="text-xs text-gray-400">{s._count.id} ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${statusColors[s.status] ?? "bg-gray-300"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
