"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("No autorizado");
}

function addMinutes(time: string, minutes: number) {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export async function createAppointment(data: {
  patientId: string;
  doctorId: string;
  officeId?: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  reason?: string;
}) {
  await requireAdmin();

  const date = new Date(data.date);
  const endTime = addMinutes(data.startTime, data.durationMinutes);

  const conflict = await prisma.appointment.findFirst({
    where: {
      doctorId: data.doctorId,
      date,
      status: { notIn: ["CANCELLED", "NO_SHOW"] },
      startTime: { lt: endTime },
      endTime: { gt: data.startTime },
    },
  });
  if (conflict) throw new Error("El médico ya tiene una cita en ese horario");

  await prisma.appointment.create({
    data: {
      patientId: data.patientId,
      doctorId: data.doctorId,
      officeId: data.officeId || null,
      date,
      startTime: data.startTime,
      endTime,
      reason: data.reason || null,
    },
  });

  revalidatePath("/admin/appointments");
}

export async function cancelAppointment(id: string) {
  await requireAdmin();
  const appt = await prisma.appointment.findUnique({ where: { id } });
  if (!appt) throw new Error("Cita no encontrada");
  if (appt.status === "COMPLETED") throw new Error("No se puede cancelar una cita completada");
  if (appt.status === "CANCELLED") throw new Error("La cita ya está cancelada");
  await prisma.appointment.update({ where: { id }, data: { status: "CANCELLED" } });
  revalidatePath("/admin/appointments");
}

export async function deleteAppointment(id: string) {
  await requireAdmin();
  const appt = await prisma.appointment.findUnique({ where: { id }, include: { consultation: true } });
  if (!appt) throw new Error("Cita no encontrada");
  if (appt.consultation) throw new Error("No se puede eliminar: tiene una consulta registrada");
  await prisma.appointment.delete({ where: { id } });
  revalidatePath("/admin/appointments");
}
