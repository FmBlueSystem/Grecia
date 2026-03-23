// Centralized UI constants for STIA Casos portal
import { getChartColors } from "@/lib/palettes";

// --- Status badge colors (used in dashboard, casos list, caso detail) ---
export const STATUS_COLORS: Record<number, string> = {
  [-3]: "bg-blue-500/10 text-blue-600 border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.15)] backdrop-blur-sm relative overflow-hidden",
  [-2]: "bg-amber-500/10 text-amber-600 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.15)] backdrop-blur-sm relative overflow-hidden",
  [-1]: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.15)] backdrop-blur-sm relative overflow-hidden",
};

// --- Priority badge colors ---
export const PRIORITY_COLORS: Record<string, string> = {
  Alta: "bg-red-500/15 text-red-600 border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)] font-bold backdrop-blur-sm relative overflow-hidden",
  Normal: "bg-slate-500/10 text-slate-600 border border-slate-500/20 shadow-sm backdrop-blur-sm relative overflow-hidden",
  Baja: "bg-gray-500/5 text-gray-500 border border-gray-200 backdrop-blur-sm relative overflow-hidden",
};

// --- Priority left-border colors (for table rows) ---
export const PRIORITY_BORDER: Record<string, string> = {
  Alta: "border-l-[3px] border-l-red-500",
  Normal: "border-l-[3px] border-l-amber-400",
  Baja: "border-l-[3px] border-l-green-500",
};

// --- Role badge colors ---
export const ROLE_COLORS: Record<string, string> = {
  admin: "bg-purple-500/10 text-purple-600 border border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.15)]",
  supervisor: "bg-blue-500/10 text-blue-600 border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.15)]",
  agente: "bg-slate-500/10 text-slate-600 border border-slate-500/20 shadow-sm",
  colaborador: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-sm",
  coordinador: "bg-rose-500/10 text-rose-600 border border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.15)]",
};

// --- Chart palette (derived from active palette default) ---
export const CHART_COLORS = getChartColors();

// --- Tooltip presets (dark, unified across all charts) ---
export const TOOLTIP_DARK = {
  background: "#0F172A",
  border: "none",
  borderRadius: 12,
  padding: "10px 14px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
  color: "#F1F5F9",
};
export const TOOLTIP_LABEL_STYLE = { color: "#94A3B8", fontSize: 11, fontWeight: 600, marginBottom: 4 };
export const TOOLTIP_ITEM_STYLE = { color: "#F1F5F9", fontSize: 13, padding: "2px 0" };

// --- Animation presets (Framer Motion) ---
export const ANIM = {
  duration: { fast: 0.3, normal: 0.5, slow: 0.7 },
  stagger: 0.06,
  rowStagger: 0.03,
  ease: "easeOut" as const,
  entry: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
} as const;

export const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: ANIM.stagger } },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: ANIM.duration.normal } },
};

// --- Card hover preset ---
export const cardHover = {
  y: -3,
  boxShadow: "0 8px 20px -4px rgba(0,0,0,0.1)",
};

// --- Common classnames ---
export const CLS = {
  card: "rounded-xl border border-slate-200/60 bg-white shadow-sm",
  cardP: "rounded-xl border border-slate-200/60 bg-white p-3 sm:p-5 shadow-sm",
  sectionTitle: "text-sm font-semibold uppercase tracking-wide text-slate-500",
  pageTitle: "text-xl sm:text-2xl font-bold text-slate-900",
  pageDesc: "text-sm text-slate-500",
  tableHead: "border-b bg-slate-50/80 text-left text-xs font-medium uppercase tracking-wide text-slate-500",
  tableCell: "px-3 sm:px-5 py-2 sm:py-3",
  tableRow: "border-b last:border-0 transition-colors hover:bg-blue-50/40",
} as const;
