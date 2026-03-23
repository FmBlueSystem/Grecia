"use client";

import { useState, useCallback, useId } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Label,
  Sector,
} from "recharts";
import { useTheme } from "@/components/theme-provider";
import { DonutCenterLabel } from "@/components/charts/DonutCenterLabel";
import { CustomChartTooltip } from "@/components/charts/CustomChartTooltip";
import { CustomChartLegend } from "@/components/charts/CustomChartLegend";

interface ChartItem {
  name: string;
  value: number;
  color: string;
}

interface MonthData {
  month: string;
  total: number;
  open: number;
  closed: number;
}

function renderActiveShape(props: any) {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill, cornerRadius,
  } = props;
  const safeId = String(fill).replace(/[^a-zA-Z0-9]/g, "");
  return (
    <g>
      <defs>
        <filter id={`glow-${safeId}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feFlood floodColor={fill} floodOpacity="0.35" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="shadow" />
          <feMerge>
            <feMergeNode in="shadow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 2}
        outerRadius={outerRadius + 4}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        cornerRadius={cornerRadius}
        filter={`url(#glow-${safeId})`}
      />
    </g>
  );
}

export function DonutChart({ data, height = 260 }: { data: ChartItem[]; height?: number }) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  const onEnter = useCallback((_: unknown, index: number) => setActiveIndex(index), []);
  const onLeave = useCallback(() => setActiveIndex(undefined), []);

  if (data.every((d) => d.value === 0)) {
    return <p className="text-center text-sm text-slate-400 py-8">Sin datos</p>;
  }
  const total = data.reduce((sum, d) => sum + d.value, 0);

  // Recharts 3.x: pass activeIndex via spread to bypass strict typing
  const pieExtra: Record<string, unknown> = { activeIndex };
  const rawId = useId();
  const uid = rawId.replace(/:/g, "");

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <defs>
          {data.map((entry, i) => (
            <radialGradient key={`rg-${i}`} id={`dg-${uid}-${i}`} cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
              <stop offset="100%" stopColor={entry.color} stopOpacity={0.75} />
            </radialGradient>
          ))}
        </defs>
        <Pie
          data={data}
          cx="50%"
          cy="42%"
          innerRadius={42}
          outerRadius={74}
          paddingAngle={3}
          cornerRadius={4}
          dataKey="value"
          strokeWidth={0}
          activeShape={renderActiveShape}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          isAnimationActive={true}
          animationBegin={0}
          animationDuration={800}
          animationEasing="ease-out"
          {...pieExtra}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={`url(#dg-${uid}-${index})`} />
          ))}
          <Label
            content={({ viewBox }) => {
              const { cx, cy } = viewBox as { cx: number; cy: number };
              return <DonutCenterLabel cx={cx} cy={cy} total={total} />;
            }}
            position="center"
          />
        </Pie>
        <Tooltip
          content={<CustomChartTooltip />}
          cursor={{ fill: "rgba(0, 103, 178, 0.04)" }}
        />
        <Legend content={(props: any) => {
          const mapped = props.payload?.map((entry: any, i: number) => ({
            ...entry,
            color: data[i]?.color || entry.color,
          }));
          return <CustomChartLegend payload={mapped} />;
        }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function StatsTrendChart({ data }: { data: MonthData[] }) {
  const { chartColors } = useTheme();
  const primaryLight = "#109BC4";
  const primaryColor = chartColors[0] || "#0067B2";

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} barGap={2}>
        <defs>
          <linearGradient id="statBarGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={primaryLight} stopOpacity={1} />
            <stop offset="100%" stopColor={primaryColor} stopOpacity={1} />
          </linearGradient>
          <linearGradient id="statBarGradientClosed" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" stopOpacity={1} />
            <stop offset="100%" stopColor="#059669" stopOpacity={1} />
          </linearGradient>
          <filter id="barShadow" x="-10%" y="-10%" width="130%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor={primaryColor} floodOpacity="0.2" />
          </filter>
          <filter id="barShadowGreen" x="-10%" y="-10%" width="130%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#059669" floodOpacity="0.2" />
          </filter>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          content={<CustomChartTooltip />}
          cursor={{ fill: "rgba(0, 103, 178, 0.04)" }}
        />
        <Bar
          dataKey="open"
          name="Abiertos"
          fill="url(#statBarGradient)"
          radius={[6, 6, 0, 0]}
          maxBarSize={40}
          style={{ filter: "url(#barShadow)" }}
          isAnimationActive={true}
          animationBegin={0}
          animationDuration={600}
          animationEasing="ease-out"
        />
        <Bar
          dataKey="closed"
          name="Cerrados"
          fill="url(#statBarGradientClosed)"
          radius={[6, 6, 0, 0]}
          maxBarSize={40}
          style={{ filter: "url(#barShadowGreen)" }}
          isAnimationActive={true}
          animationBegin={200}
          animationDuration={600}
          animationEasing="ease-out"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
