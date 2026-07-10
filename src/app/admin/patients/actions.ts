"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import type { BloodType } from "@/generated/prisma/enums";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("No autorizado");
}

export async function createPatient(data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  bloodType?: BloodType;
}) {
  await requireAdmin();

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new Error("Ya existe una cuenta con ese correo");

  const hashed = await bcrypt.hash(data.password, 12);

  await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashed,
      role: "PATIENT",
      emailVerified: new Date(),
      patient: {
        create: {
          phone: data.phone || null,
          bloodType: data.bloodType || "UNKNOWN",
        },
      },
    },
  });

  revalidatePath("/admin/patients");
}

export async function togglePatientStatus(userId: string, isActive: boolean) {
  await requireAdmin();
  await prisma.user.update({ where: { id: userId }, data: { isActive } });
  revalidatePath("/admin/patients");
}
