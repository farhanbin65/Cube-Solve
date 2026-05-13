import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cube3D from "../components/Cube3D";

const FACE_CENTRES = {
  U: "white",
  R: "red",
  F: "green",
  D: "yellow",
  L: "orange",
  B: "blue",
};

function buildDefaultColors() {
  const result = {};
  for (const key of Object.keys(FACE_CENTRES)) {
    result[key] = Array(9).fill(FACE_CENTRES[key]);
  }
  return result;
}

export default function Cube3Dscreen() {
  const navigate = useNavigate();

  const [faceColors, setFaceColors] = useState(() => {
    try {
      return (
        JSON.parse(sessionStorage.getItem("cube_colors")) ||
        buildDefaultColors()
      );
    } catch {
      return buildDefaultColors();
    }
  });

  // Re-read sessionStorage if it changes (e.g. user navigates back from review)
  useEffect(() => {
    const handler = () => {
      try {
        const stored = JSON.parse(sessionStorage.getItem("cube_colors"));
        if (stored) setFaceColors(stored);
      } catch {}
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  return (
    <div style={s.root}>
      {/* Header */}
      <div style={s.header}>
        <span style={s.stepTag}>3D View</span>
        <span style={s.subtitle}>Drag to rotate · pinch / scroll to zoom</span>
      </div>

      {/* 3D Canvas */}
      <div style={s.canvasWrapper}>
        <Cube3D faceColors={faceColors} />
      </div>

      {/* Actions */}
      <div style={s.actions}>
        <button style={s.secondaryBtn} onClick={() => navigate("/review")}>
          Back to 2D
        </button>
        <button style={s.primaryBtn} onClick={() => navigate("/solution")}>
          Confirm and solve
        </button>
      </div>
    </div>
  );
}

const s = {
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    padding: "16px 20px 24px",
    gap: 12,
  },
  header: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  stepTag: {
    color: "#e2e8f0",
    fontSize: 18,
    fontWeight: 800,
    letterSpacing: "-0.01em",
  },
  subtitle: {
    color: "#475569",
    fontSize: 12,
  },
  canvasWrapper: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.06)",
    background: "#0a0a0f",
    minHeight: 320,
  },
  actions: {
    display: "flex",
    gap: 10,
  },
  secondaryBtn: {
    flex: 1,
    padding: "13px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  primaryBtn: {
    flex: 2,
    padding: "13px",
    borderRadius: 12,
    background: "#e2e8f0",
    border: "none",
    color: "#0a0a0f",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  },
};