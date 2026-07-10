import AdminTopbar from "@/components/admin/topbar";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Settings, User, Shield, Bell, Database } from "lucide-react";
import ProfileForm from "@/components/admin/profile-form";
import SecurityForm from "@/components/admin/security-form";

export default async function SettingsPage() {
  const session = await auth();
  const adminUser = session?.user?.email
    ? await prisma.user.findUnique({ where: { email: session.user.email }, select: { name: true, email: true, createdAt: true, role: true } })
    : null;

  const [totalUsers, totalPatients, totalDoctors, totalAppointments] = await Promise.all([
    prisma.user.count(),
    prisma.patient.count(),
    prisma.doctor.count(),
    prisma.appointment.count(),
  ]);

  return (
    <div className="flex-1 overflow-y-auto">
      <AdminTopbar title="Configuración" />
      <main className="p-4 md:p-8">

        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-800">Configuración del sistema</h2>
          <p className="text-sm text-gray-400">Administra tu cuenta y las preferencias globales</p>
        </div>

        <div className="grid xl:grid-cols-3 gap-6">

          {/* Left column */}
          <div className="xl:col-span-2 flex flex-col gap-5">

            {/* Profile section */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-5">
                <User className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-gray-700">Perfil del administrador</h3>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
                  {adminUser?.name?.charAt(0) ?? "A"}
                </div>
                <div>
                  <p className="font-bold text-gray-800">{adminUser?.name ?? "Administrador"}</p>
                  <p className="text-sm text-gray-400">{adminUser?.email}</p>
                  <span className="text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full mt-1 inline-block">
                    {adminUser?.role}
                  </span>
                </div>
              </div>
              <ProfileForm name={adminUser?.name ?? ""} email={adminUser?.email ?? ""} />
            </div>

            {/* Security section */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-5">
                <Shield className="w-4 h-4 text-violet-400" />
                <h3 className="text-sm font-bold text-gray-700">Seguridad</h3>
              </div>
              <SecurityForm />
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-5">
                <Bell className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-gray-700">Notificaciones</h3>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  { label: "Nuevas citas", desc: "Recibe una alerta cuando se registra una nueva cita" },
                  { label: "Citas canceladas", desc: "Notificación cuando un paciente cancela su cita" },
                  { label: "Nuevos pacientes", desc: "Alerta al registrarse un nuevo paciente" },
                  { label: "Reportes semanales", desc: "Resumen semanal de actividad por correo" },
                ].map(({ label, desc }, i) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-700">{label}</p>
                      <p className="text-xs text-gray-400">{desc}</p>
                    </div>
                    <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${i < 2 ? "bg-blue-500" : "bg-gray-200"}`}>
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${i < 2 ? "left-5" : "left-0.5"}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-5">

            {/* System info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-5">
                <Database className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-gray-700">Base de datos</h3>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  { label: "Usuarios totales", value: totalUsers },
                  { label: "Pacientes", value: totalPatients },
                  { label: "Médicos", value: totalDoctors },
                  { label: "Citas registradas", value: totalAppointments },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-500">{label}</span>
                    <span className="text-sm font-bold text-gray-800">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* App info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-4 h-4 text-gray-300" />
                <h3 className="text-sm font-bold text-gray-700">Acerca del sistema</h3>
              </div>
              <div className="flex flex-col gap-2">
                {[
                  { label: "Versión", value: "1.0.0" },
                  { label: "Framework", value: "Next.js 16" },
                  { label: "Base de datos", value: "Supabase" },
                  { label: "ORM", value: "Prisma 7" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-xs text-gray-400">{label}</span>
                    <span className="text-xs font-semibold text-gray-600">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin since */}
            {adminUser && (
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-2xl p-5">
                <p className="text-xs text-gray-400 mb-1">Administrador desde</p>
                <p className="text-sm font-bold text-blue-700">
                  {new Date(adminUser.createdAt).toLocaleDateString("es", { day: "2-digit", month: "long", year: "numeric" })}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
