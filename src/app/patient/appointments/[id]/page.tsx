import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, Stethoscope, Pill, ClipboardList, Calendar, Clock, Building2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function AppointmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const patient = await prisma.patient.findFirst({ where: { user: { email: session.user.email } } });
  if (!patient) redirect("/login");

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      doctor: {
        include: {
          user: { select: { name: true } },
          specialty: { select: { name: true } },
        },
      },
      office: { select: { number: true } },
      consultation: { include: { prescriptions: true } },
    },
  });

  if (!appointment || appointment.patientId !== patient.id) notFound();

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

  const c = appointment.consultation;

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="bg-white border-b border-gray-100 px-8 py-4">
        <Link href="/patient/appointments" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mb-2 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver a mis citas
        </Link>
        <div className="flex items-center gap-3">
          <Image src="/medicare.png" alt="MediCare AI" width={32} height={32} className="rounded-lg shrink-0" />
          <div>
            <h1 className="text-base font-bold text-gray-800">Detalle de cita</h1>
            <p className="text-xs text-gray-400">
              {new Date(appointment.date).toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
      </header>

      <main className="p-8 max-w-2xl flex flex-col gap-5">

        {/* Appointment info card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center text-cyan-700 text-lg font-bold shrink-0">
                {appointment.doctor.user.name?.charAt(0) ?? "D"}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">Dr. {appointment.doctor.user.name}</p>
                <p className="text-xs text-gray-400">{appointment.doctor.specialty.name}</p>
              </div>
            </div>
            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLES[appointment.status]}`}>
              {STATUS_LABELS[appointment.status]}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
              {new Date(appointment.date).toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" })}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-blue-400 shrink-0" />
              {appointment.startTime} – {appointment.endTime}
            </div>
            {appointment.office && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
                Consultorio {appointment.office.number}
              </div>
            )}
            {appointment.reason && (
              <div className="col-span-2 flex items-start gap-2 text-sm text-gray-600">
                <ClipboardList className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span><span className="font-medium text-gray-700">Motivo:</span> {appointment.reason}</span>
              </div>
            )}
          </div>
        </div>

        {/* Consultation details */}
        {c ? (
          <>
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Stethoscope className="w-4 h-4 text-blue-400" />
                <h2 className="text-sm font-bold text-gray-700">Resultado de la consulta</h2>
              </div>
              <div className="flex flex-col gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Motivo de consulta</p>
                  <p className="text-sm text-gray-700">{c.chiefComplaint}</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">Diagnóstico</p>
                  <p className="text-sm text-blue-800 font-medium">{c.diagnosis}</p>
                </div>
                {c.treatment && (
                  <div className="bg-emerald-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider mb-1">Tratamiento indicado</p>
                    <p className="text-sm text-emerald-800">{c.treatment}</p>
                  </div>
                )}
                {c.notes && (
                  <div className="bg-amber-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-amber-500 uppercase tracking-wider mb-1">Notas adicionales</p>
                    <p className="text-sm text-amber-800">{c.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {c.prescriptions.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Pill className="w-4 h-4 text-blue-400" />
                  <h2 className="text-sm font-bold text-gray-700">Receta médica</h2>
                  <span className="ml-auto text-xs text-gray-400">{c.prescriptions.length} medicamento{c.prescriptions.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="flex flex-col gap-3">
                  {c.prescriptions.map((p, i) => (
                    <div key={p.id} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                        <p className="text-sm font-bold text-gray-800">{p.medication}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-1.5">
                        {p.dosage && <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-0.5 rounded-full font-medium">{p.dosage}</span>}
                        {p.frequency && <span className="text-xs bg-violet-50 text-violet-600 border border-violet-100 px-2.5 py-0.5 rounded-full font-medium">{p.frequency}</span>}
                        {p.duration && <span className="text-xs bg-amber-50 text-amber-600 border border-amber-100 px-2.5 py-0.5 rounded-full font-medium">{p.duration}</span>}
                      </div>
                      {p.instructions && <p className="text-xs text-gray-500 italic">{p.instructions}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : appointment.status === "COMPLETED" ? (
          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-8 text-center">
            <ClipboardList className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">El médico aún no ha registrado los detalles de esta consulta</p>
          </div>
        ) : null}

      </main>
    </div>
  );
}
