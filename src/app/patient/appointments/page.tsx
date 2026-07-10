import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CalendarDays } from "lucide-react";
import Link from "next/link";
import CancelButton from "./cancel-button";
import PatientTopbar from "@/components/patient/topbar";

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

export default async function PatientAppointmentsPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const patient = await prisma.patient.findFirst({
    where: { user: { email: session.user.email } },
    include: {
      appointments: {
        include: {
          doctor: { include: { user: { select: { name: true } }, specialty: { select: { name: true } } } },
          office: { select: { number: true } },
          consultation: { select: { id: true } },
        },
        orderBy: { date: "desc" },
      },
    },
  });

  if (!patient) redirect("/login");

  return (
    <div className="flex-1 overflow-y-auto">
      <PatientTopbar
        title="Mis citas"
        subtitle={`${patient.appointments.length} citas registradas`}
        right={
          <Link href="/patient/book"
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm shadow-blue-200 hover:opacity-90 transition-opacity">
            + Agendar cita
          </Link>
        }
      />

      <main className="p-4 md:p-8">
        <div className="bg-white rounded-2xl border border-gray-100">
          {patient.appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <CalendarDays className="w-12 h-12 text-gray-200 mb-3" />
              <p className="text-sm text-gray-400 font-medium">No tienes citas registradas</p>
              <Link href="/patient/book" className="mt-3 text-sm text-blue-500 font-semibold hover:underline">
                Agenda tu primera cita
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {patient.appointments.map((a) => {
                const canCancel = a.status === "PENDING" || a.status === "CONFIRMED";
                const canView = a.status === "COMPLETED";
                return (
                  <div key={a.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 md:px-6 py-4 hover:bg-gray-50/50 transition-colors gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center text-cyan-700 text-sm font-bold shrink-0">
                        {a.doctor.user.name?.charAt(0) ?? "D"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800">Dr. {a.doctor.user.name}</p>
                        <p className="text-xs text-gray-400">{a.doctor.specialty.name}</p>
                        {a.office && <p className="text-xs text-gray-300">Consultorio {a.office.number}</p>}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <div className="text-left sm:text-right">
                        <p className="text-sm font-medium text-gray-700">
                          {new Date(a.date).toLocaleDateString("es", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                        </p>
                        <p className="text-xs text-gray-400 mb-1">{a.startTime}</p>
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_STYLES[a.status]}`}>
                          {STATUS_LABELS[a.status]}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {canView && (
                          <Link href={`/patient/appointments/${a.id}`}
                            className="text-xs font-semibold text-blue-500 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap">
                            Ver consulta
                          </Link>
                        )}
                        {canCancel && <CancelButton appointmentId={a.id} />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
