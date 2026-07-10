"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import AppointmentFormModal from "./appointment-form";

type Patient = { id: string; name: string; email: string };
type Doctor = { id: string; name: string; specialty: string };
type Office = { id: string; number: string };

export default function NewAppointmentButton({
  patients, doctors, offices,
}: { patients: Patient[]; doctors: Doctor[]; offices: Office[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm shadow-blue-200 hover:opacity-90 transition-opacity">
        <Plus className="w-4 h-4" />
        Nueva cita
      </button>
      <AppointmentFormModal open={open} onClose={() => setOpen(false)} patients={patients} doctors={doctors} offices={offices} />
    </>
  );
}
