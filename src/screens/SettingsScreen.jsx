import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SettingsScreen() {
  const navigate  = useNavigate();
  const [username, setUsername]   = useState("");
  const [saved, setSaved]         = useState(false);
  const [error, setError]         = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("axis_username") || "Solver";
    setUsername(stored);
  }, []);

  const handleSave = () => {
    const trimmed = username.trim();
    if (!trimmed) {
      setError("Username cannot be empty.");
      return;
    }
    if (trimmed.length > 20) {
      setError("Username must be 20 characters or less.");
      return;
    }
    localStorage.setItem("axis_username", trimmed);
    window.dispatchEvent(new Event("axis_username_changed"));
    setError("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChange = (e) => {
    setUsername(e.target.value);
    setSaved(false);
    setError("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSave();
  };

  return (
    <div style={s.root}>
      {/* Header */}
      <div style={s.header}>
        <span style={s.stepTag}>Settings</span>
      </div>

      <h2 style={s.title}>Preferences</h2>

      {/* Profile section */}
      <div style={s.section}>
        <span style={s.sectionLabel}>Profile</span>

        <div style={s.card}>
          {/* Avatar preview */}
          <div style={s.avatarRow}>
            <div style={s.avatar}>
              {username.trim()
                ? username.trim()[0].toUpperCase()
                : "S"}
            </div>
            <div style={s.avatarInfo}>
              <span style={s.avatarName}>
                {username.trim() || "Solver"}
              </span>
              <span style={s.avatarSub}>Cube Solve user</span>
            </div>
          </div>

          <div style={s.divider} />

          {/* Username input */}
          <div style={s.fieldWrapper}>
            <label style={s.fieldLabel}>Username</label>
            <div style={s.inputRow}>
              <input
                style={{
                  ...s.input,
                  ...(error ? s.inputError : {}),
                  ...(saved ? s.inputSaved : {}),
                }}
                value={username}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                maxLength={20}
                placeholder="Enter username"
                spellCheck={false}
                autoComplete="off"
              />
              <span style={s.charCount}>
                {username.length}/20
              </span>
            </div>
            {error && (
              <span style={s.errorText}>{error}</span>
            )}
            {saved && (
              <span style={s.savedText}>✓ Saved</span>
            )}
          </div>

          <button
            style={{
              ...s.saveBtn,
              opacity: saved ? 0.5 : 1,
            }}
            onClick={handleSave}
          >
            {saved ? "Saved ✓" : "Save username"}
          </button>
        </div>
      </div>

      {/* App info section */}
      <div style={s.section}>
        <span style={s.sectionLabel}>About</span>
        <div style={s.card}>
          <div style={s.infoRow}>
            <span style={s.infoKey}>App</span>
            <span style={s.infoVal}>Cube Solve</span>
          </div>
          <div style={s.thinDivider} />
          <div style={s.infoRow}>
            <span style={s.infoKey}>Version</span>
            <span style={s.infoVal}>1.0.0</span>
          </div>
          <div style={s.thinDivider} />
          <div style={s.infoRow}>
            <span style={s.infoKey}>Author</span>
            <span style={s.infoVal}>Farhan Bin Hossain</span>
          </div>
          <div style={s.thinDivider} />
          <div style={s.infoRow}>
            <span style={s.infoKey}>Algorithm</span>
            <span style={s.infoVal}>Kociemba (Two-phase)</span>
          </div>
        </div>
      </div>

      {/* Data section */}
      <div style={s.section}>
        <span style={s.sectionLabel}>Data</span>
        <div style={s.card}>
          <div style={s.infoRow}>
            <span style={s.infoKey}>Solve history</span>
            <span style={s.infoVal}>
              {JSON.parse(localStorage.getItem("cube_history") || "[]").length} solves
            </span>
          </div>
          <div style={s.thinDivider} />
          <button
            style={s.dangerBtn}
            onClick={() => {
              localStorage.removeItem("cube_history");
              navigate("/history");
            }}
          >
            Clear solve history
          </button>
        </div>
      </div>

      {/* Footer */}
      <span style={s.footer}>
        Cube Solve · Farhan Bin Hossain · v1.0.0
      </span>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────

const s = {
  root: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100%",
    padding: "16px 20px 40px",
    gap: 20,
  },
  header: {
    display: "flex",
    alignItems: "center",
  },
  stepTag: {
    color: "#334155",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  title: {
    color: "#e2e8f0",
    fontSize: 24,
    fontWeight: 800,
    letterSpacing: "-0.02em",
    margin: 0,
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  sectionLabel: {
    color: "#334155",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    paddingLeft: 2,
  },
  card: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 14,
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  avatarRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#e2e8f0",
    fontSize: 18,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarInfo: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  avatarName: {
    color: "#e2e8f0",
    fontSize: 15,
    fontWeight: 700,
  },
  avatarSub: {
    color: "#334155",
    fontSize: 12,
    fontWeight: 400,
  },
  divider: {
    height: 1,
    background: "rgba(255,255,255,0.05)",
    margin: "0 -16px",
  },
  thinDivider: {
    height: 1,
    background: "rgba(255,255,255,0.04)",
  },
  fieldWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  fieldLabel: {
    color: "#475569",
    fontSize: 12,
    fontWeight: 500,
    letterSpacing: "0.04em",
  },
  inputRow: {
    position: "relative",
  },
  input: {
    width: "100%",
    padding: "11px 44px 11px 12px",
    borderRadius: 10,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#e2e8f0",
    fontSize: 14,
    fontWeight: 500,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    transition: "border-color 0.2s",
  },
  inputError: {
    borderColor: "rgba(248,113,113,0.4)",
  },
  inputSaved: {
    borderColor: "rgba(74,222,128,0.3)",
  },
  charCount: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: "translateY(-50%)",
    color: "#1e293b",
    fontSize: 11,
    fontWeight: 500,
    pointerEvents: "none",
  },
  errorText: {
    color: "#f87171",
    fontSize: 12,
    fontWeight: 500,
  },
  savedText: {
    color: "#4ade80",
    fontSize: 12,
    fontWeight: 500,
  },
  saveBtn: {
    padding: "12px",
    borderRadius: 10,
    background: "#e2e8f0",
    border: "none",
    color: "#0a0a0f",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    transition: "opacity 0.2s",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoKey: {
    color: "#475569",
    fontSize: 13,
    fontWeight: 400,
  },
  infoVal: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: 500,
  },
  dangerBtn: {
    padding: "10px",
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
    color: "#1e293b",
    fontSize: 11,
    fontWeight: 400,
    letterSpacing: "0.04em",
    textAlign: "center",
    marginTop: "auto",
  },
};