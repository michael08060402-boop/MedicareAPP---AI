"use client";

import { useState } from "react";
import { User, Shield, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { updateProfile, changePassword } from "./actions";

const inputClass =
  "w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50 transition";

export default function DoctorSettingsForm({ name, email }: { name: string; email: string }) {
  const [pName, setPName] = useState(name);
  const [pEmail, setPEmail] = useState(email);
  const [pLoading, setPLoading] = useState(false);
  const [pError, setPError] = useState<string | null>(null);
  const [pOk, setPOk] = useState(false);

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwOk, setPwOk] = useState(false);

  async function handleProfile(e: React.FormEvent) {
    e.preventDefault();
    setPError(null); setPOk(false); setPLoading(true);
    try {
      await updateProfile({ name: pName, email: pEmail });
      setPOk(true);
    } catch (err) {
      setPError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setPLoading(false);
    }
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError(null); setPwOk(false); setPwLoading(true);
    try {
      await changePassword({ current, next });
      setPwOk(true);
      setCurrent(""); setNext("");
    } catch (err) {
      setPwError(err instanceof Error ? err.message : "Error al cambiar contraseña");
    } finally {
      setPwLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={handleProfile} className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <User className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-bold text-gray-700">Mi perfil</h3>
        </div>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center text-cyan-700 text-xl font-bold">
            {pName.charAt(0) || "D"}
          </div>
          <div>
            <p className="font-bold text-gray-800">Dr. {pName}</p>
            <p className="text-sm text-gray-400">{pEmail}</p>
          </div>
        </div>

        {pError && (
          <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" /> {pError}
          </div>
        )}
        {pOk && (
          <div className="flex items-center gap-2 text-emerald-600 text-sm bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 mb-4">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> Perfil actualizado
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">Nombre completo</label>
            <input value={pName} onChange={(e) => setPName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">Correo electrónico</label>
            <input type="email" value={pEmail} onChange={(e) => setPEmail(e.target.value)} className={inputClass} />
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={pLoading}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm shadow-blue-200 hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-1.5">
              {pLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Guardar cambios"}
            </button>
          </div>
        </div>
      </form>

      <form onSubmit={handlePassword} className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Shield className="w-4 h-4 text-violet-400" />
          <h3 className="text-sm font-bold text-gray-700">Seguridad</h3>
        </div>

        {pwError && (
          <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" /> {pwError}
          </div>
        )}
        {pwOk && (
          <div className="flex items-center gap-2 text-emerald-600 text-sm bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 mb-4">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> Contraseña actualizada
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">Contraseña actual</label>
            <div className="relative">
              <input type={showCurrent ? "text" : "password"} value={current} onChange={(e) => setCurrent(e.target.value)}
                placeholder="••••••••" className={inputClass + " pr-10"} />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">Nueva contraseña</label>
            <div className="relative">
              <input type={showNext ? "text" : "password"} value={next} onChange={(e) => setNext(e.target.value)}
                placeholder="Mínimo 6 caracteres" className={inputClass + " pr-10"} />
              <button type="button" onClick={() => setShowNext(!showNext)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showNext ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={pwLoading || !current || !next}
              className="bg-violet-500 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-violet-600 transition-colors disabled:opacity-50 flex items-center gap-1.5">
              {pwLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Cambiar contraseña"}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
