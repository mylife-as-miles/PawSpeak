import { create } from "zustand";
import { useColorScheme } from "react-native";

export const useThemeStore = create((set) => ({
  manualTheme: null, // 'light', 'dark', or null (system)
  setManualTheme: (theme) => set({ manualTheme: theme }),
  toggleTheme: (systemScheme) =>
    set((state) => {
      const currentTheme = state.manualTheme || systemScheme || "light";
      return { manualTheme: currentTheme === "light" ? "dark" : "light" };
    }),
}));

export function useAppTheme() {
  const systemScheme = useColorScheme();
  const { manualTheme, toggleTheme } = useThemeStore();

  const isDark = (manualTheme || systemScheme) === "dark";

  return {
    isDark,
    systemScheme,
    toggleTheme: () => toggleTheme(systemScheme),
  };
}
