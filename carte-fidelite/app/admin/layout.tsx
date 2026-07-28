import { requireAdmin } from "@/lib/admin/guard";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <AdminNav />
      <div style={{ flex: 1, padding: "24px 20px 60px", maxWidth: 720, margin: "0 auto", width: "100%" }}>
        {children}
      </div>
    </div>
  );
}
