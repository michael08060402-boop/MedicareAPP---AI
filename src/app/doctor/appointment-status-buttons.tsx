"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, X, UserX } from "lucide-react";
import { confirmAppointment, cancelAppointment, markNoShow } from "./agenda-actions";

export default function AppointmentStatusButtons({
  appointmentId,
  status = "PENDING",
}: {
  appointmentId: string;
  status?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"confirm" | "cancel" | "noshow" | null>(null);

  async function handle(action: "confirm" | "cancel" | "noshow") {
    setLoading(action);
    try {
      if (action === "confirm") await confirmAppointment(appointmentId);
      else if (action === "cancel") await cancelAppointment(appointmentId);
      else await markNoShow(appointmentId);
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  if (status === "PENDING") {
    return (
      <div className="flex items-center gap-2">
        <button onClick={() => handle("confirm")} disabled={loading !== null}
          className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors disabled:opacity-50">
          {loading === "confirm" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
          Confirmar
        </button>
        <button onClick={() => handle("cancel")} disabled={loading !== null}
          className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50">
          {loading === "cancel" ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
          Cancelar
        </button>
      </div>
    );
  }

  if (status === "CONFIRMED") {
    return (
      <button onClick={() => handle("noshow")} disabled={loading !== null}
        className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50">
        {loading === "noshow" ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserX className="w-3 h-3" />}
        No asistió
      </button>
    );
  }

  return null;
}
