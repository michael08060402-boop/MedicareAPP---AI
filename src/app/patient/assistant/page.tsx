import PatientTopbar from "@/components/patient/topbar";
import AssistantChat from "@/components/patient/assistant-chat";

export default function AssistantPage() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <PatientTopbar title="Asistente IA" />
      <AssistantChat />
    </div>
  );
}
