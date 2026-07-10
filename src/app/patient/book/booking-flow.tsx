"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Stethoscope, User, CalendarDays, CheckCircle2,
  ChevronLeft, Clock, Loader2, AlertCircle, Building2,
} from "lucide-react";
import {
  getDoctorsBySpecialty, getAvailableSlots, createBooking, getSlotMinutes,
  getDoctorScheduleDays, type DoctorOption, type ScheduleDay,
} from "./actions";

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

type Specialty = { id: string; name: string; description: string | null };

type Step = "specialty" | "doctor" | "datetime" | "confirm";

const STEP_LABELS: Record<Step, string> = {
  specialty: "Especialidad",
  doctor: "Médico",
  datetime: "Fecha y hora",
  confirm: "Confirmar",
};

const STEPS: Step[] = ["specialty", "doctor", "datetime", "confirm"];

export default function BookingFlow({ specialties }: { specialties: Specialty[] }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("specialty");

  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorOption | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [slotMinutes, setSlotMinutes] = useState(30);
  const [reason, setReason] = useState("");

  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [slots, setSlots] = useState<string[]>([]);
  const [scheduleDays, setScheduleDays] = useState<ScheduleDay[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function pickSpecialty(sp: Specialty) {
    setError(null);
    setLoading(true);
    setSelectedSpecialty(sp);
    try {
      const list = await getDoctorsBySpecialty(sp.id);
      setDoctors(list);
      setSelectedDoctor(null);
      setSelectedDate("");
      setSelectedSlot("");
      setSlots([]);
      setStep("doctor");
    } catch {
      setError("Error al cargar médicos");
    } finally {
      setLoading(false);
    }
  }

  async function pickDoctor(doc: DoctorOption) {
    setSelectedDoctor(doc);
    setSelectedDate("");
    setSelectedSlot("");
    setSlots([]);
    setScheduleDays([]);
    setStep("datetime");
    try {
      const days = await getDoctorScheduleDays(doc.id);
      setScheduleDays(days);
    } catch {
      // silently fail — chips are informational only
    }
  }

  async function pickDate(date: string) {
    if (!selectedDoctor) return;
    setError(null);
    setSelectedDate(date);
    setSelectedSlot("");
    setLoading(true);
    try {
      const [available, mins] = await Promise.all([
        getAvailableSlots(selectedDoctor.id, date),
        getSlotMinutes(selectedDoctor.id, date),
      ]);
      setSlots(available);
      setSlotMinutes(mins);
    } catch {
      setError("Error al cargar horarios");
    } finally {
      setLoading(false);
    }
  }

  function pickSlot(slot: string) {
    setSelectedSlot(slot);
    setStep("confirm");
  }

  async function handleConfirm() {
    if (!selectedDoctor || !selectedDate || !selectedSlot) return;
    setError(null);
    setLoading(true);
    try {
      await createBooking({
        doctorId: selectedDoctor.id,
        date: selectedDate,
        startTime: selectedSlot,
        slotMinutes,
        reason: reason || undefined,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la cita");
    } finally {
      setLoading(false);
    }
  }

  function goBack() {
    setError(null);
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1]);
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-1">¡Cita solicitada!</h3>
        <p className="text-sm text-gray-400 mb-2">
          Tu cita con <span className="font-semibold text-gray-700">Dr. {selectedDoctor?.name}</span> el{" "}
          <span className="font-semibold text-gray-700">
            {new Date(selectedDate + "T12:00:00").toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" })}
          </span>{" "}
          a las <span className="font-semibold text-gray-700">{selectedSlot}</span> está pendiente de confirmación.
        </p>
        <p className="text-xs text-gray-300 mb-8">El médico la confirmará pronto</p>
        <div className="flex gap-3">
          <button onClick={() => router.push("/patient/appointments")}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold rounded-xl shadow-sm shadow-blue-200 hover:opacity-90 transition-opacity">
            Ver mis citas
          </button>
          <button onClick={() => { setSuccess(false); setStep("specialty"); setSelectedSpecialty(null); setSelectedDoctor(null); setSelectedDate(""); setSelectedSlot(""); setReason(""); }}
            className="px-5 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
            Agendar otra
          </button>
        </div>
      </div>
    );
  }

  const stepIdx = STEPS.indexOf(step);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
              i < stepIdx ? "bg-blue-500 text-white"
              : i === stepIdx ? "bg-blue-500 text-white ring-4 ring-blue-100"
              : "bg-gray-100 text-gray-400"
            }`}>
              {i < stepIdx ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-xs font-semibold hidden sm:block ${i === stepIdx ? "text-blue-600" : "text-gray-300"}`}>
              {STEP_LABELS[s]}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`h-px flex-1 ${i < stepIdx ? "bg-blue-300" : "bg-gray-100"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Back button */}
      {stepIdx > 0 && (
        <button onClick={goBack} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-5">
          <ChevronLeft className="w-4 h-4" />
          Volver
        </button>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* ── STEP 1: Specialty ── */}
      {step === "specialty" && (
        <div>
          <h2 className="text-base font-bold text-gray-800 mb-1">Selecciona una especialidad</h2>
          <p className="text-sm text-gray-400 mb-5">¿Qué tipo de atención necesitas?</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {specialties.map((sp) => (
              <button key={sp.id} onClick={() => pickSpecialty(sp)} disabled={loading}
                className="text-left bg-white border border-gray-100 rounded-2xl p-4 hover:border-blue-200 hover:shadow-md hover:shadow-blue-50 transition-all group disabled:opacity-50">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                  <Stethoscope className="w-4 h-4 text-blue-500" />
                </div>
                <p className="text-sm font-semibold text-gray-800">{sp.name}</p>
                {sp.description && <p className="text-xs text-gray-400 mt-0.5">{sp.description}</p>}
              </button>
            ))}
          </div>
          {loading && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mt-6">
              <Loader2 className="w-4 h-4 animate-spin" />
              Cargando médicos…
            </div>
          )}
        </div>
      )}

      {/* ── STEP 2: Doctor ── */}
      {step === "doctor" && (
        <div>
          <h2 className="text-base font-bold text-gray-800 mb-1">Selecciona un médico</h2>
          <p className="text-sm text-gray-400 mb-5">
            Médicos disponibles en <span className="font-semibold text-gray-600">{selectedSpecialty?.name}</span>
          </p>
          {doctors.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-14">
              <Stethoscope className="w-10 h-10 text-gray-200 mb-3" />
              <p className="text-sm text-gray-400 font-medium">No hay médicos disponibles en esta especialidad</p>
              <p className="text-xs text-gray-300 mt-1">Prueba con otra especialidad</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {doctors.map((doc) => (
                <button key={doc.id} onClick={() => pickDoctor(doc)}
                  className="text-left bg-white border border-gray-100 rounded-2xl p-4 hover:border-blue-200 hover:shadow-md hover:shadow-blue-50 transition-all flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center text-cyan-700 text-lg font-bold shrink-0">
                    {doc.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">Dr. {doc.name}</p>
                    <p className="text-xs text-gray-400">{doc.specialty}</p>
                    <div className="flex items-center gap-3 mt-1">
                      {doc.officeNumber && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Building2 className="w-3 h-3" />
                          Consultorio {doc.officeNumber}
                        </span>
                      )}
                      {doc.yearsExperience > 0 && (
                        <span className="text-xs text-gray-400">{doc.yearsExperience} años exp.</span>
                      )}
                    </div>
                  </div>
                  <User className="w-4 h-4 text-gray-300 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── STEP 3: Date + Slots ── */}
      {step === "datetime" && (
        <div>
          <h2 className="text-base font-bold text-gray-800 mb-1">Elige fecha y hora</h2>
          <p className="text-sm text-gray-400 mb-5">
            Con <span className="font-semibold text-gray-600">Dr. {selectedDoctor?.name}</span>
          </p>

          <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4">
            <label className="text-xs font-semibold text-gray-500 block mb-2">Fecha</label>

            {scheduleDays.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-3">
                {DAY_NAMES.map((name, i) => {
                  const hasSchedule = scheduleDays.some((s) => s.dayOfWeek === i);
                  return (
                    <span key={i} className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                      hasSchedule
                        ? "bg-blue-50 text-blue-600 border-blue-200"
                        : "bg-gray-50 text-gray-300 border-gray-100"
                    }`}>
                      {name}
                    </span>
                  );
                })}
              </div>
            )}

            <input
              type="date"
              value={selectedDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => pickDate(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50 transition"
            />
          </div>

          {selectedDate && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <label className="text-xs font-semibold text-gray-500 block mb-3">Horarios disponibles</label>
              {loading ? (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-400 py-6">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Cargando horarios…
                </div>
              ) : slots.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No hay horarios disponibles para este día</p>
                  <p className="text-xs text-gray-300 mt-1">El médico no trabaja este día o todos los turnos están ocupados</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {slots.map((slot) => (
                    <button key={slot} onClick={() => pickSlot(slot)}
                      className="py-2 text-sm font-semibold rounded-xl border border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 transition-all">
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── STEP 4: Confirm ── */}
      {step === "confirm" && selectedDoctor && (
        <div>
          <h2 className="text-base font-bold text-gray-800 mb-1">Confirmar cita</h2>
          <p className="text-sm text-gray-400 mb-5">Revisa los detalles antes de agendar</p>

          <div className="bg-white border border-gray-100 rounded-2xl divide-y divide-gray-50 mb-5">
            {[
              { label: "Especialidad", value: selectedSpecialty?.name },
              { label: "Médico", value: `Dr. ${selectedDoctor.name}` },
              {
                label: "Fecha", value: new Date(selectedDate + "T12:00:00").toLocaleDateString("es", {
                  weekday: "long", day: "numeric", month: "long", year: "numeric",
                }),
              },
              { label: "Hora", value: selectedSlot },
              selectedDoctor.officeNumber
                ? { label: "Consultorio", value: `Consultorio ${selectedDoctor.officeNumber}` }
                : null,
            ].filter(Boolean).map((row) => (
              <div key={row!.label} className="flex items-center justify-between px-5 py-3.5">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{row!.label}</span>
                <span className="text-sm font-semibold text-gray-800 capitalize">{row!.value}</span>
              </div>
            ))}
          </div>

          <div className="mb-5">
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">Motivo de consulta (opcional)</label>
            <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder="Describe brevemente el motivo de tu visita…"
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50 transition resize-none" />
          </div>

          <button onClick={handleConfirm} disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-200/50 hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>
              <CalendarDays className="w-4 h-4" />
              Confirmar cita
            </>}
          </button>
        </div>
      )}
    </div>
  );
}
