import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { label: "Solve",    path: "/",         icon: CubeIcon },
  { label: "Review",  path: "/review",   icon: GridIcon },
  { label: "History", path: "/history",  icon: ClockIcon },
  { label: "Settings",path: "/settings", icon: GearIcon },
];

export default function AppShell({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [username, setUsername] = useState(() => localStorage.getItem("axis_username") || "Solver");
  const [elapsed, setElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    window.axisTimer = {
      start: () => setTimerActive(true),
      stop:  () => setTimerActive(false),
      reset: () => { setElapsed(0); setTimerActive(false); },
      getElapsed: () => elapsed,
    };
  }, [elapsed]);

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
    <div style={s.root}>
      <header style={s.topBar}>
        <div style={s.topLeft}>
          <span style={s.appName}>Cube Solve</span>
          <span style={s.version}>v1.0</span>
        </div>
        <div style={s.topRight}>
          {showTimer && (
            <div style={s.timerPill}>
              <span style={s.timerDot} />
              {formatTime(elapsed)}
            </div>
          )}
          <div style={s.userPill}>
            <div style={s.userAvatar}>{username[0].toUpperCase()}</div>
            <span style={s.userName}>{username}</span>
          </div>
        </div>
      </header>

      <main style={s.main}>
        {children}
      </main>

      <nav style={s.bottomNav}>
        {NAV_ITEMS.map(({ label, path, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              style={{ ...s.navBtn, ...(active ? s.navBtnActive : {}) }}
              onClick={() => navigate(path)}
            >
              <Icon size={20} color={active ? "#e2e8f0" : "#475569"} />
              <span style={{ ...s.navLabel, color: active ? "#e2e8f0" : "#475569" }}>
                {label}
              </span>
              {active && <div style={s.navActiveDot} />}
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

const s = {
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100dvh",
    width: "100%",
    maxWidth: 480,
    margin: "0 auto",
    background: "#0a0a0f",
    fontFamily: "'SF Pro Display', 'Inter', system-ui, sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    background: "#0a0a0f",
    zIndex: 10,
    flexShrink: 0,
  },
  topLeft: {
    display: "flex",
    alignItems: "baseline",
    gap: 8,
  },
  appName: {
    color: "#e2e8f0",
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: "0.02em",
  },
  version: {
    color: "#334155",
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: "0.05em",
  },
  topRight: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  timerPill: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20,
    padding: "4px 10px",
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: "tabular-nums",
    letterSpacing: "0.05em",
  },
  timerDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#4ade80",
    boxShadow: "0 0 6px #4ade80",
    animation: "pulse 1.5s ease-in-out infinite",
  },
  userPill: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20,
    padding: "4px 10px 4px 4px",
  },
  userAvatar: {
    width: 24,
    height: 24,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.1)",
    color: "#e2e8f0",
    fontSize: 11,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: 500,
  },
  main: {
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
  },
  bottomNav: {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    padding: "8px 0 20px",
    borderTop: "1px solid rgba(255,255,255,0.05)",
    background: "#0a0a0f",
    flexShrink: 0,
    zIndex: 10,
  },
  navBtn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "6px 20px",
    position: "relative",
    minWidth: 60,
  },
  navBtnActive: {},
  navLabel: {
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: "0.03em",
  },
  navActiveDot: {
    position: "absolute",
    bottom: -2,
    width: 4,
    height: 4,
    borderRadius: "50%",
    background: "#e2e8f0",
  },
};