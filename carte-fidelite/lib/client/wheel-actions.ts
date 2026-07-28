"use server";

import { createClient } from "@/lib/supabase/server";

export interface WheelResult {
  label: string;
  type: "points" | "gift" | "discount";
  points_value: number | null;
}

/**
 * Étape 1 : la cliente scanne le QR (token dans l'URL). Débloque un tirage
 * si le cooldown est écoulé. Toute la logique est dans redeem_scan() côté DB
 * (SECURITY DEFINER) — le client ne peut pas forger un scan.
 */
export async function redeemScan(
  token: string
): Promise<{ scanId?: string; error?: string; cooldown?: boolean }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Vous devez être connectée." };

  const { data, error } = await supabase.rpc("redeem_scan", { p_token: token });

  if (error) {
    if (error.message.includes("COOLDOWN")) {
      return { cooldown: true, error: "Vous avez déjà joué récemment. Revenez plus tard !" };
    }
    if (error.message.includes("invalide")) {
      return { error: "QR code invalide." };
    }
    return { error: "Impossible de valider le scan pour le moment." };
  }

  return { scanId: data as string };
}

/**
 * Étape 2 : jouer le tirage débloqué par un scan. Le segment gagnant est
 * choisi côté serveur selon les probabilités (play_wheel), impossible à
 * influencer depuis le navigateur.
 */
export async function playWheel(
  scanId: string
): Promise<{ result?: WheelResult; error?: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("play_wheel", { p_scan_id: scanId });

  if (error) {
    if (error.message.includes("déjà")) {
      return { error: "Ce tirage a déjà été utilisé." };
    }
    return { error: "Le tirage a échoué. Réessayez." };
  }

  const seg = data as { label: string; type: WheelResult["type"]; points_value: number | null };
  return {
    result: { label: seg.label, type: seg.type, points_value: seg.points_value },
  };
}
