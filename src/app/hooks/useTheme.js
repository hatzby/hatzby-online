"use client";

import { createContext, useContext, useEffect, useState } from "react";

const themes = {
  light: {
    name: "light",
    background: "rgba(255, 255, 243, 1)",
    cardBg: "#595758",
    headerGradient: {
      color1: "#bf5b5b",
      color2: "#c6b955",
      color3: "#86b460",
      color4: "#3c8d88",
      color5: "#595758",
    },
    text: "#ffffff",
    textMuted: "rgba(255, 255, 255, 0.8)",
  },
  dark: {
    name: "dark",
    background: "#1a1a1a",
    cardBg: "#313131",
    headerGradient: {
      color1: "#9E2A2B",
      color2: "#D9843F",
      color3: "#D0CA92",
      color4: "#56695B",
      color5: "#1D2E2F",
    },
    text: "#e1e1e1",
    textMuted: "rgba(225, 225, 225, 0.8)",
  },
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    // Check localStorage and system preference
    const stored = localStorage.getItem("theme");
    if (stored && themes[stored]) {
      setTheme(stored);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }
  }, []);

  const [isTransitioning, setIsTransitioning] = useState(false);

  const toggleTheme = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      const newTheme = theme === "light" ? "dark" : "light";
      setTheme(newTheme);
      localStorage.setItem("theme", newTheme);
      // Give time for the loading animation to complete
      setTimeout(() => setIsTransitioning(false), 600);
    }, 100);
  };

  useEffect(() => {
    // Apply theme colors to CSS variables
    const colors = themes[theme];
    document.documentElement.style.setProperty("--background", colors.background);
    document.documentElement.style.setProperty("--card-bg", colors.cardBg);
    document.documentElement.style.setProperty("--text", colors.text);
    document.documentElement.style.setProperty("--text-muted", colors.textMuted);
    
    // Header gradient colors
    document.documentElement.style.setProperty("--gradient-1", colors.headerGradient.color1);
    document.documentElement.style.setProperty("--gradient-2", colors.headerGradient.color2);
    document.documentElement.style.setProperty("--gradient-3", colors.headerGradient.color3);
    document.documentElement.style.setProperty("--gradient-4", colors.headerGradient.color4);
    document.documentElement.style.setProperty("--gradient-5", colors.headerGradient.color5);
    
    // Update body class for any global theme styles
    document.body.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isTransitioning }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
