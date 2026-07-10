import AdminTopbar from "@/components/admin/topbar";
import { prisma } from "@/lib/prisma";
import { ShieldCheck, Stethoscope, User } from "lucide-react";
import UserActions from "./user-actions";

const ROLE_CONFIG = {
  ADMIN:   { label: "Admin",    bg: "bg-violet-50",  text: "text-violet-600",  border: "border-violet-100",  Icon: ShieldCheck },
  DOCTOR:  { label: "Médico",   bg: "bg-cyan-50",    text: "text-cyan-600",    border: "border-cyan-100",    Icon: Stethoscope },
  PATIENT: { label: "Paciente", bg: "bg-blue-50",    text: "text-blue-600",    border: "border-blue-100",    Icon: User },
};

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "desc" }],
    select: {
      id: true, name: true, email: true, role: true,
      isActive: true, createdAt: true, emailVerified: true,
    },
  });

  const counts = {
    ADMIN:   users.filter((u) => u.role === "ADMIN").length,
    DOCTOR:  users.filter((u) => u.role === "DOCTOR").length,
    PATIENT: users.filter((u) => u.role === "PATIENT").length,
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <AdminTopbar title="Usuarios" />
      <main className="p-4 md:p-8">

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {(["ADMIN", "DOCTOR", "PATIENT"] as const).map((role) => {
            const { label, bg, text, border, Icon } = ROLE_CONFIG[role];
            return (
              <div key={role} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${text}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{counts[role]}</p>
                  <p className="text-xs text-gray-400">{label}{counts[role] !== 1 ? "s" : ""}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h2 className="text-sm font-bold text-gray-700">Todos los usuarios</h2>
            <p className="text-xs text-gray-400">{users.length} en total</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  {["Usuario", "Rol", "Verificado", "Registro", "Estado", ""].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => {
                  const cfg = ROLE_CONFIG[u.role as keyof typeof ROLE_CONFIG];
                  const Icon = cfg?.Icon ?? User;
                  return (
                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center text-blue-600 text-sm font-bold shrink-0">
                            {u.name?.charAt(0) ?? "?"}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{u.name ?? "—"}</p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg?.bg} ${cfg?.text} ${cfg?.border}`}>
                          <Icon className="w-3 h-3" />
                          {cfg?.label ?? u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {u.emailVerified ? (
                          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                            Verificado
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-gray-400 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">
                            Pendiente
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(u.createdAt).toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          u.isActive
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : "bg-gray-50 text-gray-400 border-gray-100"
                        }`}>
                          {u.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <UserActions user={{ id: u.id, name: u.name, email: u.email, isActive: u.isActive, role: u.role }} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
