"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { createAppointment } from "./actions";
import Modal from "@/components/admin/modal";

type Patient = { id: string; name: string; email: string };
type Doctor = { id: string; name: string; specialty: string };
type Office = { id: string; number: string };

const inputClass =
  "w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50 transition";

export default function AppointmentFormModal({
  open,
  onClose,
  patients,
  doctors,
  offices,
}: {
  open: boolean;
  onClose: () => void;
  patients: Patient[];
  doctors: Doctor[];
  offices: Office[];
}) {
  const router = useRouter();
  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [officeId, setOfficeId] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [durationMinutes, setDurationMinutes] = useState("30");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function reset() {
    setPatientId(""); setDoctorId(""); setOfficeId(""); setDate("");
    setStartTime("09:00"); setDurationMinutes("30"); setReason(""); setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await createAppointment({
        patientId, doctorId, officeId: officeId || undefined,
        date, startTime, durationMinutes: parseInt(durationMinutes, 10) || 30,
        reason: reason || undefined,
      });
      setLoading(false);
      reset();
      onClose();
      router.refresh();
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "Error al crear la cita");
    }
  }

  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }} title="Nueva cita">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1.5">Paciente *</label>
          <select required value={patientId} onChange={(e) => setPatientId(e.target.value)} className={inputClass}>
            <option value="">Selecciona un paciente</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.name} — {p.email}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1.5">Médico *</label>
          <select required value={doctorId} onChange={(e) => setDoctorId(e.target.value)} className={inputClass}>
            <option value="">Selecciona un médico</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>{d.name} — {d.specialty}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">Consultorio</label>
            <select value={officeId} onChange={(e) => setOfficeId(e.target.value)} className={inputClass}>
              <option value="">Sin asignar</option>
              {offices.map((o) => (
                <option key={o.id} value={o.id}>Consultorio {o.number}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">Duración (min)</label>
            <select value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} className={inputClass}>
              <option value="15">15</option>
              <option value="30">30</option>
              <option value="45">45</option>
              <option value="60">60</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">Fecha *</label>
            <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">Hora *</label>
            <input required type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputClass} />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1.5">Motivo</label>
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Opcional" className={inputClass} />
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-200/50 hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Crear cita"}
        </button>
      </form>
    </Modal>
  );
}
