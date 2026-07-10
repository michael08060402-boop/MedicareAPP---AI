"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays, Users, ClipboardList, Settings,
  ChevronRight, Clock, Bot, X,
} from "lucide-react";
import Image from "next/image";
import LogoutButton from "@/components/shared/logout-button";

const NAV = [
  {
    label: "Principal",
    items: [
      { icon: CalendarDays, label: "Agenda de hoy", href: "/doctor" },
      { icon: Users, label: "Mis pacientes", href: "/doctor/patients" },
      { icon: ClipboardList, label: "Historial clínico", href: "/doctor/history" },
      { icon: Clock, label: "Mi horario", href: "/doctor/schedule" },
    ],
  },
  {
    label: "Herramientas",
    items: [
      { icon: Bot, label: "Asistente IA", href: "/doctor/assistant" },
    ],
  },
  {
    label: "Cuenta",
    items: [
      { icon: Settings, label: "Configuración", href: "/doctor/settings" },
    ],
  },
];

export default function DoctorSidebar({
  open,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-40 w-60 flex flex-col bg-white border-r border-gray-100 h-screen
      transition-transform duration-300
      ${open ? "translate-x-0" : "-translate-x-full"}
      md:static md:translate-x-0 md:shrink-0
    `}>
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
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
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
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
