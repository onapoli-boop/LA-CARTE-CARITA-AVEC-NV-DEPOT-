import { redirect } from "next/navigation";
import { getHomeData } from "@/lib/settings/get-home-data";
import { Header } from "@/components/client/header";
import { LoyaltyCard } from "@/components/client/loyalty-card";
import { QrScanCard } from "@/components/client/qr-scan-card";
import { TierProgress } from "@/components/client/tier-progress";
import { PromotionBanner } from "@/components/client/promotion-banner";
import { RecentActivity } from "@/components/client/recent-activity";
import { BottomNav } from "@/components/client/bottom-nav";

export default async function HomePage() {
  const homeData = await getHomeData();
  if (!homeData) redirect("/login");

  const { profile, tiers, currentTier, nextTier, recentActivity, activePromotion } = homeData;
  const firstName = profile.full_name?.split(" ")[0] ?? "";

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <div style={{ flex: 1, overflow: "auto" }}>
        <div style={{ padding: "70px 24px 40px" }}>
          <Header />

          <div>
            <div
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: 26,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              Bonjour {firstName} <span style={{ fontSize: 20 }}>✨</span>
            </div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
              Voici votre espace fidélité
            </div>
          </div>

          <LoyaltyCard profile={profile} nextTier={nextTier} />
          <QrScanCard />
          <TierProgress tiers={tiers} currentTier={currentTier} />
          {activePromotion && <PromotionBanner promotion={activePromotion} />}
          <RecentActivity entries={recentActivity} />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
