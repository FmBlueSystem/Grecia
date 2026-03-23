"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart3, Inbox, Clock, CheckCircle, Loader2, AlertTriangle,
  TrendingUp, TrendingDown, Minus, Calendar,
} from "lucide-react";
import dynamic from "next/dynamic";
import { KpiCard } from "@/components/kpi-card";
import { StatusBadge } from "@/components/status-badge";
import { containerVariants, itemVariants } from "@/lib/ui";

const MonthlyChart = dynamic(
  () => import("@/components/charts/dashboard-charts").then((m) => ({ default: m.MonthlyChart })),
  { ssr: false, loading: () => <div className="h-[200px] animate-pulse rounded bg-slate-100" /> }
);
const DonutChart = dynamic(
  () => import("@/components/charts/dashboard-charts").then((m) => ({ default: m.DonutChart })),
  { ssr: false, loading: () => <div className="h-[260px] animate-pulse rounded bg-slate-100" /> }
);
const CumulativeAreaChart = dynamic(
  () => import("@/components/charts/dashboard-charts").then((m) => ({ default: m.CumulativeAreaChart })),
  { ssr: false, loading: () => <div className="h-[200px] animate-pulse rounded bg-slate-100" /> }
);

interface DashboardData {
  kpis: {
    total: number;
    open: number;
    pending: number;
    closed: number;
    highPriority: number;
    thisMonthOpen: number;
    prevMonthOpen: number;
  };
  byType: { name: string; value: number }[];
  byArea: { name: string; value: number }[];
  byMonth: { month: string; open: number; closed: number }[];
  openCases: { id: number; subject: string; daysOpen: number; priority: string }[];
  recent: {
    id: number;
    subject: string;
    customerName: string;
    status: number;
    statusLabel: string;
    creationDate: string;
    priority: string;
  }[];
}

interface SlaSummary {
  exceeded: number;
  warning: number;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 18) return "Buenas tardes";
  return "Buenas noches";
}

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">{label}</p>
  );
}

function AgeDot({ days, priority }: { days: number; priority: string }) {
  const isHigh = priority === "scp_High";
  if (days === 0) return <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0 mt-0.5" />;
  if (days <= 2) return <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0 mt-0.5" />;
  return <span className={`h-2 w-2 rounded-full shrink-0 mt-0.5 ${isHigh ? "bg-red-500" : "bg-red-400"}`} />;
}

