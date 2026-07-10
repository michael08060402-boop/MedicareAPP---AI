"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Loader2, AlertCircle, X } from "lucide-react";
import { updateOffice, deleteOffice } from "./actions";
import Modal from "@/components/admin/modal";

const inputClass =
  "w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50 transition";

type Office = { id: string; number: string; floor: number; description: string | null };

function EditModal({ office, onClose }: { office: Office; onClose: () => void }) {
  const router = useRouter();
  const [number, setNumber] = useState(office.number);
  const [floor, setFloor] = useState(String(office.floor));
  const [description, setDescription] = useState(office.description ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await updateOffice(office.id, { number, floor: parseInt(floor, 10), description: description || undefined });
      onClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="Editar consultorio">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">Número *</label>
            <input required value={number} onChange={(e) => setNumber(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">Piso *</label>
            <input required type="number" min={0} value={floor} onChange={(e) => setFloor(e.target.value)} className={inputClass} />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1.5">Descripción</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Opcional" className={inputClass} />
        </div>
        <button type="submit" disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-200/50 hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar cambios"}
        </button>
      </form>
    </Modal>
  );
}

function DeleteModal({ office, appointmentCount, onClose }: { office: Office; appointmentCount: number; onClose: () => void }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setError(null);
    setLoading(true);
    try {
      await deleteOffice(office.id);
      onClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center text-center">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-300 hover:text-gray-500">
          <X className="w-4 h-4" />
        </button>
        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <Trash2 className="w-5 h-5 text-red-500" />
        </div>
        <h3 className="text-base font-bold text-gray-800 mb-1">¿Eliminar consultorio?</h3>
        <p className="text-sm text-gray-400 mb-1">
          <span className="font-semibold text-gray-700">Consultorio {office.number}</span> — Piso {office.floor}
        </p>
        {appointmentCount > 0 && (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mb-3 mt-1">
            Tiene {appointmentCount} cita(s) asociada(s) y no puede eliminarse.
          </p>
        )}
        {error && (
          <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2 mb-3 mt-1 w-full">
            {error}
          </p>
        )}
        <div className="flex gap-3 w-full mt-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button onClick={handleDelete} disabled={loading || appointmentCount > 0}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-40 flex items-center justify-center gap-1">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OfficeActions({ office, appointmentCount }: { office: Office; appointmentCount: number }) {
  const [mode, setMode] = useState<"edit" | "delete" | null>(null);

  return (
    <>
      <div className="flex items-center gap-1">
        <button onClick={() => setMode("edit")}
          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors">
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => setMode("delete")}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {mode === "edit" && <EditModal office={office} onClose={() => setMode(null)} />}
      {mode === "delete" && <DeleteModal office={office} appointmentCount={appointmentCount} onClose={() => setMode(null)} />}
    </>
  );
}
