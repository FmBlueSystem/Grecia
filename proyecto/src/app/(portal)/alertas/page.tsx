"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ShieldAlert, AlertTriangle, CheckCircle, Clock, Loader2, Filter, UserCheck } from "lucide-react";

interface AlertItem {
  id: number;
  subject: string;
  customerName: string;
  statusLabel: string;
  priorityLabel: string;
  creationDate: string;
  tiempoEstimado: string;
  area: string;
  tipoCaso: string;
  slaHours: number;
  hoursElapsed: number;
  hoursRemaining: number;
  percentUsed: number;
  slaStatus: "ok" | "warning" | "exceeded";
}

interface Summary {
  total: number;
  exceeded: number;
  warning: number;
  ok: number;
}

type EscalationMap = Record<string, {
  level: string;
  lastEscalated: string;
  notifiedTo: string | null;
  acknowledged: boolean;
  logId: number;
}>;

const LEVEL_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  "1": { bg: "bg-amber-100", text: "text-amber-800", label: "L1" },
  "2": { bg: "bg-orange-100", text: "text-orange-800", label: "L2" },
  "3": { bg: "bg-red-100", text: "text-red-800", label: "L3" },
};

const SLA_COLORS = {
  exceeded: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    badge: "bg-red-100 text-red-800",
    bar: "bg-red-500",
    icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    badge: "bg-amber-100 text-amber-800",
    bar: "bg-amber-500",
    icon: <Clock className="h-4 w-4 text-amber-500" />,
  },
  ok: {
    bg: "bg-white",
    border: "border-slate-200",
    text: "text-slate-700",
    badge: "bg-green-100 text-green-800",
    bar: "bg-green-500",
    icon: <CheckCircle className="h-4 w-4 text-green-500" />,
  },
};

function formatHours(hours: number): string {
  if (hours < 0) hours = Math.abs(hours);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  const rem = hours % 24;
  return rem > 0 ? `${days}d ${rem}h` : `${days}d`;
}

