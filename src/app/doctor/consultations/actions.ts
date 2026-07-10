"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type PrescriptionInput = {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
};

export async function createConsultation(formData: {
  appointmentId: string;
  chiefComplaint: string;
  diagnosis: string;
  treatment?: string;
  notes?: string;
  prescriptions: PrescriptionInput[];
}) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const doctor = await prisma.doctor.findFirst({ where: { user: { email: session.user.email } } });
  if (!doctor) redirect("/login");

  const appointment = await prisma.appointment.findUnique({
    where: { id: formData.appointmentId },
    include: { consultation: true },
  });

  if (!appointment || appointment.doctorId !== doctor.id) {
    throw new Error("Cita no encontrada");
  }
  if (appointment.consultation) {
    throw new Error("Esta cita ya tiene una consulta registrada");
  }

  let clinicalHistory = await prisma.clinicalHistory.findFirst({
    where: { patientId: appointment.patientId },
  });
  if (!clinicalHistory) {
    clinicalHistory = await prisma.clinicalHistory.create({
      data: { patientId: appointment.patientId },
    });
  }

  await prisma.$transaction([
    prisma.consultation.create({
      data: {
        clinicalHistoryId: clinicalHistory.id,
        appointmentId: appointment.id,
        doctorId: doctor.id,
        chiefComplaint: formData.chiefComplaint,
        diagnosis: formData.diagnosis,
        treatment: formData.treatment || null,
        notes: formData.notes || null,
        prescriptions: {
          create: formData.prescriptions
            .filter((p) => p.medication.trim() !== "")
            .map((p) => ({
              medication: p.medication,
              dosage: p.dosage,
              frequency: p.frequency,
              duration: p.duration,
              instructions: p.instructions || null,
            })),
        },
      },
    }),
    prisma.appointment.update({
      where: { id: appointment.id },
      data: { status: "COMPLETED" },
    }),
  ]);

  revalidatePath("/doctor");
  revalidatePath(`/doctor/consultations/${appointment.id}`);
  revalidatePath(`/doctor/patients/${appointment.patientId}`);
}
