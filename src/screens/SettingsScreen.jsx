import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../ThemeContext";
import { THEMES, setTheme } from "../theme";

export default function SettingsScreen() {
  const t = useTheme();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [themeOpen, setThemeOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState(
    () => localStorage.getItem("axis_theme") || "midnight"
  );

  useEffect(() => {
    setUsername(localStorage.getItem("axis_username") || "Solver");
  }, []);

  const handleSave = () => {
    const trimmed = username.trim();
    if (!trimmed) { setError("Username cannot be empty."); return; }
    if (trimmed.length > 20) { setError("Username must be 20 characters or less."); return; }
    localStorage.setItem("axis_username", trimmed);
    window.dispatchEvent(new Event("axis_username_changed"));
    setError(""); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleThemeSelect = (id) => {
    setActiveTheme(id);
    setTheme(id);
  };

  const s = makeStyles(t);

  return (
    <div style={s.root}>
      <div style={s.header}>
        <span style={s.stepTag}>Settings</span>
      </div>

      <h2 style={s.title}>Preferences</h2>

      <div style={s.section}>
        <span style={s.sectionLabel}>Appearance</span>
        <div style={s.card}>
          <button
            style={s.themeRow}
            onClick={() => setThemeOpen(o => !o)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", gap: 3 }}>
                {THEMES[activeTheme].preview.map((c, i) => (
                  <div key={i} style={{
                    width: 12,
                    height: 12,
                    borderRadius: 4,
                    background: c,
                    border: "1px solid rgba(255,255,255,0.1)",
                  }} />
                ))}
              </div>
              <span style={{ color: t.textPrimary, fontSize: 14, fontWeight: 500 }}>
                {THEMES[activeTheme].label}
              </span>
            </div>
            <span style={{
              color: t.textSub,
              fontSize: 12,
              transform: themeOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
              display: "inline-block",
            }}>
              ▾
            </span>
          </button>

          {themeOpen && (
            <div style={s.themeList}>
              {Object.values(THEMES).map((th) => {
                const isActive = activeTheme === th.id;
                return (
                  <button
                    key={th.id}
                    onClick={() => { handleThemeSelect(th.id); setThemeOpen(false); }}
                    style={{
                      ...s.themeOption,
                      background: isActive ? t.surfaceHigh : "transparent",
                      border: `1px solid ${isActive ? t.accent : "transparent"}`,
                    }}
                  >
                    <div style={{ display: "flex", gap: 4 }}>
                      {th.preview.map((c, i) => (
                        <div key={i} style={{
                          width: 14,
                          height: 14,
                          borderRadius: 4,
                          background: c,
                          border: "1px solid rgba(255,255,255,0.1)",
                        }} />
                      ))}
                    </div>
                    <span style={{
                      color: isActive ? t.accent : t.textSub,
                      fontSize: 13,
                      fontWeight: isActive ? 700 : 400,
                      flex: 1,
                      textAlign: "left",
                    }}>
                      {th.label}
                    </span>
                    {isActive && (
                      <span style={{ color: t.accent, fontSize: 12, fontWeight: 800 }}>✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div style={s.section}>
        <span style={s.sectionLabel}>Profile</span>
        <div style={s.card}>
          <div style={s.avatarRow}>
            <div style={s.avatar}>
              {username.trim() ? username.trim()[0].toUpperCase() : "S"}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ color: t.textPrimary, fontSize: 15, fontWeight: 700 }}>
                {username.trim() || "Solver"}
              </span>
              <span style={{ color: t.textMuted, fontSize: 12 }}>Cube Solve user</span>
            </div>
          </div>

          <div style={s.divider} />

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ color: t.textSub, fontSize: 12, fontWeight: 500 }}>Username</label>
            <div style={{ position: "relative" }}>
              <input
                style={{
                  ...s.input,
                  borderColor: error ? "rgba(248,113,113,0.4)" : saved ? "rgba(74,222,128,0.3)" : t.border,
                }}
                value={username}
                onChange={(e) => { setUsername(e.target.value); setSaved(false); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                maxLength={20}
                placeholder="Enter username"
                spellCheck={false}
                autoComplete="off"
              />
              <span style={s.charCount}>{username.length}/20</span>
            </div>
            {error && <span style={{ color: "#f87171", fontSize: 12, fontWeight: 500 }}>{error}</span>}
            {saved && <span style={{ color: t.accent, fontSize: 12, fontWeight: 500 }}>✓ Saved</span>}
          </div>

          <button
            style={{ ...s.saveBtn, opacity: saved ? 0.5 : 1 }}
            onClick={handleSave}
          >
            {saved ? "Saved ✓" : "Save username"}
          </button>
        </div>
      </div>

      <div style={s.section}>
        <span style={s.sectionLabel}>About</span>
        <div style={s.card}>
          {[
            ["App", "Cube Solve"],
            ["Version", "1.0.0"],
            ["Author", "Farhan Bin Hossain"],
            ["Algorithm", "Kociemba (Two-phase)"],
          ].map(([k, v], i, arr) => (
            <div key={k}>
              <div style={s.infoRow}>
                <span style={{ color: t.textSub, fontSize: 13 }}>{k}</span>
                <span style={{ color: t.textSub, fontSize: 13, fontWeight: 500 }}>{v}</span>
              </div>
              {i < arr.length - 1 && <div style={s.thinDivider} />}
            </div>
          ))}
        </div>
      </div>

      <div style={s.section}>
        <span style={s.sectionLabel}>Data</span>
        <div style={s.card}>
          <div style={s.infoRow}>
            <span style={{ color: t.textSub, fontSize: 13 }}>Solve history</span>
            <span style={{ color: t.textSub, fontSize: 13, fontWeight: 500 }}>
              {JSON.parse(localStorage.getItem("cube_history") || "[]").length} solves
            </span>
          </div>
          <div style={s.thinDivider} />
          <button
            style={s.dangerBtn}
            onClick={() => { localStorage.removeItem("cube_history"); navigate("/history"); }}
          >
            Clear solve history
          </button>
        </div>
      </div>

      <span style={s.footer}>Cube Solve · Farhan Bin Hossain · v1.0.0</span>
    </div>
  );
}

function makeStyles(t) {
  return {
    root: {
      display: "flex",
      flexDirection: "column",
      minHeight: "100%",
      padding: "16px 16px 40px",
      gap: 18,
    },
    header: { display: "flex", alignItems: "center" },
    stepTag: {
      color: t.textMuted,
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
    },
    title: {
      color: t.textPrimary,
      fontSize: 24,
      fontWeight: 800,
      letterSpacing: "-0.02em",
      margin: 0,
    },
    section: { display: "flex", flexDirection: "column", gap: 8 },
    sectionLabel: {
      color: t.textMuted,
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      paddingLeft: 2,
    },
    card: {
      background: t.surface,
      border: `1px solid ${t.border}`,
      borderRadius: 14,
      padding: 16,
      display: "flex",
      flexDirection: "column",
      gap: 14,
    },
    themeRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: 0,
      width: "100%",
    },
    themeList: {
      display: "flex",
      flexDirection: "column",
      gap: 4,
      borderTop: `1px solid ${t.border}`,
      paddingTop: 10,
      marginTop: 4,
    },
    themeOption: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 10px",
      borderRadius: 10,
      cursor: "pointer",
      transition: "background 0.15s",
      width: "100%",
    },
    avatarRow: { display: "flex", alignItems: "center", gap: 12 },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: "50%",
      background: t.surfaceHigh,
      border: `1px solid ${t.borderHigh}`,
      color: t.textPrimary,
      fontSize: 18,
      fontWeight: 700,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    divider: { height: 1, background: t.border, margin: "0 -16px" },
    thinDivider: { height: 1, background: t.border, margin: "4px 0" },
    input: {
      width: "100%",
      padding: "11px 44px 11px 12px",
      borderRadius: 10,
      background: t.surface,
      border: `1px solid ${t.border}`,
      color: t.textPrimary,
      fontSize: 14,
      fontWeight: 500,
      outline: "none",
      boxSizing: "border-box",
      fontFamily: "inherit",
      transition: "border-color 0.2s",
    },
    charCount: {
      position: "absolute",
      right: 10,
      top: "50%",
      transform: "translateY(-50%)",
      color: t.textMuted,
      fontSize: 11,
      pointerEvents: "none",
    },
    saveBtn: {
      padding: 12,
      borderRadius: 10,
      background: t.accent,
      border: "none",
      color: t.accentText,
      fontSize: 14,
      fontWeight: 700,
      cursor: "pointer",
      transition: "opacity 0.2s",
    },
    infoRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
    dangerBtn: {
      padding: 10,
      borderRadius: 10,
      background: "rgba(248,113,113,0.06)",
      border: "1px solid rgba(248,113,113,0.12)",
      color: "#f87171",
      fontSize: 13,
      fontWeight: 600,
      cursor: "pointer",
      textAlign: "center",
    },
    footer: {
      color: t.textMuted,
      fontSize: 11,
      letterSpacing: "0.04em",
      textAlign: "center",
      marginTop: "auto",
    },
  };
}