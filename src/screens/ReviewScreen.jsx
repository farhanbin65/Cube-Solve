import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { faceColorsToString } from "../utils/cubeState";

const FACES = [
  { key: "U", label: "White",  position: "Up"    },
  { key: "R", label: "Red",    position: "Right"  },
  { key: "F", label: "Green",  position: "Front"  },
  { key: "D", label: "Yellow", position: "Down"   },
  { key: "L", label: "Orange", position: "Left"   },
  { key: "B", label: "Blue",   position: "Back"   },
];

const HOLD_INSTRUCTIONS = {
  U: { facing: "White",  top: "Blue"   },
  R: { facing: "Red",    top: "White"  },
  F: { facing: "Green",  top: "White"  },
  D: { facing: "Yellow", top: "Green"  },
  L: { facing: "Orange", top: "White"  },
  B: { facing: "Blue",   top: "Yellow", note: "Read right to left" },
};

const COLOR_MAP = {
  white:  "#f0f0eb",
  yellow: "#ffd700",
  red:    "#d22828",
  orange: "#ff6420",
  green:  "#1e7a3c",
  blue:   "#1e50b4",
  unknown: "#1e293b",
};

const CENTRE_INDEX = 4;

const FACE_CENTRES = {
  U: "white",
  R: "red",
  F: "green",
  D: "yellow",
  L: "orange",
  B: "blue",
};

const NEIGHBOURS = {
  U: { top: "blue",   bottom: "green",  left: "orange", right: "red"    },
  R: { top: "white",  bottom: "yellow", left: "green",  right: "blue"   },
  F: { top: "white",  bottom: "yellow", left: "orange", right: "red"    },
  D: { top: "green",  bottom: "blue",   left: "orange", right: "red"    },
  L: { top: "white",  bottom: "yellow", left: "blue",   right: "green"  },
  B: { top: "yellow", bottom: "white",  left: "orange", right: "red"    },
};
// ── Validation ─────────────────────────────────────────────

function validateCube(faceColors) {
  const errors = [];

  // Check for unknown tiles first
  let unknownCount = 0;
  for (const face of FACES) {
    const tiles = faceColors[face.key] || [];
    for (let i = 0; i < 9; i++) {
      if (i === CENTRE_INDEX) continue;
      if (!tiles[i] || tiles[i] === "unknown") unknownCount++;
    }
  }
  if (unknownCount > 0) {
    errors.push(`${unknownCount} tile${unknownCount > 1 ? "s" : ""} not set yet`);
    return errors;
  }

  const counts = { white: 0, yellow: 0, red: 0, orange: 0, green: 0, blue: 0 };
  for (const face of FACES) {
    const tiles = faceColors[face.key] || [];
    for (const c of tiles) {
      if (counts[c] !== undefined) counts[c]++;
    }
  }
  for (const [color, count] of Object.entries(counts)) {
    if (count < 9) errors.push(`Not enough ${color} (${count}/9)`);
    if (count > 9) errors.push(`Too many ${color} (${count}/9)`);
  }

  const centreColors = FACES.map(f => faceColors[f.key]?.[CENTRE_INDEX]);
  const uniqueCentres = new Set(centreColors);
  if (uniqueCentres.size < 6) {
    errors.push("Each face must have a unique centre colour");
  }

  return errors;
}

function buildDefaultColors() {
  const result = {};
  for (const face of FACES) {
    // Fill all 9 with unknown, then set centre correctly
    result[face.key] = Array(9).fill("unknown");
    result[face.key][4] = FACE_CENTRES[face.key];
  }
  return result;
}

// ── Component ──────────────────────────────────────────────

