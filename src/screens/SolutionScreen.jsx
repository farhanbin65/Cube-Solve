import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import MoveDiagram from "../components/MoveDiagram";

const MOVE_INFO = {
  "U":  { desc: "Top row right"            },
  "U'": { desc: "Top row left"             },
  "U2": { desc: "Top row × 2"             },
  "D":  { desc: "Bottom row left"          },
  "D'": { desc: "Bottom row right"         },
  "D2": { desc: "Bottom row × 2"          },
  "R":  { desc: "Right column up"          },
  "R'": { desc: "Right column down"        },
  "R2": { desc: "Right column × 2"        },
  "L":  { desc: "Left column down"         },
  "L'": { desc: "Left column up"           },
  "L2": { desc: "Left column × 2"         },
  "F":  { desc: "Front face clockwise"     },
  "F'": { desc: "Front face counter-clock" },
  "F2": { desc: "Front face × 2"          },
  "B":  { desc: "Back face clockwise"      },
  "B'": { desc: "Back face counter-clock"  },
  "B2": { desc: "Back face × 2"           },
};

const BATCH_SIZE = 6;

// ── Solver ─────────────────────────────────────────────────

const COLOR_TO_FACE = {
  white:  "U",
  red:    "R",
  green:  "F",
  yellow: "D",
  orange: "L",
  blue:   "B",
};

function buildCubeString(faceColors) {
  const order = ["U", "R", "F", "D", "L", "B"];
  const colourToLetter = {};
  for (const face of order) {
    const tiles = faceColors[face] || [];
    const centreColour = tiles[4];
    if (centreColour && centreColour !== "unknown") {
      colourToLetter[centreColour] = face;
    }
  }

  console.log("Colour to letter map:", colourToLetter);

  let str = "";
  let skipped = 0;
  for (const face of order) {
    const tiles = faceColors[face] || [];
    console.log(`Face ${face} has ${tiles.length} tiles:`, tiles);
    for (let i = 0; i < 9; i++) {
      const colour = tiles[i];
      const letter = colourToLetter[colour];
      if (!letter) {
        console.error(`No letter for colour: "${colour}" on face ${face} tile ${i}`);
        skipped++;
        str += face;
      } else {
        str += letter;
      }
    }
  }

  console.log("Cube string:", str);
  console.log("Length:", str.length);
  console.log("Skipped:", skipped);
  return str;
}

async function solveCube(faceColors) {
  const cubeStr = buildCubeString(faceColors);
  if (!cubeStr) {
    console.error("Invalid cube string — colour mapping failed");
    return null;
  }
  console.log("Cube string:", cubeStr);
  console.log("Length:", cubeStr.length);
  try {
    const { solve } = await import("kociemba-wasm");
    const result = await solve(cubeStr);
    console.log("Solution:", result);
    if (!result || result.trim() === "") return [];
    return result.trim().split(" ").filter(Boolean);
  } catch (e) {
    console.error("Solver error:", e);
    return null;
  }
}

// ── Component ──────────────────────────────────────────────

