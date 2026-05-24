import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "./ThemeContext";
import Logo from "./components/Logo";

const NAV_ITEMS = [
  { label: "Solve",    path: "/",         icon: CubeIcon },
  { label: "Review",  path: "/review",   icon: GridIcon },
  { label: "Home",    path: "/",         icon: (props) => <Logo {...props} /> },
  { label: "History", path: "/history",  icon: ClockIcon },
  { label: "Settings",path: "/settings", icon: GearIcon },
];

export default function AppShell({ children }) {
  const t = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [username, setUsername] = useState(
    () => localStorage.getItem("axis_username") || "Solver"
  );
  const [elapsed, setElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    window.axisTimer = {
      start: () => setTimerActive(true),
      stop:  () => setTimerActive(false),
      reset: () => { setElapsed(0); setTimerActive(false); },
      getElapsed: () => elapsed,
      isRunning: timerActive,
    };
  }, [elapsed, timerActive]);

  useEffect(() => {
    if (timerActive) {
      intervalRef.current = setInterval(() => setElapsed(p => p + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [timerActive]);

  useEffect(() => {
    const sync = () => setUsername(localStorage.getItem("axis_username") || "Solver");
    window.addEventListener("axis_username_changed", sync);
    return () => window.removeEventListener("axis_username_changed", sync);
  }, []);

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const showTimer = timerActive || elapsed > 0;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100dvh",
      width: "100%",
      maxWidth: "430px",
      margin: "0 auto",
      background: t.bg,
      fontFamily: "'SF Pro Display', 'Inter', system-ui, sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      <header style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 16px",
        borderBottom: `1px solid ${t.border}`,
        background: t.headerBg,
        zIndex: 10,
        flexShrink: 0,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap: 8 }}>
          <Logo size={28} />
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
            <span style={{ color: t.textPrimary, fontSize: 15, fontWeight: 700, letterSpacing: "0.02em" }}>
              Cube Solve
            </span>
            <span style={{ color: t.textMuted, fontSize: 10, fontWeight: 500, letterSpacing: "0.05em" }}>
              v1.0
            </span>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap: 8 }}>
          {showTimer && (
            <div style={{
              display: "flex", alignItems: "center", gap: 5,
              background: t.surface,
              border: `1px solid ${t.border}`,
              borderRadius: 20, padding: "3px 8px",
              color: t.textSub, fontSize: 12, fontWeight: 600,
              fontVariantNumeric: "tabular-nums",
            }}>
              <span style={{
                width: 5, height: 5, borderRadius: "50%",
                background: t.accent,
                boxShadow: `0 0 6px ${t.accent}`,
                animation: "pulse 1.5s ease-in-out infinite",
              }} />
              {formatTime(elapsed)}
            </div>
          )}
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 20, padding: "3px 8px 3px 3px",
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: "50%",
              background: t.surfaceHigh,
              color: t.textPrimary, fontSize: 10, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {username[0].toUpperCase()}
            </div>
            <span style={{ color: t.textSub, fontSize: 12, fontWeight: 500 }}>
              {username}
            </span>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        {children}
      </main>

      <nav style={{
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        padding: "6px 0 18px",
        borderTop: `1px solid ${t.border}`,
        background: t.navBg,
        flexShrink: 0,
        zIndex: 10,
      }}>
        {NAV_ITEMS.map(({ label, path, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              style={{
                display: "flex", flexDirection: "column",
                alignItems: "center", gap: 3,
                background: "none", border: "none", cursor: "pointer",
                padding: "6px 16px", position: "relative",
                minWidth: 56,
              }}
            >
              <Icon size={20} color={active ? t.textPrimary : t.textSub} />
              <span style={{
                fontSize: 10, fontWeight: 500, letterSpacing: "0.03em",
                color: active ? t.textPrimary : t.textSub,
              }}>
                {label}
              </span>
              {active && (
                <div style={{
                  position: "absolute", bottom: -2,
                  width: 4, height: 4, borderRadius: "50%",
                  background: t.accent,
                }} />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function CubeIcon({ size = 20, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  );
}

function GridIcon({ size = 20, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  );
}

function ClockIcon({ size = 20, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

function GearIcon({ size = 20, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  );
}
