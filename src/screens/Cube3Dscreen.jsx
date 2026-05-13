import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Cube3D from "../components/Cube3D";
import { createStateTracker, buildSolved, applyMoveToState } from "../utils/cubeState";
import { solveCube } from "../utils/cubeSolver";

const MOVE_DEF = {
  "U":"U","U'":"U'","U2":"U2",
  "D":"D","D'":"D'","D2":"D2",
  "R":"R","R'":"R'","R2":"R2",
  "L":"L","L'":"L'","L2":"L2",
  "F":"F","F'":"F'","F2":"F2",
  "B":"B","B'":"B'","B2":"B2",
};

const FACE_CENTRES = {
  U:"white", R:"red", F:"green",
  D:"yellow", L:"orange", B:"blue",
};

function buildDefaultColors() {
  const r = {};
  for (const k of Object.keys(FACE_CENTRES)) r[k] = Array(9).fill(FACE_CENTRES[k]);
  return r;
}

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
        <div key={t.id} style={{ ...ts.toast, ...(t.type === "error" ? ts.error : t.type === "success" ? ts.success : ts.info) }}>
          <span style={ts.icon}>
            {t.type === "error" ? "✕" : t.type === "success" ? "✓" : "ℹ"}
          </span>
          {t.message}
        </div>
      ))}
    </div>
  );
}

const ts = {
  container: {
    position: "fixed", top: 60, left: "50%", transform: "translateX(-50%)",
    display: "flex", flexDirection: "column", gap: 8,
    zIndex: 999, pointerEvents: "none", width: "calc(100% - 40px)", maxWidth: 440,
  },
  toast: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "12px 16px", borderRadius: 12,
    fontSize: 13, fontWeight: 600,
    backdropFilter: "blur(12px)",
    animation: "slideDown 0.25s ease",
    boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
  },
  success: { background: "rgba(74,222,128,0.15)", border: "1px solid rgba(74,222,128,0.3)", color: "#4ade80" },
  error:   { background: "rgba(248,113,113,0.15)", border: "1px solid rgba(248,113,113,0.3)", color: "#f87171" },
  info:    { background: "rgba(148,163,184,0.12)", border: "1px solid rgba(148,163,184,0.2)", color: "#94a3b8" },
  icon:    { fontSize: 14, fontWeight: 800, flexShrink: 0 },
};

// ── Main component ─────────────────────────────────────────

