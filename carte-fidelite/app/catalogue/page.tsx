import { redirect } from "next/navigation";
import { getCatalogueData } from "@/lib/client/get-catalogue";
import { getBusinessSettings } from "@/lib/settings/get-settings";
import { CatalogueItemCard } from "@/components/client/catalogue-item";
import { BottomNav } from "@/components/client/bottom-nav";

export default async function CataloguePage() {
  const [data, settings] = await Promise.all([getCatalogueData(), getBusinessSettings()]);

  if (!data) redirect("/login");

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <div style={{ flex: 1, overflow: "auto", padding: "60px 24px 30px" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 26, fontWeight: 600 }}>Catalogue</h1>
        <p style={{ fontSize: 14, color: "var(--color-secondary)", marginTop: 4 }}>
          {data.pointsBalance} {settings?.points_label ?? "points"} disponibles
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 24 }}>
          {data.items.length === 0 ? (
            <p style={{ fontSize: 14, opacity: 0.5 }}>Aucune récompense disponible pour le moment.</p>
          ) : (
            data.items.map((item) => (
              <CatalogueItemCard key={item.id} item={item} pointsBalance={data.pointsBalance} />
            ))
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
