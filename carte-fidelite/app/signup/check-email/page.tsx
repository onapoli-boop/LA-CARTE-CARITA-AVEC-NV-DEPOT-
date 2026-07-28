export default function CheckEmailPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: "40px 28px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 40 }}>📩</div>
      <h1
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: 22,
          fontWeight: 600,
        }}
      >
        Vérifiez votre boîte mail
      </h1>
      <p style={{ fontSize: 14, opacity: 0.6, maxWidth: 320 }}>
        Un lien de confirmation vient de vous être envoyé. Cliquez dessus pour
        activer votre compte et accéder à votre carte de fidélité.
      </p>
    </div>
  );
}
