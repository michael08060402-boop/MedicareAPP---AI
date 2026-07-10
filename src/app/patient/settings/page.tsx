import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import SettingsForm from "./settings-form";
import PatientTopbar from "@/components/patient/topbar";

export default async function PatientSettingsPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  return (
    <div className="flex-1 overflow-y-auto">
      <PatientTopbar title="Configuración" subtitle="Gestiona tu cuenta y preferencias" />
      <main className="p-4 md:p-8 max-w-xl">
        <SettingsForm name={session.user.name ?? ""} email={session.user.email ?? ""} />
      </main>
    </div>
  );
}
