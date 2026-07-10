import AdminTopbar from "@/components/admin/topbar";
import { prisma } from "@/lib/prisma";
import { Clock, Plus } from "lucide-react";

const DAYS: Record<number, string> = {
  0: "Domingo", 1: "Lunes", 2: "Martes", 3: "Miércoles",
  4: "Jueves", 5: "Viernes", 6: "Sábado",
};

const DAY_COLORS: Record<number, string> = {
  0: "bg-purple-50 text-purple-600 border-purple-100",
  1: "bg-blue-50 text-blue-600 border-blue-100",
  2: "bg-cyan-50 text-cyan-600 border-cyan-100",
  3: "bg-emerald-50 text-emerald-600 border-emerald-100",
  4: "bg-amber-50 text-amber-600 border-amber-100",
  5: "bg-orange-50 text-orange-600 border-orange-100",
  6: "bg-rose-50 text-rose-600 border-rose-100",
};

export default async function SchedulesPage() {
  const doctors = await prisma.doctor.findMany({
    where: { isActive: true },
    include: {
      user: { select: { name: true } },
      specialty: { select: { name: true } },
      schedules: { orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalSchedules = doctors.reduce((sum, d) => sum + d.schedules.length, 0);

  return (
    <div className="flex-1 overflow-y-auto">
      <AdminTopbar title="Horarios" />
      <main className="p-4 md:p-8">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Horarios de atención</h2>
            <p className="text-sm text-gray-400">{totalSchedules} turnos configurados para {doctors.length} médicos</p>
          </div>
          <button className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm shadow-blue-200 hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" />
            Nuevo horario
          </button>
        </div>

        {doctors.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-20">
            <Clock className="w-12 h-12 text-gray-200 mb-3" />
            <p className="text-sm font-medium text-gray-400">No hay médicos activos</p>
            <p className="text-xs text-gray-300 mt-1">Registra médicos para poder asignarles horarios</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {doctors.map((d) => (
              <div key={d.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center text-cyan-700 text-sm font-bold shrink-0">
                      {d.user.name?.charAt(0) ?? "?"}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{d.user.name}</p>
                      <p className="text-xs text-gray-400">{d.specialty.name}</p>
                    </div>
                  </div>
                  <button className="text-xs text-blue-500 font-semibold hover:underline">+ Agregar turno</button>
                </div>

                {d.schedules.length === 0 ? (
                  <div className="bg-gray-50 rounded-xl py-4 flex items-center justify-center">
                    <p className="text-xs text-gray-300">Sin horarios asignados</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {d.schedules.map((s) => (
                      <div key={s.id} className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${DAY_COLORS[s.dayOfWeek]}`}>
                          {DAYS[s.dayOfWeek]}
                        </span>
                        <Clock className="w-3.5 h-3.5 text-gray-300" />
                        <span className="text-xs font-medium text-gray-600">{s.startTime} – {s.endTime}</span>
                        <span className="text-xs text-gray-400">({s.slotMinutes} min)</span>
                      </div>
                    ))}
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
