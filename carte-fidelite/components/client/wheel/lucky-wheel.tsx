"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSettings } from "@/components/providers/settings-provider";
import { playWheel, type WheelResult } from "@/lib/client/wheel-actions";

export interface WheelSegment {
  id: string;
  label: string;
  type: "points" | "gift" | "discount";
  is_dark: boolean;
  sort_order: number;
}

/**
 * Roue thémée : les segments clairs utilisent --color-primary, les sombres un
 * ton foncé dérivé du fond. Le libellé prend un contraste automatique.
 * L'animation est purement visuelle : le VRAI résultat vient de playWheel()
 * (serveur). On aligne ensuite la roue sur le segment renvoyé.
 */
export function LuckyWheel({
  segments,
  scanId,
}: {
  segments: WheelSegment[];
  scanId: string;
}) {
  const settings = useSettings();
  const router = useRouter();
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<WheelResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const usedRef = useRef(false);

  const N = segments.length;
  const segAngle = 360 / N;

  async function spin() {
    if (spinning || usedRef.current) return;
    usedRef.current = true;
    setSpinning(true);
    setError(null);

    const res = await playWheel(scanId);

    if (res.error || !res.result) {
      setError(res.error ?? "Erreur");
      setSpinning(false);
      usedRef.current = false;
      return;
    }

    // Trouver l'index du segment gagné pour aligner la roue dessus.
    const wonIndex = Math.max(
      0,
      segments.findIndex((s) => s.label === res.result!.label)
    );
    const extraTurns = 5 + Math.floor(Math.random() * 3);
    const target =
      rotation + extraTurns * 360 + (360 - (wonIndex * segAngle + segAngle / 2));

    setRotation(target);

    // Laisser l'animation se dérouler (4s) avant d'afficher le résultat.
    setTimeout(() => {
      setResult(res.result!);
      setSpinning(false);
    }, 4200);
  }

  // Génère les tranches SVG.
  const cx = 150, cy = 150, r = 150;
  const polar = (deg: number, radius: number) => {
    const a = ((deg - 90) * Math.PI) / 180;
    return [cx + radius * Math.cos(a), cy + radius * Math.sin(a)];
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
      <div style={{ textAlign: "center", paddingTop: 6 }}>
        <div style={{ fontFamily: "var(--font-heading)", fontSize: 32, fontWeight: 600 }}>
          À vous de jouer !
        </div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 8 }}>
          Faites tourner la roue et tentez votre chance
        </div>
      </div>

      <div
        style={{
          position: "relative",
          width: 320,
          height: 320,
          marginTop: 10,
          filter: "drop-shadow(0 25px 45px rgba(0,0,0,0.6))",
        }}
      >
        {/* halo */}
        <div
          style={{
            position: "absolute",
            inset: -6,
            borderRadius: "50%",
            background: "radial-gradient(circle, color-mix(in srgb, var(--color-primary) 35%, transparent), transparent 70%)",
            filter: "blur(10px)",
          }}
        />
        {/* jante */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background:
              "conic-gradient(from -45deg, color-mix(in srgb, var(--color-primary) 60%, #000), var(--color-primary) 20%, color-mix(in srgb, var(--color-secondary) 70%, #000) 40%, var(--color-primary) 60%, color-mix(in srgb, var(--color-primary) 60%, #000) 80%, var(--color-primary) 100%)",
            boxShadow: "inset 0 2px 3px rgba(255,255,255,0.4), inset 0 -3px 5px rgba(0,0,0,0.5)",
          }}
        />
        <div style={{ position: "absolute", inset: 8, borderRadius: "50%", background: "#0d0d0d" }} />

        {/* disque tournant */}
        <div
          style={{
            position: "absolute",
            inset: 15,
            borderRadius: "50%",
            overflow: "hidden",
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? "transform 4s cubic-bezier(0.17,0.67,0.2,1)" : "none",
          }}
        >
          <svg viewBox="0 0 300 300" width="100%" height="100%" style={{ display: "block" }}>
            {segments.map((s, i) => {
              const start = i * segAngle;
              const end = (i + 1) * segAngle;
              const [x1, y1] = polar(start, r);
              const [x2, y2] = polar(end, r);

              const mid = start + segAngle / 2;
              const [tx, ty] = polar(mid, r * 0.62);
              return (
                <g key={s.id}>
                  <path d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 0 1 ${x2},${y2} Z`} fill={fill} />
                  <text
                    x={tx}
                    y={ty}
                    fill={textColor}
                    fontSize="11"
                    fontWeight="600"
                    fontFamily="var(--font-heading)"
                    textAnchor="middle"
                    transform={`rotate(${mid} ${tx} ${ty})`}
                  >
                    {s.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* pointeur */}
        <div
          style={{
            position: "absolute",
            top: -20,
            left: "50%",
            width: 40,
            height: 44,
            marginLeft: -20,
            zIndex: 4,
            filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.6))",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50% 50% 50% 0",
              background: "linear-gradient(135deg, var(--color-primary), color-mix(in srgb, var(--color-secondary) 70%, #000))",
              transform: "rotate(45deg)",
              border: "2px solid #0d0d0d",
            }}
          />
        </div>

        {/* moyeu */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 80,
            height: 80,
            margin: "-40px 0 0 -40px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--color-primary), color-mix(in srgb, var(--color-secondary) 70%, #000))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 3,
          }}
        >
          <div
            style={{
              width: 70,
              height: 70,
              borderRadius: "50%",
              background: "radial-gradient(circle at 40% 30%, #1c1c1c, #050505 75%)",
              border: "1.5px solid color-mix(in srgb, var(--color-primary) 60%, transparent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: 30,
                color: "var(--color-primary)",
                fontWeight: 500,
              }}
            >
              {settings.name[0]}
            </span>
          </div>
        </div>
      </div>

      <div style={{ position: "relative", width: 170, height: 170, marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1.5px dashed color-mix(in srgb, var(--color-primary) 45%, transparent)" }} />
        <button
          onClick={spin}
          disabled={spinning}
          style={{
            width: 132,
            height: 132,
            borderRadius: "50%",
            border: "2px solid var(--color-primary)",
            background: "radial-gradient(circle, color-mix(in srgb, var(--color-primary) 10%, transparent), transparent 70%)",
            color: "#fff",
            cursor: spinning ? "default" : "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            animation: spinning ? "none" : "ctaPulse 2.2s ease-in-out infinite",
          }}
        >
          <span style={{ fontFamily: "var(--font-heading)", fontSize: 19, letterSpacing: 2, fontWeight: 500 }}>
            {spinning ? "..." : "TOURNER"}
          </span>
          {!spinning && (
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 15, letterSpacing: 2, color: "var(--color-primary)", fontWeight: 500, marginTop: 2 }}>
              LA ROUE
            </span>
          )}
        </button>
      </div>

      {error && <p style={{ color: "#e08a6a", fontSize: 13.5 }}>{error}</p>}

      {result && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "var(--color-background)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 18,
            padding: "40px 32px",
            textAlign: "center",
            zIndex: 50,
          }}
        >
          <div style={{ fontSize: 44 }}>✨</div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 28, fontWeight: 600 }}>
            Félicitations !
          </div>
          <div style={{ fontSize: 16, color: "rgba(255,255,255,0.7)" }}>Vous avez remporté</div>
          <div style={{ fontSize: 34, fontWeight: 700, color: "var(--color-primary)" }}>
            {result.type === "points" ? `+${result.points_value} ${settings.points_label}` : result.label}
          </div>
          {result.type !== "points" && (
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", maxWidth: 280 }}>
              Retrouvez ce gain dans « Mes gains » et présentez-le en salon.
            </div>
          )}
          <button
            onClick={() => router.push("/")}
            style={{
              marginTop: 20,
              background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
              color: "#20160a",
              fontWeight: 600,
              fontSize: 15,
              padding: "15px 32px",
              borderRadius: 30,
              border: "none",
              cursor: "pointer",
              width: "100%",
              maxWidth: 300,
            }}
          >
            Retour à l&apos;accueil
          </button>
        </div>
      )}
    </div>
  );
}