export default function AlertasPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "exceeded" | "warning" | "ok">("all");
  const [escalationMap, setEscalationMap] = useState<EscalationMap>({});
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [ackFilter, setAckFilter] = useState<string>("all");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/alertas");
        if (res.ok) {
          const data = await res.json();
          setAlerts(data.alerts);
          setSummary(data.summary);

          // Batch fetch escalation levels for all alerts
          const ids = data.alerts.map((a: AlertItem) => a.id);
          if (ids.length > 0) {
            const escRes = await fetch(`/api/escalation-logs?case_ids=${ids.join(",")}`);
            if (escRes.ok) {
              const escData = await escRes.json();
              setEscalationMap(escData.latest || {});
            }
          }
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = alerts.filter((a) => {
    if (filter !== "all" && a.slaStatus !== filter) return false;
    const esc = escalationMap[String(a.id)];
    if (levelFilter !== "all") {
      if (!esc) return false;
      if (esc.level !== levelFilter) return false;
    }
    if (ackFilter !== "all") {
      if (ackFilter === "pending") {
        if (!esc || esc.acknowledged) return false;
      } else if (ackFilter === "acknowledged") {
        if (!esc || !esc.acknowledged) return false;
      }
    }
    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-900">SLA & Alertas</h1>
        <p className="text-sm text-slate-500">
          Monitoreo de casos abiertos vs tiempo estimado de resolucion
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <>
          {/* Summary cards */}
          {summary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ y: -2 }}
                onClick={() => setFilter("all")}
                className={`rounded-xl border border-t-[3px] border-t-primary p-4 text-left transition-colors shadow-sm ${filter === "all" ? "border-primary bg-blue-50" : "border-slate-200/60 bg-white hover:bg-slate-50"}`}
              >
                <p className="text-sm text-slate-500">Total Abiertos</p>
                <p className="text-2xl font-bold text-slate-900">{summary.total}</p>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ y: -2 }}
                onClick={() => setFilter("exceeded")}
                className={`rounded-xl border border-t-[3px] border-t-[#EF4444] p-4 text-left transition-colors shadow-sm ${filter === "exceeded" ? "border-red-400 bg-red-50" : "border-slate-200/60 bg-white hover:bg-slate-50"}`}
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <p className="text-sm text-red-600">Excedidos</p>
                </div>
                <p className="text-2xl font-bold text-red-700">{summary.exceeded}</p>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ y: -2 }}
                onClick={() => setFilter("warning")}
                className={`rounded-xl border border-t-[3px] border-t-[#F59E0B] p-4 text-left transition-colors shadow-sm ${filter === "warning" ? "border-amber-400 bg-amber-50" : "border-slate-200/60 bg-white hover:bg-slate-50"}`}
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <p className="text-sm text-amber-600">En Riesgo</p>
                </div>
                <p className="text-2xl font-bold text-amber-700">{summary.warning}</p>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ y: -2 }}
                onClick={() => setFilter("ok")}
                className={`rounded-xl border border-t-[3px] border-t-[#10B981] p-4 text-left transition-colors shadow-sm ${filter === "ok" ? "border-green-400 bg-green-50" : "border-slate-200/60 bg-white hover:bg-slate-50"}`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <p className="text-sm text-green-600">En Tiempo</p>
                </div>
                <p className="text-2xl font-bold text-green-700">{summary.ok}</p>
              </motion.button>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Filter className="h-3.5 w-3.5" />
              <span className="font-medium">Filtros:</span>
            </div>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700"
            >
              <option value="all">Nivel: Todos</option>
              <option value="1">Nivel 1</option>
              <option value="2">Nivel 2</option>
              <option value="3">Nivel 3</option>
            </select>
            <select
              value={ackFilter}
              onChange={(e) => setAckFilter(e.target.value)}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700"
            >
              <option value="all">Estado: Todos</option>
              <option value="pending">Pendiente</option>
              <option value="acknowledged">Reconocido</option>
            </select>
            {(levelFilter !== "all" || ackFilter !== "all") && (
              <button
                onClick={() => { setLevelFilter("all"); setAckFilter("all"); }}
                className="text-xs text-primary hover:underline"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {/* Alerts list */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <ShieldAlert className="h-12 w-12 mb-3" />
              <p className="text-sm">No hay alertas en esta categoria</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((alert, i) => {
                const colors = SLA_COLORS[alert.slaStatus];
                const esc = escalationMap[String(alert.id)];
                const levelStyle = esc ? LEVEL_COLORS[esc.level] || LEVEL_COLORS["1"] : null;
                return (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Link
                      href={`/casos/${alert.id}`}
                      className={`block rounded-xl border ${colors.border} ${colors.bg} p-4 transition-all hover:shadow-md`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            {colors.icon}
                            <span className="font-semibold text-slate-900">
                              #{alert.id}
                            </span>
                            <span className="text-sm text-slate-600 truncate">
                              {alert.subject}
                            </span>
                            {levelStyle && (
                              <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${levelStyle.bg} ${levelStyle.text}`}>
                                {levelStyle.label}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 sm:gap-4 text-xs text-slate-500 flex-wrap">
                            <span>{alert.customerName}</span>
                            <span>{alert.statusLabel}</span>
                            <span>{alert.priorityLabel}</span>
                            {alert.area && <span>{alert.area}</span>}
                          </div>
                          {esc && (
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                              {esc.notifiedTo && (
                                <span className="flex items-center gap-1">
                                  <UserCheck className="h-3 w-3" />
                                  Notificado: <span className="font-medium text-slate-700">{esc.notifiedTo}</span>
                                </span>
                              )}
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                esc.acknowledged
                                  ? "bg-green-50 text-green-700 border border-green-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}>
                                {esc.acknowledged ? "Reconocido" : "Pendiente"}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${colors.badge}`}>
                            {alert.slaStatus === "exceeded"
                              ? `Excedido ${formatHours(Math.abs(alert.hoursRemaining))}`
                              : alert.slaStatus === "warning"
                                ? `${formatHours(alert.hoursRemaining)} restantes`
                                : `${formatHours(alert.hoursRemaining)} restantes`}
                          </span>
                          <p className="text-xs text-slate-400 mt-1">
                            SLA: {alert.tiempoEstimado}
                          </p>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-3 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(alert.percentUsed, 100)}%` }}
                          transition={{ duration: 0.6, delay: i * 0.03 }}
                          className={`h-full rounded-full ${colors.bar}`}
                        />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
