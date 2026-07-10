"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("No autorizado");
}

export async function createDoctor(data: {
  name: string;
  email: string;
  password: string;
  specialtyId: string;
  officeId?: string;
  licenseNumber: string;
  phone?: string;
  yearsExperience: number;
}) {
  await requireAdmin();

  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) throw new Error("Ya existe una cuenta con ese correo");

  const existingLicense = await prisma.doctor.findUnique({ where: { licenseNumber: data.licenseNumber } });
  if (existingLicense) throw new Error("Ya existe un médico con ese número de licencia");

  const hashed = await bcrypt.hash(data.password, 12);

  await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashed,
      role: "DOCTOR",
      emailVerified: new Date(),
      doctor: {
        create: {
          specialtyId: data.specialtyId,
          officeId: data.officeId || null,
          licenseNumber: data.licenseNumber,
          phone: data.phone || null,
          yearsExperience: data.yearsExperience,
        },
      },
    },
  });

  revalidatePath("/admin/doctors");
}

export async function toggleDoctorStatus(id: string, isActive: boolean) {
  await requireAdmin();
  await prisma.doctor.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/doctors");
}

export async function updateDoctor(id: string, data: {
  name: string;
  email: string;
  specialtyId: string;
  officeId?: string;
  yearsExperience: number;
}) {
  await requireAdmin();

  const doctor = await prisma.doctor.findUnique({ where: { id }, select: { userId: true } });
  if (!doctor) throw new Error("Médico no encontrado");

  const emailConflict = await prisma.user.findFirst({ where: { email: data.email, NOT: { id: doctor.userId } } });
  if (emailConflict) throw new Error("Ya existe una cuenta con ese correo");

  await prisma.$transaction([
    prisma.user.update({ where: { id: doctor.userId }, data: { name: data.name, email: data.email } }),
    prisma.doctor.update({ where: { id }, data: { specialtyId: data.specialtyId, officeId: data.officeId || null, yearsExperience: data.yearsExperience } }),
  ]);

  revalidatePath("/admin/doctors");
}

export async function deleteDoctor(id: string) {
  await requireAdmin();

  const doctor = await prisma.doctor.findUnique({
    where: { id },
    include: { _count: { select: { appointments: true } } },
  });
  if (!doctor) throw new Error("Médico no encontrado");
  if (doctor._count.appointments > 0) throw new Error(`No se puede eliminar: tiene ${doctor._count.appointments} cita(s)`);

  await prisma.doctor.delete({ where: { id } });
  revalidatePath("/admin/doctors");
}

export async function createSpecialty(data: { name: string; description?: string }) {
  await requireAdmin();

  const existing = await prisma.specialty.findUnique({ where: { name: data.name } });
  if (existing) throw new Error("Ya existe una especialidad con ese nombre");

  const specialty = await prisma.specialty.create({
    data: { name: data.name, description: data.description || null },
  });

  revalidatePath("/admin/doctors");
  return specialty;
}
