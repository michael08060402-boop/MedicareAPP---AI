import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const ROLE_MAP: Record<string, string> = {
  ADMIN: "/admin",
  DOCTOR: "/doctor",
  PATIENT: "/patient",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  redirect(ROLE_MAP[session.user.role] ?? "/login");
}
