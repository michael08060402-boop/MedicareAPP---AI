import DoctorLayoutWrapper from "@/components/doctor/layout-wrapper";

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return <DoctorLayoutWrapper>{children}</DoctorLayoutWrapper>;
}
