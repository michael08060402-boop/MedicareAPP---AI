"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function requireDoctor() {
  const session = await auth();
  if (!session?.user?.email) throw new Error("No autorizado");
  const doctor = await prisma.doctor.findFirst({ where: { user: { email: session.user.email } } });
  if (!doctor) throw new Error("No autorizado");
  return doctor;
}

export async function confirmAppointment(appointmentId: string) {
  const doctor = await requireDoctor();
  const appt = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (!appt || appt.doctorId !== doctor.id) throw new Error("No autorizado");
  await prisma.appointment.update({ where: { id: appointmentId }, data: { status: "CONFIRMED" } });
  revalidatePath("/doctor");
}

export async function cancelAppointment(appointmentId: string) {
  const doctor = await requireDoctor();
  const appt = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (!appt || appt.doctorId !== doctor.id) throw new Error("No autorizado");
  await prisma.appointment.update({ where: { id: appointmentId }, data: { status: "CANCELLED" } });
  revalidatePath("/doctor");
}

export async function markNoShow(appointmentId: string) {
  const doctor = await requireDoctor();
  const appt = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (!appt || appt.doctorId !== doctor.id) throw new Error("No autorizado");
  if (appt.status !== "CONFIRMED") throw new Error("Solo se puede marcar como no asistió en citas confirmadas");
  await prisma.appointment.update({ where: { id: appointmentId }, data: { status: "NO_SHOW" } });
  revalidatePath("/doctor");
}
