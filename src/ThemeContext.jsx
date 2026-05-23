import { createContext, useContext, useState, useEffect } from "react";
import { getTheme } from "./theme";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getTheme);

  useEffect(() => {
    const sync = () => setThemeState(getTheme());
    window.addEventListener("axis_theme_changed", sync);
    return () => window.removeEventListener("axis_theme_changed", sync);
  }, []);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}