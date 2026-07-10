import { prisma } from "@/lib/prisma";
import BookingFlow from "./booking-flow";
import PatientTopbar from "@/components/patient/topbar";

export default async function BookAppointmentPage() {
  const specialties = await prisma.specialty.findMany({
    where: { isActive: true },
    select: { id: true, name: true, description: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex-1 overflow-y-auto">
      <PatientTopbar title="Agendar cita" subtitle="Selecciona especialidad, médico y horario disponible" />
      <main>
        <BookingFlow specialties={specialties} />
      </main>
    </div>
  );
}
