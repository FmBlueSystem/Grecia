export function CustomChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ color: string; value: number; name: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        padding: "8px 14px",
        boxShadow: "0 8px 24px -4px rgba(0, 103, 178, 0.12)",
        fontSize: "13px",
        fontFamily: "inherit",
        minWidth: "110px",
      }}
    >
      {label && (
        <p
          style={{
            margin: "0 0 6px",
            color: "#94a3b8",
            fontSize: "10px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {label}
        </p>
      )}
      {payload.map((entry, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            marginTop: i > 0 ? "4px" : 0,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: entry.color || "#0067B2",
              flexShrink: 0,
              display: "inline-block",
            }}
          />
          <span style={{ color: "#1e293b", fontWeight: 700 }}>{entry.value}</span>
          <span style={{ color: "#64748b", fontSize: "12px" }}>{entry.name}</span>
        </div>
      ))}
    </div>
  );
}
