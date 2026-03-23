"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { type PaletteId, DEFAULT_PALETTE, PALETTES, getPaletteId, savePaletteId, applyPalette, getChartColors } from "@/lib/palettes";

interface ThemeContextValue {
  paletteId: PaletteId;
  setPalette: (id: PaletteId) => void;
  chartColors: string[];
}

const ThemeContext = createContext<ThemeContextValue>({
  paletteId: DEFAULT_PALETTE,
  setPalette: () => {},
  chartColors: getChartColors(),
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [paletteId, setPaletteId] = useState<PaletteId>(DEFAULT_PALETTE);

  useEffect(() => {
    const stored = getPaletteId();
    setPaletteId(stored);
    applyPalette(stored);
  }, []);

  function setPalette(id: PaletteId) {
    setPaletteId(id);
    savePaletteId(id);
    applyPalette(id);
  }

  const chartColors = getChartColors(paletteId);

  return (
    <ThemeContext.Provider value={{ paletteId, setPalette, chartColors }}>
      {children}
    </ThemeContext.Provider>
  );
}
