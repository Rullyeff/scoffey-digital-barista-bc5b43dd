import { createContext, useContext, useEffect, useMemo, useState } from "react";

export const PALETTES = [
  {
    id: "signature",
    name: "Scoffey Signature",
    description: "Tema asli — oat milk, espresso, dan aksen karamel.",
    swatch: ["#f2e7d5", "#6b4a2f", "#c98a4b"],
  },
  {
    id: "navy",
    name: "Navy",
    description: "Biru laut dalam dengan aksen kuningan.",
    swatch: ["#e6ecf5", "#1f3a63", "#c7a55c"],
  },
  {
    id: "coffee",
    name: "Coffee",
    description: "Sangrai gelap, cokelat pekat, dan crema.",
    swatch: ["#efe3d6", "#4a2f21", "#a9744a"],
  },
  {
    id: "milk",
    name: "Milk",
    description: "Putih susu lembut dengan sentuhan vanila.",
    swatch: ["#faf7f2", "#5c5348", "#d9c7a7"],
  },
  {
    id: "tea",
    name: "Tea",
    description: "Hijau matcha dan daun teh yang menenangkan.",
    swatch: ["#eaf0e2", "#33502f", "#8fae5d"],
  },
] as const;

export type PaletteId = (typeof PALETTES)[number]["id"];

export const PALETTE_STORAGE_KEY = "scoffey-palette";
const PALETTE_EVENT = "scoffey-palette-change";

export function isPaletteId(value: unknown): value is PaletteId {
  return PALETTES.some((p) => p.id === value);
}

export function applyPalette(id: PaletteId) {
  document.documentElement.setAttribute("data-palette", id);
}

const PaletteContext = createContext<{
  palette: PaletteId;
  setPalette: (id: PaletteId) => void;
}>({ palette: "signature", setPalette: () => {} });

export function PaletteProvider({ children }: { children: React.ReactNode }) {
  const [palette, setPaletteState] = useState<PaletteId>("signature");

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(PALETTE_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    const next: PaletteId = isPaletteId(stored) ? stored : "signature";
    setPaletteState(next);
    applyPalette(next);

    const onChange = () => {
      let value: string | null = null;
      try {
        value = window.localStorage.getItem(PALETTE_STORAGE_KEY);
      } catch {
        /* ignore */
      }
      const resolved: PaletteId = isPaletteId(value) ? value : "signature";
      setPaletteState(resolved);
      applyPalette(resolved);
    };

    window.addEventListener("storage", onChange);
    window.addEventListener(PALETTE_EVENT, onChange);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener(PALETTE_EVENT, onChange);
    };
  }, []);

  const setPalette = (id: PaletteId) => {
    setPaletteState(id);
    applyPalette(id);
    try {
      window.localStorage.setItem(PALETTE_STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event(PALETTE_EVENT));
  };

  const value = useMemo(() => ({ palette, setPalette }), [palette]);

  return <PaletteContext.Provider value={value}>{children}</PaletteContext.Provider>;
}

export const usePalette = () => useContext(PaletteContext);
