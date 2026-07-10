import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPassword = await bcrypt.hash("admin1234", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@medicare.com" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@medicare.com",
      password: adminPassword,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  console.log("✅ Usuario admin creado:");
  console.log("   Email:    admin@medicare.com");
  console.log("   Password: admin1234");
  console.log("   ID:", admin.id);

  const specialtiesData = [
    { name: "Medicina General", description: "Atención médica general" },
    { name: "Pediatría", description: "Atención médica infantil" },
    { name: "Ginecología y Obstetricia", description: "Salud reproductiva y maternidad" },
    { name: "Cardiología", description: "Enfermedades del corazón" },
    { name: "Dermatología", description: "Salud de la piel" },
    { name: "Traumatología y Ortopedia", description: "Huesos, articulaciones y músculos" },
    { name: "Neurología", description: "Sistema nervioso" },
    { name: "Oftalmología", description: "Salud visual" },
    { name: "Otorrinolaringología", description: "Oído, nariz y garganta" },
    { name: "Psiquiatría", description: "Salud mental" },
    { name: "Endocrinología", description: "Hormonas y metabolismo" },
    { name: "Gastroenterología", description: "Sistema digestivo" },
    { name: "Urología", description: "Sistema urinario y reproductor masculino" },
    { name: "Odontología", description: "Salud dental" },
  ];

  const specialties = await Promise.all(
    specialtiesData.map((s) =>
      prisma.specialty.upsert({ where: { name: s.name }, update: {}, create: s })
    )
  );
  const specialty = specialties[0];

  console.log(`✅ ${specialties.length} especialidades creadas/verificadas`);

  const officesData = [
    { number: "101", floor: 1, description: "Consultorio principal" },
    { number: "102", floor: 1, description: "Consulta general" },
    { number: "103", floor: 1, description: "Consulta general" },
    { number: "201", floor: 2, description: "Pediatría" },
    { number: "202", floor: 2, description: "Ginecología" },
    { number: "203", floor: 2, description: "Cardiología" },
    { number: "301", floor: 3, description: "Traumatología" },
    { number: "302", floor: 3, description: "Dermatología" },
  ];

  const offices = await Promise.all(
    officesData.map((o) =>
      prisma.office.upsert({ where: { number: o.number }, update: {}, create: o })
    )
  );
  const office = offices[0];

  console.log(`✅ ${offices.length} consultorios creados/verificados`);

  const doctorPassword = await bcrypt.hash("doctor1234", 12);

  const doctorUser = await prisma.user.upsert({
    where: { email: "doctor@medicare.com" },
    update: {},
    create: {
      name: "Carlos Ramírez",
      email: "doctor@medicare.com",
      password: doctorPassword,
      role: "DOCTOR",
      emailVerified: new Date(),
    },
  });

  await prisma.doctor.upsert({
    where: { userId: doctorUser.id },
    update: {},
    create: {
      userId: doctorUser.id,
      specialtyId: specialty.id,
      officeId: office.id,
      licenseNumber: "CMP-12345",
      yearsExperience: 5,
    },
  });

  console.log("✅ Usuario doctor creado:");
  console.log("   Email:    doctor@medicare.com");
  console.log("   Password: doctor1234");

  const doctorRecord = await prisma.doctor.findUnique({ where: { userId: doctorUser.id } });
  if (doctorRecord) {
    const existing = await prisma.schedule.findFirst({ where: { doctorId: doctorRecord.id } });
    if (!existing) {
      await prisma.schedule.createMany({
        data: [1, 2, 3, 4, 5].map((day) => ({
          doctorId: doctorRecord.id,
          dayOfWeek: day,
          startTime: "08:00",
          endTime: "17:00",
          slotMinutes: 30,
        })),
      });
      console.log("✅ Horarios Lun–Vie 08:00–17:00 creados para doctor demo");
    } else {
      console.log("✅ Horarios doctor demo ya existen");
    }
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
