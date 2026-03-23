// Palette system for STIA Casos portal
// Scientific foundations: Mehta & Zhu 2009, Su et al. 2019, Elliot & Maier 2014, Labrecque & Milne 2012

export type PaletteId = "corporativo-azul" | "bosque-profesional" | "ejecutivo-grafito";

export interface PaletteColors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  accent: string;
  ring: string;
  chart: [string, string, string, string, string];
  sidebarGradientFrom: string;
  sidebarGradientTo: string;
}

export interface Palette {
  id: PaletteId;
  name: string;
  description: string;
  citation: string;
  colors: PaletteColors;
}

export const PALETTES: Record<PaletteId, Palette> = {
  "corporativo-azul": {
    id: "corporativo-azul",
    name: "Corporativo Azul",
    description: "Confianza institucional y claridad analítica",
    citation: "Mehta & Zhu 2009, Su et al. 2019",
    colors: {
      primary: "#0067B2",
      primaryDark: "#004E87",
      primaryLight: "#109BC4",
      accent: "#F59E0B",
      ring: "#0067B2",
      chart: ["#0067B2", "#8B5CF6", "#10B981", "#F59E0B", "#EC4899"],
      sidebarGradientFrom: "#0067B2",
      sidebarGradientTo: "#004E87",
    },
  },
  "bosque-profesional": {
    id: "bosque-profesional",
    name: "Bosque Profesional",
    description: "Calma natural y reducción de estrés cognitivo",
    citation: "Elliot & Maier 2014, Li & Sullivan 2016",
    colors: {
      primary: "#0D7C66",
      primaryDark: "#065F4E",
      primaryLight: "#10B981",
      accent: "#D97706",
      ring: "#0D7C66",
      chart: ["#0D7C66", "#7C3AED", "#0EA5E9", "#F59E0B", "#F43F5E"],
      sidebarGradientFrom: "#0D7C66",
      sidebarGradientTo: "#065F4E",
    },
  },
  "ejecutivo-grafito": {
    id: "ejecutivo-grafito",
    name: "Ejecutivo Grafito",
    description: "Autoridad premium y sofisticación",
    citation: "Labrecque & Milne 2012",
    colors: {
      primary: "#374151",
      primaryDark: "#1F2937",
      primaryLight: "#6B7280",
      accent: "#D97706",
      ring: "#374151",
      chart: ["#374151", "#6366F1", "#14B8A6", "#EAB308", "#EC4899"],
      sidebarGradientFrom: "#374151",
      sidebarGradientTo: "#1F2937",
    },
  },
};

export const DEFAULT_PALETTE: PaletteId = "corporativo-azul";

const LS_KEY = "stia-palette";

export function getPaletteId(): PaletteId {
  if (typeof window === "undefined") return DEFAULT_PALETTE;
  const stored = localStorage.getItem(LS_KEY);
  if (stored && stored in PALETTES) return stored as PaletteId;
  return DEFAULT_PALETTE;
}

export function savePaletteId(id: PaletteId): void {
  localStorage.setItem(LS_KEY, id);
}

export function getChartColors(id?: PaletteId): string[] {
  const pid = id ?? DEFAULT_PALETTE;
  return [...PALETTES[pid].colors.chart];
}

export function applyPalette(id: PaletteId): void {
  const { colors } = PALETTES[id];
  const root = document.documentElement;

  root.style.setProperty("--primary", colors.primary);
  root.style.setProperty("--primary-dark", colors.primaryDark);
  root.style.setProperty("--primary-light", colors.primaryLight);
  root.style.setProperty("--ring", colors.ring);
  root.style.setProperty("--sidebar-primary", colors.primary);
  root.style.setProperty("--sidebar-ring", colors.ring);

  // Chart CSS vars
  colors.chart.forEach((c, i) => {
    root.style.setProperty(`--chart-${i + 1}`, c);
  });

  // Sidebar gradient
  root.style.setProperty("--sidebar-gradient-from", colors.sidebarGradientFrom);
  root.style.setProperty("--sidebar-gradient-to", colors.sidebarGradientTo);
}
