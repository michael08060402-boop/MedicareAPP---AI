import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ClipboardList } from "lucide-react";
import PatientTopbar from "@/components/patient/topbar";

export default async function PatientHistoryPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const patient = await prisma.patient.findFirst({
    where: { user: { email: session.user.email } },
    include: {
      clinicalHistories: {
        include: {
          consultations: {
            include: {
              doctor: { include: { user: { select: { name: true } }, specialty: { select: { name: true } } } },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  if (!patient) redirect("/login");

  const consultations = patient.clinicalHistories.flatMap((h) => h.consultations);

  return (
    <div className="flex-1 overflow-y-auto">
      <PatientTopbar title="Mi historial clínico" subtitle={`${consultations.length} consultas registradas`} />

      <main className="p-4 md:p-8">
        <div className="bg-white rounded-2xl border border-gray-100">
          {consultations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <ClipboardList className="w-12 h-12 text-gray-200 mb-3" />
              <p className="text-sm text-gray-400 font-medium">Sin historial clínico aún</p>
              <p className="text-xs text-gray-300 mt-1">Tus consultas aparecerán aquí después de cada cita</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {consultations.map((c) => (
                <div key={c.id} className="px-6 py-5 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Dr. {c.doctor.user.name}</p>
                      <p className="text-xs text-gray-400">{c.doctor.specialty.name}</p>
                    </div>
                    <p className="text-xs text-gray-400">
                      {new Date(c.createdAt).toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  {c.diagnosis && (
                    <div className="mt-2">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Diagnóstico</span>
                      <p className="text-sm text-gray-700 mt-0.5">{c.diagnosis}</p>
                    </div>
                  )}
                  {c.notes && (
                    <div className="mt-2">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notas</span>
                      <p className="text-sm text-gray-600 mt-0.5">{c.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
