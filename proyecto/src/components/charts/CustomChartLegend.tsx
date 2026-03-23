export function CustomChartLegend({
  payload,
  vertical = false,
}: {
  payload?: Array<{ color: string; value: string; count?: number }>;
  vertical?: boolean;
}) {
  if (!payload?.length) return null;

  if (vertical) {
    return (
      <ul style={{ listStyle: "none", padding: 0, margin: "14px 0 0", display: "flex", flexDirection: "column", gap: 8 }}>
        {payload.map((entry, i) => (
          <li key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, color: "#475569" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: entry.color, display: "inline-block", flexShrink: 0 }} />
              {entry.value}
            </span>
            {entry.count !== undefined && (
              <span style={{ fontWeight: 700, color: "#1e293b" }}>{entry.count}</span>
            )}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul style={{ display: "grid", gridTemplateColumns: "repeat(2, max-content)", gap: "4px 16px", justifyContent: "center", padding: 0, margin: "10px 0 0", listStyle: "none" }}>
      {payload.map((entry, i) => (
        <li key={i} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", color: "#475569", fontFamily: "inherit" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: entry.color, display: "inline-block", flexShrink: 0 }} />
          {entry.value}
        </li>
      ))}
    </ul>
  );
}
