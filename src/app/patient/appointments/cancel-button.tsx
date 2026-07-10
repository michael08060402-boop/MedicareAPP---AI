"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2, AlertCircle } from "lucide-react";
import { cancelOwnAppointment } from "./actions";

export default function CancelButton({ appointmentId }: { appointmentId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    setError(null);
    setLoading(true);
    try {
      await cancelOwnAppointment(appointmentId, reason);
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cancelar");
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => { setOpen(true); setReason(""); setError(null); }}
        className="text-xs font-semibold text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors whitespace-nowrap"
      >
        Cancelar cita
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-gray-300 hover:text-gray-500">
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
              <X className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">¿Cancelar esta cita?</h3>
            <p className="text-sm text-gray-400 mb-4">Esta acción no se puede deshacer.</p>

            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">
                Motivo de cancelación <span className="text-gray-300">(opcional)</span>
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Cuéntanos por qué cancelas..."
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-50 transition resize-none"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 border border-red-100 rounded-xl px-3 py-2 mb-3">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                Volver
              </button>
              <button onClick={handleCancel} disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sí, cancelar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
