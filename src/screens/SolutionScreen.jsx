import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MoveDiagram from "../components/MoveDiagram";
import { solveCube } from "../utils/cubeSolver";

// Plain English instructions for non-cubers
const MOVE_PLAIN = {
  "U":  { action: "Turn the TOP layer",    dir: "to the LEFT  ←",   times: 1 },
  "U'": { action: "Turn the TOP layer",    dir: "to the RIGHT  →",  times: 1 },
  "U2": { action: "Turn the TOP layer",    dir: "HALFWAY (×2)",      times: 2 },
  "D":  { action: "Turn the BOTTOM layer", dir: "to the RIGHT  →",  times: 1 },
  "D'": { action: "Turn the BOTTOM layer", dir: "to the LEFT  ←",   times: 1 },
  "D2": { action: "Turn the BOTTOM layer", dir: "HALFWAY (×2)",      times: 2 },
  "R":  { action: "Turn the RIGHT column",   dir: "UPWARD  ↑",         times: 1 },
  "R'": { action: "Turn the RIGHT column",   dir: "DOWNWARD  ↓",       times: 1 },
  "R2": { action: "Turn the RIGHT column",   dir: "HALFWAY (×2)",      times: 2 },
  "L":  { action: "Turn the LEFT column",    dir: "DOWNWARD  ↓",       times: 1 },
  "L'": { action: "Turn the LEFT column",    dir: "UPWARD  ↑",         times: 1 },
  "L2": { action: "Turn the LEFT column",    dir: "HALFWAY (×2)",      times: 2 },
  "F":  { action: "Turn the FRONT face",     dir: "CLOCKWISE  ↻",      times: 1 },
  "F'": { action: "Turn the FRONT face",     dir: "COUNTER-CLOCKWISE ↺", times: 1 },
  "F2": { action: "Turn the FRONT face",     dir: "HALFWAY (×2)",      times: 2 },
  "B":  { action: "Turn the BACK face",      dir: "CLOCKWISE  ↻",      times: 1 },
  "B'": { action: "Turn the BACK face",      dir: "COUNTER-CLOCKWISE ↺", times: 1 },
  "B2": { action: "Turn the BACK face",      dir: "HALFWAY (×2)",      times: 2 },
};

const MOVE_HOLD = {
  U: "White face on top · Any colour facing you",
  D: "Yellow face on top · Any colour facing you",
  R: "Hold normally · Right side is the Red face",
  L: "Hold normally · Left side is the Orange face",
  F: "Green face directly facing you · White on top",
  B: "Blue face pointing AWAY from you · White on top",
};

// Mini cube orientation diagram — shows which face to look at
function OrientationHint({ move }) {
  const face = move?.[0];
  const faceColors = { U:"#f0f0eb", D:"#ffd700", R:"#d22828", L:"#ff6420", F:"#1e7a3c", B:"#1e50b4" };
  const faceNames  = { U:"TOP", D:"BOTTOM", R:"RIGHT", L:"LEFT", F:"FRONT", B:"BACK" };
  const color = faceColors[face] || "#64748b";
  const name  = faceNames[face]  || "";

  return (
    <div style={s.orientHint}>
      <div style={{ ...s.orientDot, background: color }} />
      <span style={s.orientText}>
        Moving the <span style={{ color, fontWeight: 700 }}>{name}</span> layer/face
      </span>
    </div>
  );
}

