import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";

export default function HistoryScreen() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("cube_history") || "[]");
      setHistory(saved);
    } catch {
      setHistory([]);
    }
  }, []);

  const formatTime = (s) => {
    const m   = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", {
      day:   "2-digit",
      month: "short",
      year:  "numeric",
    });
  };

  const formatDateShort = (iso) => {
    const d    = new Date(iso);
    const now  = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60)                return "Just now";
    if (diff < 3600)              return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400)             return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 86400 * 2)         return "Yesterday";
    return formatDate(iso);
  };

  const getRating = (moves) => {
    if (moves <= 20) return { label: "Optimal",   color: "#fbbf24" };
    if (moves <= 30) return { label: "Excellent",  color: "#4ade80" };
    if (moves <= 40) return { label: "Good",       color: "#60a5fa" };
    return               { label: "Completed",  color: "#475569" };
  };

  const getBest = () => {
    if (history.length === 0) return null;
    return history.reduce((best, h) => h.time < best.time ? h : best, history[0]);
  };

  const clearHistory = () => {
    localStorage.removeItem("cube_history");
    setHistory([]);
  };

  const best = getBest();

  // ── Empty state ──────────────────────────────────────────

  if (history.length === 0) {
    return (
      <div style={s.root}>
        <div style={s.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Logo size={24} />
            <span style={s.stepTag}>History</span>
          </div>
        </div>
        <div style={s.emptyState}>
          <div style={s.emptyIcon}>
            <ClockIcon />
          </div>
          <h3 style={s.emptyTitle}>No solves yet</h3>
          <p style={s.emptyDesc}>
            Complete your first solve to see your history here.
          </p>
          <button style={s.primaryBtn} onClick={() => navigate("/")}>
            Start solving
          </button>
        </div>
      </div>
    );
  }

  // ── Main ─────────────────────────────────────────────────

  return (
    <div style={s.root}>
      {/* Header */}
      <div style={s.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Logo size={24} />
          <span style={s.stepTag}>History</span>
        </div>
        <button style={s.clearBtn} onClick={clearHistory}>
          Clear all
        </button>
      </div>

      <h2 style={s.title}>Your solves</h2>

      {/* Best solve card */}
      {best && (
        <div style={s.bestCard}>
          <div style={s.bestLeft}>
            <TrophyIcon />
            <div style={s.bestText}>
              <span style={s.bestLabel}>Personal best</span>
              <span style={s.bestValue}>{formatTime(best.time)}</span>
            </div>
          </div>
          <div style={s.bestRight}>
            <span style={s.bestMoves}>{best.moves}</span>
            <span style={s.bestMovesLabel}>moves</span>
          </div>
        </div>
      )}

      {/* Summary row */}
      <div style={s.summaryRow}>
        <div style={s.summaryCard}>
          <span style={s.summaryValue}>{history.length}</span>
          <span style={s.summaryLabel}>Total solves</span>
        </div>
        <div style={s.summaryCard}>
          <span style={s.summaryValue}>
            {formatTime(
              Math.round(
                history.reduce((sum, h) => sum + h.time, 0) / history.length
              )
            )}
          </span>
          <span style={s.summaryLabel}>Avg time</span>
        </div>
        <div style={s.summaryCard}>
          <span style={s.summaryValue}>
            {Math.round(
              history.reduce((sum, h) => sum + h.moves, 0) / history.length
            )}
          </span>
          <span style={s.summaryLabel}>Avg moves</span>
        </div>
      </div>

      {/* Divider */}
      <div style={s.divider} />

      {/* Solve list */}
      <div style={s.list}>
        {history.map((item, i) => {
          const rating = getRating(item.moves);
          const isBest = best && item.id === best.id;
          return (
            <div key={item.id} style={{
              ...s.listItem,
              ...(isBest ? s.listItemBest : {}),
            }}>
              {/* Index */}
              <span style={s.listIndex}>#{history.length - i}</span>

              {/* Info */}
              <div style={s.listInfo}>
                <div style={s.listInfoTop}>
                  <span style={s.listTime}>{formatTime(item.time)}</span>
                  {isBest && <span style={s.bestTag}>PB</span>}
                </div>
                <span style={s.listDate}>{formatDateShort(item.date)}</span>
              </div>

              {/* Right */}
              <div style={s.listRight}>
                <span style={s.listMoves}>{item.moves} moves</span>
                <span style={{
                  ...s.listRating,
                  color: rating.color,
                  background: `${rating.color}15`,
                }}>
                  {rating.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Icons ──────────────────────────────────────────────────

function ClockIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
      stroke="#1e293b" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="#fbbf24" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      <polyline points="8 21 12 17 16 21" />
      <path d="M7 4H17V11C17 13.76 14.76 16 12 16C9.24 16 7 13.76 7 11V4Z" />
      <path d="M7 8H4C4 8 3 13 7 13" />
      <path d="M17 8H20C20 8 21 13 17 13" />
    </svg>
  );
}

// ── Styles ─────────────────────────────────────────────────

const s = {
  root: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100%",
    padding: "16px 20px 32px",
    gap: 14,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stepTag: {
    color: "#334155",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  clearBtn: {
    background: "none",
    border: "none",
    color: "#334155",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    padding: "4px 8px",
  },
  title: {
    color: "#e2e8f0",
    fontSize: 24,
    fontWeight: 800,
    letterSpacing: "-0.02em",
    margin: 0,
  },
  bestCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "rgba(251,191,36,0.06)",
    border: "1px solid rgba(251,191,36,0.15)",
    borderRadius: 14,
    padding: "14px 16px",
  },
  bestLeft: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  bestText: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  bestLabel: {
    color: "#92400e",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  bestValue: {
    color: "#fbbf24",
    fontSize: 22,
    fontWeight: 800,
    letterSpacing: "-0.02em",
    fontVariantNumeric: "tabular-nums",
  },
  bestRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 2,
  },
  bestMoves: {
    color: "#fbbf24",
    fontSize: 18,
    fontWeight: 700,
  },
  bestMovesLabel: {
    color: "#92400e",
    fontSize: 11,
    fontWeight: 500,
  },
  summaryRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 8,
  },
  summaryCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 12,
    padding: "12px 8px",
  },
  summaryValue: {
    color: "#e2e8f0",
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: "-0.01em",
    fontVariantNumeric: "tabular-nums",
  },
  summaryLabel: {
    color: "#334155",
    fontSize: 10,
    fontWeight: 500,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    textAlign: "center",
  },
  divider: {
    height: 1,
    background: "rgba(255,255,255,0.04)",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  listItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: "12px 14px",
  },
  listItemBest: {
    background: "rgba(251,191,36,0.04)",
    border: "1px solid rgba(251,191,36,0.1)",
  },
  listIndex: {
    color: "#1e293b",
    fontSize: 11,
    fontWeight: 600,
    minWidth: 24,
    fontVariantNumeric: "tabular-nums",
  },
  listInfo: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
    flex: 1,
  },
  listInfoTop: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  listTime: {
    color: "#e2e8f0",
    fontSize: 16,
    fontWeight: 700,
    fontVariantNumeric: "tabular-nums",
    letterSpacing: "-0.01em",
  },
  bestTag: {
    background: "rgba(251,191,36,0.15)",
    color: "#fbbf24",
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: "0.06em",
    padding: "2px 6px",
    borderRadius: 4,
  },
  listDate: {
    color: "#334155",
    fontSize: 11,
    fontWeight: 400,
  },
  listRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 4,
  },
  listMoves: {
    color: "#475569",
    fontSize: 12,
    fontWeight: 500,
    fontVariantNumeric: "tabular-nums",
  },
  listRating: {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.04em",
    padding: "2px 8px",
    borderRadius: 20,
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    gap: 12,
    paddingBottom: 60,
    textAlign: "center",
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    color: "#e2e8f0",
    fontSize: 18,
    fontWeight: 700,
    margin: 0,
  },
  emptyDesc: {
    color: "#334155",
    fontSize: 13,
    fontWeight: 400,
    lineHeight: 1.6,
    maxWidth: 220,
    margin: 0,
  },
  primaryBtn: {
    marginTop: 8,
    padding: "12px 28px",
    borderRadius: 12,
    background: "#e2e8f0",
    border: "none",
    color: "#0a0a0f",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  },
};