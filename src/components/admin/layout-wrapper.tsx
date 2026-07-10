"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import Image from "next/image";
import AdminSidebar from "./sidebar";

export default function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile topbar — fixed */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-20 flex items-center gap-3 px-4 h-14 bg-white border-b border-gray-100">
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
        <Image src="/medicare.png" alt="MediCare AI" width={28} height={28} className="rounded-lg" />
        <span className="font-bold text-gray-800">
          Medicare<span className="text-blue-500">AI</span>
        </span>
      </div>

      {/* Sidebar */}
      <AdminSidebar open={open} onClose={() => setOpen(false)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden pt-14 md:pt-0">
        {children}
      </div>
    </div>
  );
}
