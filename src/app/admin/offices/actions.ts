"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("No autorizado");
}

export async function createOffice(data: { number: string; floor: number; description?: string }) {
  await requireAdmin();

  const existing = await prisma.office.findUnique({ where: { number: data.number } });
  if (existing) throw new Error("Ya existe un consultorio con ese número");

  await prisma.office.create({
    data: { number: data.number, floor: data.floor, description: data.description || null },
  });

  revalidatePath("/admin/offices");
}

export async function updateOffice(id: string, data: { number: string; floor: number; description?: string }) {
  await requireAdmin();

  const conflict = await prisma.office.findFirst({ where: { number: data.number, NOT: { id } } });
  if (conflict) throw new Error("Ya existe un consultorio con ese número");

  await prisma.office.update({
    where: { id },
    data: { number: data.number, floor: data.floor, description: data.description || null },
  });

  revalidatePath("/admin/offices");
}

export async function deleteOffice(id: string) {
  await requireAdmin();

  const office = await prisma.office.findUnique({
    where: { id },
    include: { _count: { select: { appointments: true } } },
  });
  if (!office) throw new Error("Consultorio no encontrado");
  if (office._count.appointments > 0)
    throw new Error(`No se puede eliminar: tiene ${office._count.appointments} cita(s) asociada(s)`);

  await prisma.office.delete({ where: { id } });
  revalidatePath("/admin/offices");
}

export async function toggleOfficeStatus(id: string, isActive: boolean) {
  await requireAdmin();
  await prisma.office.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/offices");
}
