import DoctorAssistantChat from "@/components/doctor/doctor-assistant-chat";

export default function DoctorAssistantPage() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="bg-white border-b border-gray-100 px-4 md:px-8 py-3 md:py-4">
        <h1 className="text-base font-bold text-gray-800">Asistente Clínico IA</h1>
        <p className="text-xs text-gray-400">Consultas médicas de apoyo · lenguaje técnico clínico</p>
      </header>
      <DoctorAssistantChat />
    </div>
  );
}
