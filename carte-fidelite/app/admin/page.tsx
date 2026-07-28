import { getDashboardStats, getRecentActivity } from "@/lib/admin/get-dashboard-data";
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/admin/stat-card";
import { PromoWidget } from "@/components/admin/promo-widget";
import { RecentActivityList } from "@/components/admin/recent-activity-list";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [stats, recentActivity, promoRes] = await Promise.all([
    getDashboardStats(),
    getRecentActivity(),
    supabase.from("promotions").select("title, description, is_active").order("created_at", { ascending: false }).limit(1).maybeSingle(),
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 24, fontWeight: 600, marginBottom: 6 }}>
          Tableau de bord
        </h1>
        <p style={{ fontSize: 13.5, opacity: 0.55, margin: 0 }}>Vue d&apos;ensemble de l&apos;activité.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        <StatCard label="Points distribués" value={stats.pointsDistributedToday} sub="Aujourd'hui" />
        <StatCard label="Clientes actives" value={stats.activeClientsThisMonth} sub="Ce mois" />
        <StatCard label="Tirages effectués" value={stats.drawsToday} sub="Aujourd'hui" />
        <StatCard
          label="Taux de participation"
          value={stats.participationRatePct !== null ? `${stats.participationRatePct}%` : "—"}
          sub="Scan → roue, aujourd'hui"
        />
      </div>

      <PromoWidget promotion={promoRes.data ?? null} />

      <div>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 17, fontWeight: 600, marginBottom: 12 }}>
          Activité récente
        </h2>
        <RecentActivityList entries={recentActivity} />
      </div>
    </div>
  );
}
