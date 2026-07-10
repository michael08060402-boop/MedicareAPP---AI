import AdminTopbar from "@/components/admin/topbar";
import { prisma } from "@/lib/prisma";
import { Users } from "lucide-react";
import NewPatientButton from "./new-patient-button";
import TogglePatientStatus from "./toggle-patient-status";

const BLOOD_LABELS: Record<string, string> = {
  A_POSITIVE: "A+", A_NEGATIVE: "A-", B_POSITIVE: "B+", B_NEGATIVE: "B-",
  AB_POSITIVE: "AB+", AB_NEGATIVE: "AB-", O_POSITIVE: "O+", O_NEGATIVE: "O-", UNKNOWN: "—",
};

export default async function PatientsPage() {
  const patients = await prisma.patient.findMany({
    include: {
      user: { select: { name: true, email: true, isActive: true, createdAt: true } },
      _count: { select: { appointments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex-1 overflow-y-auto">
      <AdminTopbar title="Pacientes" />
      <main className="p-4 md:p-8">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Pacientes registrados</h2>
            <p className="text-sm text-gray-400">{patients.length} pacientes en total</p>
          </div>
          <NewPatientButton />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100">
          {patients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Users className="w-12 h-12 text-gray-200 mb-3" />
              <p className="text-sm font-medium text-gray-400">No hay pacientes registrados</p>
              <p className="text-xs text-gray-300 mt-1">Los pacientes aparecerán aquí cuando se registren</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50">
                    {["Paciente", "Contacto", "Sangre", "Citas", "Registro", "Estado"].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {patients.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center text-blue-600 text-sm font-bold shrink-0">
                            {p.user.name?.charAt(0) ?? "?"}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{p.user.name}</p>
                            <p className="text-xs text-gray-400">{p.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{p.phone ?? "—"}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-red-500 bg-red-50 border border-red-100 px-2 py-1 rounded-full">
                          {BLOOD_LABELS[p.bloodType]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{p._count.appointments}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(p.user.createdAt).toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-6 py-4">
                        <TogglePatientStatus userId={p.userId} isActive={p.user.isActive} />
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
