import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { FileText, Stethoscope, Pill, Calendar, User } from "lucide-react";
import PatientTopbar from "@/components/patient/topbar";

export default async function PatientPrescriptionsPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const patient = await prisma.patient.findFirst({
    where: { user: { email: session.user.email } },
    include: {
      clinicalHistories: {
        include: {
          consultations: {
            where: { prescriptions: { some: {} } },
            include: {
              prescriptions: true,
              doctor: {
                include: {
                  user: { select: { name: true } },
                  specialty: { select: { name: true } },
                },
              },
              appointment: { select: { date: true } },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  if (!patient) redirect("/login");

  const consultations = patient.clinicalHistories.flatMap((h) => h.consultations);
  const totalPrescriptions = consultations.reduce((acc, c) => acc + c.prescriptions.length, 0);

  return (
    <div className="flex-1 overflow-y-auto">
      <PatientTopbar
        title="Mis recetas"
        subtitle={
          totalPrescriptions === 0
            ? "Sin recetas emitidas aún"
            : `${totalPrescriptions} medicamento${totalPrescriptions !== 1 ? "s" : ""} en ${consultations.length} receta${consultations.length !== 1 ? "s" : ""}`
        }
      />

      <main className="p-4 md:p-8">
        {consultations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-24">
            <FileText className="w-12 h-12 text-gray-200 mb-3" />
            <p className="text-sm text-gray-400 font-medium">Sin recetas emitidas aún</p>
            <p className="text-xs text-gray-300 mt-1">Tus recetas médicas aparecerán aquí tras una consulta</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {consultations.map((c) => (
              <div key={c.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">Receta médica</p>
                      <p className="text-blue-100 text-xs">{c.diagnosis}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 text-blue-100 text-xs mb-0.5">
                      <Calendar className="w-3 h-3" />
                      {new Date(c.appointment.date).toLocaleDateString("es", {
                        day: "2-digit", month: "long", year: "numeric",
                      })}
                    </div>
                    <div className="flex items-center gap-1.5 text-blue-100 text-xs">
                      <User className="w-3 h-3" />
                      Dr. {c.doctor.user.name}
                    </div>
                  </div>
                </div>

                {/* Doctor info strip */}
                <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-50 bg-gray-50/50">
                  <Stethoscope className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-xs text-gray-500">
                    <span className="font-semibold text-gray-700">Dr. {c.doctor.user.name}</span>
                    {" · "}{c.doctor.specialty.name}
                  </span>
                </div>

                {/* Medications */}
                <div className="divide-y divide-gray-50">
                  {c.prescriptions.map((p, idx) => (
                    <div key={p.id} className="px-6 py-4 flex items-start gap-4">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                        <Pill className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-bold text-gray-800">{p.medication}</p>
                          <span className="text-xs text-gray-400 shrink-0">#{idx + 1}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1.5">
                          {p.dosage && (
                            <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-0.5 rounded-full font-medium">
                              {p.dosage}
                            </span>
                          )}
                          {p.frequency && (
                            <span className="text-xs bg-violet-50 text-violet-600 border border-violet-100 px-2.5 py-0.5 rounded-full font-medium">
                              {p.frequency}
                            </span>
                          )}
                          {p.duration && (
                            <span className="text-xs bg-amber-50 text-amber-600 border border-amber-100 px-2.5 py-0.5 rounded-full font-medium">
                              {p.duration}
                            </span>
                          )}
                        </div>
                        {p.instructions && (
                          <p className="text-xs text-gray-500 mt-1.5 italic">📝 {p.instructions}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                {c.treatment && (
                  <div className="px-6 py-3 border-t border-gray-50 bg-emerald-50/50">
                    <p className="text-xs text-emerald-700">
                      <span className="font-semibold">Tratamiento adicional:</span> {c.treatment}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