function AgeLabel({ days, priority }: { days: number; priority: string }) {
  const isHigh = priority === "scp_High";
  const color = days === 0 ? "text-emerald-600" : days <= 2 ? "text-amber-600" : "text-red-600";
  return (
    <span className={`flex items-center gap-1 text-xs font-bold ${color} whitespace-nowrap`}>
      {days}d{isHigh && days > 0 && <AlertTriangle className="h-3 w-3" />}
    </span>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [slaSummary, setSlaSummary] = useState<SlaSummary>({ exceeded: 0, warning: 0 });
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard").then((r) => r.json()),
      fetch("/api/auth/session").then((r) => r.json()),
      fetch("/api/alertas").then((r) => r.json()),
    ])
      .then(([dashData, session, alertData]) => {
        setData(dashData);
        if (session?.name) setUserName(session.name);
        if (alertData?.summary) setSlaSummary({ exceeded: alertData.summary.exceeded || 0, warning: alertData.summary.warning || 0 });
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
          <Loader2 className="h-8 w-8 text-primary" />
        </motion.div>
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-20 text-sm text-slate-500">Error al cargar el dashboard</div>;
  }

  const { kpis, byType, byArea, byMonth, openCases, recent } = data;
  const openDelta = kpis.thisMonthOpen - kpis.prevMonthOpen;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants}>
        <p className="text-slate-500 text-sm mb-1">
          {getGreeting()}, <span className="font-semibold text-slate-700">{userName || "equipo"}</span> 👋
        </p>
        <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-900 tracking-tight">Panel de Casos</h1>
        <p className="text-sm text-slate-600 mt-0.5">Resumen general de casos de servicio</p>
      </motion.div>

      {/* ── RESUMEN ── */}
      <motion.div variants={itemVariants}>
        <SectionLabel label="Resumen" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <KpiCard title="Total Casos" value={kpis.total} icon={BarChart3} color="text-primary" bgColor="bg-primary/10" accentColor="bg-primary" delay={0.1} />
          <div className="relative">
            <KpiCard title="Abiertos" value={kpis.open} icon={Inbox} color="text-blue-600" bgColor="bg-blue-100" accentColor="bg-primary" delay={0.2} highlight />
            {openDelta !== 0 && (
              <span className={`absolute bottom-3 left-4 flex items-center gap-0.5 text-[10px] font-semibold ${openDelta > 0 ? "text-red-500" : "text-emerald-600"}`}>
                {openDelta > 0 ? <TrendingUp className="h-3 w-3" /> : openDelta < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                {Math.abs(openDelta)} este mes
              </span>
            )}
          </div>
          <KpiCard title="En Proceso" value={kpis.pending} icon={Clock} color="text-amber-600" bgColor="bg-amber-100" accentColor="bg-amber-500" delay={0.3} />
          <KpiCard title="Resueltos" value={kpis.closed} icon={CheckCircle} color="text-emerald-600" bgColor="bg-emerald-100" accentColor="bg-emerald-500" delay={0.4} />
          <div onClick={() => router.push("/alertas")} className="cursor-pointer">
            <KpiCard title="Excedidos" value={slaSummary.exceeded} icon={AlertTriangle} color="text-red-600" bgColor="bg-red-100" accentColor="bg-red-500" delay={0.5} highlight={slaSummary.exceeded > 0} />
          </div>
          <div onClick={() => router.push("/alertas")} className="cursor-pointer">
            <KpiCard title="En Riesgo" value={slaSummary.warning} icon={Clock} color="text-amber-600" bgColor="bg-amber-100" accentColor="bg-amber-400" delay={0.6} />
          </div>
        </div>
      </motion.div>

      {/* Alert banner */}
      {slaSummary.exceeded > 0 && (
        <motion.button
          variants={itemVariants}
          onClick={() => router.push("/alertas")}
          className="w-full flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-left hover:bg-red-100 transition-colors"
        >
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
          <span className="text-sm font-semibold text-red-700">
            {slaSummary.exceeded} {slaSummary.exceeded === 1 ? "caso ha excedido" : "casos han excedido"} el tiempo de resolución SLA
          </span>
          <span className="ml-auto text-xs font-bold text-red-500">Ver alertas →</span>
        </motion.button>
      )}

      {/* ── DISTRIBUCIÓN ── */}
      <motion.div variants={itemVariants}>
        <SectionLabel label="Distribución" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800 mb-0.5">Por tipo de caso</h2>
            <DonutChart
              data={byType}
              subtitle={`Donut · ${kpis.total} casos totales`}
              gradPrefix="tipo"
            />
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800 mb-0.5">Por área responsable</h2>
            <DonutChart
              data={byArea}
              subtitle={`Donut · ${byArea.length} áreas activas`}
              gradPrefix="area"
            />
          </div>
        </div>
      </motion.div>

      {/* ── EVOLUCIÓN MENSUAL ── */}
      <motion.div variants={itemVariants}>
        <SectionLabel label="Evolución Mensual" />
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800">Casos abiertos vs resueltos</h2>
          <p className="text-xs text-slate-400 mb-4">Últimos 6 meses · Barras agrupadas</p>
          <div className="flex gap-4 mb-2">
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="h-2.5 w-2.5 rounded-sm bg-blue-500 inline-block" /> Abiertos
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500 inline-block" /> Resueltos
            </span>
          </div>
          <MonthlyChart data={byMonth} />
        </div>
      </motion.div>

      {/* ── ACUMULADO POR ESTADO ── */}
      <motion.div variants={itemVariants}>
        <SectionLabel label="Acumulado por Estado" />
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800">Flujo acumulado</h2>
          <p className="text-xs text-slate-400 mb-4">Área apilada · tendencia de resolución</p>
          <div className="flex gap-4 mb-2">
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="h-2.5 w-2.5 rounded-sm bg-blue-500 inline-block" /> Abiertos
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500 inline-block" /> Resueltos
            </span>
          </div>
          <CumulativeAreaChart data={byMonth.slice(-3)} />
        </div>
      </motion.div>

      {/* ── ACTIVIDAD ── */}
      <motion.div variants={itemVariants}>
        <SectionLabel label="Actividad" />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Antigüedad de casos abiertos */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80">
              <div>
                <h2 className="text-sm font-bold text-slate-800">Antigüedad de casos abiertos</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">días abierto</p>
              </div>
              <Calendar className="h-4 w-4 text-slate-400" />
            </div>
            <div className="divide-y divide-slate-100">
              {openCases.length === 0 ? (
                <p className="px-5 py-6 text-sm text-slate-400 text-center">Sin casos abiertos</p>
              ) : (
                openCases.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => router.push(`/casos/${c.id}`)}
                    className="flex items-start gap-3 px-5 py-3 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <AgeDot days={c.daysOpen} priority={c.priority} />
                    <span className="flex-1 text-xs text-slate-700 font-medium line-clamp-2">{c.subject}</span>
                    <AgeLabel days={c.daysOpen} priority={c.priority} />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Casos recientes */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80">
              <h2 className="text-sm font-bold text-slate-800">Casos recientes</h2>
              <button
                onClick={() => router.push("/casos")}
                className="rounded-full bg-primary/20 border border-primary/30 px-3 py-1 text-xs font-bold text-primary transition-all hover:bg-primary hover:text-white"
              >
                Ver todos →
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px]">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-3">ID</th>
                    <th className="px-5 py-3">Asunto</th>
                    <th className="px-5 py-3">Cliente</th>
                    <th className="px-5 py-3">Estado</th>
                    <th className="px-5 py-3">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recent.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-sm text-slate-400">Sin casos recientes</td>
                    </tr>
                  ) : (
                    recent.map((caso) => (
                      <tr
                        key={caso.id}
                        onClick={() => router.push(`/casos/${caso.id}`)}
                        className="cursor-pointer hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-5 py-3 text-xs font-mono font-bold text-primary">#{caso.id}</td>
                        <td className="px-5 py-3 max-w-[180px]">
                          <span className="text-xs font-semibold text-slate-800 line-clamp-1">{caso.subject}</span>
                          {caso.priority === "scp_High" && (
                            <span className="inline-flex items-center gap-0.5 mt-0.5 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
                              <AlertTriangle className="h-2.5 w-2.5" /> Alta prio.
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-xs text-slate-500 capitalize">{caso.customerName?.toLowerCase()?.split(" ").slice(0, 2).join(" ")}</td>
                        <td className="px-5 py-3"><StatusBadge status={caso.status} label={caso.statusLabel} /></td>
                        <td className="px-5 py-3 text-xs text-slate-500 whitespace-nowrap">
                          {new Date(caso.creationDate).toLocaleDateString("es", { day: "numeric", month: "short", timeZone: "America/Costa_Rica" })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </motion.div>
    </motion.div>
  );
}
