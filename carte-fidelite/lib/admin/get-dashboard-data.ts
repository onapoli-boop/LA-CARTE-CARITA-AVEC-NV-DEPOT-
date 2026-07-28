import { createClient } from "@/lib/supabase/server";

export interface DashboardStats {
  pointsDistributedToday: number;
  activeClientsThisMonth: number;
  drawsToday: number;
  participationRatePct: number | null; // null si aucune activité aujourd'hui (rien à diviser)
}

export interface RecentActivityRow {
  id: string;
  client_name: string;
  type: string;
  points_delta: number;
  created_at: string;
}

const TYPE_LABELS: Record<string, string> = {
  purchase: "Achat en institut",
  wheel_spin: "Tirage à la roue",
  welcome_bonus: "Bienvenue",
  reward_redeem: "Récompense échangée",
  manual_adjustment: "Ajustement",
  tier_upgrade: "Palier atteint",
};

function startOfToday(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function startOfMonth(): string {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();
  const todayStart = startOfToday();
  const monthStart = startOfMonth();

  const [todayLogsRes, monthClientLogsRes] = await Promise.all([
    supabase
      .from("activity_logs")
      .select("profile_id, type, points_delta")
      .gte("created_at", todayStart),
    supabase
      .from("activity_logs")
      .select("profile_id, profiles!inner(role)")
      .eq("profiles.role", "client")
      .gte("created_at", monthStart),
  ]);

  const todayLogs = todayLogsRes.data ?? [];
  const monthClientLogs = monthClientLogsRes.data ?? [];

  const pointsDistributedToday = todayLogs
    .filter((l) => l.points_delta > 0)
    .reduce((sum, l) => sum + l.points_delta, 0);

  const drawsToday = todayLogs.filter((l) => l.type === "wheel_spin").length;

  const activeClientsThisMonth = new Set(monthClientLogs.map((l) => l.profile_id)).size;

  // Heuristique : parmi les clients ayant eu une activité aujourd'hui,
  // quelle proportion a fait un tirage à la roue aujourd'hui. Approximation
  // du "scan -> roue" en l'absence d'un événement de scan dédié en base.
  const distinctActiveToday = new Set(todayLogs.map((l) => l.profile_id)).size;
  const distinctWheelToday = new Set(
    todayLogs.filter((l) => l.type === "wheel_spin").map((l) => l.profile_id)
  ).size;
  const participationRatePct =
    distinctActiveToday > 0 ? Math.round((distinctWheelToday / distinctActiveToday) * 100) : null;

  return { pointsDistributedToday, activeClientsThisMonth, drawsToday, participationRatePct };
}

export async function getRecentActivity(limit = 6): Promise<RecentActivityRow[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("activity_logs")
    .select("id, type, points_delta, created_at, profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((row) => ({
    id: row.id,
    client_name: (row.profiles as unknown as { full_name: string | null })?.full_name ?? "Client",
    type: TYPE_LABELS[row.type] ?? row.type,
    points_delta: row.points_delta,
    created_at: row.created_at,
  }));
}
