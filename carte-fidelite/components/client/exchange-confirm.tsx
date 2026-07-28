"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSettings } from "@/components/providers/settings-provider";
import { confirmExchange } from "@/lib/client/exchange-actions";

export function ExchangeConfirm({
  reward,
  token,
}: {
  reward: { id: string; name: string; points_cost: number };
  token: string | null;
}) {
  const settings = useSettings();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Pas encore de token => la cliente n'a pas scanné. On l'invite à le faire.
  if (!token) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center", paddingTop: 40 }}>
        <div style={{ fontSize: 44 }}>📷</div>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 24, fontWeight: 600 }}>
          Scannez au comptoir
        </h1>
        <p style={{ fontSize: 14.5, color: "rgba(255,255,255,0.6)", maxWidth: 300 }}>
          Pour échanger « {reward.name} », scannez le QR code présent au comptoir du salon.
        </p>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", maxWidth: 300 }}>
          {reward.points_cost} {settings.points_label} seront réservés puis validés en caisse.
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center", paddingTop: 40 }}>
        <div style={{ fontSize: 44 }}>✨</div>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 24, fontWeight: 600 }}>Demande envoyée !</h1>
        <p style={{ fontSize: 14.5, color: "rgba(255,255,255,0.6)", maxWidth: 300 }}>
          Le salon a été notifié. Présentez-vous au comptoir, votre échange « {reward.name} »
          sera validé et vos points débités à ce moment-là.
        </p>
        <button
          onClick={() => router.push("/gains")}
          style={{
            marginTop: 16,
            background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
            color: "#20160a",
            fontWeight: 600,
            fontSize: 15,
            padding: "14px 30px",
            borderRadius: 28,
            border: "none",
            cursor: "pointer",
          }}
        >
          Voir mes gains
        </button>
      </div>
    );
  }

  function confirm() {
    startTransition(async () => {
      const res = await confirmExchange(token!, reward.id);
      if (res.error) {
        setError(res.error);
        return;
      }
      setDone(true);
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center", paddingTop: 30 }}>
      <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 24, fontWeight: 600 }}>
        Confirmer l&apos;échange
      </h1>
      <div style={{ fontSize: 18, fontWeight: 500, marginTop: 4 }}>{reward.name}</div>
      <div style={{ fontSize: 15, color: "var(--color-primary)", fontWeight: 600 }}>
        {reward.points_cost} {settings.points_label}
      </div>

      {error && <p style={{ color: "#e08a6a", fontSize: 13.5 }}>{error}</p>}

      <button
        onClick={confirm}
        disabled={isPending}
        style={{
          marginTop: 20,
          background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
          color: "#20160a",
          fontWeight: 600,
          fontSize: 15,
          padding: "15px 32px",
          borderRadius: 30,
          border: "none",
          cursor: isPending ? "default" : "pointer",
          width: "100%",
          maxWidth: 300,
        }}
      >
        {isPending ? "..." : "Confirmer et notifier le salon"}
      </button>
    </div>
  );
}
