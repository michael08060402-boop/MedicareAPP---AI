"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, Trash2, Loader2, X } from "lucide-react";
import { cancelAppointment, deleteAppointment } from "./actions";

type ApptRow = { id: string; patientName: string; status: string; hasConsultation: boolean };

function CancelModal({ appt, onClose }: { appt: ApptRow; onClose: () => void }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handle() {
    setError(null);
    setLoading(true);
    try {
      await cancelAppointment(appt.id);
      onClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center text-center">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-300 hover:text-gray-500"><X className="w-4 h-4" /></button>
        <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
          <Ban className="w-5 h-5 text-amber-500" />
        </div>
        <h3 className="text-base font-bold text-gray-800 mb-1">¿Cancelar cita?</h3>
        <p className="text-sm text-gray-500 mb-4">Paciente: <span className="font-semibold text-gray-700">{appt.patientName}</span></p>
        {error && <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2 mb-3 w-full">{error}</p>}
        <div className="flex gap-3 w-full">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Volver</button>
          <button onClick={handle} disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cancelar cita"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({ appt, onClose }: { appt: ApptRow; onClose: () => void }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handle() {
    setError(null);
    setLoading(true);
    try {
      await deleteAppointment(appt.id);
      onClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center text-center">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-300 hover:text-gray-500"><X className="w-4 h-4" /></button>
        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <Trash2 className="w-5 h-5 text-red-500" />
        </div>
        <h3 className="text-base font-bold text-gray-800 mb-1">¿Eliminar cita?</h3>
        <p className="text-sm text-gray-500 mb-1">Paciente: <span className="font-semibold text-gray-700">{appt.patientName}</span></p>
        {appt.hasConsultation && (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mb-3 w-full">
            Tiene una consulta registrada y no puede eliminarse.
          </p>
        )}
        {error && <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2 mb-3 w-full">{error}</p>}
        <div className="flex gap-3 w-full">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Volver</button>
          <button onClick={handle} disabled={loading || appt.hasConsultation}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AppointmentActions({ appt }: { appt: ApptRow }) {
  const [mode, setMode] = useState<"cancel" | "delete" | null>(null);
  const canCancel = appt.status === "PENDING" || appt.status === "CONFIRMED";

  return (
    <>
      <div className="flex items-center gap-1">
        {canCancel && (
          <button onClick={() => setMode("cancel")} title="Cancelar" className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 transition-colors">
            <Ban className="w-3.5 h-3.5" />
          </button>
        )}
        <button onClick={() => setMode("delete")} title="Eliminar" className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      {mode === "cancel" && <CancelModal appt={appt} onClose={() => setMode(null)} />}
      {mode === "delete" && <DeleteModal appt={appt} onClose={() => setMode(null)} />}
    </>
  );
}