export default function Cube3Dscreen() {
  const navigate = useNavigate();
  const cubeRef = useRef(null);
  const solveTimerRef = useRef(null);

  const [faceColors, setFaceColors] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("cube_colors")) || buildDefaultColors(); }
    catch { return buildDefaultColors(); }
  });

  const [stateTracker] = useState(() => createStateTracker(
    JSON.parse(sessionStorage.getItem("cube_colors") || "null") || buildDefaultColors()
  ));

  const [moveHistory,      setMoveHistory]      = useState([]);
  const [isAutoSolving,    setIsAutoSolving]    = useState(false);
  const [solutionMoves,    setSolutionMoves]    = useState([]);
  const [currentSolveIdx,  setCurrentSolveIdx]  = useState(0);
  const [currentMove,      setCurrentMove]      = useState("");
  const [toasts,           setToasts]           = useState([]);

  useEffect(() => () => { if (solveTimerRef.current) clearTimeout(solveTimerRef.current); }, []);

  // ── Toast helpers ────────────────────────────────────────

  const showToast = useCallback((message, type = "info", duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  // ── Move ─────────────────────────────────────────────────

  const applyMove = useCallback((move) => {
    cubeRef.current?.applyMove(move);
    const newState = stateTracker.applyMove(move);
    setMoveHistory(h => [...h, move]);
    sessionStorage.setItem("cube_colors", JSON.stringify(newState));
  }, [stateTracker]);

  // ── Scramble ─────────────────────────────────────────────

  const handleScramble = useCallback(() => {
    if (isAutoSolving) return;
    const allMoves = Object.keys(MOVE_DEF);
    const scramble = [];
    let last = "";
    for (let i = 0; i < 20; i++) {
      let m;
      do { m = allMoves[Math.floor(Math.random() * allMoves.length)]; } while (m[0] === last);
      last = m[0];
      scramble.push(m);
    }

    // Reset state tracker to solved, then apply scramble
    stateTracker.reset();
    scramble.forEach(m => stateTracker.applyMove(m));
    const scrambledState = stateTracker.getCurrentState();
    sessionStorage.setItem("cube_colors", JSON.stringify(scrambledState));

    // Apply to 3D cube
    scramble.forEach(m => cubeRef.current?.applyMove(m));

    setMoveHistory(scramble);
    showToast(`Scrambled with ${scramble.length} moves`, "info");
  }, [isAutoSolving, stateTracker, showToast]);

  // ── Reset ────────────────────────────────────────────────

  const handleReset = useCallback(() => {
    if (solveTimerRef.current) clearTimeout(solveTimerRef.current);
    setIsAutoSolving(false);
    setSolutionMoves([]);
    setCurrentMove("");
    setMoveHistory([]);
    stateTracker.reset();
    const solved = buildSolved();
    setFaceColors(solved);
    sessionStorage.setItem("cube_colors", JSON.stringify(solved));
    cubeRef.current?.reset();
    showToast("Cube reset to solved state", "info");
  }, [stateTracker, showToast]);

  // ── Auto solve ───────────────────────────────────────────

  const executeNextMove = useCallback((moves, index) => {
    if (index >= moves.length) {
      setIsAutoSolving(false);
      setSolutionMoves([]);
      setCurrentMove("");
      showToast("Cube solved! 🎉", "success", 4000);
      return;
    }
    cubeRef.current?.applyMove(moves[index]);
    setCurrentSolveIdx(index);
    setCurrentMove(moves[index]);
    solveTimerRef.current = setTimeout(() => executeNextMove(moves, index + 1), 420);
  }, [showToast]);

  const autoSolve = useCallback(async () => {
    if (isAutoSolving) return;
    setIsAutoSolving(true);
    setCurrentMove("");
    setSolutionMoves([]);

    try {
      const currentState = stateTracker.getCurrentState();
      const moves = await solveCube(currentState);

      if (moves === null) {
        setIsAutoSolving(false);
        showToast("Invalid cube state — cannot solve", "error");
        return;
      }
      if (moves.length === 0) {
        setIsAutoSolving(false);
        showToast("Cube is already solved!", "success");
        return;
      }

      showToast(`Solution: ${moves.length} moves`, "info");
      setSolutionMoves(moves);
      setCurrentSolveIdx(0);
      executeNextMove(moves, 0);
    } catch (err) {
      console.error(err);
      setIsAutoSolving(false);
      showToast("Solver error — try again", "error");
    }
  }, [isAutoSolving, stateTracker, executeNextMove, showToast]);

  // ── Render ───────────────────────────────────────────────

  return (
    <div style={s.root}>
      <Toast toasts={toasts} />

      {/* Header */}
      <div style={s.header}>
        <div style={s.headerTop}>
          <span style={s.title}>3D Cube</span>
          <div style={s.headerBtns}>
            <button style={s.smallBtn} onClick={handleScramble} disabled={isAutoSolving}>
              🔀 Scramble
            </button>
            <button style={s.smallBtn} onClick={handleReset}>
              ↺ Reset
            </button>
          </div>
        </div>
        <span style={s.subtitle}>Drag to rotate · scroll to zoom</span>
      </div>

      {/* Canvas */}
      <div style={s.canvasWrapper}>
        <Cube3D ref={cubeRef} faceColors={faceColors} />
      </div>

      {/* Move history */}
      {moveHistory.length > 0 && (
        <div style={s.historyStrip}>
          {moveHistory.slice(-14).map((m, i) => (
            <span key={i} style={s.historyBadge}>{m}</span>
          ))}
          <span style={s.moveCount}>{moveHistory.length} moves</span>
        </div>
      )}

      {/* Move buttons */}
      <div style={s.movePanel}>
        {MOVE_GROUPS.map(({ label, moves }) => (
          <div key={label} style={s.moveGroup}>
            <span style={{ ...s.moveGroupLabel, color: FACE_COLOR[label] }}>{label}</span>
            {moves.map(m => (
              <button key={m} style={s.moveBtn} onClick={() => applyMove(m)} disabled={isAutoSolving}>
                {m}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Solution display */}
      {solutionMoves.length > 0 && (
        <div style={s.solutionBar}>
          <span style={s.solutionLabel}>Solution:</span>
          <div style={s.solutionMoves}>
            {solutionMoves.map((m, i) => (
              <span key={i} style={{
                ...s.solutionBadge,
                background: i === currentSolveIdx ? "#e2e8f0" : i < currentSolveIdx ? "rgba(74,222,128,0.1)" : "rgba(255,255,255,0.05)",
                color: i === currentSolveIdx ? "#0a0a0f" : i < currentSolveIdx ? "#4ade80" : "#64748b",
              }}>{m}</span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={s.actions}>
        <button style={s.secondaryBtn} onClick={() => navigate("/review")}>
          ← Review
        </button>
        <button
          style={{ ...s.solveBtn, opacity: isAutoSolving ? 0.7 : 1 }}
          onClick={autoSolve}
          disabled={isAutoSolving}
        >
          {isAutoSolving ? `⏳ ${currentMove || "…"}` : "🤖 Auto Solve"}
        </button>
      </div>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────

const s = {
  root: { display:"flex", flexDirection:"column", height:"100%", padding:"12px 16px 16px", gap:10, overflowY:"auto" },
  header: { display:"flex", flexDirection:"column", gap:2, flexShrink:0 },
  headerTop: { display:"flex", justifyContent:"space-between", alignItems:"center" },
  title: { color:"#e2e8f0", fontSize:18, fontWeight:800 },
  headerBtns: { display:"flex", gap:6 },
  smallBtn: { padding:"5px 10px", borderRadius:8, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"#94a3b8", fontSize:12, fontWeight:600, cursor:"pointer" },
  subtitle: { color:"#334155", fontSize:11 },
  canvasWrapper: { height:260, flexShrink:0, borderRadius:14, overflow:"hidden", border:"1px solid rgba(255,255,255,0.06)" },
  historyStrip: { display:"flex", gap:5, overflowX:"auto", alignItems:"center", flexShrink:0, scrollbarWidth:"none", paddingBottom:2 },
  historyBadge: { flexShrink:0, padding:"2px 8px", borderRadius:6, background:"rgba(255,255,255,0.06)", color:"#94a3b8", fontSize:11, fontWeight:600 },
  moveCount: { marginLeft:"auto", flexShrink:0, color:"#334155", fontSize:11 },
  movePanel: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, flexShrink:0 },
  moveGroup: { display:"flex", alignItems:"center", gap:4, background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)", borderRadius:10, padding:"6px 8px" },
  moveGroupLabel: { fontSize:11, fontWeight:800, width:14, flexShrink:0, letterSpacing:"0.04em" },
  moveBtn: { flex:1, padding:"6px 0", borderRadius:6, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", color:"#e2e8f0", fontSize:11, fontWeight:700, cursor:"pointer" },
  solutionBar: { background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:12, padding:"8px 12px", flexShrink:0 },
  solutionLabel: { color:"#334155", fontSize:10, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase", display:"block", marginBottom:6 },
  solutionMoves: { display:"flex", flexWrap:"wrap", gap:4 },
  solutionBadge: { padding:"3px 8px", borderRadius:6, fontSize:12, fontWeight:600, transition:"all 0.2s" },
  actions: { display:"flex", gap:10, flexShrink:0 },
  secondaryBtn: { flex:1, padding:"12px", borderRadius:12, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", color:"#94a3b8", fontSize:14, fontWeight:600, cursor:"pointer" },
  solveBtn: { flex:1, padding:"12px", borderRadius:12, background:"linear-gradient(135deg,#667eea,#764ba2)", border:"none", color:"white", fontSize:14, fontWeight:700, cursor:"pointer", transition:"opacity 0.2s" },
};