export default function SolutionScreen() {
  const navigate = useNavigate();

  const [solution,         setSolution]         = useState([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [loading,          setLoading]           = useState(true);
  const [solveError,       setSolveError]        = useState(null);
  const [done,             setDone]              = useState(false);

  const location = useLocation();

  useEffect(() => {
    (async () => {
      setLoading(true);
      setSolveError(null);
      try {
        const cubeStr = location.state?.cubeStr || sessionStorage.getItem("cube_string");
        let moves = null;
        if (cubeStr) {
          moves = await solveCube(cubeStr);
        } else {
          const saved = JSON.parse(sessionStorage.getItem("cube_colors") || "null");
          if (!saved) { setSolveError("No cube data found. Please scan your cube first."); setLoading(false); return; }
          moves = await solveCube(saved);
        }

        if (moves === null)     setSolveError("Could not solve — check your colours.");
        else if (moves.length === 0) navigate("/success", { state: { moves: 0, time: 0 } });
        else { setSolution(moves); setCurrentMoveIndex(0); }
      } catch { setSolveError("Unexpected error. Please try again."); }
      setLoading(false);
    })();
  }, [navigate, location]);

  const currentMove = solution[currentMoveIndex];
  const plain       = MOVE_PLAIN[currentMove] || {};
  const isLastMove  = currentMoveIndex === solution.length - 1;
  const progress    = solution.length ? ((currentMoveIndex + 1) / solution.length) * 100 : 0;

  const handleNext = () => {
    if (isLastMove) {
      const elapsed  = window.axisTimer?.getElapsed() || 0;
      const history  = JSON.parse(localStorage.getItem("cube_history") || "[]");
      history.unshift({ id: Date.now(), date: new Date().toISOString(), moves: solution.length, time: elapsed });
      localStorage.setItem("cube_history", JSON.stringify(history.slice(0, 50)));
      navigate("/success", { state: { moves: solution.length, time: elapsed } });
    } else {
      setCurrentMoveIndex(p => p + 1);
    }
  };

  const handlePrev = () => { if (currentMoveIndex > 0) setCurrentMoveIndex(p => p - 1); };

  const handleWatch3D = () => {
    const saved = JSON.parse(sessionStorage.getItem("cube_colors") || "null");
    navigate("/cube3d", { state: { faceColors: saved } });
  };

  // ── Loading ───────────────────────────────────────────────
  if (loading) return (
    <div style={s.centred}>
      <div style={s.spinner} />
      <p style={s.loadingText}>Finding the shortest solution…</p>
    </div>
  );

  // ── Error ─────────────────────────────────────────────────
  if (solveError) return (
    <div style={s.centred}>
      <div style={s.errorIcon}>⚠️</div>
      <p style={s.errorText}>{solveError}</p>
      <button style={s.primaryBtn} onClick={() => navigate("/review")}>← Back to Review</button>
    </div>
  );

  // ── Main ──────────────────────────────────────────────────
  return (
    <div style={s.root}>

      {/* ── Top bar ── */}
      <div style={s.topBar}>
        <button style={s.backBtn} onClick={() => navigate("/review")}>← Review</button>
        <span style={s.stepCounter}>{currentMoveIndex + 1} / {solution.length}</span>
        <button style={s.watchBtn} onClick={handleWatch3D}>3D ▶</button>
      </div>

      {/* ── Progress bar ── */}
      <div style={s.progressTrack}>
        <div style={{ ...s.progressFill, width: `${progress}%` }} />
      </div>

      {/* ── Move label ── */}
      <p style={s.moveLabel}>Move {currentMoveIndex + 1} of {solution.length}</p>

      {/* ── Main instruction card ── */}
      <div style={s.card}>

        {/* Notation badge */}
        <div style={s.notationBadge}>{currentMove}</div>

        {/* Big plain-English action — single clean line */}
        <div style={s.actionBlock}>
          <span style={s.actionText}>{plain.action}</span>
          <span style={s.dirText}>{plain.dir}</span>
        </div>

        {/* Diagram — the visual tells everything */}
        <div style={s.diagramWrap}>
          <MoveDiagram move={currentMove} size="lg" />
        </div>

        {/* How to hold */}
        <div style={s.holdBox}>
          <span style={s.holdLabel}>📐 How to hold</span>
          <span style={s.holdText}>{MOVE_HOLD[currentMove?.[0]] || ""}</span>
        </div>
      </div>
      {/* ── Upcoming moves strip ── */}
      <div style={s.upcomingWrap}>
        <span style={s.upcomingLabel}>Upcoming</span>
        <div style={s.strip}>
          {solution.slice(currentMoveIndex + 1, currentMoveIndex + 6).map((m, i) => (
            <div key={i} style={{ ...s.stripBadge, opacity: 1 - i * 0.18 }}>{m}</div>
          ))}
          {currentMoveIndex + 1 >= solution.length && (
            <span style={s.doneTag}>🎉 Last move!</span>
          )}
        </div>
      </div>

      {/* ── Nav buttons ── */}
      <div style={s.navRow}>
        <button
          style={{ ...s.navBtn, ...s.prevBtn, opacity: currentMoveIndex === 0 ? 0.3 : 1 }}
          onClick={handlePrev}
          disabled={currentMoveIndex === 0}
        >
          ← Prev
        </button>
        <button style={{ ...s.navBtn, ...s.nextBtn }} onClick={handleNext}>
          {isLastMove ? "Finish ✓" : "Next →"}
        </button>
      </div>

      {/* Spacer for bottom nav */}
      <div style={{ height: 80 }} />
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = {
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",             // was minHeight
    padding: "10px 16px 12px",  // tighter
    gap: 8,                     // was 14
    overflow: "hidden",         // no scroll
  },
  centred: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    gap: 20,
    padding: 32,
  },
  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexShrink: 0,
  },
  backBtn: {
    background: "none",
    border: "none",
    color: "#64748b",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    padding: 0,
  },
  stepCounter: {
    color: "#e2e8f0",
    fontSize: 14,
    fontWeight: 700,
  },
  watchBtn: {
    background: "rgba(139,92,246,0.15)",
    border: "1px solid rgba(139,92,246,0.3)",
    color: "#a78bfa",
    fontSize: 12,
    fontWeight: 700,
    borderRadius: 8,
    padding: "5px 12px",
    cursor: "pointer",
  },
  progressTrack: {
    height: 3,                  // was 4
    background: "rgba(255,255,255,0.06)",
    borderRadius: 4,
    overflow: "hidden",
    flexShrink: 0,
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #4ade80, #22d3ee)",
    borderRadius: 4,
    transition: "width 0.35s ease",
  },
  moveLabel: {
    color: "#475569",
    fontSize: 10,               // was 11
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    margin: 0,
    flexShrink: 0,
  },
  card: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,                    // was 16
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20,           // was 24
    padding: "14px 16px",       // was 24px 20px
    flexShrink: 0,
  },
  notationBadge: {
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 10,
    padding: "4px 18px",        // was 6px 20px
    color: "#e2e8f0",
    fontSize: 24,               // was 28
    fontWeight: 900,
    letterSpacing: "0.04em",
  },
  actionBlock: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,                     // was 4
    textAlign: "center",
  },
  actionText: {
    color: "#94a3b8",
    fontSize: 13,               // was 15
    fontWeight: 600,
  },
  dirText: {
    color: "#e2e8f0",
    fontSize: 17,               // was 20
    fontWeight: 800,
    letterSpacing: "-0.01em",
  },
  timesNote: {
    marginTop: 2,
    color: "#fbbf24",
    fontSize: 11,
    fontWeight: 600,
    background: "rgba(251,191,36,0.1)",
    border: "1px solid rgba(251,191,36,0.2)",
    borderRadius: 8,
    padding: "2px 10px",
  },
  orientHint: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 10,
    padding: "6px 12px",
    alignSelf: "stretch",
  },
  orientDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    flexShrink: 0,
  },
  orientText: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: 500,
  },
  diagramWrap: {
    padding: "2px 0",           // was 8px
  },
  holdBox: {
    display: "flex",
    flexDirection: "column",
    gap: 3,                     // was 5
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 10,
    padding: "8px 12px",        // was 10px 14px
    alignSelf: "stretch",
  },
  holdLabel: {
    color: "#334155",
    fontSize: 9,                // was 10
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  holdText: {
    color: "#64748b",
    fontSize: 12,               // was 13
    fontWeight: 500,
    lineHeight: 1.4,
  },
  upcomingWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 6,                     // was 8
    flexShrink: 0,
  },
  upcomingLabel: {
    color: "#1e293b",
    fontSize: 9,                // was 10
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  strip: {
    display: "flex",
    gap: 5,
    alignItems: "center",
  },
  stripBadge: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 7,
    padding: "4px 10px",        // was 5px 12px
    color: "#475569",
    fontSize: 12,               // was 13
    fontWeight: 700,
  },
  doneTag: {
    color: "#4ade80",
    fontSize: 12,
    fontWeight: 600,
  },
  navRow: {
    display: "flex",
    gap: 10,                    // was 12
    flexShrink: 0,
    marginTop: "auto",          // pushes to bottom
  },
  navBtn: {
    padding: "13px",            // was 15px
    borderRadius: 14,
    border: "none",
    fontSize: 14,               // was 15
    fontWeight: 700,
    cursor: "pointer",
    transition: "opacity 0.2s",
  },
  prevBtn: {
    flex: 1,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#94a3b8",
  },
  nextBtn: {
    flex: 2,
    background: "#e2e8f0",
    color: "#0a0a0f",
  },
  spinner: {
    width: 44,
    height: 44,
    border: "3px solid rgba(255,255,255,0.08)",
    borderTop: "3px solid #4ade80",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: { color: "#64748b", fontSize: 14 },
  errorIcon:   { fontSize: 44 },
  errorText:   { color: "#f87171", fontSize: 14, textAlign: "center" },
  primaryBtn: {
    padding: "14px 28px",
    borderRadius: 14,
    background: "#e2e8f0",
    border: "none",
    color: "#0a0a0f",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
  },
};