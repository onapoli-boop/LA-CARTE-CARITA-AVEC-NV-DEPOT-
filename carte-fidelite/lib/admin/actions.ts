"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/guard";

export type BrandingFormState = { error?: string; success?: boolean } | undefined;

export async function updateBranding(
  _prevState: BrandingFormState,
  formData: FormData
): Promise<BrandingFormState> {
  // Double barrière : le guard explicite ici + la policy RLS
  // "business_settings_update_admin" côté base. Aucune des deux ne suffit
  // seule à documenter l'intention, donc on garde les deux.
  await requireAdmin();

  const supabase = await createClient();

  const name = formData.get("name") as string;
  const brand_word = (formData.get("brand_word") as string) || null;
  const brand_subword = (formData.get("brand_subword") as string) || null;
  const points_label = formData.get("points_label") as string;
  const welcome_bonus_points = Number(formData.get("welcome_bonus_points") ?? 0);
  const scan_cooldown_minutes = Number(formData.get("scan_cooldown_minutes") ?? 60);
  const primary_color = formData.get("primary_color") as string;
  const secondary_color = formData.get("secondary_color") as string;
  const background_color = formData.get("background_color") as string;
  const text_color = formData.get("text_color") as string;
  const font_heading = formData.get("font_heading") as string;
  const font_body = formData.get("font_body") as string;

  if (!name || !points_label || !primary_color || !background_color) {
    return { error: "Merci de remplir au minimum le nom, le libellé des points et les couleurs." };
  }

  const { data: existing } = await supabase.from("business_settings").select("id").limit(1).maybeSingle();

  if (!existing) {
    return { error: "Aucune configuration trouvée. Contacte le support." };
  }

  const { error } = await supabase
    .from("business_settings")
    .update({
      name,
      brand_word,
      brand_subword,
      points_label,
      welcome_bonus_points,
      scan_cooldown_minutes,
      primary_color,
      secondary_color,
      background_color,
      text_color,
      font_heading,
      font_body,
    })
    .eq("id", existing.id);

  if (error) {
    return { error: "La mise à jour a échoué. Réessaie." };
  }

  // Le thème est lu dans app/layout.tsx (racine) : on invalide tout le site.
  revalidatePath("/", "layout");

  return { success: true };
}

export type PromoFormState = { error?: string; success?: boolean } | undefined;

export async function updatePromotion(
  _prevState: PromoFormState,
  formData: FormData
): Promise<PromoFormState> {
  await requireAdmin();
  const supabase = await createClient();

  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const is_active = formData.get("is_active") === "on";

  if (!title) {
    return { error: "Le titre de la promotion est requis." };
  }

  const { data: existing } = await supabase
    .from("promotions")
    .select("id")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = existing
    ? await supabase.from("promotions").update({ title, description, is_active }).eq("id", existing.id)
    : await supabase.from("promotions").insert({ title, description, is_active });

  if (error) {
    return { error: "La mise à jour de la promotion a échoué." };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin");
  return { success: true };
}

// =============================================================================
// CATALOGUE (rewards)
// =============================================================================

export async function toggleRewardActive(id: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { data: reward } = await supabase.from("rewards").select("is_active").eq("id", id).single();
  if (!reward) return;

  await supabase.from("rewards").update({ is_active: !reward.is_active }).eq("id", id);
  revalidatePath("/admin/catalogue");
  revalidatePath("/catalogue");
}

export async function bumpRewardPoints(id: string, delta: number) {
  await requireAdmin();
  const supabase = await createClient();

  const { data: reward } = await supabase.from("rewards").select("points_cost").eq("id", id).single();
  if (!reward) return;

  const next = Math.max(0, reward.points_cost + delta);
  await supabase.from("rewards").update({ points_cost: next }).eq("id", id);
  revalidatePath("/admin/catalogue");
  revalidatePath("/catalogue");
}

export async function updateRewardText(id: string, field: "name" | "category", value: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("rewards").update({ [field]: value }).eq("id", id);
  revalidatePath("/admin/catalogue");
  revalidatePath("/catalogue");
}

export async function addReward() {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("rewards").insert({
    name: "Nouvelle récompense",
    category: "Général",
    points_cost: 100,
    is_active: true,
  });
  revalidatePath("/admin/catalogue");
  revalidatePath("/catalogue");
}

export async function deleteReward(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("rewards").delete().eq("id", id);
  revalidatePath("/admin/catalogue");
  revalidatePath("/catalogue");
}

// =============================================================================
// ROUE DE LA CHANCE (wheel_segments)
// =============================================================================

export async function bumpProbability(id: string, delta: number): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await createClient();

  const { data: segment } = await supabase.from("wheel_segments").select("probability").eq("id", id).single();
  if (!segment) return { error: "Segment introuvable." };

  const next = Math.max(0, Math.min(100, Math.round((Number(segment.probability) + delta) * 10) / 10));
  const { error } = await supabase.from("wheel_segments").update({ probability: next }).eq("id", id);

  revalidatePath("/admin/wheel");
  // Le trigger check_wheel_probability_total() rejette si la somme dépasse 100%.
  return error ? { error: "La somme des probabilités ne peut pas dépasser 100%." } : {};
}

