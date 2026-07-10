import PatientLayoutWrapper from "@/components/patient/layout-wrapper";

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return <PatientLayoutWrapper>{children}</PatientLayoutWrapper>;
}
