import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Cube3D from "../components/Cube3D";
import { createStateTracker, buildSolved } from "../utils/cubeState";
import { solveCube } from "../utils/cubeSolver";

const ALL_MOVES = ["U","U'","U2","D","D'","D2","R","R'","R2","L","L'","L2","F","F'","F2","B","B'","B2"];

const MOVE_GROUPS = [
  { label:"U", moves:["U","U'","U2"] },
  { label:"D", moves:["D","D'","D2"] },
  { label:"R", moves:["R","R'","R2"] },
  { label:"L", moves:["L","L'","L2"] },
  { label:"F", moves:["F","F'","F2"] },
  { label:"B", moves:["B","B'","B2"] },
];

const FACE_COLOR = {
  U:"#f0f0eb", D:"#ffd700", R:"#d22828",
  L:"#ff6420", F:"#1e7a3c", B:"#1e50b4",
};

// ── Toast ──────────────────────────────────────────────────
function Toast({ toasts }) {
  return (
    <div style={ts.container}>
      {toasts.map(t => (
        <div key={t.id} style={{
          ...ts.toast,
          ...(t.type==="error" ? ts.error : t.type==="success" ? ts.success : ts.info)
        }}>
          <span style={ts.icon}>{t.type==="error"?"✕":t.type==="success"?"✓":"ℹ"}</span>
          {t.message}
        </div>
      ))}
    </div>
  );
}

const ts = {
  container: { position:"fixed", top:60, left:"50%", transform:"translateX(-50%)", display:"flex", flexDirection:"column", gap:8, zIndex:999, pointerEvents:"none", width:"calc(100% - 40px)", maxWidth:440 },
  toast: { display:"flex", alignItems:"center", gap:10, padding:"12px 16px", borderRadius:12, fontSize:13, fontWeight:600, backdropFilter:"blur(12px)", boxShadow:"0 4px 24px rgba(0,0,0,0.4)" },
  success: { background:"rgba(74,222,128,0.15)", border:"1px solid rgba(74,222,128,0.3)", color:"#4ade80" },
  error: { background:"rgba(248,113,113,0.15)", border:"1px solid rgba(248,113,113,0.3)", color:"#f87171" },
  info: { background:"rgba(148,163,184,0.12)", border:"1px solid rgba(148,163,184,0.2)", color:"#94a3b8" },
  icon: { fontSize:14, fontWeight:800, flexShrink:0 },
};

