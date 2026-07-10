"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function cancelOwnAppointment(appointmentId: string, reason: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("No autorizado");

  const patient = await prisma.patient.findFirst({
    where: { user: { email: session.user.email } },
  });
  if (!patient) throw new Error("Paciente no encontrado");

  const appt = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (!appt || appt.patientId !== patient.id) throw new Error("Cita no encontrada");
  if (appt.status !== "PENDING" && appt.status !== "CONFIRMED")
    throw new Error("Solo puedes cancelar citas pendientes o confirmadas");

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: "CANCELLED", notes: reason ? `Cancelada por paciente: ${reason}` : "Cancelada por paciente" },
  });

  revalidatePath("/patient/appointments");
}
