import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const FACES = [
  { key: "U", label: "White", position: "Up" },
  { key: "R", label: "Red",   position: "Right" },
  { key: "F", label: "Green", position: "Front" },
  { key: "D", label: "Yellow",position: "Down" },
  { key: "L", label: "Orange",position: "Left" },
  { key: "B", label: "Blue",  position: "Back" },
];

const HOLD_INSTRUCTIONS = {
  U: "Hold White facing camera, Blue on top",
  R: "Hold Red facing camera, White on top",
  F: "Hold Green facing camera, White on top",
  D: "Hold Yellow facing camera, Green on top",
  L: "Hold Orange facing camera, White on top",
  B: "Hold Blue facing camera, Yellow on top — read right to left",
};

// Mini cube face diagram — inline, emoji-sized
const FACE_COLORS_MAP = {
  white: "#f0f0eb",
  yellow: "#ffd700",
  red: "#d22828",
  orange: "#ff6420",
  green: "#1e7a3c",
  blue: "#1e50b4",
};

const FACE_VISUAL = {
  U: { front: "white", top: "blue", left: "orange", right: "red" },
  R: { front: "red", top: "white", left: "green", right: "blue" },
  F: { front: "green", top: "white", left: "orange", right: "red" },
  D: { front: "yellow", top: "green", left: "orange", right: "red" },
  L: { front: "orange", top: "white", left: "blue", right: "green" },
  B: { front: "blue", top: "yellow", left: "red", right: "orange" },
};

function MiniCubeFace({ faceKey }) {
  const v = FACE_VISUAL[faceKey];
  if (!v) return null;
  const cell = 7; // px per cell
  const gap = 1;
  const strip = 3;
  const grid = cell * 3 + gap * 2;

  return (
    <span
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        verticalAlign: "middle",
        marginRight: 6,
      }}
    >
      {/* Top strip */}
      <span
        style={{
          display: "block",
          width: grid,
          height: strip,
          background: FACE_COLORS_MAP[v.top],
          borderRadius: "2px 2px 0 0",
        }}
      />
      <span style={{ display: "flex", alignItems: "center" }}>
        {/* Left strip */}
        <span
          style={{
            display: "block",
            width: strip,
            height: grid,
            background: FACE_COLORS_MAP[v.left],
            borderRadius: "2px 0 0 2px",
          }}
        />
        {/* 3×3 grid */}
        <svg width={grid} height={grid} style={{ display: "block" }}>
          {Array(9)
            .fill(0)
            .map((_, i) => (
              <rect
                key={i}
                x={(i % 3) * (cell + gap)}
                y={Math.floor(i / 3) * (cell + gap)}
                width={cell}
                height={cell}
                fill={FACE_COLORS_MAP[v.front]}
                rx={1}
              />
            ))}
        </svg>
        {/* Right strip */}
        <span
          style={{
            display: "block",
            width: strip,
            height: grid,
            background: FACE_COLORS_MAP[v.right],
            borderRadius: "0 2px 2px 0",
          }}
        />
      </span>
      {/* Bottom — no strip needed, bottom face not shown */}
    </span>
  );
}

