"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Loader2, BarChart3, Clock, TrendingUp, Users, Calendar, Filter } from "lucide-react";
import dynamic from "next/dynamic";
import { useTheme } from "@/components/theme-provider";

const DonutChart = dynamic(
  () => import("@/components/charts/stats-charts").then((m) => ({ default: m.DonutChart })),
  { ssr: false, loading: () => <div className="h-[260px] animate-pulse rounded bg-slate-100" /> }
);
const StatsTrendChart = dynamic(
  () => import("@/components/charts/stats-charts").then((m) => ({ default: m.StatsTrendChart })),
  { ssr: false, loading: () => <div className="h-[280px] animate-pulse rounded bg-slate-100" /> }
);

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

interface CustomerData {
  code: string;
  name: string;
  count: number;
}

interface StatsData {
  kpis: {
    total: number;
    open: number;
    pending: number;
    closed: number;
    avgResolutionHours: number;
  };
  byStatus: ChartItem[];
  byPriority: ChartItem[];
  byType: ChartItem[];
  byArea: ChartItem[];
  byCanal: ChartItem[];
  byMonth: MonthData[];
  topCustomers: CustomerData[];
}

type PresetKey = "7d" | "30d" | "3m" | "6m" | "12m" | "all" | "custom";

const PRESETS: { key: PresetKey; label: string }[] = [
  { key: "7d", label: "7 dias" },
  { key: "30d", label: "30 dias" },
  { key: "3m", label: "3 meses" },
  { key: "6m", label: "6 meses" },
  { key: "12m", label: "12 meses" },
  { key: "all", label: "Todo" },
];

function getPresetDates(key: PresetKey): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString().split("T")[0];
  const from = new Date(now);

  switch (key) {
    case "7d":
      from.setDate(from.getDate() - 7);
      break;
    case "30d":
      from.setDate(from.getDate() - 30);
      break;
    case "3m":
      from.setMonth(from.getMonth() - 3);
      break;
    case "6m":
      from.setMonth(from.getMonth() - 6);
      break;
    case "12m":
      from.setFullYear(from.getFullYear() - 1);
      break;
    case "all":
      return { from: "", to: "" };
    default:
      return { from: "", to: "" };
  }

  return { from: from.toISOString().split("T")[0], to };
}

function StatCard({
  label,
  value,
  icon: Icon,
  delay,
}: {
  label: string;
  value: string | number;
  icon: any;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -3, boxShadow: "0 8px 20px -4px rgba(0,0,0,0.1)" }}
      className="rounded-xl border border-slate-200/60 border-t-[3px] border-t-primary bg-white p-5 shadow-sm cursor-default"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
          <Icon className="h-6 w-6 text-slate-400" />
        </div>
      </div>
    </motion.div>
  );
}

function ChartCard({
  title,
  children,
  delay,
}: {
  title: string;
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm"
    >
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
      {children}
    </motion.div>
  );
}