export default function ReviewScreen() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const pickerRef = useRef(null);

  const [faceColors, setFaceColors] = useState(() => {
    // Priority: state from 3D screen > sessionStorage > default
    if (location.state?.faceColors) return location.state.faceColors;
    try {
      return JSON.parse(sessionStorage.getItem("cube_colors")) || buildDefaultColors();
    } catch {
      return buildDefaultColors();
    }
  });

  const [selectedFace, setSelectedFace] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [errors,       setErrors]       = useState([]);
  const [centreWarn,   setCentreWarn]   = useState(false);

  useEffect(() => {
    setErrors(validateCube(faceColors));
  }, [faceColors]);

  // Close picker when tapping outside
  useEffect(() => {
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setSelectedFace(null);
        setSelectedCell(null);
        setCentreWarn(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

// ── Debug / Quick‑fill helpers ──────────────────────────

// Map face keys to expected centre colour
const FACE_CENTRES_STATIC = {
  U: "white",
  F: "green",
  R: "red",
  B: "blue",
  L: "orange",
  D: "yellow",
};

// Fill with a solved cube
function fillSolvedCube() {
  const newColors = {};
  for (const face of FACES) {
    const centre = FACE_CENTRES_STATIC[face.key];
    newColors[face.key] = Array(9).fill(centre);
  }
  setFaceColors(newColors);
  sessionStorage.setItem("cube_colors", JSON.stringify(newColors));
}



const handleTileClick = (faceKey, cellIndex, e) => {
  e.stopPropagation();
  setCentreWarn(false);
  // Centres are locked — forced from known cube layout
  if (cellIndex === CENTRE_INDEX) {
    setCentreWarn(true);
    setSelectedFace(null);
    setSelectedCell(null);
    return;
  }
  if (selectedFace === faceKey && selectedCell === cellIndex) {
    setSelectedFace(null);
    setSelectedCell(null);
  } else {
    setSelectedFace(faceKey);
    setSelectedCell(cellIndex);
  }
};

  const handleColorPick = (colorName) => {
    if (selectedFace === null || selectedCell === null) return;

    // If changing a centre, block duplicate centre colours
    if (selectedCell === CENTRE_INDEX) {
      const duplicate = FACES.some(
        f => f.key !== selectedFace &&
        faceColors[f.key]?.[CENTRE_INDEX] === colorName
      );
      if (duplicate) {
        setCentreWarn(true);
        return;
      }
    }

    const newColors = { ...faceColors };
    newColors[selectedFace] = [...newColors[selectedFace]];
    newColors[selectedFace][selectedCell] = colorName;
    setFaceColors(newColors);
    setSelectedFace(null);
    setSelectedCell(null);
    setCentreWarn(false);
  };

  const handleConfirm = () => {
    const confirmedFaceColors = faceColors;
    const cubeStr = faceColorsToString(confirmedFaceColors);
    if (!cubeStr) {
      alert("Invalid cube — check your colours");
      return;
    }

    sessionStorage.setItem("cube_colors", JSON.stringify(confirmedFaceColors));
    navigate("/cube3d", { state: { faceColors: confirmedFaceColors } });
  };

  const handleRescan = () => {
    sessionStorage.removeItem("cube_colors");
    sessionStorage.removeItem("cube_faces");
    if (window.axisTimer) window.axisTimer.reset();
    navigate("/capture");
  };

  const isValid        = errors.length === 0;
  const isCentreSelected = selectedCell === CENTRE_INDEX;

  return (
    <div style={s.root}>

      {/* Header */}
      <div style={s.header}>
        <span style={s.stepTag}>Step 02 · Verification</span>
      </div>

      <h2 style={s.title}>Verify mapping</h2>
      <p style={s.subtitle}>
        Tap any tile to correct its color.
        <span style={s.lockNote}> Centre tiles can be edited if wrongly detected.</span>
      </p>

      {/* Live errors */}
      {errors.length > 0 && (
        <div style={s.errorBox}>
          <span style={s.errorIcon}>⚠</span>
          <div style={s.errorList}>
            {errors.map((e, i) => (
              <span key={i} style={s.errorItem}>{e}</span>
            ))}
          </div>
        </div>
      )}

      {/* Faces grid */}
      <div style={s.facesGrid}>
        {FACES.map((face) => {
          const tiles      = faceColors[face.key] || Array(9).fill("white");
          const neighbours = NEIGHBOURS[face.key];
          return (
            <FaceCard
              key={face.key}
              face={face}
              tiles={tiles}
              neighbours={neighbours}
              selectedCell={selectedFace === face.key ? selectedCell : null}
              onTileClick={(ci, e) => handleTileClick(face.key, ci, e)}
            />
          );
        })}
      </div>

      {/* Validation status */}
      <div style={s.statusRow}>
        {isValid ? (
          <div style={s.statusGood}>
            <span style={{ ...s.statusDot, background: "#4ade80" }} />
            Valid cube — ready to solve
          </div>
        ) : (
          <div style={s.statusBad}>
            <span style={{ ...s.statusDot, background: "#f87171" }} />
            {errors.length} issue{errors.length > 1 ? "s" : ""} — keep correcting
          </div>
        )}
      </div>

      {/* Spacer for sticky bottom */}
      <div style={{ height: 160 }} />

      {/* ── Sticky bottom ── */}
      <div style={s.stickyBottom} ref={pickerRef}>

        {/* Centre warning */}
        {isCentreSelected && (
          <div style={s.centreWarning}>
            <span style={s.centreWarningIcon}>🔒</span>
            <span style={s.centreWarningText}>
              {centreWarn
                ? "That colour is already used as another centre"
                : "Editing centre tile — each face needs a unique centre colour"}
            </span>
          </div>
        )}

        {/* Colour picker tray */}
        <div style={s.pickerTray}>
          <span style={s.pickerLabel}>
            {selectedFace !== null
              ? `Changing tile on ${FACES.find(f => f.key === selectedFace)?.label} face`
              : "Select a tile above to change its color"}
          </span>
          <div style={s.pickerRow}>
            {Object.entries(COLOR_MAP)
              .filter(([name]) => name !== "unknown")
              .map(([name, hex]) => {
              const isSelected =
                selectedFace !== null &&
                faceColors[selectedFace]?.[selectedCell] === name;

              // Grey out colours already used as centres when editing a centre
              const isCentreConflict =
                isCentreSelected &&
                FACES.some(
                  f => f.key !== selectedFace &&
                  faceColors[f.key]?.[CENTRE_INDEX] === name
                );

              return (
                <button
                  key={name}
                  style={{
                    ...s.pickerSwatch,
                    background: hex,
                    outline:    isSelected ? "3px solid #fff" : "none",
                    outlineOffset: 2,
                    opacity:    selectedFace === null
                      ? 0.4
                      : isCentreConflict
                      ? 0.2
                      : 1,
                    transform:  isSelected ? "scale(1.15)" : "scale(1)",
                    cursor:     isCentreConflict ? "not-allowed" : "pointer",
                  }}
                  onClick={() => handleColorPick(name)}
                  disabled={selectedFace === null}
                  title={isCentreConflict ? "Already used as a centre" : name}
                />
              );
              })}
          </div>
        </div>

        {/* Quick‑fill toolbar */}
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <button style={s.debugBtn} onClick={fillSolvedCube}>
            🧊 Solved cube
          </button>
        </div>

        {/* Action buttons */}
        <div style={s.actions}>
          <button style={s.secondaryBtn} onClick={handleRescan}>
            Re-scan
          </button>
          <button
            style={s.secondaryBtn}
            onClick={() => {
              const confirmedFaceColors = faceColors;
              const cubeStr = faceColorsToString(confirmedFaceColors);
              if (!cubeStr) {
                alert("Invalid cube — check your colours");
                return;
              }
              sessionStorage.setItem("cube_colors", JSON.stringify(confirmedFaceColors));
              navigate("/cube3d", { state: { faceColors: confirmedFaceColors } });
            }}
          >
            View 3D
          </button>
          <button
            style={{
              ...s.primaryBtn,
              opacity: isValid ? 1 : 0.35,
              cursor:  isValid ? "pointer" : "not-allowed",
            }}
            onClick={handleConfirm}
            disabled={!isValid}
          >
            Confirm and solve
          </button>
        </div>
              </div>
            </div>
          );
}

// ── Face Card ──────────────────────────────────────────────

function FaceCard({ face, tiles, neighbours, selectedCell, onTileClick }) {
  return (
    <div style={s.faceCardOuter}>

      {/* Top neighbour */}
      <div style={s.neighbourRow}>
        <div style={{
          ...s.neighbourStrip,
          ...s.neighbourTop,
          background: COLOR_MAP[neighbours.top],
        }} />
      </div>

      <div style={s.faceCardMiddle}>

        {/* Left neighbour */}
        <div style={{
          ...s.neighbourStrip,
          ...s.neighbourSide,
          background: COLOR_MAP[neighbours.left],
        }} />

        {/* Face */}
        <div style={s.faceCard}>
          <div style={s.faceCardHeader}>
            <span style={s.faceCardLabel}>{face.label}</span>
            <span style={s.faceCardPos}>{face.position}</span>
          </div>
          <span style={s.holdInstruction}>
            Hold {HOLD_INSTRUCTIONS[face.key].facing} facing you, {HOLD_INSTRUCTIONS[face.key].top} on top
          </span>
          {HOLD_INSTRUCTIONS[face.key].note && (
            <span style={s.holdInstruction}>
              {HOLD_INSTRUCTIONS[face.key].note}
            </span>
          )}
          <div style={s.tileGrid}>
            {tiles.map((colorName, ci) => {
              const isCentre   = ci === CENTRE_INDEX;
              const isSelected = selectedCell === ci;
              return (
                <div
                  key={ci}
                  onClick={(e) => onTileClick(ci, e)}
                  style={{
                    ...s.tile,
                    background:  colorName === "unknown"
                      ? "#0f172a"
                      : COLOR_MAP[colorName] || "#333",
                    cursor:      "pointer",
                    outline:     isSelected ? "2.5px solid #fff" : "none",
                    outlineOffset: 1,
                    border: colorName === "unknown"
                      ? "1px dashed #334155"
                      : "none",
                  }}
                >
                  {isCentre && (
                    <div style={s.lockBadge}>
                      {isSelected ? <UnlockIcon /> : <LockIcon />}
                    </div>
                  )}
                  {colorName === "unknown" && !isCentre && (
                    <div style={{
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      background: "#334155",
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right neighbour */}
        <div style={{
          ...s.neighbourStrip,
          ...s.neighbourSide,
          background: COLOR_MAP[neighbours.right],
        }} />

      </div>

      {/* Bottom neighbour */}
      <div style={s.neighbourRow}>
        <div style={{
          ...s.neighbourStrip,
          ...s.neighbourTop,
          background: COLOR_MAP[neighbours.bottom],
        }} />
      </div>

    </div>
  );
}

// ── Icons ──────────────────────────────────────────────────

function LockIcon() {
  return (
    <svg width="7" height="7" viewBox="0 0 24 24" fill="none"
      stroke="rgba(0,0,0,0.6)" strokeWidth="3"
      strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function UnlockIcon() {
  return (
    <svg width="7" height="7" viewBox="0 0 24 24" fill="none"
      stroke="rgba(0,0,0,0.6)" strokeWidth="3"
      strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  );
}

// ── Styles ─────────────────────────────────────────────────

const s = {
  root: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100%",
    padding: "16px 20px 0",
    gap: 12,
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
  subtitle: {
    color: "#475569",
    fontSize: 13,
    margin: 0,
    lineHeight: 1.5,
  },
  lockNote: {
    color: "#334155",
    fontSize: 12,
  },
  errorBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    background: "rgba(248,113,113,0.07)",
    border: "1px solid rgba(248,113,113,0.15)",
    borderRadius: 10,
    padding: "10px 12px",
  },
  errorIcon: {
    color: "#f87171",
    fontSize: 13,
    flexShrink: 0,
    marginTop: 1,
  },
  errorList: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    flex: 1,
  },
  errorItem: {
    color: "#f87171",
    fontSize: 11,
    fontWeight: 500,
  },
  facesGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },
  faceCardOuter: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  neighbourRow: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    paddingLeft: 10,
    paddingRight: 10,
  },
  faceCardMiddle: {
    display: "flex",
    alignItems: "stretch",
    width: "100%",
  },
  neighbourStrip: {
    borderRadius: 2,
    flexShrink: 0,
  },
  neighbourTop: {
    width: "100%",
    height: 6,
    borderRadius: "3px 3px 0 0",
  },
  neighbourSide: {
    width: 6,
    borderRadius: 0,
  },
  faceCard: {
    flex: 1,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 0,
    padding: "8px 8px 10px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  faceCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  faceCardLabel: {
    color: "#94a3b8",
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  },
  faceCardPos: {
    color: "#1e293b",
    fontSize: 9,
  },
  holdInstruction: {
    color: "#334155",
    fontSize: 8,
    fontWeight: 500,
    lineHeight: 1.3,
    marginBottom: 2,
  },
  tileGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 2,
  },
  tile: {
    aspectRatio: "1",
    borderRadius: 3,
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "outline 0.1s",
  },
  lockBadge: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  statusRow: {
    display: "flex",
    alignItems: "center",
  },
  statusGood: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    color: "#4ade80",
    fontSize: 12,
    fontWeight: 500,
  },
  statusBad: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    color: "#f87171",
    fontSize: 12,
    fontWeight: 500,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    flexShrink: 0,
  },
  stickyBottom: {
    position: "fixed",
    bottom: 64,
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
    maxWidth: 480,
    background: "#0a0a0f",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    padding: "10px 20px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    zIndex: 20,
  },
  centreWarning: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(251,191,36,0.07)",
    border: "1px solid rgba(251,191,36,0.15)",
    borderRadius: 8,
    padding: "7px 10px",
  },
  centreWarningIcon: {
    fontSize: 13,
    flexShrink: 0,
  },
  centreWarningText: {
    color: "#fbbf24",
    fontSize: 11,
    fontWeight: 500,
    lineHeight: 1.4,
  },
  pickerTray: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  pickerLabel: {
    color: "#334155",
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: "0.03em",
    minHeight: 16,
  },
  pickerRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 8,
  },
  pickerSwatch: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    transition: "outline 0.1s, transform 0.15s, opacity 0.2s",
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
    transition: "opacity 0.2s",
  },
  debugBtn: {
    padding: "6px 12px",
    borderRadius: 8,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
};