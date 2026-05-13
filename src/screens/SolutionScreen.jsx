// SolutionScreen.jsx - Complete working version with step-by-step

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MoveDiagram from "../components/MoveDiagram";
import { solveCube } from "../utils/cubeSolver";

const MOVE_INFO = {
  "U": { desc: "Top row right" },
  "U'": { desc: "Top row left" },
  "U2": { desc: "Top row × 2" },
  "D": { desc: "Bottom row left" },
  "D'": { desc: "Bottom row right" },
  "D2": { desc: "Bottom row × 2" },
  "R": { desc: "Right column up" },
  "R'": { desc: "Right column down" },
  "R2": { desc: "Right column × 2" },
  "L": { desc: "Left column down" },
  "L'": { desc: "Left column up" },
  "L2": { desc: "Left column × 2" },
  "F": { desc: "Front face clockwise" },
  "F'": { desc: "Front face counter-clock" },
  "F2": { desc: "Front face × 2" },
  "B": { desc: "Back face clockwise" },
  "B'": { desc: "Back face counter-clock" },
  "B2": { desc: "Back face × 2" },
};

const MOVE_HOLD = {
  U: "White facing you · Blue on top",
  D: "Yellow facing you · Green on top",
  R: "Red facing you · White on top",
  L: "Orange facing you · White on top",
  F: "Green facing you · White on top",
  B: "Blue facing you · Yellow on top",
};