export default function CaptureScreen() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [faceIndex, setFaceIndex] = useState(0);
  const [cameraError, setCameraError] = useState(null);
  const [flashOn, setFlashOn] = useState(false);
  const [captured, setCaptured] = useState(false); // flash feedback
  const [capturedFaces, setCapturedFaces] = useState({});
  const [faceColors, setFaceColors] = useState({});

  const currentFace = FACES[faceIndex];

  // ── Camera ─────────────────────────────────────────────

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setCameraError("Camera access denied. Please allow camera permissions and reload.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Start timer on first mount
    if (window.axisTimer) window.axisTimer.start();
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  // ── Colour Detection ───────────────────────────────────

  const sampleColor = (ctx, cx, cy, radius = 12) => {
    let r = 0, g = 0, b = 0, count = 0;
    for (let dy = -radius; dy <= radius; dy += 2) {
      for (let dx = -radius; dx <= radius; dx += 2) {
        // Only sample within circle
        if (dx * dx + dy * dy > radius * radius) continue;
        try {
          const px = ctx.getImageData(
            Math.max(0, cx + dx),
            Math.max(0, cy + dy),
            1, 1
          ).data;
          r += px[0]; g += px[1]; b += px[2]; count++;
        } catch {}
      }
    }
    if (count === 0) return [128, 128, 128];
    return [Math.round(r / count), Math.round(g / count), Math.round(b / count)];
  };

  const COLOR_REFS = [
    // Multiple sample points per colour to handle different lighting
    { name: "white",  rgb: [230, 230, 220] },
    { name: "white",  rgb: [210, 210, 200] },
    { name: "white",  rgb: [245, 245, 240] },
    { name: "yellow", rgb: [255, 213,   0] },
    { name: "yellow", rgb: [240, 200,   0] },
    { name: "yellow", rgb: [255, 230,  30] },
    { name: "red",    rgb: [180,  20,  20] },
    { name: "red",    rgb: [200,  30,  30] },
    { name: "red",    rgb: [220,  50,  50] },
    { name: "orange", rgb: [220,  80,   0] },
    { name: "orange", rgb: [240, 100,  20] },
    { name: "orange", rgb: [255, 120,  30] },
    { name: "green",  rgb: [  0, 120,  40] },
    { name: "green",  rgb: [ 20, 100,  30] },
    { name: "green",  rgb: [  0, 150,  50] },
    { name: "blue",   rgb: [  0,  50, 180] },
    { name: "blue",   rgb: [ 20,  70, 160] },
    { name: "blue",   rgb: [  0,  80, 200] },
  ];

  function detectColor(r, g, b) {
    // Normalize brightness first
    const brightness = (r + g + b) / 3;
    const scale = brightness > 0 ? 128 / brightness : 1;
    const nr = Math.min(255, r * scale);
    const ng = Math.min(255, g * scale);
    const nb = Math.min(255, b * scale);

    // Use both raw and normalized for matching
    let bestName = "white";
    let bestDist = Infinity;

    for (const ref of COLOR_REFS) {
      // Raw distance
      const rawDist = Math.sqrt(
        (r - ref.rgb[0]) ** 2 + (g - ref.rgb[1]) ** 2 + (b - ref.rgb[2]) ** 2
      );
      if (rawDist < bestDist) {
        bestDist = rawDist;
        bestName = ref.name;
      }
    }

    // Heuristic overrides for common misdetections
    // If it looks greyish/whitish
    const maxChannel = Math.max(r, g, b);
    const minChannel = Math.min(r, g, b);
    const saturation = maxChannel > 0 ? (maxChannel - minChannel) / maxChannel : 0;

    if (saturation < 0.15 && brightness > 140) return "white";
    if (saturation < 0.15 && brightness <= 140) return "white"; // dark white still white

    // Strong green detection
    if (g > r * 1.4 && g > b * 1.4 && g > 80) return "green";

    // Strong blue detection
    if (b > r * 1.5 && b > g * 1.2 && b > 60) return "blue";

    // Strong red detection
    if (r > g * 1.8 && r > b * 1.8) return "red";

    // Orange vs red: orange has significant green channel
    if (r > 150 && g > 60 && g < 140 && b < 60) return "orange";

    // Yellow: high red + high green, low blue
    if (r > 180 && g > 160 && b < 80) return "yellow";

    return bestName;
  };

  const extractColors = (canvas) => {
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;

    // Sample from the centre 60% of the frame (where grid overlay is)
    const gridLeft   = w * 0.2;
    const gridTop    = h * 0.2;
    const gridWidth  = w * 0.6;
    const gridHeight = h * 0.6;
    const cellW = gridWidth  / 3;
    const cellH = gridHeight / 3;

    const colors = [];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const cx = Math.round(gridLeft + (col + 0.5) * cellW);
        const cy = Math.round(gridTop  + (row + 0.5) * cellH);
        const [r, g, b] = sampleColor(ctx, cx, cy);
        colors.push(detectColor(r, g, b));
      }
    }
    return colors;
  };

  // Force correct centre colour — override index 4 with known face centre
  const FACE_CENTRES = {
    U: "white",
    R: "red",
    F: "green",
    D: "yellow",
    L: "orange",
    B: "blue",
  };

  const forceCorrectCentre = (colors, faceKey) => {
    const fixed = [...colors];
    fixed[4] = FACE_CENTRES[faceKey];
    return fixed;
  };

  // ── Capture ────────────────────────────────────────────

  const captureFrame = () => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width  = video.videoWidth  || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL("image/jpeg", 0.9);
  const colors = extractColors(canvas);
  const fixedColors = forceCorrectCentre(colors, currentFace.key);
  const faceKey = currentFace.key;

    setCapturedFaces((p) => ({ ...p, [faceKey]: imageData }));
  setFaceColors((p) => ({ ...p, [faceKey]: fixedColors }));

    // Flash feedback
    setCaptured(true);
    setTimeout(() => setCaptured(false), 200);

    if (faceIndex < 5) {
      setFaceIndex(faceIndex + 1);
    } else {
      // All 6 faces captured — save to sessionStorage and go to review
      stopCamera();
      sessionStorage.setItem("cube_faces",  JSON.stringify({ ...capturedFaces, [faceKey]: imageData }));
      sessionStorage.setItem("cube_colors", JSON.stringify({ ...faceColors,    [faceKey]: fixedColors }));
      navigate("/review");
    }
  };

  const retake = () => {
    if (faceIndex > 0) setFaceIndex(faceIndex - 1);
  };

  // ── Render ─────────────────────────────────────────────

  return (
    <div style={s.root}>
      {/* Step Header */}
      <div style={s.header}>
        <span style={s.stepTag}>Step 01 · Scanning</span>
        <div style={s.progressPill}>
          {faceIndex + 1} <span style={s.progressOf}>of 6</span>
        </div>
      </div>

      {/* Face Label */}
      <div style={s.faceLabel}>
        <span style={s.faceName}>{currentFace.label}</span>
        <span style={s.facePos}>({currentFace.position} face)</span>
      </div>

      {/* Progress Dots */}
      <div style={s.dots}>
        {FACES.map((_, i) => (
          <div key={i} style={{
            ...s.dot,
            background: i < faceIndex
              ? "#4ade80"
              : i === faceIndex
              ? "#e2e8f0"
              : "rgba(255,255,255,0.1)",
            width: i === faceIndex ? 20 : 8,
          }} />
        ))}
      </div>

      {/* Viewfinder */}
      <div style={s.viewfinderWrapper}>
        {cameraError ? (
          <div style={s.cameraError}>
            <CameraOffIcon />
            <p style={s.cameraErrorText}>{cameraError}</p>
            <button style={s.retryBtn} onClick={startCamera}>Retry</button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={s.video}
            />
            {/* AR Grid Overlay */}
            <div style={s.gridOverlay}>
              {Array(9).fill(0).map((_, i) => (
                <div key={i} style={s.gridCell} />
              ))}
            </div>
            {/* Corner markers */}
            <div style={{ ...s.corner, top: "19%", left: "19%" }} />
            <div style={{ ...s.corner, top: "19%", right: "19%", transform: "rotate(90deg)" }} />
            <div style={{ ...s.corner, bottom: "19%", left: "19%", transform: "rotate(-90deg)" }} />
            <div style={{ ...s.corner, bottom: "19%", right: "19%", transform: "rotate(180deg)" }} />
            {/* Capture flash */}
            {captured && <div style={s.flashOverlay} />}
          </>
        )}
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Hint */}
      <p style={s.hint}>
        <MiniCubeFace faceKey={currentFace.key} />
        {HOLD_INSTRUCTIONS[currentFace.key]}
      </p>

      {/* Controls */}
      <div style={s.controls}>
        {/* Flash toggle */}
        <button style={s.iconBtn} onClick={() => setFlashOn(!flashOn)}>
          <FlashIcon active={flashOn} />
        </button>

        {/* Capture button */}
        <button
          style={s.captureBtn}
          onClick={captureFrame}
          disabled={!!cameraError}
        >
          <div style={s.captureBtnInner} />
        </button>

        {/* Retake */}
        <button
          style={{ ...s.iconBtn, opacity: faceIndex === 0 ? 0.2 : 1 }}
          onClick={retake}
          disabled={faceIndex === 0}
        >
          <RetakeIcon />
        </button>
      </div>
    </div>
  );
}

