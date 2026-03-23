export function DonutCenterLabel({
  cx,
  cy,
  total,
  sublabel = "casos",
}: {
  cx: number;
  cy: number;
  total: number;
  sublabel?: string;
}) {
  return (
    <g>
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{
          fontSize: "20px",
          fontWeight: 700,
          fill: "#1e293b",
          fontFamily: "inherit",
        }}
      >
        {total}
      </text>
      <text
        x={cx}
        y={cy + 13}
        textAnchor="middle"
        style={{
          fontSize: "10px",
          fill: "#94a3b8",
          fontFamily: "inherit",
          fontWeight: 400,
        }}
      >
        {sublabel}
      </text>
    </g>
  );
}
