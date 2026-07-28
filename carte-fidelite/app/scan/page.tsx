import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { redeemScan } from "@/lib/client/wheel-actions";
import { LuckyWheel, type WheelSegment } from "@/components/client/wheel/lucky-wheel";
import { ExchangeConfirm } from "@/components/client/exchange-confirm";

/**
 * Point d'entrée du QR salon. Deux modes selon les query params :
 *  - ?token=... (+ éventuellement rien d'autre) => débloque un tirage de roue
 *  - ?exchange=<rewardId> => confirme un échange catalogue (le token est celui
 *    du QR ; on le lit ici pour le passer à confirmExchange côté client).
 *
 * Note : le QR imprimé pointe vers /scan?token=<scan_token>. Pour l'échange,
 * la cliente arrive d'abord sur /scan?exchange=<id> (depuis le catalogue),
 * puis scanne le QR qui la renvoie sur /scan?token=...&exchange=<id>.
 */
export default async function ScanPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; exchange?: string }>;
}) {
  const { token, exchange } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const qs = new URLSearchParams();
    if (token) qs.set("token", token);
    if (exchange) qs.set("exchange", exchange);
    redirect(`/login?next=${encodeURIComponent(`/scan?${qs.toString()}`)}`);
  }

  // -------------------------------------------------------------------------
  // MODE ÉCHANGE CATALOGUE
  // -------------------------------------------------------------------------
  if (exchange) {
    const { data: reward } = await supabase
      .from("rewards")
      .select("id, name, points_cost")
      .eq("id", exchange)
      .eq("is_active", true)
      .maybeSingle();

    if (!reward) {
      return <ScanMessage title="Récompense indisponible" text="Cette récompense n'est plus proposée." />;
    }

    // Si le token est déjà présent (la cliente a scanné), on affiche l'écran de
    // confirmation qui appellera confirmExchange. Sinon, on invite à scanner.
    return (
      <div style={{ minHeight: "100vh", padding: "60px 24px" }}>
        <ExchangeConfirm reward={reward} token={token ?? null} />
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // MODE TIRAGE ROUE (défaut)
  // -------------------------------------------------------------------------
  if (!token) {
    return <ScanMessage title="Scannez en salon" text="Scannez le QR code présent au comptoir pour jouer." />;
  }

  const scan = await redeemScan(token);

  if (scan.error || !scan.scanId) {
    return (
      <ScanMessage
        title={scan.cooldown ? "Patience !" : "Oups"}
        text={scan.error ?? "Impossible de débloquer un tirage."}
      />
    );
  }

  const { data: segments } = await supabase
    .from("wheel_segments")
    .select("id, label, type, is_dark, sort_order")
    .order("sort_order", { ascending: true });

  if (!segments || segments.length === 0) {
    return <ScanMessage title="Roue indisponible" text="Aucun lot n'est configuré pour le moment." />;
  }

  return (
    <div style={{ minHeight: "100vh", padding: "40px 22px" }}>
      <LuckyWheel segments={segments as WheelSegment[]} scanId={scan.scanId} />
    </div>
  );
}

function ScanMessage({ title, text }: { title: string; text: string }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: "40px 28px",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 24, fontWeight: 600 }}>{title}</h1>
      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", maxWidth: 300 }}>{text}</p>
      <a href="/" style={{ marginTop: 12, color: "var(--color-primary)", fontSize: 14 }}>
        Retour à l&apos;accueil
      </a>
    </div>
  );
}