// ── Icons ──────────────────────────────────────────────────

function CameraOffIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="1" y1="1" x2="23" y2="23"/>
      <path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34"/>
      <circle cx="12" cy="13" r="3"/>
    </svg>
  );
}

function FlashIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? "#fbbf24" : "none"} stroke={active ? "#fbbf24" : "#475569"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  );
}

function RetakeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10"/>
      <path d="M3.51 15a9 9 0 1 0 .49-3.5"/>
    </svg>
  );
}

// ── Styles ─────────────────────────────────────────────────

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
  progressPill: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20,
    padding: "3px 10px",
    color: "#e2e8f0",
    fontSize: 13,
    fontWeight: 700,
  },
  progressOf: {
    color: "#475569",
    fontWeight: 400,
  },
  faceLabel: {
    display: "flex",
    alignItems: "baseline",
    gap: 8,
  },
  faceName: {
    color: "#e2e8f0",
    fontSize: 22,
    fontWeight: 800,
    letterSpacing: "-0.01em",
  },
  facePos: {
    color: "#334155",
    fontSize: 13,
    fontWeight: 400,
  },
  dots: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    height: 4,
    borderRadius: 4,
    transition: "all 0.3s ease",
  },
  viewfinderWrapper: {
    flex: 1,
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
    background: "#0d0d14",
    border: "1px solid rgba(255,255,255,0.06)",
    minHeight: 260,
  },
  video: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  gridOverlay: {
    position: "absolute",
    top: "20%",
    left: "20%",
    width: "60%",
    height: "60%",
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gridTemplateRows: "1fr 1fr 1fr",
    pointerEvents: "none",
  },
  gridCell: {
    border: "1px solid rgba(255,255,255,0.5)",
    boxSizing: "border-box",
  },
  corner: {
    position: "absolute",
    width: 16,
    height: 16,
    borderTop: "2px solid #e2e8f0",
    borderLeft: "2px solid #e2e8f0",
    pointerEvents: "none",
  },
  flashOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(255,255,255,0.3)",
    pointerEvents: "none",
  },
  cameraError: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    height: "100%",
    padding: 24,
  },
  cameraErrorText: {
    color: "#475569",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 1.6,
  },
  retryBtn: {
    padding: "8px 20px",
    borderRadius: 8,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#e2e8f0",
    fontSize: 13,
    cursor: "pointer",
  },
  hint: {
    color: "#334155",
    fontSize: 12,
    textAlign: "center",
    fontWeight: 400,
  },
  controls: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 4,
  },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.08)",
    border: "2px solid rgba(255,255,255,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: 0,
  },
  captureBtnInner: {
    width: 52,
    height: 52,
    borderRadius: "50%",
    background: "#e2e8f0",
  },
};