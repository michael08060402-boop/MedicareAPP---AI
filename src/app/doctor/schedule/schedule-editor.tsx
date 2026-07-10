"use client";

import { useState } from "react";
import { Loader2, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { saveSchedule, type ScheduleEntry } from "./actions";

const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const DAY_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const SLOT_OPTIONS = [
  { value: 15, label: "15 min" },
  { value: 20, label: "20 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "1 hora" },
];

function buildDefault(existing: ScheduleEntry[]): ScheduleEntry[] {
  return Array.from({ length: 7 }, (_, i) => {
    const found = existing.find((e) => e.dayOfWeek === i);
    return found ?? { dayOfWeek: i, startTime: "08:00", endTime: "17:00", slotMinutes: 30, isActive: false };
  });
}

const inputClass =
  "text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50 transition w-full";

export default function ScheduleEditor({ initial }: { initial: ScheduleEntry[] }) {
  const [entries, setEntries] = useState<ScheduleEntry[]>(() => buildDefault(initial));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function update(day: number, field: keyof ScheduleEntry, value: string | number | boolean) {
    setEntries((prev) =>
      prev.map((e) => (e.dayOfWeek === day ? { ...e, [field]: value } : e))
    );
    setSaved(false);
  }

  async function handleSave() {
    setError(null);
    setLoading(true);
    setSaved(false);
    try {
      await saveSchedule(entries);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setLoading(false);
    }
  }

  const activeDays = entries.filter((e) => e.isActive);

  return (
    <div className="max-w-2xl">

      {/* Summary chips */}
      <div className="flex gap-2 flex-wrap mb-6">
        {entries.map((e) => (
          <span key={e.dayOfWeek} className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors ${
            e.isActive
              ? "bg-blue-50 text-blue-600 border-blue-200"
              : "bg-gray-50 text-gray-300 border-gray-100"
          }`}>
            {DAY_SHORT[e.dayOfWeek]}
          </span>
        ))}
        {activeDays.length === 0 && (
          <span className="text-xs text-gray-400 ml-1">Ningún día activo aún</span>
        )}
      </div>

      {/* Day rows */}
      <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 mb-6">
        {entries.map((entry) => (
          <div key={entry.dayOfWeek} className={`px-5 py-4 transition-colors ${entry.isActive ? "" : "opacity-50"}`}>
            <div className="flex items-center gap-4">
              {/* Toggle */}
              <button
                type="button"
                onClick={() => update(entry.dayOfWeek, "isActive", !entry.isActive)}
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${entry.isActive ? "bg-blue-500" : "bg-gray-200"}`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${entry.isActive ? "translate-x-4" : "translate-x-0.5"}`} />
              </button>

              {/* Day name */}
              <span className="w-24 text-sm font-semibold text-gray-700">{DAY_NAMES[entry.dayOfWeek]}</span>

              {/* Time fields */}
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="time"
                  value={entry.startTime}
                  disabled={!entry.isActive}
                  onChange={(e) => update(entry.dayOfWeek, "startTime", e.target.value)}
                  className={inputClass}
                />
                <span className="text-xs text-gray-400 shrink-0">a</span>
                <input
                  type="time"
                  value={entry.endTime}
                  disabled={!entry.isActive}
                  onChange={(e) => update(entry.dayOfWeek, "endTime", e.target.value)}
                  className={inputClass}
                />
              </div>

              {/* Slot select */}
              <select
                value={entry.slotMinutes}
                disabled={!entry.isActive}
                onChange={(e) => update(entry.dayOfWeek, "slotMinutes", Number(e.target.value))}
                className="text-sm border border-gray-200 rounded-xl px-2 py-2 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50 transition shrink-0"
              >
                {SLOT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
        <Clock className="w-3.5 h-3.5" />
        <span>La duración de cada cita se define por la columna de la derecha (tiempo por turno)</span>
      </div>

      {/* Feedback */}
      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}
      {saved && (
        <div className="flex items-center gap-2 text-emerald-600 text-sm bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 mb-4">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> Horario guardado correctamente
        </div>
      )}

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-200/50 hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar horario"}
      </button>
    </div>
  );
}
