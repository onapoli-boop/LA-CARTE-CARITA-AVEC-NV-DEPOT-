"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Étape 1 : la cliente "demande" un échange depuis le catalogue.
 * On ne crée PAS encore le coupon : on vérifie juste qu'elle a assez de points
 * et on renvoie l'id de la récompense. La création effective se fait au scan
 * (confirmExchange), pour matérialiser la présence physique au comptoir.
 */
export async function requestExchange(
  rewardId: string
): Promise<{ ok?: boolean; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Vous devez être connectée." };

  const [{ data: reward }, { data: profile }] = await Promise.all([
    supabase.from("rewards").select("id, name, points_cost, is_active").eq("id", rewardId).single(),
    supabase.from("profiles").select("points_balance").eq("id", user.id).single(),
  ]);

  if (!reward || !reward.is_active) return { error: "Cette récompense n'est plus disponible." };
  if (!profile || profile.points_balance < reward.points_cost) {
    return { error: "Vous n'avez pas assez de points pour cette récompense." };
  }

  return { ok: true };
}

/**
 * Étape 2 : au comptoir, la cliente scanne le QR pour CONFIRMER l'échange.
 * Vérifie le token, revérifie le solde, crée le coupon 'pending' (points
 * réservés, déduits seulement à la validation admin en caisse).
 * Le coupon apparaît alors dans la liste admin "Tirages & gains".
 */
export async function confirmExchange(
  token: string,
  rewardId: string
): Promise<{ ok?: boolean; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Vous devez être connectée." };

  // Valider le token du QR salon.
  const { data: settings } = await supabase
    .from("business_settings")
    .select("scan_token")
    .limit(1)
    .single();
  if (!settings || settings.scan_token !== token) {
    return { error: "QR code invalide." };
  }

  const [{ data: reward }, { data: profile }] = await Promise.all([
    supabase.from("rewards").select("id, name, points_cost, is_active").eq("id", rewardId).single(),
    supabase.from("profiles").select("points_balance").eq("id", user.id).single(),
  ]);

  if (!reward || !reward.is_active) return { error: "Cette récompense n'est plus disponible." };
  if (!profile || profile.points_balance < reward.points_cost) {
    return { error: "Solde de points insuffisant." };
  }

  // Créer le coupon 'pending' : points RÉSERVÉS (pas encore déduits).
  const { error } = await supabase.from("user_rewards").insert({
    profile_id: user.id,
    source: "catalogue",
    reward_id: reward.id,
    label: reward.name,
    status: "pending",
    points_spent: reward.points_cost,
  });

  if (error) return { error: "La demande d'échange a échoué." };

  revalidatePath("/gains");
  revalidatePath("/admin/draws");
  return { ok: true };
}
