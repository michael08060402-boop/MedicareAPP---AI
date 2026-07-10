"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { LogOut, X } from "lucide-react";
import { logout } from "@/lib/actions";

export default function LogoutButton() {
  const [open, setOpen] = useState(false);

  const modal = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center text-center">
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 shadow-md shadow-blue-200">
          <LogOut className="w-6 h-6 text-white" />
        </div>

        <h3 className="text-base font-bold text-gray-800 mb-1">¿Cerrar sesión?</h3>
        <p className="text-sm text-gray-400 mb-6">
          Tu sesión se cerrará y tendrás que volver a iniciar.
        </p>

        <div className="flex gap-3 w-full">
          <button
            onClick={() => setOpen(false)}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => logout()}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold shadow-sm shadow-blue-200 hover:opacity-90 transition-opacity"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all w-full group"
      >
        <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-400" />
        Cerrar sesión
      </button>

      {open && createPortal(modal, document.body)}
    </>
  );
}
