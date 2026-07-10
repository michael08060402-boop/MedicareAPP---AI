import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Stethoscope } from "lucide-react";
import DoctorSettingsForm from "./settings-form";
import DoctorTopbar from "@/components/doctor/topbar";

export default async function DoctorSettingsPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const doctor = await prisma.doctor.findFirst({
    where: { user: { email: session.user.email } },
    include: { specialty: { select: { name: true } }, office: { select: { number: true } } },
  });
  if (!doctor) redirect("/login");

  return (
    <div className="flex-1 overflow-y-auto">
      <DoctorTopbar title="Configuración" subtitle="Gestiona tu cuenta y datos profesionales" />

      <main className="p-4 md:p-8 max-w-xl flex flex-col gap-5">
        <DoctorSettingsForm name={session.user.name ?? ""} email={session.user.email ?? ""} />

        {/* Professional info (read-only) */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Stethoscope className="w-4 h-4 text-cyan-500" />
            <h3 className="text-sm font-bold text-gray-700">Información profesional</h3>
          </div>
          <div className="flex flex-col gap-3">
            {[
              { label: "Especialidad", value: doctor.specialty.name },
              { label: "Licencia médica", value: doctor.licenseNumber },
              { label: "Consultorio", value: doctor.office?.number ?? "Sin asignar" },
              { label: "Años de experiencia", value: `${doctor.yearsExperience} años` },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-500">{label}</span>
                <span className="text-sm font-semibold text-gray-800">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
