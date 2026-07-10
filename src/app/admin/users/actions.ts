"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("No autorizado");
}

export async function updateUser(id: string, data: { name: string; email: string; isActive: boolean }) {
  await requireAdmin();

  const conflict = await prisma.user.findFirst({ where: { email: data.email, NOT: { id } } });
  if (conflict) throw new Error("Ya existe otro usuario con ese correo");

  await prisma.user.update({
    where: { id },
    data: { name: data.name, email: data.email, isActive: data.isActive },
  });

  revalidatePath("/admin/users");
}

export async function deleteUser(id: string) {
  await requireAdmin();

  const session = await auth();
  if (session?.user?.email) {
    const self = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (self?.id === id) throw new Error("No puedes eliminar tu propia cuenta");
  }

  const user = await prisma.user.findUnique({ where: { id }, select: { role: true } });
  if (!user) throw new Error("Usuario no encontrado");

  if (user.role === "ADMIN") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) throw new Error("Debe existir al menos un administrador");
  }

  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/users");
}
