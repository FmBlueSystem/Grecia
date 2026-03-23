"use client";

import { useState, useCallback } from "react";
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
  LabelList,
  Sector,
  AreaChart,
  Area,
} from "recharts";
import { useTheme } from "@/components/theme-provider";
import { CustomChartTooltip } from "@/components/charts/CustomChartTooltip";
import { CustomChartLegend } from "@/components/charts/CustomChartLegend";

interface ByMonthItem {
  month: string;
  open: number;
  closed: number;
}

interface ByTypeItem {
  name: string;
  value: number;
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
        <filter id={`glow-d-${safeId}`} x="-30%" y="-30%" width="160%" height="160%">
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
        filter={`url(#glow-d-${safeId})`}
      />
    </g>
  );
}

export function MonthlyChart({ data }: { data: ByMonthItem[] }) {
  const { chartColors } = useTheme();
  const primaryLight = "#109BC4";
  const primaryColor = chartColors[0] || "#0067B2";

  if (data.length === 0) {
    return <p className="py-16 text-center text-sm text-slate-400">Sin datos suficientes</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} barGap={4}>
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={primaryLight} stopOpacity={1} />
            <stop offset="100%" stopColor={primaryColor} stopOpacity={1} />
          </linearGradient>
          <linearGradient id="barGradientClosed" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" stopOpacity={1} />
            <stop offset="100%" stopColor="#059669" stopOpacity={1} />
          </linearGradient>
          <filter id="dashBarShadow" x="-10%" y="-10%" width="130%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor={primaryColor} floodOpacity="0.2" />
          </filter>
          <filter id="dashBarShadowGreen" x="-10%" y="-10%" width="130%" height="140%">
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
          fill="url(#barGradient)"
          radius={[5, 5, 0, 0]}
          maxBarSize={32}
          style={{ filter: "url(#dashBarShadow)" }}
          isAnimationActive={true}
          animationBegin={0}
          animationDuration={600}
          animationEasing="ease-out"
        >
          <LabelList
            dataKey="open"
            position="top"
            style={{ fill: "#64748B", fontSize: 11, fontWeight: 600 }}
            formatter={(value: unknown) => (Number(value) > 0 ? String(value) : "")}
          />
        </Bar>
        <Bar
          dataKey="closed"
          name="Cerrados"
          fill="url(#barGradientClosed)"
          radius={[5, 5, 0, 0]}
          maxBarSize={32}
          style={{ filter: "url(#dashBarShadowGreen)" }}
          isAnimationActive={true}
          animationBegin={200}
          animationDuration={600}
          animationEasing="ease-out"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Donut chart con leyenda vertical y conteos — para sección DISTRIBUCIÓN */
export function DonutChart({ data, subtitle, gradPrefix }: { data: ByTypeItem[]; subtitle?: string; gradPrefix?: string }) {
  const { chartColors } = useTheme();
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const prefix = gradPrefix || "donut";

  const onEnter = useCallback((_: unknown, index: number) => setActiveIndex(index), []);
  const onLeave = useCallback(() => setActiveIndex(undefined), []);

  if (data.length === 0) return <p className="py-8 text-center text-sm text-slate-400">Sin datos</p>;

  const pieExtra: Record<string, unknown> = { activeIndex };

  const legendPayload = data.map((entry, i) => ({
    value: entry.name,
    color: chartColors[i % chartColors.length],
    count: entry.value,
  }));

  return (
    <div style={{ width: "100%" }}>
      {subtitle && <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>{subtitle}</p>}
      <div style={{ position: "relative", width: "100%", height: 160 }}>
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <defs>
              {data.map((_, i) => {
                const color = chartColors[i % chartColors.length];
                return (
                  <radialGradient key={`${prefix}-rg-${i}`} id={`${prefix}-grad-${i}`} cx="30%" cy="30%" r="70%">
                    <stop offset="0%" stopColor={color} stopOpacity={1} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.75} />
                  </radialGradient>
                );
              })}
            </defs>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={72}
              dataKey="value"
              paddingAngle={2}
              cornerRadius={4}
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
              {data.map((_, i) => (
                <Cell key={i} fill={`url(#${prefix}-grad-${i})`} />
              ))}
            </Pie>
            <Tooltip content={<CustomChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <CustomChartLegend payload={legendPayload} vertical />
    </div>
  );
}

/** Gráfico de área acumulado — sección ACUMULADO POR ESTADO */
export function CumulativeAreaChart({ data }: { data: ByMonthItem[] }) {
  if (data.length === 0) return <p className="py-8 text-center text-sm text-slate-400">Sin datos</p>;

  let cumOpen = 0;
  let cumClosed = 0;
  const cumData = data.map((d) => {
    cumOpen += d.open;
    cumClosed += d.closed;
    return { month: d.month, Abiertos: cumOpen, Resueltos: cumClosed };
  });

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={cumData}>
        <defs>
          <linearGradient id="gradCumOpen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0067B2" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#0067B2" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="gradCumClosed" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#10B981" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<CustomChartTooltip />} />
        <Area
          type="monotone"
          dataKey="Abiertos"
          stroke="#109BC4"
          strokeWidth={2}
          fill="url(#gradCumOpen)"
          dot={{ r: 3, fill: "#0067B2", strokeWidth: 0 }}
          activeDot={{ r: 5 }}
          isAnimationActive={true}
          animationDuration={800}
        />
        <Area
          type="monotone"
          dataKey="Resueltos"
          stroke="#10B981"
          strokeWidth={2}
          fill="url(#gradCumClosed)"
          dot={{ r: 3, fill: "#10B981", strokeWidth: 0 }}
          activeDot={{ r: 5 }}
          isAnimationActive={true}
          animationBegin={200}
          animationDuration={800}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
