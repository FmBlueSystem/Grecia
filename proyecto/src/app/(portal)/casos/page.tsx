"use client";

import { Suspense, useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Search, Filter, Loader2, Download, ChevronDown, ArrowUp, ArrowDown, GripVertical, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { PRIORITY_OPTIONS } from "@/lib/constants";
import { TIEMPO_TO_HOURS } from "@/lib/sla";
import { useDropdownOptions } from "@/hooks/use-dropdown-options";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/pagination";
import { StatusBadge, PriorityBadge } from "@/components/status-badge";
import { PRIORITY_BORDER } from "@/lib/ui";
import type { CasoListItem } from "@/lib/types";

/* ------------------------------------------------------------------ */
/*  Column definitions                                                  */
/* ------------------------------------------------------------------ */

interface ColumnDef {
  key: string;
  label: string;
  sortKey?: keyof CasoListItem;
  render: (caso: CasoListItem) => React.ReactNode;
}

const ALL_COLUMNS: ColumnDef[] = [
  { key: "id", label: "ID", sortKey: "id", render: (c) => <span className="font-mono font-bold text-primary">{c.id}</span> },
  { key: "subject", label: "Asunto", sortKey: "subject", render: (c) => <span className="font-semibold text-slate-900">{c.subject}</span> },
  { key: "customer", label: "Cliente", sortKey: "customerName", render: (c) => <span className="font-medium text-slate-600 capitalize" style={{textTransform: "capitalize"}}>{c.customerName?.toLowerCase()}</span> },
  { key: "status", label: "Estado", sortKey: "status", render: (c) => <StatusBadge status={c.status} label={c.statusLabel} /> },
  { key: "priority", label: "Prioridad", sortKey: "priorityLabel", render: (c) => <PriorityBadge priority={c.priorityLabel} /> },
  { key: "tipo", label: "Tipo", sortKey: "tipoCaso", render: (c) => <span className="font-medium text-slate-600">{c.tipoCaso}</span> },
  { key: "area", label: "Area", sortKey: "area", render: (c) => <span className="font-medium text-slate-600">{c.area}</span> },
  { key: "date", label: "Fecha", sortKey: "creationDate", render: (c) => <span className="font-medium text-slate-500">{new Date(c.creationDate).toLocaleDateString("es")}</span> },
  {
    key: "sla", label: "SLA",
    render: (c) => {
      if (c.status === -1) return <span className="text-slate-300 text-xs">—</span>;
      const slaHours = TIEMPO_TO_HOURS[c.tiempoEstimado || ""] || 48;
      const hoursElapsed = (Date.now() - new Date(c.creationDate).getTime()) / 3600000;
      if (hoursElapsed >= slaHours) return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 whitespace-nowrap">
          <AlertTriangle className="h-3 w-3" /> Excedido
        </span>
      );
      if (hoursElapsed / slaHours >= 0.75) return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 whitespace-nowrap">
          <Clock className="h-3 w-3" /> En Riesgo
        </span>
      );
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 whitespace-nowrap">
          <CheckCircle className="h-3 w-3" /> OK
        </span>
      );
    }
  },
];

const LS_KEY = "stia-casos-col-order";

function loadColumnOrder(): string[] {
  if (typeof window === "undefined") return ALL_COLUMNS.map((c) => c.key);
  try {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) {
      const keys = JSON.parse(saved) as string[];
      const valid = keys.filter((k) => ALL_COLUMNS.some((c) => c.key === k));
      // Add any new columns not in saved order
      for (const col of ALL_COLUMNS) {
        if (!valid.includes(col.key)) valid.push(col.key);
      }
      return valid;
    }
  } catch { /* ignore */ }
  return ALL_COLUMNS.map((c) => c.key);
}

export default function CasosPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>}>
      <CasosContent />
    </Suspense>
  );
}

function CasosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { options: ddOptions } = useDropdownOptions();
  const [items, setItems] = useState<CasoListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [canalFilter, setCanalFilter] = useState("");
  const [tipoFilter, setTipoFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  // Column ordering (drag) + sorting (double-click)
  const [columnOrder, setColumnOrder] = useState<string[]>(loadColumnOrder);
  const [sortKey, setSortKey] = useState<keyof CasoListItem | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const dragCol = useRef<string | null>(null);
  const dragOverCol = useRef<string | null>(null);

  const orderedColumns = useMemo(
    () => columnOrder.map((k) => ALL_COLUMNS.find((c) => c.key === k)!).filter(Boolean),
    [columnOrder]
  );

  const sortedItems = useMemo(() => {
    if (!sortKey) return items;
    return [...items].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp = typeof av === "number" && typeof bv === "number"
        ? av - bv
        : String(av).localeCompare(String(bv), "es", { sensitivity: "base" });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [items, sortKey, sortDir]);

  function handleColumnDoubleClick(col: ColumnDef) {
    if (!col.sortKey) return;
    if (sortKey === col.sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(col.sortKey);
      setSortDir("asc");
    }
  }

  function handleDragStart(key: string) {
    dragCol.current = key;
  }

  function handleDragOver(e: React.DragEvent, key: string) {
    e.preventDefault();
    dragOverCol.current = key;
  }

  function handleDrop() {
    if (!dragCol.current || !dragOverCol.current || dragCol.current === dragOverCol.current) return;
    const newOrder = [...columnOrder];
    const fromIdx = newOrder.indexOf(dragCol.current);
    const toIdx = newOrder.indexOf(dragOverCol.current);
    newOrder.splice(fromIdx, 1);
    newOrder.splice(toIdx, 0, dragCol.current);
    setColumnOrder(newOrder);
    localStorage.setItem(LS_KEY, JSON.stringify(newOrder));
    dragCol.current = null;
    dragOverCol.current = null;
  }

  const fetchCasos = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    if (priorityFilter) params.set("priority", priorityFilter);
    if (canalFilter) params.set("canal", canalFilter);
    if (tipoFilter) params.set("tipoCaso", tipoFilter);
    if (areaFilter) params.set("area", areaFilter);

    try {
      const res = await fetch(`/api/casos?${params}`);
      const data = await res.json();
      setItems(data.items || []);
      setTotal(data.total || 0);
      setPages(data.pages || 0);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, priorityFilter, canalFilter, tipoFilter, areaFilter]);

  useEffect(() => {
    fetchCasos();
  }, [fetchCasos]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchCasos();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-900 tracking-tight">Casos de Servicio</h1>
          <p className="text-sm text-slate-600 mt-0.5">{total} {total === 1 ? "caso" : "casos"} en total</p>
        </motion.div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-2 border-primary text-primary hover:border-primary/80 hover:bg-primary/10"
            onClick={() => window.open(`/api/casos/export?status=${statusFilter}`, "_blank")}
          >
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
          <Button
            onClick={() => router.push("/casos/nuevo")}
          >
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Nuevo Caso</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Buscar por asunto o cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-primary shadow-sm"
            />
          </div>
          <Button type="submit" variant="outline">
            Buscar
          </Button>
        </form>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Todos los estados</option>
          <option value="-3">Abierto</option>
          <option value="-2">En Proceso</option>
          <option value="-1">Resuelto</option>
        </select>
        <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="mr-1 h-3 w-3" /> Filtros <ChevronDown className={`ml-1 h-3 w-3 transition-transform ${showFilters ? "rotate-180" : ""}`} />
        </Button>
      </div>

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm"
        >
          <select value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
            <option value="">Prioridad</option>
            {PRIORITY_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          <select value={canalFilter} onChange={(e) => { setCanalFilter(e.target.value); setPage(1); }} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
            <option value="">Canal</option>
            {ddOptions.canal.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          <select value={tipoFilter} onChange={(e) => { setTipoFilter(e.target.value); setPage(1); }} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
            <option value="">Tipo</option>
            {ddOptions.tipo_caso.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          <select value={areaFilter} onChange={(e) => { setAreaFilter(e.target.value); setPage(1); }} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
            <option value="">Area</option>
            {ddOptions.area.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </motion.div>
      )}

      <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                {orderedColumns.map((col) => (
                  <th
                    key={col.key}
                    draggable
                    onDragStart={() => handleDragStart(col.key)}
                    onDragOver={(e) => handleDragOver(e, col.key)}
                    onDrop={handleDrop}
                    onDoubleClick={() => handleColumnDoubleClick(col)}
                    className="px-3 sm:px-5 py-2.5 sm:py-3.5 select-none cursor-grab active:cursor-grabbing whitespace-nowrap"
                    title="Doble click para ordenar · Arrastrar para mover"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <GripVertical className="h-3 w-3 opacity-30" />
                      {col.label}
                      {sortKey === col.sortKey && (
                        sortDir === "asc"
                          ? <ArrowUp className="h-3 w-3 text-primary" />
                          : <ArrowDown className="h-3 w-3 text-primary" />
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={orderedColumns.length} className="px-4 py-12 text-center text-sm text-slate-500">
                    Cargando casos...
                  </td>
                </tr>
              ) : sortedItems.length === 0 ? (
                <tr>
                  <td colSpan={orderedColumns.length} className="px-4 py-12 text-center text-sm text-slate-500">
                    No se encontraron casos. Cree el primero con el boton &quot;Nuevo Caso&quot;.
                  </td>
                </tr>
              ) : (
                sortedItems.map((caso, i) => (
                  <motion.tr
                    key={caso.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`cursor-pointer transition-all duration-200 hover:bg-slate-50 hover:-translate-y-[1px] ${PRIORITY_BORDER[caso.priorityLabel] || ""}`}
                    onClick={() => router.push(`/casos/${caso.id}`)}
                  >
                    {orderedColumns.map((col) => (
                      <td key={col.key} className="px-3 sm:px-5 py-2.5 sm:py-4 text-sm">
                        {col.render(caso)}
                      </td>
                    ))}
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} pages={pages} onPageChange={setPage} />
    </motion.div>
  );
}
