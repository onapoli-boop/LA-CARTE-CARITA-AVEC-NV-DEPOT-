import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "40px 28px" }}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 26, fontWeight: 600, marginBottom: 32, textAlign: "center" }}>
          Connexion
        </h1>
        <LoginForm />
      </div>
    </div>
  );
}
