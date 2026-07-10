"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, Plus, RefreshCw, Eye, EyeOff } from "lucide-react";
import { createDoctor, createSpecialty } from "./actions";
import Modal from "@/components/admin/modal";

type Specialty = { id: string; name: string };
type Office = { id: string; number: string };

const inputClass =
  "w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50 transition";

function generateLicense() {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `CMP-${num}`;
}

export default function DoctorFormModal({
  open,
  onClose,
  specialties,
  offices,
}: {
  open: boolean;
  onClose: () => void;
  specialties: Specialty[];
  offices: Office[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [specialtyId, setSpecialtyId] = useState("");
  const [officeId, setOfficeId] = useState("");
  const [licenseNumber, setLicenseNumber] = useState(generateLicense);
  const [phone, setPhone] = useState("");
  const [yearsExperience, setYearsExperience] = useState("0");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [localSpecialties, setLocalSpecialties] = useState<Specialty[]>(specialties);
  const [showNewSpecialty, setShowNewSpecialty] = useState(false);
  const [newSpecialtyName, setNewSpecialtyName] = useState("");
  const [creatingSpecialty, setCreatingSpecialty] = useState(false);

  function reset() {
    setName(""); setEmail(""); setPassword(""); setSpecialtyId(""); setOfficeId("");
    setLicenseNumber(generateLicense()); setPhone(""); setYearsExperience("0"); setError(null);
    setShowNewSpecialty(false); setNewSpecialtyName("");
  }

  async function handleCreateSpecialty() {
    if (!newSpecialtyName.trim()) return;
    setCreatingSpecialty(true);
    try {
      const specialty = await createSpecialty({ name: newSpecialtyName.trim() });
      setLocalSpecialties((prev) => [...prev, specialty]);
      setSpecialtyId(specialty.id);
      setNewSpecialtyName("");
      setShowNewSpecialty(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la especialidad");
    } finally {
      setCreatingSpecialty(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!specialtyId) {
      setError("Selecciona una especialidad");
      return;
    }
    setLoading(true);
    try {
      await createDoctor({
        name, email, password, specialtyId,
        officeId: officeId || undefined,
        licenseNumber, phone: phone || undefined,
        yearsExperience: parseInt(yearsExperience, 10) || 0,
      });
      setLoading(false);
      reset();
      onClose();
      router.refresh();
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "Error al crear el médico");
    }
  }

  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }} title="Nuevo médico">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1.5">Nombre completo *</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Carlos Ramírez" className={inputClass} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">Correo *</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="doctor@medicare.com" className={inputClass} />
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

        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1.5">Especialidad *</label>
          {!showNewSpecialty ? (
            <div className="flex gap-2">
              <select required value={specialtyId} onChange={(e) => setSpecialtyId(e.target.value)} className={inputClass}>
                <option value="">Selecciona una especialidad</option>
                {localSpecialties.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <button type="button" onClick={() => setShowNewSpecialty(true)}
                className="shrink-0 flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 text-gray-400 hover:text-blue-500 hover:border-blue-200 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input value={newSpecialtyName} onChange={(e) => setNewSpecialtyName(e.target.value)} placeholder="Nueva especialidad" className={inputClass} />
              <button type="button" disabled={creatingSpecialty} onClick={handleCreateSpecialty}
                className="shrink-0 px-3 rounded-xl bg-blue-500 text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50">
                {creatingSpecialty ? <Loader2 className="w-4 h-4 animate-spin" /> : "Crear"}
              </button>
              <button type="button" onClick={() => setShowNewSpecialty(false)}
                className="shrink-0 px-3 rounded-xl border border-gray-200 text-xs font-semibold text-gray-500 hover:bg-gray-50">
                Cancelar
              </button>
            </div>
          )}
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
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">N° Licencia *</label>
            <div className="flex gap-2">
              <input required value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder="CMP-12345" className={inputClass} />
              <button type="button" onClick={() => setLicenseNumber(generateLicense())}
                title="Generar otro número"
                className="shrink-0 flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 text-gray-400 hover:text-blue-500 hover:border-blue-200 transition-colors">
                <RefreshCw className="w-4 h-4" />
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
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">Años de experiencia</label>
            <input type="number" min={0} value={yearsExperience} onChange={(e) => setYearsExperience(e.target.value)} className={inputClass} />
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-200/50 hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Crear médico"}
        </button>
      </form>
    </Modal>
  );
}
