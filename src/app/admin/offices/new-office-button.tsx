"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import OfficeFormModal from "./office-form";

export default function NewOfficeButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm shadow-blue-200 hover:opacity-90 transition-opacity">
        <Plus className="w-4 h-4" />
        Nuevo consultorio
      </button>
      <OfficeFormModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