export async function setSegmentLabel(id: string, label: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("wheel_segments").update({ label }).eq("id", id);
  revalidatePath("/admin/wheel");
}

export async function setSegmentPointsValue(id: string, points_value: number) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("wheel_segments").update({ points_value }).eq("id", id);
  revalidatePath("/admin/wheel");
}

const DEFAULT_LABEL_BY_TYPE: Record<string, string> = {
  points: "+10 points",
  gift: "Cadeau offert",
  discount: "-10% (réduction)",
};

export async function setSegmentType(id: string, type: "points" | "gift" | "discount") {
  await requireAdmin();
  const supabase = await createClient();
  await supabase
    .from("wheel_segments")
    .update({ type, label: DEFAULT_LABEL_BY_TYPE[type] })
    .eq("id", id);
  revalidatePath("/admin/wheel");
}

export async function removeWheelSegment(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("wheel_segments").delete().eq("id", id);
  revalidatePath("/admin/wheel");
}

export async function addWheelSegment(): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await createClient();

  const { count } = await supabase.from("wheel_segments").select("id", { count: "exact", head: true });
  if ((count ?? 0) >= 8) {
    return { error: "8 segments maximum sur la roue." };
  }

  await supabase.from("wheel_segments").insert({
    label: "+10 points",
    type: "points",
    points_value: 10,
    probability: 0,
    is_dark: (count ?? 0) % 2 === 1,
    sort_order: count ?? 0,
  });

  revalidatePath("/admin/wheel");
  return {};
}

// =============================================================================
// VALIDATION DES GAINS EN CAISSE (user_rewards)
// =============================================================================

/**
 * Valide un gain en salon : passage 'pending' -> 'used'.
 * Pour un échange CATALOGUE, c'est ICI que les points sont réellement déduits
 * (ils étaient seulement "réservés" jusqu'à la validation). On vérifie donc
 * que la cliente a toujours assez de points au moment de valider.
 * Pour un gain ROUE (cadeau/réduction), aucun point à déduire.
 */
export async function validateReward(
  id: string
): Promise<{ error?: string }> {
  const admin = await requireAdmin();
  const supabase = await createClient();

  const { data: reward } = await supabase
    .from("user_rewards")
    .select("id, profile_id, source, status, points_spent, label")
    .eq("id", id)
    .single();

  if (!reward) return { error: "Gain introuvable." };
  if (reward.status === "used") return { error: "Ce gain a déjà été validé." };

  // Échange catalogue : déduire les points maintenant (s'ils sont suffisants).
  if (reward.source === "catalogue" && reward.points_spent > 0) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("points_balance")
      .eq("id", reward.profile_id)
      .single();

    if (!profile || profile.points_balance < reward.points_spent) {
      return { error: "Solde de points insuffisant pour valider cet échange." };
    }

    // Le trigger apply_points_delta décrémentera automatiquement le solde.
    const { error: logError } = await supabase.from("activity_logs").insert({
      profile_id: reward.profile_id,
      type: "reward_redeem",
      points_delta: -reward.points_spent,
      description: `Échange validé : ${reward.label}`,
      created_by: admin.userId,
    });

    if (logError) {
      return { error: "Erreur lors de la déduction des points." };
    }
  }

  const { error } = await supabase
    .from("user_rewards")
    .update({ status: "used", validated_by: admin.userId, validated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: "La validation a échoué." };

  revalidatePath("/admin/draws");
  return {};
}

/**
 * Annule/refuse un gain en attente (ex: erreur, cliente absente).
 * Pour un échange catalogue non encore validé, aucun point n'avait été déduit,
 * donc rien à recréditer.
 */
export async function cancelReward(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("user_rewards")
    .update({ status: "expired" })
    .eq("id", id)
    .eq("status", "pending");

  if (error) return { error: "L'annulation a échoué." };

  revalidatePath("/admin/draws");
  return {};
}
