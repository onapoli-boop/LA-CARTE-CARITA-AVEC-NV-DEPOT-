export function TotalProbabilityBadge({ total }: { total: number }) {
  const isComplete = total === 100;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 14px",
        borderRadius: 20,
        background: isComplete ? "rgba(205,167,106,0.15)" : "rgba(224,138,106,0.15)",
        color: isComplete ? "var(--color-primary)" : "#e08a6a",
        fontSize: 13.5,
        fontWeight: 600,
      }}
    >
      Total : {Number.isInteger(total) ? total : total.toFixed(1)}%
      {!isComplete && <span style={{ fontWeight: 400, opacity: 0.8 }}>— doit faire 100%</span>}
    </div>
  );
}
