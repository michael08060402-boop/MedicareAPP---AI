import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, ClipboardList, FileText } from "lucide-react";
import Link from "next/link";

const BLOOD_LABELS: Record<string, string> = {
  A_POSITIVE: "A+", A_NEGATIVE: "A-", B_POSITIVE: "B+", B_NEGATIVE: "B-",
  AB_POSITIVE: "AB+", AB_NEGATIVE: "AB-", O_POSITIVE: "O+", O_NEGATIVE: "O-", UNKNOWN: "—",
};

export default async function DoctorPatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const doctor = await prisma.doctor.findFirst({ where: { user: { email: session.user.email } } });
  if (!doctor) redirect("/login");

  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      clinicalHistories: {
        include: {
          consultations: {
            where: { doctorId: doctor.id },
            include: { prescriptions: true },
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  if (!patient) notFound();

  const consultations = patient.clinicalHistories.flatMap((h) => h.consultations);

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="bg-white border-b border-gray-100 px-8 py-4">
        <Link href="/doctor/patients" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mb-2 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver a pacientes
        </Link>
        <h1 className="text-base font-bold text-gray-800">{patient.user.name}</h1>
        <p className="text-xs text-gray-400">{patient.user.email}</p>
      </header>

      <main className="p-8">

        {/* Patient summary */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 grid sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">Tipo de sangre</p>
            <span className="text-sm font-bold text-red-500 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full">
              {BLOOD_LABELS[patient.bloodType]}
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Teléfono</p>
            <p className="text-sm font-medium text-gray-700">{patient.phone ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Alergias</p>
            <p className="text-sm font-medium text-gray-700">
              {patient.allergies.length > 0 ? patient.allergies.join(", ") : "Ninguna registrada"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Contacto de emergencia</p>
            <p className="text-sm font-medium text-gray-700">{patient.emergencyName ?? "—"}</p>
          </div>
        </div>

        {/* Clinical history */}
        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-50">
            <ClipboardList className="w-4 h-4 text-violet-400" />
            <h2 className="text-sm font-bold text-gray-700">Historial clínico (mis consultas)</h2>
          </div>

          {consultations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <ClipboardList className="w-10 h-10 text-gray-200 mb-3" />
              <p className="text-sm text-gray-400">Aún no has registrado consultas con este paciente</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {consultations.map((c) => (
                <div key={c.id} className="px-6 py-5">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      {new Date(c.createdAt).toLocaleDateString("es", { day: "2-digit", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 mb-1">{c.chiefComplaint}</p>
                  <p className="text-sm text-gray-600 mb-2"><span className="font-medium text-gray-700">Diagnóstico:</span> {c.diagnosis}</p>
                  {c.treatment && (
                    <p className="text-sm text-gray-600 mb-2"><span className="font-medium text-gray-700">Tratamiento:</span> {c.treatment}</p>
                  )}
                  {c.prescriptions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {c.prescriptions.map((p) => (
                        <span key={p.id} className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-600 border border-emerald-100 px-2.5 py-1 rounded-full font-medium">
                          <FileText className="w-3 h-3" />
                          {p.medication} · {p.dosage}
                        </span>
                      ))}
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
