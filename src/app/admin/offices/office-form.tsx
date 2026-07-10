"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { createOffice } from "./actions";
import Modal from "@/components/admin/modal";

export default function OfficeFormModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [number, setNumber] = useState("");
  const [floor, setFloor] = useState("1");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function reset() {
    setNumber(""); setFloor("1"); setDescription(""); setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await createOffice({ number, floor: parseInt(floor, 10), description: description || undefined });
      setLoading(false);
      reset();
      onClose();
      router.refresh();
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "Error al crear el consultorio");
    }
  }

  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }} title="Nuevo consultorio">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">Número *</label>
            <input required value={number} onChange={(e) => setNumber(e.target.value)} placeholder="101"
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50 transition" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">Piso *</label>
            <input required type="number" min={0} value={floor} onChange={(e) => setFloor(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50 transition" />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1.5">Descripción</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Opcional"
            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50 transition" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-200/50 hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Crear consultorio"}
        </button>
      </form>
    </Modal>
  );
}
