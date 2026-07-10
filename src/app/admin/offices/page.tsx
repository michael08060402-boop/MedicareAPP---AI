import AdminTopbar from "@/components/admin/topbar";
import { prisma } from "@/lib/prisma";
import { Building2 } from "lucide-react";
import NewOfficeButton from "./new-office-button";
import ToggleOfficeStatus from "./toggle-office-status";
import OfficeActions from "./office-actions";

export default async function OfficesPage() {
  const offices = await prisma.office.findMany({
    include: {
      doctors: { include: { user: { select: { name: true } }, specialty: { select: { name: true } } } },
      _count: { select: { appointments: true } },
    },
    orderBy: { number: "asc" },
  });

  return (
    <div className="flex-1 overflow-y-auto">
      <AdminTopbar title="Consultorios" />
      <main className="p-4 md:p-8">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Consultorios</h2>
            <p className="text-sm text-gray-400">{offices.length} consultorios registrados</p>
          </div>
          <NewOfficeButton />
        </div>

        {offices.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-20">
            <Building2 className="w-12 h-12 text-gray-200 mb-3" />
            <p className="text-sm font-medium text-gray-400">No hay consultorios registrados</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {offices.map((o) => (
              <div key={o.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-blue-100 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex items-center gap-2">
                    <ToggleOfficeStatus id={o.id} isActive={o.isActive} />
                    <OfficeActions
                      office={{ id: o.id, number: o.number, floor: o.floor, description: o.description }}
                      appointmentCount={o._count.appointments}
                    />
                  </div>
                </div>
                <p className="font-bold text-gray-800 text-lg">Consultorio {o.number}</p>
                <p className="text-sm text-gray-400 mb-1">Piso {o.floor}</p>
                {o.description && <p className="text-xs text-gray-400 mb-3">{o.description}</p>}
                <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
                  <div>
                    {o.doctors.length > 0 ? (
                      <p className="text-xs text-gray-500">
                        <span className="font-medium text-gray-700">{o.doctors[0].user.name}</span>
                        {o.doctors.length > 1 && ` +${o.doctors.length - 1}`}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-300">Sin médico asignado</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{o._count.appointments} citas</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
