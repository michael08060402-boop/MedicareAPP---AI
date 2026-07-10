import AdminLayoutWrapper from "@/components/admin/layout-wrapper";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>;
}