// ── Main ───────────────────────────────────────────────────
export default function Cube3Dscreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const cubeRef = useRef(null);
  const solveTimerRef = useRef(null);
  const trackerRef = useRef(null);

  const [ready, setReady]                     = useState(false);
  const [cubeKey, setCubeKey]                 = useState(0);
  const [scrambledColors, setScrambledColors] = useState(() => location.state?.faceColors || buildSolved());
  const [moveHistory, setMoveHistory]         = useState([]);
  const [isAutoSolving, setIsAutoSolving]     = useState(false);
  const [solutionMoves, setSolutionMoves]     = useState([]);
  const [currentSolveIdx, setCurrentSolveIdx] = useState(0);
  const [currentMove, setCurrentMove]         = useState("");
  const [toasts, setToasts]                   = useState([]);
  const [showNotations, setShowNotations]     = useState(false); // hidden by default

  const showToast = useCallback((message, type = "info", duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  // ── Init tracker ──────────────────────────────────────────
  useEffect(() => {
    createStateTracker().then(t => {
      trackerRef.current = t;
      const incoming = location.state?.faceColors;
      if (incoming) {
        const loaded = t.loadFromFaceColors(incoming);
        if (!loaded) showToast("Couldn't load scanned cube state", "error");
      }
      setReady(true);
    });
    return () => { if (solveTimerRef.current) clearTimeout(solveTimerRef.current); };
  }, []);

  // ── Apply single move ─────────────────────────────────────
  const applyMove = useCallback((move) => {
    console.log("SCREEN applyMove:", move);
    if (!trackerRef.current) return;
    cubeRef.current?.applyMove(move);
    trackerRef.current.applyMove(move);
    setMoveHistory(h => [...h, move]);
  }, []);

  // ── Scramble ──────────────────────────────────────────────
  const handleScramble = useCallback(() => {
    if (!trackerRef.current || isAutoSolving) return;
    const scramble = [];
    let last = "";
    for (let i = 0; i < 20; i++) {
      let m;
      do { m = ALL_MOVES[Math.floor(Math.random() * ALL_MOVES.length)]; }
      while (m[0] === last);
      last = m[0];
      scramble.push(m);
    }
    trackerRef.current.reset();
    scramble.forEach(m => trackerRef.current.applyMove(m));
    const scrambledState = trackerRef.current.getCurrentState();
    setScrambledColors(scrambledState);
    setCubeKey(k => k + 1);
    setMoveHistory(scramble);
    showToast(`Scrambled — ${scramble.length} moves`, "info");
  }, [isAutoSolving, showToast]);

  // ── Reset ─────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    if (solveTimerRef.current) clearTimeout(solveTimerRef.current);
    if (!trackerRef.current) return;
    setIsAutoSolving(false);
    setSolutionMoves([]);
    setCurrentMove("");
    setMoveHistory([]);
    trackerRef.current.reset();
    setScrambledColors(buildSolved());
    setCubeKey(k => k + 1);
    showToast("Reset to solved", "info");
  }, [showToast]);

  // ── Auto solve ────────────────────────────────────────────
  const executeNextMove = useCallback((moves, index) => {
    if (index >= moves.length) {
      setIsAutoSolving(false);
      setSolutionMoves([]);
      setCurrentMove("");
      trackerRef.current?.reset();
      showToast("Cube solved! 🎉", "success", 4000);
      return;
    }
    cubeRef.current?.applyMove(moves[index]);
    trackerRef.current?.applyMove(moves[index]);
    setCurrentSolveIdx(index);
    setCurrentMove(moves[index]);
    solveTimerRef.current = setTimeout(() => executeNextMove(moves, index + 1), 420);
  }, [showToast]);

  const autoSolve = useCallback(async () => {
    if (!trackerRef.current || isAutoSolving) return;
    setIsAutoSolving(true);
    setCurrentMove("");
    setSolutionMoves([]);
    try {
      const trackerState = trackerRef.current.getCurrentState();
      const savedColors  = JSON.parse(sessionStorage.getItem("cube_colors") || "null");
      const state = moveHistory.length === 0 && savedColors ? savedColors : trackerState;
      const moves = await solveCube(state);
      if (moves === null) { setIsAutoSolving(false); showToast("Invalid cube state", "error"); return; }
      if (moves.length === 0) { setIsAutoSolving(false); showToast("Already solved!", "success"); return; }
      showToast(`Solution: ${moves.length} moves`, "info");
      setSolutionMoves(moves);
      executeNextMove(moves, 0);
    } catch (err) {
      console.error(err);
      setIsAutoSolving(false);
      showToast("Solver error", "error");
    }
  }, [isAutoSolving, moveHistory.length, executeNextMove, showToast]);

  // ── Loading ───────────────────────────────────────────────
  if (!ready) {
    return (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100%", flexDirection:"column", gap:12 }}>
        <div style={{ width:36, height:36, border:"3px solid rgba(255,255,255,0.06)", borderTop:"3px solid #e2e8f0", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
        <span style={{ color:"#475569", fontSize:13 }}>Loading cube...</span>
      </div>
    );
  }

  const solveProgress = solutionMoves.length > 0
    ? Math.round((currentSolveIdx / solutionMoves.length) * 100)
    : 0;

  // ── Render ────────────────────────────────────────────────
  return (
    <div style={s.root}>
      <Toast toasts={toasts} />

      {/* ── Header ── */}
      <div style={s.header}>
        <div style={s.headerTop}>
          <div style={s.headerLeft}>
            <span style={s.title}>3D Cube</span>
            {moveHistory.length > 0 && (
              <span style={s.movePill}>{moveHistory.length} moves</span>
            )}
          </div>
          <div style={s.headerBtns}>
            <button
              style={{ ...s.iconBtn, background: showNotations ? "rgba(102,126,234,0.2)" : "rgba(255,255,255,0.06)", borderColor: showNotations ? "rgba(102,126,234,0.4)" : "rgba(255,255,255,0.1)", color: showNotations ? "#a5b4fc" : "#64748b" }}
              onClick={() => setShowNotations(n => !n)}
              title="Toggle move notation buttons"
            >
              {showNotations ? "𝄜" : "𝄜"}
              <span style={{ fontSize:10, marginLeft:3 }}>{showNotations ? "Hide" : "Moves"}</span>
            </button>
            <button style={s.iconBtn} onClick={handleScramble} disabled={isAutoSolving} title="Scramble">
              🔀 <span style={{ fontSize:10, marginLeft:2 }}>Scramble</span>
            </button>
            <button style={s.iconBtn} onClick={handleReset} title="Reset">
              ↺ <span style={{ fontSize:10, marginLeft:2 }}>Reset</span>
            </button>
          </div>
        </div>
        <span style={s.subtitle}>Drag to rotate · pinch to zoom</span>
      </div>

      {/* ── Canvas ── */}
      <div style={s.canvasWrapper}>
        <Cube3D key={cubeKey} ref={cubeRef} faceColors={scrambledColors} />
        {/* Overlay hint — fades after solve starts */}
        {moveHistory.length === 0 && !isAutoSolving && (
          <div style={s.canvasHint}>
            <span style={s.hintText}>👆 Drag to rotate</span>
          </div>
        )}
      </div>

      {/* ── Move history strip ── */}
      {moveHistory.length > 0 && (
        <div style={s.historyStrip}>
          <span style={s.historyLabel}>History</span>
          <div style={s.historyScroll}>
            {moveHistory.slice(-18).map((m, i) => (
              <span key={i} style={s.historyBadge}>{m}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── Solution progress bar ── */}
      {solutionMoves.length > 0 && (
        <div style={s.solutionBar}>
          <div style={s.solutionHeader}>
            <span style={s.solutionLabel}>Solving… {currentMove}</span>
            <span style={s.solutionCount}>{currentSolveIdx}/{solutionMoves.length}</span>
          </div>
          <div style={s.progressTrack}>
            <div style={{ ...s.progressFill, width: `${solveProgress}%` }} />
          </div>
          <div style={s.solutionMoves}>
            {solutionMoves.map((m, i) => (
              <span key={i} style={{
                ...s.solutionBadge,
                background: i === currentSolveIdx ? "#667eea" : i < currentSolveIdx ? "rgba(74,222,128,0.12)" : "rgba(255,255,255,0.04)",
                color: i === currentSolveIdx ? "#fff" : i < currentSolveIdx ? "#4ade80" : "#475569",
                transform: i === currentSolveIdx ? "scale(1.1)" : "scale(1)",
              }}>{m}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── Notation panel (collapsible) ── */}
      {showNotations && (
        <div style={s.notationPanel}>
          <div style={s.notationGrid}>
            {MOVE_GROUPS.map(({ label, moves }) => (
              <div key={label} style={s.moveGroup}>
                <span style={{ ...s.moveGroupLabel, color: FACE_COLOR[label] }}>{label}</span>
                {moves.map(m => (
                  <button
                    key={m}
                    style={s.moveBtn}
                    onClick={() => applyMove(m)}
                    disabled={isAutoSolving}
                    onPointerDown={e => e.currentTarget.style.transform = "scale(0.93)"}
                    onPointerUp={e => e.currentTarget.style.transform = "scale(1)"}
                    onPointerLeave={e => e.currentTarget.style.transform = "scale(1)"}
                  >
                    {m}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Action buttons ── */}
      <div style={s.actions}>
        <button style={s.secondaryBtn} onClick={() => {
          const currentState = trackerRef.current?.getCurrentState();
          navigate("/review", { state: { faceColors: currentState } });
        }}>
          ← Review
        </button>
        <button
          style={{ ...s.solveBtn, opacity: isAutoSolving ? 0.75 : 1, cursor: isAutoSolving ? "not-allowed" : "pointer" }}
          onClick={autoSolve}
          disabled={isAutoSolving}
        >
          {isAutoSolving
            ? <><span style={s.spinnerDot}>⏳</span> {currentMove || "Solving…"}</>
            : "🤖 Auto Solve"}
        </button>
      </div>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────
const s = {
  root: {
    display:"flex", flexDirection:"column", height:"100%",
    padding:"12px 16px 20px", gap:10, overflowY:"auto",
    background:"#080810",
  },

  // Header
  header: { display:"flex", flexDirection:"column", gap:3, flexShrink:0 },
  headerTop: { display:"flex", justifyContent:"space-between", alignItems:"center" },
  headerLeft: { display:"flex", alignItems:"center", gap:8 },
  title: { color:"#e2e8f0", fontSize:18, fontWeight:800, letterSpacing:"-0.02em" },
  movePill: { padding:"2px 8px", borderRadius:20, background:"rgba(102,126,234,0.15)", border:"1px solid rgba(102,126,234,0.25)", color:"#a5b4fc", fontSize:11, fontWeight:700 },
  headerBtns: { display:"flex", gap:5, alignItems:"center" },
  iconBtn: {
    display:"flex", alignItems:"center", padding:"5px 9px",
    borderRadius:8, background:"rgba(255,255,255,0.06)",
    border:"1px solid rgba(255,255,255,0.1)",
    color:"#94a3b8", fontSize:13, fontWeight:600,
    cursor:"pointer", transition:"all 0.15s", gap:2,
    WebkitTapHighlightColor:"transparent",
  },
  subtitle: { color:"#334155", fontSize:11 },

  // Canvas
  canvasWrapper: {
    position:"relative", flexShrink:0,
    height:280, borderRadius:18, overflow:"hidden",
    border:"1px solid rgba(255,255,255,0.07)",
    background:"radial-gradient(ellipse at 50% 30%, rgba(102,126,234,0.08) 0%, rgba(8,8,16,0.95) 70%)",
    boxShadow:"0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
  },
  canvasHint: {
    position:"absolute", bottom:12, left:"50%", transform:"translateX(-50%)",
    pointerEvents:"none",
  },
  hintText: {
    padding:"4px 12px", borderRadius:20,
    background:"rgba(0,0,0,0.5)", backdropFilter:"blur(8px)",
    color:"rgba(255,255,255,0.4)", fontSize:11, fontWeight:500,
    border:"1px solid rgba(255,255,255,0.08)",
  },

  // History strip
  historyStrip: {
    display:"flex", alignItems:"center", gap:8, flexShrink:0,
    background:"rgba(255,255,255,0.02)", borderRadius:10,
    padding:"6px 10px", border:"1px solid rgba(255,255,255,0.04)",
  },
  historyLabel: { color:"#334155", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", flexShrink:0 },
  historyScroll: { display:"flex", gap:4, overflowX:"auto", scrollbarWidth:"none", flex:1 },
  historyBadge: {
    flexShrink:0, padding:"2px 7px", borderRadius:5,
    background:"rgba(255,255,255,0.05)", color:"#64748b",
    fontSize:11, fontWeight:600,
  },

  // Solution bar
  solutionBar: {
    background:"rgba(102,126,234,0.06)", border:"1px solid rgba(102,126,234,0.15)",
    borderRadius:14, padding:"10px 12px", flexShrink:0,
  },
  solutionHeader: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 },
  solutionLabel: { color:"#a5b4fc", fontSize:12, fontWeight:700 },
  solutionCount: { color:"#475569", fontSize:11, fontWeight:600 },
  progressTrack: {
    height:4, borderRadius:4, background:"rgba(255,255,255,0.06)",
    overflow:"hidden", marginBottom:8,
  },
  progressFill: {
    height:"100%", borderRadius:4,
    background:"linear-gradient(90deg,#667eea,#a78bfa)",
    transition:"width 0.3s ease",
  },
  solutionMoves: { display:"flex", flexWrap:"wrap", gap:4 },
  solutionBadge: {
    padding:"3px 8px", borderRadius:6, fontSize:11, fontWeight:700,
    transition:"all 0.2s", display:"inline-block",
  },

  // Notation panel
  notationPanel: {
    background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)",
    borderRadius:14, padding:"10px 10px 8px", flexShrink:0,
  },
  notationGrid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 },
  moveGroup: {
    display:"flex", alignItems:"center", gap:4,
    background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)",
    borderRadius:10, padding:"7px 8px",
  },
  moveGroupLabel: {
    fontSize:11, fontWeight:800, width:14, flexShrink:0,
    letterSpacing:"0.04em",
  },
  moveBtn: {
    flex:1, padding:"8px 0", borderRadius:7,
    background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)",
    color:"#e2e8f0", fontSize:12, fontWeight:700, cursor:"pointer",
    transition:"transform 0.1s",
    WebkitTapHighlightColor:"transparent",
    touchAction:"manipulation",
  },

  // Actions
  actions: { display:"flex", gap:10, flexShrink:0, marginTop:"auto" },
  secondaryBtn: {
    flex:1, padding:"14px", borderRadius:14,
    background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)",
    color:"#64748b", fontSize:14, fontWeight:600, cursor:"pointer",
    WebkitTapHighlightColor:"transparent",
    touchAction:"manipulation",
  },
  solveBtn: {
    flex:2, padding:"14px", borderRadius:14,
    background:"linear-gradient(135deg,#667eea 0%,#764ba2 100%)",
    border:"none", color:"white", fontSize:14, fontWeight:700,
    cursor:"pointer", transition:"opacity 0.2s",
    boxShadow:"0 4px 20px rgba(102,126,234,0.35)",
    WebkitTapHighlightColor:"transparent",
    touchAction:"manipulation",
    display:"flex", alignItems:"center", justifyContent:"center", gap:6,
  },
  spinnerDot: { animation:"spin 1s linear infinite", display:"inline-block" },
};