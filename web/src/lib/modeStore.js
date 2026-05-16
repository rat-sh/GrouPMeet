import { create } from "zustand";

export const useModeStore = create((set) => ({
  mode: "personal", // 'personal' | 'education' | 'professional'
  setMode: (mode) => set({ mode }),

  colorFamily: "green", // 'yellow' | 'red' | 'blue' | 'green' | 'pink'
  setColorFamily: (color) => set({ colorFamily: color }),

  isDarkMode: true,
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
}));