export default function SolutionScreen() {
  const navigate = useNavigate();
  
  const [solution, setSolution] = useState([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [solving, setSolving] = useState(false);
  const [solveError, setSolveError] = useState(null);
  
  // Load and solve cube
  useEffect(() => {
    const loadAndSolve = async () => {
      setLoading(true);
      setSolveError(null);
      
      try {
        const savedColors = JSON.parse(sessionStorage.getItem("cube_colors") || "null");
        
        if (!savedColors) {
          setSolveError("No cube data found. Please scan your cube first.");
          setLoading(false);
          return;
        }
        
        setSolving(true);
        const moves = await solveCube(savedColors);
        setSolving(false);
        
        if (moves === null) {
          setSolveError("Could not solve cube. Please check your colors.");
        } else if (moves.length === 0) {
          // Cube already solved
          navigate("/success", { state: { moves: 0, time: 0 } });
          return;
        } else {
          setSolution(moves);
          setCurrentMoveIndex(0);
        }
      } catch (error) {
        console.error("Error:", error);
        setSolveError("Unexpected error. Please try again.");
      }
      
      setLoading(false);
    };
    
    loadAndSolve();
  }, [navigate]);
  
  const currentMove = solution[currentMoveIndex];
  const isLastMove = currentMoveIndex === solution.length - 1;
  
  const handleNextMove = () => {
    if (isLastMove) {
      // Finish solving
      const elapsed = window.axisTimer?.getElapsed() || 0;
      const history = JSON.parse(localStorage.getItem("cube_history") || "[]");
      history.unshift({
        id: Date.now(),
        date: new Date().toISOString(),
        moves: solution.length,
        time: elapsed,
      });
      localStorage.setItem("cube_history", JSON.stringify(history.slice(0, 50)));
      navigate("/success", { state: { moves: solution.length, time: elapsed } });
    } else {
      setCurrentMoveIndex(prev => prev + 1);
    }
  };
  
  const handlePrevMove = () => {
    if (currentMoveIndex > 0) {
      setCurrentMoveIndex(prev => prev - 1);
    }
  };
  
  // Loading state
  if (loading || solving) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>
          {solving ? "Finding solution..." : "Loading..."}
        </p>
      </div>
    );
  }
  
  // Error state
  if (solveError) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorIcon}>⚠️</div>
        <p style={styles.errorText}>{solveError}</p>
        <button style={styles.primaryBtn} onClick={() => navigate("/review")}>
          Back to Review
        </button>
      </div>
    );
  }
  
  // Main view - show one move at a time
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.stepTag}>Step 03 · Solution</span>
        <div style={styles.progressBadge}>
          {currentMoveIndex + 1} / {solution.length}
        </div>
      </div>
      
      {/* Progress bar */}
      <div style={styles.progressBar}>
        <div 
          style={{
            ...styles.progressFill,
            width: `${((currentMoveIndex + 1) / solution.length) * 100}%`
          }}
        />
      </div>
      
      {/* Current Move Card */}
      <div style={styles.moveCard}>
        <div style={styles.moveNumber}>
          Move {currentMoveIndex + 1} of {solution.length}
        </div>
        
        <MoveDiagram move={currentMove} size="lg" />
        
        <div style={styles.moveNotation}>
          {currentMove}
        </div>
        
        <div style={styles.moveDescription}>
          {MOVE_INFO[currentMove]?.desc || "Perform this move"}
        </div>
        
        <div style={styles.holdInstruction}>
          {MOVE_HOLD[currentMove?.[0]] || ""}
        </div>
      </div>
      
      {/* Control Buttons */}
      <div style={styles.controls}>
        <button
          style={{
            ...styles.secondaryBtn,
            opacity: currentMoveIndex === 0 ? 0.4 : 1
          }}
          onClick={handlePrevMove}
          disabled={currentMoveIndex === 0}
        >
          ← Previous
        </button>
        
        <button
          style={styles.primaryBtn}
          onClick={handleNextMove}
        >
          {isLastMove ? "Finish ✓" : "Next Move →"}
        </button>
      </div>
      
      {/* Mini move strip for context */}
      <div style={styles.moveStrip}>
        {solution.slice(Math.max(0, currentMoveIndex - 2), Math.min(solution.length, currentMoveIndex + 3)).map((move, idx) => {
          const actualIndex = Math.max(0, currentMoveIndex - 2) + idx;
          const isCurrent = actualIndex === currentMoveIndex;
          
          return (
            <div
              key={actualIndex}
              style={{
                ...styles.stripBadge,
                background: isCurrent ? "#e2e8f0" : "rgba(255,255,255,0.05)",
                color: isCurrent ? "#0a0a0f" : "#64748b",
                border: isCurrent ? "none" : "1px solid rgba(255,255,255,0.08)",
              }}
              onClick={() => setCurrentMoveIndex(actualIndex)}
            >
              {move}
            </div>
          );
        })}
      </div>
      {/* Temporary test button for solver debugging */}
      <button 
        onClick={async () => {
          const colors = JSON.parse(sessionStorage.getItem("cube_colors"));
          console.log("Testing solver with current cube...");
          const result = await solveCube(colors);
          console.log("Test result:", result);
        }}
        style={{ position: 'fixed', bottom: 10, right: 10, zIndex: 9999, background: '#4ade80', padding: '8px 16px', borderRadius: 8, color: '#000' }}
      >
        Test Solver
      </button>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100%",
    padding: "20px",
    gap: 20,
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
  progressBadge: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20,
    padding: "4px 12px",
    color: "#e2e8f0",
    fontSize: 13,
    fontWeight: 700,
  },
  progressBar: {
    height: 3,
    background: "rgba(255,255,255,0.06)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "#4ade80",
    borderRadius: 3,
    transition: "width 0.3s ease",
  },
  moveCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 24,
    padding: "32px 20px",
  },
  moveNumber: {
    color: "#475569",
    fontSize: 12,
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  moveNotation: {
    fontSize: 64,
    fontWeight: 900,
    color: "#e2e8f0",
    letterSpacing: "0.02em",
    lineHeight: 1,
  },
  moveDescription: {
    color: "#64748b",
    fontSize: 14,
    textAlign: "center",
  },
  holdInstruction: {
    color: "#334155",
    fontSize: 12,
    textAlign: "center",
    paddingTop: 8,
    borderTop: "1px solid rgba(255,255,255,0.06)",
    width: "100%",
  },
  controls: {
    display: "flex",
    gap: 12,
  },
  primaryBtn: {
    flex: 2,
    padding: "16px",
    borderRadius: 16,
    background: "#e2e8f0",
    border: "none",
    color: "#0a0a0f",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
  },
  secondaryBtn: {
    flex: 1,
    padding: "16px",
    borderRadius: 16,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  moveStrip: {
    display: "flex",
    gap: 8,
    justifyContent: "center",
    flexWrap: "wrap",
    padding: "12px",
    background: "rgba(255,255,255,0.02)",
    borderRadius: 16,
  },
  stripBadge: {
    padding: "6px 14px",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    gap: 20,
  },
  spinner: {
    width: 48,
    height: 48,
    border: "3px solid rgba(255,255,255,0.1)",
    borderTop: "3px solid #e2e8f0",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: {
    color: "#64748b",
    fontSize: 14,
  },
  errorContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    gap: 16,
    padding: 32,
  },
  errorIcon: {
    fontSize: 48,
  },
  errorText: {
    color: "#f87171",
    fontSize: 14,
    textAlign: "center",
  },
};