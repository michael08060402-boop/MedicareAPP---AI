"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { createPatient } from "./actions";
import Modal from "@/components/admin/modal";
import type { BloodType } from "@/generated/prisma/enums";

const inputClass =
  "w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50 transition";

const BLOOD_OPTIONS: { value: BloodType; label: string }[] = [
  { value: "UNKNOWN", label: "No especificado" },
  { value: "A_POSITIVE", label: "A+" },
  { value: "A_NEGATIVE", label: "A-" },
  { value: "B_POSITIVE", label: "B+" },
  { value: "B_NEGATIVE", label: "B-" },
  { value: "AB_POSITIVE", label: "AB+" },
  { value: "AB_NEGATIVE", label: "AB-" },
  { value: "O_POSITIVE", label: "O+" },
  { value: "O_NEGATIVE", label: "O-" },
];

export default function PatientFormModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [bloodType, setBloodType] = useState<BloodType>("UNKNOWN");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function reset() {
    setName(""); setEmail(""); setPassword(""); setPhone(""); setBloodType("UNKNOWN"); setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await createPatient({ name, email, password, phone: phone || undefined, bloodType });
      setLoading(false);
      reset();
      onClose();
      router.refresh();
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "Error al crear el paciente");
    }
  }

  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }} title="Nuevo paciente">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1.5">Nombre completo *</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="María López" className={inputClass} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">Correo *</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="paciente@correo.com" className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">Contraseña *</label>
            <div className="relative">
              <input required type={showPassword ? "text" : "password"} minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" className={`${inputClass} pr-10`} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">Teléfono</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Opcional" className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">Tipo de sangre</label>
            <select value={bloodType} onChange={(e) => setBloodType(e.target.value as BloodType)} className={inputClass}>
              {BLOOD_OPTIONS.map((b) => (
                <option key={b.value} value={b.value}>{b.label}</option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-200/50 hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Crear paciente"}
        </button>
      </form>
    </Modal>
  );
}
