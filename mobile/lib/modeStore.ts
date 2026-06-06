import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createMMKV } from "react-native-mmkv";

export type AppMode = "personal" | "education" | "professional";

// ── 5 Colour Palettes (Matching Settings Mockup) ─────────────────────────────
export const colorPalettes = [
  { name: "Green",   accent: "#05D474", accentMuted: "#05D47422", grad: ["#05D474", "#029A53"] as [string, string] },
  { name: "Yellow",  accent: "#FFBE0B", accentMuted: "#FFBE0B22", grad: ["#FFBE0B", "#D69F06"] as [string, string] },
  { name: "Pink",    accent: "#FF2A5F", accentMuted: "#FF2A5F22", grad: ["#FF2A5F", "#CC1C46"] as [string, string] },
  { name: "Blue",    accent: "#3B82F6", accentMuted: "#3B82F622", grad: ["#3B82F6", "#1D4ED8"] as [string, string] },
  { name: "Magenta", accent: "#F327B6", accentMuted: "#F327B622", grad: ["#F327B6", "#C11A8E"] as [string, string] },
] as const;

// ── Mode base (bg / text / borders — not accent) ─────────────────────────────
const modeBase = {
  personal:     { bg: "#0D0D0F", cardBg: "#1A1A1D", text: "#ECECEC", textMuted: "#6B6B70", border: "#2D2D30" },
  education:    { bg: "#09090B", cardBg: "#18181B", text: "#FAFAFA",  textMuted: "#A1A1AA", border: "#27272A" },
  professional: { bg: "#0F172A", cardBg: "#1E293B", text: "#F8FAFC",  textMuted: "#94A3B8", border: "#334155" },
};

// ── Legacy static export (used in tabs _layout before hook refactor) ──────────
export const modeTheme = {
  personal:     { ...modeBase.personal,     accent: "#EC4899", accentMuted: "#EC489922" },
  education:    { ...modeBase.education,    accent: "#9333EA", accentMuted: "#9333EA22" },
  professional: { ...modeBase.professional, accent: "#3B82F6", accentMuted: "#3B82F622" },
};

// ── Store ────────────────────────────────────────────────────────────────────
interface ModeState {
  mode: AppMode;
  paletteIndex: number;
  setMode: (mode: AppMode) => void;
  setPalette: (index: number) => void;
}

const storage = createMMKV();
const zustandStorage = {
  setItem: (name: string, value: string) => storage.set(name, value),
  getItem: (name: string) => storage.getString(name) ?? null,
  removeItem: (_name: string) => { /* no-op: mmkv v4 delete API changed */ },
};

export const useModeStore = create<ModeState>()(
  persist(
    (set) => ({
      mode: "personal",
      paletteIndex: 0,          // Default: Pink Neon
      setMode: (mode) => set({ mode }),
      setPalette: (paletteIndex) => set({ paletteIndex }),
    }),
    { name: "mode-storage", storage: createJSONStorage(() => zustandStorage) }
  )
);

// ── Composite theme hook ──────────────────────────────────────────────────────
// Returns mode bg/text/border merged with active palette accent colours.
export const useAppTheme = () => {
  const { mode, paletteIndex } = useModeStore();
  const base = modeBase[mode];
  const palette = colorPalettes[paletteIndex];
  return {
    ...base,
    accent:         palette.accent,
    accentMuted:    palette.accentMuted,
    gradientColors: palette.grad,
    paletteName:    palette.name,
  };
};
