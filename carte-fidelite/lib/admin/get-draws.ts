import { createClient } from "@/lib/supabase/server";

export interface DrawRow {
  id: string;
  client_name: string;
  source: "wheel" | "catalogue";
  label: string;
  points_spent: number;
  status: "pending" | "available" | "used" | "expired";
  created_at: string;
  validated_at: string | null;
}

/** Combien de temps un gain validé reste visible (grisé) avant de disparaître. */
const KEEP_VALIDATED_MINUTES = 60;

function mapRow(row: {
  id: string;
  source: string;
  label: string;
  points_spent: number;
  status: string;
  created_at: string;
  validated_at: string | null;
  profiles: { full_name: string | null } | null;
}): DrawRow {
  return {
    id: row.id,
    client_name: row.profiles?.full_name ?? "Client",
    source: row.source as DrawRow["source"],
    label: row.label,
    points_spent: row.points_spent,
    status: row.status as DrawRow["status"],
    created_at: row.created_at,
    validated_at: row.validated_at,
  };
}

/**
 * Liste unique pour l'écran "Tirages & gains" :
 * - tous les gains en attente (pending/available)
 * - les gains validés il y a moins de KEEP_VALIDATED_MINUTES (affichés grisés
 *   "Validé" un moment pour que l'admin voie la prise en compte, puis ils
 *   disparaissent).
 * Triés : en attente d'abord (plus anciens en haut), puis validés récents.
 */
export async function getDraws(): Promise<DrawRow[]> {
  const supabase = await createClient();
  const cutoff = new Date(Date.now() - KEEP_VALIDATED_MINUTES * 60_000).toISOString();

  const [pendingRes, recentUsedRes] = await Promise.all([
    supabase
      .from("user_rewards")
      .select("id, source, label, points_spent, status, created_at, validated_at, profiles(full_name)")
      .in("status", ["pending", "available"])
      .order("created_at", { ascending: true }),
    supabase
      .from("user_rewards")
      .select("id, source, label, points_spent, status, created_at, validated_at, profiles(full_name)")
      .eq("status", "used")
      .gte("validated_at", cutoff)
      .order("validated_at", { ascending: false }),
  ]);

  const pending = (pendingRes.data ?? []).map((r) => mapRow(r as never));
  const recentUsed = (recentUsedRes.data ?? []).map((r) => mapRow(r as never));

  return [...pending, ...recentUsed];
}
