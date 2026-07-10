"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Stethoscope, CalendarDays,
  Building2, Clock, FileBarChart2, Settings,
  ChevronRight, ShieldCheck, X,
} from "lucide-react";
import Image from "next/image";
import LogoutButton from "@/components/shared/logout-button";

const NAV = [
  {
    label: "Principal",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
      { icon: CalendarDays, label: "Citas", href: "/admin/appointments" },
    ],
  },
  {
    label: "Gestión",
    items: [
      { icon: Users, label: "Pacientes", href: "/admin/patients" },
      { icon: Stethoscope, label: "Médicos", href: "/admin/doctors" },
      { icon: Building2, label: "Consultorios", href: "/admin/offices" },
      { icon: Clock, label: "Horarios", href: "/admin/schedules" },
    ],
  },
  {
    label: "Sistema",
    items: [
      { icon: ShieldCheck, label: "Usuarios", href: "/admin/users" },
      { icon: FileBarChart2, label: "Reportes", href: "/admin/reports" },
      { icon: Settings, label: "Configuración", href: "/admin/settings" },
    ],
  },
];

export default function AdminSidebar({
  open,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-40 w-64 flex flex-col bg-white border-r border-gray-100 h-screen
      transition-transform duration-300
      ${open ? "translate-x-0" : "-translate-x-full"}
      md:static md:translate-x-0 md:shrink-0
    `}>
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <Image src="/medicare.png" alt="MediCare AI" width={36} height={36} className="rounded-xl" />
          <span className="font-bold text-gray-800 text-lg tracking-tight">
            Medicare<span className="text-blue-500">AI</span>
          </span>
        </div>
        <button
          onClick={onClose}
          className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-6">
        {NAV.map((group) => (
          <div key={group.label}>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-2">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                        active
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${active ? "text-blue-500" : "text-gray-400 group-hover:text-gray-600"}`} />
                      {item.label}
                      {active && <ChevronRight className="w-3 h-3 ml-auto text-blue-400" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-100">
        <LogoutButton />
      </div>
    </aside>
  );
}
