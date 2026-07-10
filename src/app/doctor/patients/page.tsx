import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import Link from "next/link";
import DoctorTopbar from "@/components/doctor/topbar";

const BLOOD_LABELS: Record<string, string> = {
  A_POSITIVE: "A+", A_NEGATIVE: "A-", B_POSITIVE: "B+", B_NEGATIVE: "B-",
  AB_POSITIVE: "AB+", AB_NEGATIVE: "AB-", O_POSITIVE: "O+", O_NEGATIVE: "O-", UNKNOWN: "—",
};

export default async function DoctorPatientsPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const doctor = await prisma.doctor.findFirst({ where: { user: { email: session.user.email } } });
  if (!doctor) redirect("/login");

  const appointments = await prisma.appointment.findMany({
    where: { doctorId: doctor.id },
    select: {
      patientId: true,
      date: true,
      patient: {
        select: {
          id: true, bloodType: true, phone: true,
          user: { select: { name: true, email: true } },
        },
      },
    },
    orderBy: { date: "desc" },
  });

  const seen = new Map<string, { patient: typeof appointments[number]["patient"]; count: number; lastVisit: Date }>();
  for (const a of appointments) {
    const existing = seen.get(a.patientId);
    if (existing) {
      existing.count += 1;
    } else {
      seen.set(a.patientId, { patient: a.patient, count: 1, lastVisit: a.date });
    }
  }
  const patients = Array.from(seen.values());

  return (
    <div className="flex-1 overflow-y-auto">
      <DoctorTopbar title="Mis pacientes" subtitle={`${patients.length} pacientes atendidos`} />

      <main className="p-4 md:p-8">
        <div className="bg-white rounded-2xl border border-gray-100">
          {patients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Users className="w-12 h-12 text-gray-200 mb-3" />
              <p className="text-sm text-gray-400 font-medium">Aún no tienes pacientes asignados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50">
                    {["Paciente", "Contacto", "Sangre", "Citas", "Última visita", ""].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {patients.map(({ patient, count, lastVisit }) => (
                    <tr key={patient.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center text-blue-600 text-sm font-bold shrink-0">
                            {patient.user.name?.charAt(0) ?? "?"}
                          </div>
                          <p className="text-sm font-semibold text-gray-800">{patient.user.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{patient.phone ?? patient.user.email}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-red-500 bg-red-50 border border-red-100 px-2 py-1 rounded-full">
                          {BLOOD_LABELS[patient.bloodType]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{count}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(lastVisit).toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/doctor/patients/${patient.id}`} className="text-xs font-semibold text-blue-500 hover:underline">
                          Ver historial
                        </Link>
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
