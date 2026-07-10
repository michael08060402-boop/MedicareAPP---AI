"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function pad(n: number) { return String(n).padStart(2, "0"); }

function minsToTime(mins: number) {
  return `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`;
}

function timeToMins(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function generateSlots(startTime: string, endTime: string, slotMinutes: number): string[] {
  const slots: string[] = [];
  let cur = timeToMins(startTime);
  const end = timeToMins(endTime);
  while (cur + slotMinutes <= end) {
    slots.push(minsToTime(cur));
    cur += slotMinutes;
  }
  return slots;
}

export type DoctorOption = {
  id: string;
  name: string;
  specialty: string;
  officeNumber: string | null;
  yearsExperience: number;
};

export async function getDoctorsBySpecialty(specialtyId: string): Promise<DoctorOption[]> {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");

  const doctors = await prisma.doctor.findMany({
    where: { specialtyId, isActive: true },
    include: {
      user: { select: { name: true } },
      specialty: { select: { name: true } },
      office: { select: { number: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return doctors.map((d) => ({
    id: d.id,
    name: d.user.name ?? "—",
    specialty: d.specialty.name,
    officeNumber: d.office?.number ?? null,
    yearsExperience: d.yearsExperience,
  }));
}

export type SlotInfo = {
  time: string;
  available: boolean;
};

export async function getAvailableSlots(doctorId: string, dateStr: string): Promise<string[]> {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");

  const date = new Date(dateStr);
  const dayOfWeek = date.getDay();

  const schedule = await prisma.schedule.findFirst({
    where: { doctorId, dayOfWeek, isActive: true },
  });

  if (!schedule) return [];

  const dayStart = new Date(dateStr);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dateStr);
  dayEnd.setHours(23, 59, 59, 999);

  const existing = await prisma.appointment.findMany({
    where: {
      doctorId,
      date: { gte: dayStart, lte: dayEnd },
      status: { notIn: ["CANCELLED", "NO_SHOW"] },
    },
    select: { startTime: true, endTime: true },
  });

  const allSlots = generateSlots(schedule.startTime, schedule.endTime, schedule.slotMinutes);

  return allSlots.filter((slot) => {
    const slotStart = timeToMins(slot);
    const slotEnd = slotStart + schedule.slotMinutes;
    return !existing.some((a) => {
      const aStart = timeToMins(a.startTime);
      const aEnd = timeToMins(a.endTime);
      return aStart < slotEnd && aEnd > slotStart;
    });
  });
}

export async function createBooking(data: {
  doctorId: string;
  date: string;
  startTime: string;
  slotMinutes: number;
  reason?: string;
}) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("No autorizado");

  const patient = await prisma.patient.findFirst({
    where: { user: { email: session.user.email } },
  });
  if (!patient) throw new Error("Paciente no encontrado");

  const endMins = timeToMins(data.startTime) + data.slotMinutes;
  const endTime = minsToTime(endMins);

  const date = new Date(data.date);
  date.setHours(12, 0, 0, 0);

  const schedule = await prisma.schedule.findFirst({
    where: { doctorId: data.doctorId, dayOfWeek: date.getDay(), isActive: true },
  });
  if (!schedule) throw new Error("El médico no tiene horario disponible ese día");

  const dayStart = new Date(data.date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(data.date);
  dayEnd.setHours(23, 59, 59, 999);

  const conflict = await prisma.appointment.findFirst({
    where: {
      doctorId: data.doctorId,
      date: { gte: dayStart, lte: dayEnd },
      status: { notIn: ["CANCELLED", "NO_SHOW"] },
      startTime: { lt: endTime },
      endTime: { gt: data.startTime },
    },
  });
  if (conflict) throw new Error("Ese horario ya fue reservado, elige otro");

  const doctor = await prisma.doctor.findUnique({
    where: { id: data.doctorId },
    select: { officeId: true },
  });

  await prisma.appointment.create({
    data: {
      patientId: patient.id,
      doctorId: data.doctorId,
      officeId: doctor?.officeId ?? null,
      date,
      startTime: data.startTime,
      endTime,
      reason: data.reason || null,
      status: "PENDING",
    },
  });

  revalidatePath("/patient/appointments");
  revalidatePath("/patient");
}

export async function getSlotMinutes(doctorId: string, dateStr: string): Promise<number> {
  const date = new Date(dateStr);
  const schedule = await prisma.schedule.findFirst({
    where: { doctorId, dayOfWeek: date.getDay(), isActive: true },
  });
  return schedule?.slotMinutes ?? 30;
}

export type ScheduleDay = { dayOfWeek: number; startTime: string; endTime: string };

export async function getDoctorScheduleDays(doctorId: string): Promise<ScheduleDay[]> {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");

  const schedules = await prisma.schedule.findMany({
    where: { doctorId, isActive: true },
    select: { dayOfWeek: true, startTime: true, endTime: true },
    orderBy: { dayOfWeek: "asc" },
  });

  return schedules;
}
