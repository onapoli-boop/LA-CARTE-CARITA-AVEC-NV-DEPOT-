
import { requireAdmin } from "@/lib/admin/guard";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireAdmin();
  } catch (err) {
    const e = err as { digest?: string; message?: string; stack?: string };
    if (e?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    return (
      <div style={{ padding: 24, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
        <h2>Erreur (debug temporaire) — requireAdmin</h2>
        <p>message : {e?.message}</p>
        <p>stack : {e?.stack}</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <AdminNav />
      <div style={{ flex: 1, padding: "24px 20px 60px", maxWidth: 720, margin: "0 auto", width: "100%" }}>
        {children}
      </div>
    </div>
  );
}
