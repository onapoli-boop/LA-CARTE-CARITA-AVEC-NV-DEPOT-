import { getBusinessSettings } from "@/lib/settings/get-settings";
import { BrandingForm } from "@/components/admin/branding-form";

export default async function AdminBrandingPage() {
  const settings = await getBusinessSettings();

  if (!settings) {
    return <p>Configuration introuvable.</p>;
  }

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 24, fontWeight: 600, marginBottom: 6 }}>
        Branding
      </h1>
      <p style={{ fontSize: 13.5, opacity: 0.55, marginTop: 0, marginBottom: 28 }}>
        Ces réglages s&apos;appliquent instantanément sur toute l&apos;application,
        pour tous vos clients.
      </p>
      <BrandingForm settings={settings} />
    </div>
  );
}