export default function SolutionScreen() {
  const navigate = useNavigate();

  const [solution,    setSolution]    = useState([]);
  const [currentMove, setCurrentMove] = useState(0);
  const [mode,        setMode]        = useState("off");
  const [loading,     setLoading]     = useState(true);
  const [wrongMove,   setWrongMove]   = useState(false);
  const [recalcing,   setRecalcing]   = useState(false);
  const [solveError,  setSolveError]  = useState(null);

  const videoRef  = useRef(null);
  const streamRef = useRef(null);
  const stripRef  = useRef(null);

  const batchStart = Math.floor(currentMove / BATCH_SIZE) * BATCH_SIZE;
  const batchMoves = solution.slice(batchStart, batchStart + BATCH_SIZE);

  // ── Init & Solve ──────────────────────────────────────────

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setSolveError(null);
      try {
        const savedColors = JSON.parse(
          sessionStorage.getItem("cube_colors") || "null"
        );
        if (!savedColors) {
          setSolveError("No cube data found. Please scan your cube first.");
          setLoading(false);
          return;
        }
        const moves = await solveCube(savedColors);
        if (moves === null) {
          setSolveError("Solver error. Please re-scan your cube.");
        } else if (moves.length === 0) {
          setSolveError("Could not generate solution. Check your colour mapping.");
        } else {
          setSolution(moves);
        }
      } catch (e) {
        console.error(e);
        setSolveError("Unexpected error. Please re-scan.");
      }
      setLoading(false);
    };
    run();
  }, []);

  // ── Camera ────────────────────────────────────────────────

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 320, height: 240 },
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      setMode("off");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (mode === "on") startCamera();
    else stopCamera();
  }, [mode, startCamera, stopCamera]);

  // ── Strip scroll ──────────────────────────────────────────

  useEffect(() => {
    if (stripRef.current) {
      const active = stripRef.current.querySelector("[data-active='true']");
      if (active)
        active.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
    }
  }, [currentMove]);

  // ── Actions ───────────────────────────────────────────────

  const nextMove = () => {
    setWrongMove(false);
    if (currentMove < solution.length - 1) {
      setCurrentMove((p) => p + 1);
    } else {
      finishSolve();
    }
  };

  const prevMove = () => {
    if (currentMove > 0) {
      setCurrentMove((p) => p - 1);
      setWrongMove(false);
    }
  };

  const nextBatch = () => {
    const next = batchStart + BATCH_SIZE;
    if (next < solution.length) {
      setCurrentMove(next);
      setWrongMove(false);
    } else {
      finishSolve();
    }
  };

  const recalculate = async () => {
    setRecalcing(true);
    setWrongMove(false);
    setSolveError(null);
    try {
      const savedColors = JSON.parse(
        sessionStorage.getItem("cube_colors") || "null"
      );
      if (savedColors) {
        const moves = await solveCube(savedColors);
        if (moves && moves.length > 0) {
          setSolution(moves);
          setCurrentMove(0);
          setRecalcing(false);
          return;
        }
      }
      setSolveError("Could not recalculate. Please re-scan.");
    } catch {
      setSolveError("Solver error. Please re-scan.");
    }
    setRecalcing(false);
  };

  const finishSolve = () => {
    stopCamera();
    if (window.axisTimer) window.axisTimer.stop();
    const elapsed = window.axisTimer?.getElapsed() || 0;
    const history = JSON.parse(localStorage.getItem("cube_history") || "[]");
    history.unshift({
      id:    Date.now(),
      date:  new Date().toISOString(),
      moves: solution.length,
      time:  elapsed,
    });
    localStorage.setItem("cube_history", JSON.stringify(history.slice(0, 50)));
    navigate("/success", { state: { moves: solution.length, time: elapsed } });
  };

  const move = solution[currentMove];
  const info = MOVE_INFO[move] || { desc: "Perform move" };

  // ── Loading ───────────────────────────────────────────────

  if (loading || recalcing) {
    return (
      <div style={s.loadingRoot}>
        <div style={s.spinnerRing} />
        <p style={s.loadingText}>
          {recalcing ? "Recalculating…" : "Generating solution…"}
        </p>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────

  if (solveError) {
    return (
      <div style={s.loadingRoot}>
        <div style={s.errorIcon}>⚠</div>
        <p style={s.errorText}>{solveError}</p>
        <button style={s.rescanBtn} onClick={() => navigate("/review")}>
          Go back to Review
        </button>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────

  return (
    <div style={s.root}>

      {/* Header */}
      <div style={s.header}>
        <span style={s.stepTag}>Step 03 · Solution</span>
        <div style={s.moveCountBadge}>
          {currentMove + 1}
          <span style={s.moveCountOf}> / {solution.length}</span>
        </div>
      </div>

      {/* Mode Toggle */}
      <div style={s.modeToggle}>
        <button
          style={{ ...s.modeBtn, ...(mode === "off" ? s.modeBtnActive : {}) }}
          onClick={() => setMode("off")}
        >
          <CameraOffIcon size={14} />
          Manual
        </button>
        <button
          style={{ ...s.modeBtn, ...(mode === "on" ? s.modeBtnActive : {}) }}
          onClick={() => setMode("on")}
        >
          <CameraOnIcon size={14} />
          Live Track
        </button>
      </div>

      {/* Live mode notice */}
      {mode === "on" && (
        <div style={s.liveNotice}>
          <span style={s.liveNoticeDot} />
          <span style={s.liveNoticeText}>
            Camera is on. Press Next after each move — live detection coming soon.
          </span>
        </div>
      )}

      {/* Wrong move warning */}
      {wrongMove && (
        <div style={s.wrongMoveBox}>
          <span style={s.wrongMoveIcon}>⚠</span>
          <div style={s.wrongMoveContent}>
            <span style={s.wrongMoveTitle}>Wrong move detected</span>
            <span style={s.wrongMoveDesc}>Undo the last move and try again</span>
          </div>
          <button style={s.recalcBtn} onClick={recalculate}>
            Recalc
          </button>
        </div>
      )}

      {/* Camera mini viewfinder */}
      {mode === "on" && (
        <div style={s.miniViewfinder}>
          <video ref={videoRef} autoPlay playsInline muted style={s.miniVideo} />
          <div style={s.miniLabel}>
            <span style={s.miniDot} />
            Tracking
          </div>
        </div>
      )}

      {/* ── MANUAL: Batch view ── */}
      {mode === "off" && (
        <div style={s.batchWrapper}>
          <span style={s.batchLabel}>
            Moves {batchStart + 1}–
            {Math.min(batchStart + BATCH_SIZE, solution.length)}
          </span>
          <div style={s.batchGrid}>
            {batchMoves.map((m, i) => {
              const absI = batchStart + i;
              const done = absI < currentMove;
              const curr = absI === currentMove;
              return (
                <div
                  key={i}
                  style={{
                    ...s.batchCard,
                    ...(done ? s.batchCardDone : {}),
                    ...(curr ? s.batchCardActive : {}),
                  }}
                >
                  <MoveDiagram move={m} size="sm" />
                  <span
                    style={{
                      ...s.batchNotation,
                      color: done
                        ? "#334155"
                        : curr
                        ? "#e2e8f0"
                        : "#64748b",
                    }}
                  >
                    {m}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── LIVE: Single move view ── */}
      {mode === "on" && (
        <div style={s.currentMoveCard}>
          <MoveDiagram move={move} size="lg" />
          <div style={s.moveNotation}>{move}</div>
          <div style={s.moveDesc}>{info.desc}</div>
        </div>
      )}

      {/* Progress bar */}
      <div style={s.progressBarTrack}>
        <div
          style={{
            ...s.progressBarFill,
            width: `${((currentMove + 1) / solution.length) * 100}%`,
          }}
        />
      </div>

      {/* Move strip */}
      <div style={s.stripWrapper} ref={stripRef}>
        {solution.map((m, i) => {
          const done   = i < currentMove;
          const active = i === currentMove;
          return (
            <div
              key={i}
              data-active={String(active)}
              style={{
                ...s.stripBadge,
                background: done
                  ? "rgba(74,222,128,0.12)"
                  : active
                  ? "#e2e8f0"
                  : "rgba(255,255,255,0.04)",
                color: done
                  ? "#4ade80"
                  : active
                  ? "#0a0a0f"
                  : "#334155",
                border: active
                  ? "none"
                  : "1px solid rgba(255,255,255,0.06)",
                fontWeight: active ? 800 : 500,
              }}
            >
              {m}
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div style={s.actions}>
        <button
          style={{
            ...s.iconActionBtn,
            opacity: currentMove === 0 ? 0.2 : 1,
          }}
          onClick={prevMove}
          disabled={currentMove === 0}
        >
          <UndoIcon />
          <span style={s.actionBtnLabel}>Undo</span>
        </button>

        {mode === "off" ? (
          <button style={s.primaryBtn} onClick={nextBatch}>
            {batchStart + BATCH_SIZE >= solution.length
              ? "Finish"
              : "Next moves →"}
          </button>
        ) : (
          <button style={s.primaryBtn} onClick={nextMove}>
            {currentMove === solution.length - 1 ? "Finish" : "Next →"}
          </button>
        )}
      </div>

    </div>
  );
}

// ── Icons ──────────────────────────────────────────────────

function CameraOffIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34" />
    </svg>
  );
}

function CameraOnIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function UndoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 .49-3.5" />
    </svg>
  );
}

// ── Styles ─────────────────────────────────────────────────

const s = {
  root: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100%",
    padding: "16px 20px 24px",
    gap: 14,
  },
  loadingRoot: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    gap: 16,
    padding: 24,
  },
  spinnerRing: {
    width: 44,
    height: 44,
    border: "3px solid rgba(255,255,255,0.06)",
    borderTop: "3px solid #e2e8f0",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: {
    color: "#475569",
    fontSize: 14,
  },
  errorIcon: {
    fontSize: 40,
    color: "#f87171",
  },
  errorText: {
    color: "#f87171",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 1.6,
    maxWidth: 280,
  },
  rescanBtn: {
    marginTop: 8,
    padding: "12px 24px",
    borderRadius: 12,
    background: "#e2e8f0",
    border: "none",
    color: "#0a0a0f",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
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
  moveCountBadge: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20,
    padding: "3px 10px",
    color: "#e2e8f0",
    fontSize: 13,
    fontWeight: 700,
  },
  moveCountOf: {
    color: "#475569",
    fontWeight: 400,
  },
  modeToggle: {
    display: "flex",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 10,
    padding: 3,
    gap: 3,
  },
  modeBtn: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: "8px",
    borderRadius: 8,
    border: "none",
    background: "none",
    color: "#475569",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  modeBtnActive: {
    background: "rgba(255,255,255,0.08)",
    color: "#e2e8f0",
  },
  liveNotice: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(96,165,250,0.06)",
    border: "1px solid rgba(96,165,250,0.15)",
    borderRadius: 10,
    padding: "8px 12px",
  },
  liveNoticeDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#60a5fa",
    flexShrink: 0,
  },
  liveNoticeText: {
    color: "#60a5fa",
    fontSize: 12,
    fontWeight: 500,
    lineHeight: 1.4,
  },
  wrongMoveBox: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "rgba(251,191,36,0.08)",
    border: "1px solid rgba(251,191,36,0.2)",
    borderRadius: 10,
    padding: "10px 12px",
  },
  wrongMoveIcon: {
    fontSize: 16,
    color: "#fbbf24",
    flexShrink: 0,
  },
  wrongMoveContent: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    flex: 1,
  },
  wrongMoveTitle: {
    color: "#fbbf24",
    fontSize: 13,
    fontWeight: 600,
  },
  wrongMoveDesc: {
    color: "#92400e",
    fontSize: 12,
  },
  recalcBtn: {
    padding: "6px 12px",
    borderRadius: 8,
    background: "rgba(251,191,36,0.15)",
    border: "1px solid rgba(251,191,36,0.3)",
    color: "#fbbf24",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    flexShrink: 0,
  },
  miniViewfinder: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
    height: 120,
    background: "#0d0d14",
    border: "1px solid rgba(255,255,255,0.06)",
  },
  miniVideo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  miniLabel: {
    position: "absolute",
    bottom: 8,
    left: 10,
    display: "flex",
    alignItems: "center",
    gap: 5,
    color: "#e2e8f0",
    fontSize: 11,
    fontWeight: 600,
    background: "rgba(0,0,0,0.5)",
    padding: "3px 8px",
    borderRadius: 20,
  },
  miniDot: {
    width: 5,
    height: 5,
    borderRadius: "50%",
    background: "#4ade80",
    boxShadow: "0 0 4px #4ade80",
    animation: "pulse 1.5s ease-in-out infinite",
  },
  batchWrapper: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 14,
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  batchLabel: {
    color: "#334155",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  batchGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 8,
  },
  batchCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    padding: "10px 4px",
    borderRadius: 10,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    overflow: "hidden",
  },
  batchCardDone: {
    background: "rgba(74,222,128,0.05)",
    border: "1px solid rgba(74,222,128,0.1)",
    opacity: 0.5,
  },
  batchCardActive: {
    background: "rgba(226,232,240,0.06)",
    border: "1px solid rgba(226,232,240,0.2)",
  },
  batchNotation: {
    fontSize: 15,
    fontWeight: 800,
    letterSpacing: "0.02em",
  },
  currentMoveCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    padding: "20px 16px",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 14,
  },
  moveNotation: {
    fontSize: 52,
    fontWeight: 900,
    color: "#e2e8f0",
    letterSpacing: "0.02em",
    lineHeight: 1,
  },
  moveDesc: {
    color: "#475569",
    fontSize: 13,
    fontWeight: 400,
    textAlign: "center",
  },
  progressBarTrack: {
    height: 2,
    background: "rgba(255,255,255,0.06)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    background: "#e2e8f0",
    borderRadius: 2,
    transition: "width 0.3s ease",
  },
  stripWrapper: {
    display: "flex",
    gap: 6,
    overflowX: "auto",
    paddingBottom: 4,
    scrollbarWidth: "none",
  },
  stripBadge: {
    flexShrink: 0,
    padding: "4px 10px",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 500,
    transition: "all 0.2s",
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginTop: "auto",
  },
  iconActionBtn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 3,
    padding: "10px 16px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#475569",
    cursor: "pointer",
    flexShrink: 0,
  },
  actionBtnLabel: {
    fontSize: 10,
    fontWeight: 500,
    letterSpacing: "0.04em",
  },
  primaryBtn: {
    flex: 1,
    padding: "14px",
    borderRadius: 12,
    background: "#e2e8f0",
    border: "none",
    color: "#0a0a0f",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  },
};