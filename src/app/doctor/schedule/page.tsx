import { getMySchedule } from "./actions";
import ScheduleEditor from "./schedule-editor";
import DoctorTopbar from "@/components/doctor/topbar";

export default async function SchedulePage() {
  const schedule = await getMySchedule();

  return (
    <div className="flex-1 overflow-y-auto">
      <DoctorTopbar title="Mi horario" subtitle="Define los días y horas en que atiendes pacientes" />

      <main className="p-8">
        <p className="text-sm text-gray-400 mb-6">
          Activa los días que trabajas y configura tu horario de atención. Los pacientes solo podrán agendar citas en los días y franjas que definas aquí.
        </p>
        <ScheduleEditor initial={schedule} />
      </main>
    </div>
  );
}
