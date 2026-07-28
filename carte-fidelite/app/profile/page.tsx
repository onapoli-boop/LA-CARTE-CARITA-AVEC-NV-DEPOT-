import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AvatarUploader } from "@/components/client/avatar-uploader";
import { ProfileInfo } from "@/components/client/profile-info";
import { LogoutButton } from "@/components/auth/logout-button";
import { getBusinessSettings } from "@/lib/settings/get-settings";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, settings] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, phone, avatar_url, points_balance, member_since, notif_push_enabled, role")
      .eq("id", user.id)
      .single(),
    getBusinessSettings(),
  ]);

  if (!profile) redirect("/login");

  const memberYear = new Date(profile.member_since).getFullYear();
  const isAdmin = profile.role === "admin" || profile.role === "superadmin";
  // L'admin revient sur son dashboard, la cliente sur sa carte.
  const backHref = isAdmin ? "/admin" : "/";

  return (
    <div style={{ minHeight: "100vh", padding: "56px 24px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
        <Link
          href={backHref}
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            border: "1px solid var(--color-secondary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--color-secondary)",
            flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 24, fontWeight: 600 }}>Profil</h1>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 32 }}>
        <AvatarUploader userId={user.id} initialUrl={profile.avatar_url} />
        <div style={{ fontFamily: "var(--font-heading)", fontSize: 24, fontWeight: 600, marginTop: 6 }}>
          {profile.full_name ?? "—"}
        </div>
        <div style={{ fontSize: 13, letterSpacing: "0.05em", color: "var(--color-secondary)" }}>
          MEMBRE DEPUIS {memberYear} · {profile.points_balance} {(settings?.points_label ?? "pts").toUpperCase()}
        </div>
      </div>

      <ProfileInfo
        profile={{
          full_name: profile.full_name,
          phone: profile.phone,
          notif_push_enabled: profile.notif_push_enabled,
        }}
        email={user.email ?? ""}
      />

      <div style={{ marginTop: 30 }}>
        <LogoutButton />
      </div>
    </div>
  );
}
