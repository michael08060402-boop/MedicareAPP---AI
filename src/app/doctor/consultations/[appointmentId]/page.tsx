import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import ConsultationForm from "./consultation-form";

export default async function ConsultationPage({ params }: { params: Promise<{ appointmentId: string }> }) {
  const { appointmentId } = await params;
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const doctor = await prisma.doctor.findFirst({ where: { user: { email: session.user.email } } });
  if (!doctor) redirect("/login");

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      patient: { include: { user: { select: { name: true, email: true } } } },
      consultation: { include: { prescriptions: true } },
    },
  });

  if (!appointment || appointment.doctorId !== doctor.id) notFound();

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="bg-white border-b border-gray-100 px-8 py-4">
        <Link href="/doctor" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mb-2 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver a la agenda
        </Link>
        <h1 className="text-base font-bold text-gray-800">Consulta — {appointment.patient.user.name}</h1>
        <p className="text-xs text-gray-400">
          {new Date(appointment.date).toLocaleDateString("es", { day: "2-digit", month: "long", year: "numeric" })} · {appointment.startTime}
        </p>
      </header>

      <main className="p-8 max-w-2xl">
        {appointment.consultation ? (
          <div className="flex flex-col gap-5">
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 text-sm text-emerald-600 font-medium">
              Esta consulta ya fue registrada.
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="text-sm font-bold text-gray-700 mb-4">Datos de la consulta</h3>
              <div className="flex flex-col gap-3 text-sm">
                <p><span className="font-medium text-gray-700">Motivo:</span> <span className="text-gray-600">{appointment.consultation.chiefComplaint}</span></p>
                <p><span className="font-medium text-gray-700">Diagnóstico:</span> <span className="text-gray-600">{appointment.consultation.diagnosis}</span></p>
                {appointment.consultation.treatment && (
                  <p><span className="font-medium text-gray-700">Tratamiento:</span> <span className="text-gray-600">{appointment.consultation.treatment}</span></p>
                )}
                {appointment.consultation.notes && (
                  <p><span className="font-medium text-gray-700">Notas:</span> <span className="text-gray-600">{appointment.consultation.notes}</span></p>
                )}
              </div>
            </div>

            {appointment.consultation.prescriptions.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="text-sm font-bold text-gray-700 mb-4">Recetas emitidas</h3>
                <div className="flex flex-col gap-3">
                  {appointment.consultation.prescriptions.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                      <FileText className="w-4 h-4 text-emerald-500 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{p.medication}</p>
                        <p className="text-xs text-gray-500">{p.dosage} · {p.frequency} · {p.duration}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <ConsultationForm appointmentId={appointment.id} />
        )}
      </main>
    </div>
  );
}
