import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ClipboardList } from "lucide-react";
import Link from "next/link";
import DoctorTopbar from "@/components/doctor/topbar";

export default async function DoctorHistoryPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const doctor = await prisma.doctor.findFirst({ where: { user: { email: session.user.email } } });
  if (!doctor) redirect("/login");

  const consultations = await prisma.consultation.findMany({
    where: { doctorId: doctor.id },
    include: {
      clinicalHistory: { include: { patient: { include: { user: { select: { name: true, email: true } } } } } },
      prescriptions: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex-1 overflow-y-auto">
      <DoctorTopbar title="Historial clínico" subtitle={`${consultations.length} consultas registradas por ti`} />

      <main className="p-4 md:p-8">
        <div className="bg-white rounded-2xl border border-gray-100">
          {consultations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <ClipboardList className="w-12 h-12 text-gray-200 mb-3" />
              <p className="text-sm text-gray-400 font-medium">Aún no has registrado consultas</p>
              <p className="text-xs text-gray-300 mt-1">Atiende una cita desde la agenda para crear tu primera consulta</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {consultations.map((c) => (
                <div key={c.id} className="flex items-start justify-between px-6 py-5 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center text-blue-600 text-sm font-bold shrink-0">
                      {c.clinicalHistory.patient.user.name?.charAt(0) ?? "?"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{c.clinicalHistory.patient.user.name}</p>
                      <p className="text-xs text-gray-400 mb-1">{c.chiefComplaint}</p>
                      <p className="text-sm text-gray-600"><span className="font-medium text-gray-700">Diagnóstico:</span> {c.diagnosis}</p>
                      {c.prescriptions.length > 0 && (
                        <p className="text-xs text-emerald-600 mt-1">{c.prescriptions.length} receta(s) emitida(s)</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-400 mb-1">
                      {new Date(c.createdAt).toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                    <Link href={`/doctor/patients/${c.clinicalHistory.patient.id}`} className="text-xs font-semibold text-blue-500 hover:underline">
                      Ver paciente
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
