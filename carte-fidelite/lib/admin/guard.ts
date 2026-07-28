import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * À appeler en tête de tout Server Component sous /admin.
 * Redirige vers /login si non connecté, vers / si connecté mais pas admin.
 */
export async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "admin" && profile.role !== "superadmin")) {
    redirect("/");
  }

  return { userId: user.id, role: profile.role, fullName: profile.full_name };
}
