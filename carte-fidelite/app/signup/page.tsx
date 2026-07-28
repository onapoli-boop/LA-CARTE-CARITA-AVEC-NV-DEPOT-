import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "40px 28px" }}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 26, fontWeight: 600, marginBottom: 32, textAlign: "center" }}>
          Créer un compte
        </h1>
        <SignupForm />
      </div>
    </div>
  );
}
