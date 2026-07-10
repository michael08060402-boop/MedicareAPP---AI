"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

async function getUser() {
  const session = await auth();
  if (!session?.user?.email) throw new Error("No autorizado");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("Usuario no encontrado");
  return user;
}

export async function updateProfile(data: { name: string; email: string }) {
  const user = await getUser();

  const conflict = await prisma.user.findFirst({ where: { email: data.email, NOT: { id: user.id } } });
  if (conflict) throw new Error("Ese correo ya está en uso");

  await prisma.user.update({ where: { id: user.id }, data: { name: data.name, email: data.email } });
  revalidatePath("/patient/settings");
}

export async function changePassword(data: { current: string; next: string }) {
  const user = await getUser();
  if (!user.password) throw new Error("Esta cuenta no tiene contraseña configurada");

  const valid = await bcrypt.compare(data.current, user.password);
  if (!valid) throw new Error("La contraseña actual es incorrecta");
  if (data.next.length < 6) throw new Error("La nueva contraseña debe tener al menos 6 caracteres");

  const hashed = await bcrypt.hash(data.next, 12);
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
}
