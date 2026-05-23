export const THEMES = {
  midnight: {
    id: "midnight",
    label: "Midnight",
    preview: ["#0a0a0f", "#1e293b", "#4ade80"],
    bg:          "#0a0a0f",
    surface:     "rgba(255,255,255,0.03)",
    surfaceHigh: "rgba(255,255,255,0.06)",
    border:      "rgba(255,255,255,0.06)",
    borderHigh:  "rgba(255,255,255,0.12)",
    textPrimary: "#e2e8f0",
    textSub:     "#64748b",
    textMuted:   "#334155",
    accent:      "#4ade80",
    accentText:  "#0a0a0f",
    navBg:       "#0a0a0f",
    headerBg:    "#0a0a0f",
  },
  slate: {
    id: "slate",
    label: "Slate",
    preview: ["#0f172a", "#1e40af", "#38bdf8"],
    bg:          "#0f172a",
    surface:     "rgba(255,255,255,0.04)",
    surfaceHigh: "rgba(255,255,255,0.08)",
    border:      "rgba(255,255,255,0.07)",
    borderHigh:  "rgba(56,189,248,0.3)",
    textPrimary: "#e2e8f0",
    textSub:     "#64748b",
    textMuted:   "#1e3a5f",
    accent:      "#38bdf8",
    accentText:  "#0f172a",
    navBg:       "#0d1526",
    headerBg:    "#0d1526",
  },
  ember: {
    id: "ember",
    label: "Ember",
    preview: ["#0f0a0a", "#7f1d1d", "#fb923c"],
    bg:          "#0f0a0a",
    surface:     "rgba(255,255,255,0.03)",
    surfaceHigh: "rgba(255,255,255,0.06)",
    border:      "rgba(255,100,50,0.1)",
    borderHigh:  "rgba(251,146,60,0.3)",
    textPrimary: "#fef2f2",
    textSub:     "#78716c",
    textMuted:   "#3f2d1e",
    accent:      "#fb923c",
    accentText:  "#0f0a0a",
    navBg:       "#0f0a0a",
    headerBg:    "#0f0a0a",
  },
  aurora: {
    id: "aurora",
    label: "Aurora",
    preview: ["#070d14", "#1a1040", "#a78bfa"],
    bg:          "#070d14",
    surface:     "rgba(255,255,255,0.03)",
    surfaceHigh: "rgba(167,139,250,0.08)",
    border:      "rgba(167,139,250,0.1)",
    borderHigh:  "rgba(167,139,250,0.3)",
    textPrimary: "#ede9fe",
    textSub:     "#6d5fa6",
    textMuted:   "#2e1f4a",
    accent:      "#a78bfa",
    accentText:  "#070d14",
    navBg:       "#070d14",
    headerBg:    "#070d14",
  },
};

export const DEFAULT_THEME = "midnight";

export function getTheme() {
  const id = localStorage.getItem("axis_theme") || DEFAULT_THEME;
  return THEMES[id] || THEMES[DEFAULT_THEME];
}

export function setTheme(id) {
  localStorage.setItem("axis_theme", id);
  window.dispatchEvent(new Event("axis_theme_changed"));
}