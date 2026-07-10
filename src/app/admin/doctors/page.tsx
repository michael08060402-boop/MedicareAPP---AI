import AdminTopbar from "@/components/admin/topbar";
import { prisma } from "@/lib/prisma";
import { Stethoscope } from "lucide-react";
import NewDoctorButton from "./new-doctor-button";
import ToggleDoctorStatus from "./toggle-doctor-status";
import DoctorActions from "./doctor-actions";

export default async function DoctorsPage() {
  const [doctors, specialties, offices] = await Promise.all([
    prisma.doctor.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, isActive: true } },
        specialty: { select: { id: true, name: true } },
        office: { select: { id: true, number: true } },
        _count: { select: { appointments: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.specialty.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.office.findMany({ where: { isActive: true }, select: { id: true, number: true }, orderBy: { number: "asc" } }),
  ]);

  const officeOptions = offices.map((o) => ({ id: o.id, name: `Consultorio ${o.number}` }));

  return (
    <div className="flex-1 overflow-y-auto">
      <AdminTopbar title="Médicos" />
      <main className="p-4 md:p-8">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Médicos registrados</h2>
            <p className="text-sm text-gray-400">{doctors.length} médicos en total</p>
          </div>
          <NewDoctorButton specialties={specialties} offices={offices} />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100">
          {doctors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Stethoscope className="w-12 h-12 text-gray-200 mb-3" />
              <p className="text-sm font-medium text-gray-400">No hay médicos registrados</p>
              <p className="text-xs text-gray-300 mt-1">Los médicos aparecerán aquí cuando se registren</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50">
                    {["Médico", "Especialidad", "Licencia", "Consultorio", "Experiencia", "Citas", "Estado", ""].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {doctors.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center text-cyan-700 text-sm font-bold shrink-0">
                            {d.user.name?.charAt(0) ?? "?"}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{d.user.name}</p>
                            <p className="text-xs text-gray-400">{d.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-full">
                          {d.specialty.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-mono">{d.licenseNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{d.office?.number ?? "—"}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{d.yearsExperience} años</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{d._count.appointments}</td>
                      <td className="px-6 py-4">
                        <ToggleDoctorStatus id={d.id} isActive={d.isActive} />
                      </td>
                      <td className="px-6 py-4">
                        <DoctorActions
                          doctor={{
                            id: d.id,
                            userId: d.userId,
                            name: d.user.name ?? "",
                            email: d.user.email,
                            specialtyId: d.specialtyId,
                            officeId: d.officeId,
                            yearsExperience: d.yearsExperience,
                            appointmentCount: d._count.appointments,
                          }}
                          specialties={specialties}
                          offices={officeOptions}
                        />
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
