import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { MMKV } from "react-native-mmkv";

export type AppMode = "personal" | "education" | "professional";

interface ModeState {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
}

// Initialize MMKV via Nitro Modules / JSI
const storage = new MMKV();

// Create Zustand storage adapter
const zustandStorage = {
  setItem: (name: string, value: string) => {
    return storage.set(name, value);
  },
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name: string) => {
    return storage.delete(name);
  },
};

export const useModeStore = create<ModeState>()(
  persist(
    (set) => ({
      mode: "personal",
      setMode: (mode) => set({ mode }),
    }),
    {
      name: "mode-storage",
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);

export const modeTheme = {
  personal: {
    bg: "#0D0D0F",
    cardBg: "#1A1A1D",
    accent: "#F4A261",
    accentMuted: "#F4A26120",
    text: "#ECECEC",
    textMuted: "#6B6B70",
    border: "#2D2D30",
  },
  education: {
    bg: "#09090B",
    cardBg: "#18181B",
    accent: "#6366F1",
    accentMuted: "#6366F120",
    text: "#FAFAFA",
    textMuted: "#A1A1AA",
    border: "#27272A",
  },
  professional: {
    bg: "#0F172A", // Slate 900
    cardBg: "#1E293B", // Slate 800
    accent: "#0EA5E9", // Sky 500
    accentMuted: "#0EA5E920",
    text: "#F8FAFC",
    textMuted: "#94A3B8",
    border: "#334155",
  },
};
