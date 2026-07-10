"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function requireDoctor() {
  const session = await auth();
  if (!session?.user?.email) throw new Error("No autorizado");
  const doctor = await prisma.doctor.findFirst({
    where: { user: { email: session.user.email } },
  });
  if (!doctor) throw new Error("Médico no encontrado");
  return doctor;
}

export type ScheduleEntry = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotMinutes: number;
  isActive: boolean;
};

export async function getMySchedule(): Promise<ScheduleEntry[]> {
  const doctor = await requireDoctor();

  const rows = await prisma.schedule.findMany({
    where: { doctorId: doctor.id },
    orderBy: { dayOfWeek: "asc" },
    select: { dayOfWeek: true, startTime: true, endTime: true, slotMinutes: true, isActive: true },
  });

  return rows;
}

export async function saveSchedule(entries: ScheduleEntry[]) {
  const doctor = await requireDoctor();

  for (const entry of entries) {
    const existing = await prisma.schedule.findFirst({
      where: { doctorId: doctor.id, dayOfWeek: entry.dayOfWeek },
    });

    if (existing) {
      await prisma.schedule.update({
        where: { id: existing.id },
        data: {
          startTime: entry.startTime,
          endTime: entry.endTime,
          slotMinutes: entry.slotMinutes,
          isActive: entry.isActive,
        },
      });
    } else if (entry.isActive) {
      await prisma.schedule.create({
        data: {
          doctorId: doctor.id,
          dayOfWeek: entry.dayOfWeek,
          startTime: entry.startTime,
          endTime: entry.endTime,
          slotMinutes: entry.slotMinutes,
          isActive: true,
        },
      });
    }
  }

  revalidatePath("/doctor/schedule");
  revalidatePath("/patient/book");
}
