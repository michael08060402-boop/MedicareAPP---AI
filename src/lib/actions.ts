"use server";

import { signOut } from "@/lib/auth";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function logout() {
  await signOut({ redirectTo: "/login" });
}

export async function updateProfile(_: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) return { error: "No autenticado" };

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();

  if (!name || !email) return { error: "Nombre y correo son requeridos" };

  await prisma.user.update({
    where: { email: session.user.email },
    data: { name, email },
  });

  return { success: "Perfil actualizado" };
}

export async function changePassword(_: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) return { error: "No autenticado" };

  const current = formData.get("current") as string;
  const next = formData.get("next") as string;
  const confirm = formData.get("confirm") as string;

  if (!current || !next || !confirm) return { error: "Todos los campos son requeridos" };
  if (next !== confirm) return { error: "Las contraseñas no coinciden" };
  if (next.length < 6) return { error: "La contraseña debe tener al menos 6 caracteres" };

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user?.password) return { error: "Esta cuenta no tiene contraseña configurada" };

  const valid = await bcrypt.compare(current, user.password);
  if (!valid) return { error: "Contraseña actual incorrecta" };

  const hashed = await bcrypt.hash(next, 12);
  await prisma.user.update({ where: { email: session.user.email }, data: { password: hashed } });

  return { success: "Contraseña actualizada" };
}
