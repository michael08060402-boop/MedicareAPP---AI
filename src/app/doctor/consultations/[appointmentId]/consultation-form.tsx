"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2, AlertCircle } from "lucide-react";
import { createConsultation, type PrescriptionInput } from "../actions";
import AIAssistantPanel from "@/components/doctor/ai-assistant-panel";

export default function ConsultationForm({ appointmentId }: { appointmentId: string }) {
  const router = useRouter();
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [notes, setNotes] = useState("");
  const [prescriptions, setPrescriptions] = useState<PrescriptionInput[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function addPrescription() {
    setPrescriptions([...prescriptions, { medication: "", dosage: "", frequency: "", duration: "", instructions: "" }]);
  }
  function removePrescription(i: number) {
    setPrescriptions(prescriptions.filter((_, idx) => idx !== i));
  }
  function updatePrescription(i: number, field: keyof PrescriptionInput, value: string) {
    setPrescriptions(prescriptions.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await createConsultation({
        appointmentId, chiefComplaint, diagnosis,
        treatment: treatment || undefined,
        notes: notes || undefined,
        prescriptions,
      });
      router.push("/doctor");
      router.refresh();
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "Error al guardar la consulta");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-sm font-bold text-gray-700 mb-4">Datos de la consulta</h3>
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">Motivo de consulta *</label>
            <textarea required value={chiefComplaint} onChange={(e) => setChiefComplaint(e.target.value)}
              rows={2} placeholder="Describe el motivo de la visita"
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50 transition resize-none" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-500">Diagnóstico *</label>
              <AIAssistantPanel chiefComplaint={chiefComplaint} />
            </div>
            <textarea required value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)}
              rows={2} placeholder="Diagnóstico clínico"
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50 transition resize-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">Tratamiento</label>
            <textarea value={treatment} onChange={(e) => setTreatment(e.target.value)}
              rows={2} placeholder="Tratamiento indicado (opcional)"
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50 transition resize-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">Notas adicionales</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
              rows={2} placeholder="Notas internas (opcional)"
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50 transition resize-none" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-700">Recetas</h3>
          <button type="button" onClick={addPrescription}
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-500 hover:underline">
            <Plus className="w-3.5 h-3.5" />
            Agregar medicamento
          </button>
        </div>

        {prescriptions.length === 0 ? (
          <p className="text-xs text-gray-300 text-center py-4">Sin medicamentos agregados</p>
        ) : (
          <div className="flex flex-col gap-4">
            {prescriptions.map((p, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4 relative">
                <button type="button" onClick={() => removePrescription(i)}
                  className="absolute top-3 right-3 text-gray-300 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid sm:grid-cols-2 gap-3 pr-6">
                  <input required value={p.medication} onChange={(e) => updatePrescription(i, "medication", e.target.value)}
                    placeholder="Medicamento" className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-300 bg-white" />
                  <input required value={p.dosage} onChange={(e) => updatePrescription(i, "dosage", e.target.value)}
                    placeholder="Dosis (ej. 500mg)" className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-300 bg-white" />
                  <input required value={p.frequency} onChange={(e) => updatePrescription(i, "frequency", e.target.value)}
                    placeholder="Frecuencia (ej. cada 8h)" className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-300 bg-white" />
                  <input required value={p.duration} onChange={(e) => updatePrescription(i, "duration", e.target.value)}
                    placeholder="Duración (ej. 7 días)" className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-300 bg-white" />
                  <input value={p.instructions} onChange={(e) => updatePrescription(i, "instructions", e.target.value)}
                    placeholder="Instrucciones (opcional)" className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-300 bg-white sm:col-span-2" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button type="submit" disabled={loading}
        className="self-end flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold px-6 py-3 rounded-xl shadow-sm shadow-blue-200 hover:opacity-90 transition-opacity disabled:opacity-50">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar consulta"}
      </button>
    </form>
  );
}
