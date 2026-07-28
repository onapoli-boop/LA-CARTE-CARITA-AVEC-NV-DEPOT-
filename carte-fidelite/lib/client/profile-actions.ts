"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ProfileFormState = { error?: string; success?: boolean } | undefined;

export async function updateProfile(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const full_name = (formData.get("full_name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim() || null;

  if (!full_name) return { error: "Le nom est requis." };

  const { error } = await supabase
    .from("profiles")
    .update({ full_name, phone })
    .eq("id", user.id);

  if (error) return { error: "La mise à jour a échoué." };

  revalidatePath("/profile");
  revalidatePath("/");
  return { success: true };
}

export async function toggleNotifications(enabled: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("profiles").update({ notif_push_enabled: enabled }).eq("id", user.id);
  revalidatePath("/profile");
}

/**
 * Enregistre l'URL publique de l'avatar après upload côté client dans le
 * bucket 'avatars'. L'upload lui-même se fait depuis le navigateur (fichier
 * binaire), on ne persiste ici que le chemin/URL résultant.
 */
export async function saveAvatarUrl(avatar_url: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("profiles").update({ avatar_url }).eq("id", user.id);
  revalidatePath("/profile");
  revalidatePath("/");
}
