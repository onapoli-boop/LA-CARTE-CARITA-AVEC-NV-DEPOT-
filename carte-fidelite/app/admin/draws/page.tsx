import { getDraws } from "@/lib/admin/get-draws";
import { DrawCard } from "@/components/admin/draw-card";

export default async function AdminDrawsPage() {
  const draws = await getDraws();

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 28, fontWeight: 600, marginBottom: 4 }}>
        Tirages &amp; gains
      </h1>
      <p style={{ fontSize: 14, opacity: 0.5, marginTop: 0, marginBottom: 24 }}>À valider en caisse</p>

      {draws.length === 0 ? (
        <p style={{ fontSize: 14, opacity: 0.5 }}>Aucun gain à valider pour le moment.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {draws.map((draw) => (
            <DrawCard key={draw.id} draw={draw} />
          ))}
        </div>
      )}
    </div>
  );
}
