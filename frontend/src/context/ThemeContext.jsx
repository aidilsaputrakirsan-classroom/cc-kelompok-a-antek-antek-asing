import { createContext, useState, useLayoutEffect } from "react";

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState("light");
  const [mounted, setMounted] = useState(false);

  const applyTheme = (themeMode) => {
    const root = document.documentElement;
    const isDark = themeMode === "dark";

    if (isDark) {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    }

    localStorage.setItem("themeMode", themeMode);
  };

  // Initialize theme on mount
  useLayoutEffect(() => {
    const savedMode = localStorage.getItem("themeMode") || "light";
    setMode(savedMode);
    applyTheme(savedMode);
    setMounted(true);
  }, []);

  const toggleMode = () => {
    setMode((prev) => {
      const newMode = prev === "light" ? "dark" : "light";
      applyTheme(newMode);
      return newMode;
    });
  };

  // Prevent flash on mount
  if (!mounted) {
    return children;
  }

  return (
    <ThemeContext.Provider value={{ mode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

