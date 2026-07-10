import AdminTopbar from "@/components/admin/topbar";
import { prisma } from "@/lib/prisma";
import { CalendarDays } from "lucide-react";
import Link from "next/link";
import NewAppointmentButton from "./new-appointment-button";
import AppointmentActions from "./appointment-actions";

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

const FILTERS = [
  { label: "Todas",      value: "" },
  { label: "Pendiente",  value: "PENDING" },
  { label: "Confirmada", value: "CONFIRMED" },
  { label: "Completada", value: "COMPLETED" },
  { label: "Cancelada",  value: "CANCELLED" },
  { label: "No asistió", value: "NO_SHOW" },
];

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeFilter = FILTERS.find((f) => f.value === (status ?? "")) ? (status ?? "") : "";

  const [appointments, patients, doctors, offices] = await Promise.all([
    prisma.appointment.findMany({
      where: activeFilter ? { status: activeFilter as never } : {},
      include: {
        patient: { include: { user: { select: { name: true, email: true } } } },
        doctor: { include: { user: { select: { name: true } }, specialty: { select: { name: true } } } },
        office: { select: { number: true } },
        consultation: { select: { id: true } },
      },
      orderBy: { date: "desc" },
      take: 100,
    }),
    prisma.patient.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.doctor.findMany({
      where: { isActive: true },
      include: { user: { select: { name: true } }, specialty: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.office.findMany({ where: { isActive: true }, select: { id: true, number: true }, orderBy: { number: "asc" } }),
  ]);

  const patientOptions = patients.map((p) => ({ id: p.id, name: p.user.name ?? "—", email: p.user.email }));
  const doctorOptions = doctors.map((d) => ({ id: d.id, name: d.user.name ?? "—", specialty: d.specialty.name }));

  return (
    <div className="flex-1 overflow-y-auto">
      <AdminTopbar title="Citas" />
      <main className="p-4 md:p-8">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Todas las citas</h2>
            <p className="text-sm text-gray-400">{appointments.length} registros</p>
          </div>
          <NewAppointmentButton patients={patientOptions} doctors={doctorOptions} offices={offices} />
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {FILTERS.map((f) => {
            const isActive = f.value === activeFilter;
            const href = f.value ? `/admin/appointments?status=${f.value}` : "/admin/appointments";
            return (
              <Link key={f.value} href={href}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-500"
                }`}>
                {f.label}
              </Link>
            );
          })}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100">
          {appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <CalendarDays className="w-12 h-12 text-gray-200 mb-3" />
              <p className="text-sm font-medium text-gray-400">No hay citas con este filtro</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50">
                    {["Paciente", "Médico", "Especialidad", "Consultorio", "Fecha", "Hora", "Estado", ""].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {appointments.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-xs font-bold shrink-0">
                            {a.patient.user.name?.charAt(0) ?? "?"}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{a.patient.user.name}</p>
                            <p className="text-xs text-gray-400">{a.patient.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{a.doctor.user.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{a.doctor.specialty.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{a.office?.number ?? "—"}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(a.date).toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-700">{a.startTime}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLES[a.status]}`}>
                          {STATUS_LABELS[a.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <AppointmentActions appt={{
                          id: a.id,
                          patientName: a.patient.user.name ?? "—",
                          status: a.status,
                          hasConsultation: !!a.consultation,
                        }} />
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
