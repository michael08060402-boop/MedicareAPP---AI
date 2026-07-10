"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Loader2, AlertCircle, X } from "lucide-react";
import { updateDoctor, deleteDoctor } from "./actions";
import Modal from "@/components/admin/modal";

type DoctorRow = {
  id: string;
  userId: string;
  name: string;
  email: string;
  specialtyId: string;
  officeId: string | null;
  yearsExperience: number;
  appointmentCount: number;
};

type Option = { id: string; name: string };

const inputClass =
  "w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50 transition";

function EditModal({
  doctor, specialties, offices, onClose,
}: {
  doctor: DoctorRow;
  specialties: Option[];
  offices: Option[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState(doctor.name);
  const [email, setEmail] = useState(doctor.email);
  const [specialtyId, setSpecialtyId] = useState(doctor.specialtyId);
  const [officeId, setOfficeId] = useState(doctor.officeId ?? "");
  const [yearsExperience, setYearsExperience] = useState(doctor.yearsExperience);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await updateDoctor(doctor.id, { name, email, specialtyId, officeId: officeId || undefined, yearsExperience });
      onClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="Editar médico">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1.5">Nombre *</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1.5">Correo *</label>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1.5">Especialidad *</label>
          <select required value={specialtyId} onChange={(e) => setSpecialtyId(e.target.value)} className={inputClass}>
            {specialties.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1.5">Consultorio</label>
          <select value={officeId} onChange={(e) => setOfficeId(e.target.value)} className={inputClass}>
            <option value="">Sin asignar</option>
            {offices.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1.5">Años de experiencia</label>
          <input type="number" min={0} max={60} value={yearsExperience} onChange={(e) => setYearsExperience(Number(e.target.value))} className={inputClass} />
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-200/50 hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar cambios"}
        </button>
      </form>
    </Modal>
  );
}

function DeleteModal({ doctor, onClose }: { doctor: DoctorRow; onClose: () => void }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setError(null);
    setLoading(true);
    try {
      await deleteDoctor(doctor.id);
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
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-300 hover:text-gray-500"><X className="w-4 h-4" /></button>
        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <Trash2 className="w-5 h-5 text-red-500" />
        </div>
        <h3 className="text-base font-bold text-gray-800 mb-1">¿Eliminar médico?</h3>
        <p className="text-sm text-gray-500 mb-1 font-semibold">{doctor.name}</p>
        {doctor.appointmentCount > 0 ? (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mb-4 w-full">
            Este médico tiene {doctor.appointmentCount} cita(s). Elimínelas primero.
          </p>
        ) : (
          <p className="text-xs text-gray-300 mb-4">Se eliminará su cuenta y todos sus datos.</p>
        )}
        {error && <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2 mb-3 w-full">{error}</p>}
        <div className="flex gap-3 w-full">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Cancelar</button>
          <button onClick={handleDelete} disabled={loading || doctor.appointmentCount > 0}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DoctorActions({
  doctor, specialties, offices,
}: {
  doctor: DoctorRow;
  specialties: Option[];
  offices: Option[];
}) {
  const [mode, setMode] = useState<"edit" | "delete" | null>(null);

  return (
    <>
      <div className="flex items-center gap-1">
        <button onClick={() => setMode("edit")} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors">
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => setMode("delete")} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      {mode === "edit" && <EditModal doctor={doctor} specialties={specialties} offices={offices} onClose={() => setMode(null)} />}
      {mode === "delete" && <DeleteModal doctor={doctor} onClose={() => setMode(null)} />}
    </>
  );
}