export default function EstadisticasPage() {
  const { chartColors } = useTheme();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePreset, setActivePreset] = useState<PresetKey>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchStats = useCallback(async (from: string, to: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (from) params.set("dateFrom", from);
      if (to) params.set("dateTo", to);
      const qs = params.toString();
      const res = await fetch(`/api/estadisticas${qs ? `?${qs}` : ""}`);
      if (res.ok) {
        setStats(await res.json());
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats("", "");
  }, [fetchStats]);

  function handlePreset(key: PresetKey) {
    setActivePreset(key);
    const { from, to } = getPresetDates(key);
    setDateFrom(from);
    setDateTo(to);
    fetchStats(from, to);
  }

  function handleCustomDate() {
    if (dateFrom || dateTo) {
      setActivePreset("custom");
      fetchStats(dateFrom, dateTo);
    }
  }

  const closedPct = stats && stats.kpis.total > 0
    ? Math.round((stats.kpis.closed / stats.kpis.total) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-900">Estadísticas</h1>
          <p className="text-sm text-slate-600">Análisis detallado de casos de servicio</p>
        </div>
      </div>

      {/* Date Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-slate-200/60 bg-white p-4 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <Filter className="h-4 w-4 text-slate-400 shrink-0" />

            {/* Presets */}
            <div className="flex items-center gap-1 flex-wrap">
              {PRESETS.map((preset) => (
                <button
                  key={preset.key}
                  onClick={() => handlePreset(preset.key)}
                  className={`rounded-md px-3 py-1.5 text-sm transition-colors ${activePreset === preset.key
                      ? "bg-primary text-white font-medium"
                      : "text-slate-600 hover:bg-slate-100"
                    }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Separator */}
          <div className="hidden sm:block h-6 w-px bg-slate-200" />

          {/* Custom date range */}
          <div className="flex items-center gap-2 flex-wrap">
            <Calendar className="h-4 w-4 text-slate-400" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-md border border-slate-200 px-2 py-1.5 text-sm text-slate-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full sm:w-auto"
            />
            <span className="text-xs text-slate-400">a</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-md border border-slate-200 px-2 py-1.5 text-sm text-slate-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full sm:w-auto"
            />
            <button
              onClick={handleCustomDate}
              disabled={!dateFrom && !dateTo}
              className="rounded-md bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Aplicar
            </button>
          </div>

          {/* Loading indicator */}
          {loading && <Loader2 className="h-4 w-4 animate-spin text-primary ml-auto" />}
        </div>

        {/* Active filter label */}
        {(dateFrom || dateTo) && (
          <p className="mt-2 text-xs text-slate-400">
            Mostrando: {dateFrom || "inicio"} — {dateTo || "hoy"}
          </p>
        )}
      </motion.div>

      {loading && !stats ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : !stats ? (
        <p className="text-center text-sm text-red-500">Error al cargar estadísticas</p>
      ) : (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Casos" value={stats.kpis.total} icon={BarChart3} delay={0} />
            <StatCard label="Tasa de Resolución" value={`${closedPct}%`} icon={TrendingUp} delay={0.05} />
            <StatCard
              label="Tiempo Promedio Resolución"
              value={stats.kpis.avgResolutionHours > 0 ? `${stats.kpis.avgResolutionHours}h` : "N/A"}
              icon={Clock}
              delay={0.1}
            />
            <StatCard label="Clientes Atendidos" value={stats.topCustomers.length} icon={Users} delay={0.15} />
          </div>

          {/* Row 1: Trend (2 cols) + Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <ChartCard title="Tendencia Mensual" delay={0.2}>
                <StatsTrendChart data={stats.byMonth} />
              </ChartCard>
            </div>

            <ChartCard title="Por Estado" delay={0.25}>
              <DonutChart data={stats.byStatus} />
            </ChartCard>
          </div>

          {/* Row 2: Type + Area + Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ChartCard title="Por Tipo de Caso" delay={0.3}>
              <DonutChart data={stats.byType.map((d, i) => ({ ...d, color: chartColors[i % chartColors.length] }))} />
            </ChartCard>
            <ChartCard title="Por Área" delay={0.35}>
              <DonutChart data={stats.byArea.map((d, i) => ({ ...d, color: chartColors[i % chartColors.length] }))} />
            </ChartCard>
            <ChartCard title="Por Prioridad" delay={0.4}>
              <DonutChart data={stats.byPriority} />
            </ChartCard>
          </div>

          {/* Row 3: Canal + Top Customers */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ChartCard title="Por Canal de Ingreso" delay={0.45}>
              <DonutChart data={stats.byCanal.map((d, i) => ({ ...d, color: chartColors[i % chartColors.length] }))} />
            </ChartCard>
            <div className="md:col-span-1 lg:col-span-2">
              <ChartCard title="Top Clientes con más Casos" delay={0.5}>
                {stats.topCustomers.length === 0 ? (
                  <p className="text-center text-sm text-slate-400 py-4">Sin datos</p>
                ) : (
                  <div className="space-y-2">
                    {stats.topCustomers.map((customer, i) => (
                      <div key={customer.code} className="flex items-center gap-3">
                        <span className="w-6 text-right text-xs text-slate-400">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-700 truncate">{customer.name}</span>
                            <span className="text-sm font-semibold text-slate-900 ml-2">{customer.count}</span>
                          </div>
                          <div
                            className="mt-1 w-full rounded-full overflow-hidden"
                            style={{ backgroundColor: "#e2e8f0", height: "8px" }}
                          >
                            <div
                              className="rounded-full bg-primary"
                              style={{
                                width: `${(customer.count / (stats.topCustomers[0]?.count || 1)) * 100}%`,
                                height: "100%",
                                transition: "width 0.6s ease-out",
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ChartCard>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
