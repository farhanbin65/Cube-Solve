const FACE_COLORS = {
  white:  "#f0f0eb",
  yellow: "#ffd700",
  red:    "#d22828",
  orange: "#ff6420",
  green:  "#1e7a3c",
  blue:   "#1e50b4",
};

// Neighbour centres: top, bottom, left, right
const NEIGHBOURS = {
  U: { top: "blue",   bottom: "green",  left: "orange", right: "red"   },
  F: { top: "white",  bottom: "yellow", left: "orange", right: "red"   },
  D: { top: "green",  bottom: "blue",   left: "orange", right: "red"   },
  B: { top: "yellow", bottom: "white",  left: "orange", right: "red" },
  L: { top: "white",  bottom: "yellow", left: "blue",   right: "green" },
  R: { top: "white",  bottom: "yellow", left: "green",  right: "blue"  },
};

// Which face each move belongs to + direction
const MOVE_META = {
  "U":  { face: "U", arrow: "right",  label: "Top row →"            },
  "U'": { face: "U", arrow: "left",   label: "Top row ←"            },
  "U2": { face: "U", arrow: "right2", label: "Top row × 2"          },
  "D":  { face: "D", arrow: "left",   label: "Bottom row ←"         },
  "D'": { face: "D", arrow: "right",  label: "Bottom row →"         },
  "D2": { face: "D", arrow: "left2",  label: "Bottom row × 2"       },
  "R":  { face: "R", arrow: "up",     label: "Right column ↑"       },
  "R'": { face: "R", arrow: "down",   label: "Right column ↓"       },
  "R2": { face: "R", arrow: "up2",    label: "Right column × 2"     },
  "L":  { face: "L", arrow: "down",   label: "Left column ↓"        },
  "L'": { face: "L", arrow: "up",     label: "Left column ↑"        },
  "L2": { face: "L", arrow: "down2",  label: "Left column × 2"      },
  "F":  { face: "F", arrow: "cw",     label: "Front face ↻"         },
  "F'": { face: "F", arrow: "ccw",    label: "Front face ↺"         },
  "F2": { face: "F", arrow: "cw2",    label: "Front face × 2"       },
  "B":  { face: "B", arrow: "ccw",    label: "Back face ↻ (from back)" },
  "B'": { face: "B", arrow: "cw",     label: "Back face ↺ (from back)" },
  "B2": { face: "B", arrow: "ccw2",   label: "Back face × 2"        },
};

// ── Arrow SVGs ─────────────────────────────────────────────

function ArrowUp({ color, size }) {
  return (
    <svg width={size * 0.5} height={size} viewBox="0 0 14 28">
      <line x1="7" y1="26" x2="7" y2="4" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
      <polyline points="2,9 7,2 12,9" fill="none" stroke={color} strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ArrowDown({ color, size }) {
  return (
    <svg width={size * 0.5} height={size} viewBox="0 0 14 28">
      <line x1="7" y1="2" x2="7" y2="24" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
      <polyline points="2,19 7,26 12,19" fill="none" stroke={color} strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ArrowRight({ color, size }) {
  return (
    <svg width={size} height={size * 0.5} viewBox="0 0 28 14">
      <line x1="2" y1="7" x2="24" y2="7" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
      <polyline points="19,2 26,7 19,12" fill="none" stroke={color} strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ArrowLeft({ color, size }) {
  return (
    <svg width={size} height={size * 0.5} viewBox="0 0 28 14">
      <line x1="26" y1="7" x2="4" y2="7" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
      <polyline points="9,2 2,7 9,12" fill="none" stroke={color} strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// 180° — single arrow + ×2 badge
function Arrow180({ color, size, direction }) {
  const isVertical = direction === "up2" || direction === "down2";
  const baseDir    = direction.replace("2", "");
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
      {baseDir === "up"    && <ArrowUp    color={color} size={size} />}
      {baseDir === "down"  && <ArrowDown  color={color} size={size} />}
      {baseDir === "right" && <ArrowRight color={color} size={size} />}
      {baseDir === "left"  && <ArrowLeft  color={color} size={size} />}
      <span style={{
        color,
        fontSize: size * 0.38,
        fontWeight: 900,
        letterSpacing: "-0.02em",
        lineHeight: 1,
      }}>×2</span>
    </div>
  );
}

// Clockwise — corner bracket rotating right
function ArrowCW({ color, size }) {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 36 36">
      {/* Corner bracket shape suggesting rotation */}
      <path
        d="M 28 8 A 14 14 0 1 1 8 28"
        fill="none" stroke={color} strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Arrowhead at end of arc */}
      <polyline
        points="4,22 8,29 15,26"
        fill="none" stroke={color} strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

// Counter-clockwise
function ArrowCCW({ color, size }) {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 36 36">
      <path
        d="M 8 8 A 14 14 0 1 0 28 28"
        fill="none" stroke={color} strokeWidth="2.5"
        strokeLinecap="round"
      />
      <polyline
        points="32,22 28,29 21,26"
        fill="none" stroke={color} strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

// CW ×2
function ArrowCW2({ color, size }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
      <ArrowCW color={color} size={size} />
      <span style={{
        color,
        fontSize: size * 0.38,
        fontWeight: 900,
        lineHeight: 1,
      }}>×2</span>
    </div>
  );
}

function ArrowCCW2({ color, size }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
      <ArrowCCW color={color} size={size} />
      <span style={{
        color,
        fontSize: size * 0.38,
        fontWeight: 900,
        lineHeight: 1,
      }}>×2</span>
    </div>
  );
}

function renderArrow(arrowType, color, size) {
  switch (arrowType) {
    case "up":    return <ArrowUp    color={color} size={size} />;
    case "down":  return <ArrowDown  color={color} size={size} />;
    case "right": return <ArrowRight color={color} size={size} />;
    case "left":  return <ArrowLeft  color={color} size={size} />;
    case "up2":   return <Arrow180   color={color} size={size} direction="up2"    />;
    case "down2": return <Arrow180   color={color} size={size} direction="down2"  />;
    case "right2":return <Arrow180   color={color} size={size} direction="right2" />;
    case "left2": return <Arrow180   color={color} size={size} direction="left2"  />;
    case "cw":    return <ArrowCW    color={color} size={size} />;
    case "ccw":   return <ArrowCCW   color={color} size={size} />;
    case "cw2":   return <ArrowCW2   color={color} size={size} />;
    case "ccw2":  return <ArrowCCW2  color={color} size={size} />;
    default:      return null;
  }
}

// ── Main Component ─────────────────────────────────────────

export default function MoveDiagram({ move, size = "md" }) {
  const meta = MOVE_META[move];
  if (!meta) return null;

  const { face, arrow, label } = meta;
  const neighbours = NEIGHBOURS[face];
  const faceColor  = FACE_COLORS[face === "U" ? "white"
    : face === "D" ? "yellow"
    : face === "R" ? "red"
    : face === "L" ? "orange"
    : face === "F" ? "green"
    : "blue"];

  // Arrow colour: use face colour, but white face gets light grey for visibility
  const arrowColor = faceColor === FACE_COLORS.white ? "#94a3b8" : faceColor;

  const squareSize = size === "sm" ? 28 : size === "lg" ? 52 : 38;
  const stripSize  = size === "sm" ? 5  : size === "lg" ? 9  : 7;
  const arrowSize  = size === "sm" ? 18 : size === "lg" ? 32 : 24;
  const fontSize   = size === "sm" ? 9  : size === "lg" ? 13 : 11;
  const isVertical = ["up","down","up2","down2"].includes(arrow);
  const isHoriz    = ["right","left","right2","left2"].includes(arrow);
  const isRotation = ["cw","ccw","cw2","ccw2"].includes(arrow);

  return (
    <div style={{
      display:       "flex",
      flexDirection: "column",
      alignItems:    "center",
      gap:           size === "sm" ? 4 : 8,
    }}>

      {/* ── Centre square with neighbour strips ── */}
      <div style={{
        display:       "flex",
        flexDirection: "column",
        alignItems:    "center",
        gap:           0,
      }}>

        {/* Top neighbour strip */}
        <div style={{
          width:           squareSize,
          height:          stripSize,
          background:      FACE_COLORS[neighbours.top],
          borderRadius:    "3px 3px 0 0",
        }} />

        <div style={{ display: "flex", alignItems: "center" }}>

          {/* Left neighbour strip */}
          <div style={{
            width:        stripSize,
            height:       squareSize,
            background:   FACE_COLORS[neighbours.left],
            borderRadius: "3px 0 0 3px",
          }} />

          {/* Centre square — face colour */}
          <div style={{
            width:      squareSize,
            height:     squareSize,
            background: faceColor,
            flexShrink: 0,
          }} />

          {/* Right neighbour strip */}
          <div style={{
            width:        stripSize,
            height:       squareSize,
            background:   FACE_COLORS[neighbours.right],
            borderRadius: "0 3px 3px 0",
          }} />

        </div>

        {/* Bottom neighbour strip */}
        <div style={{
          width:           squareSize,
          height:          stripSize,
          background:      FACE_COLORS[neighbours.bottom],
          borderRadius:    "0 0 3px 3px",
        }} />

      </div>

      {/* ── Arrow ── */}
      <div style={{
        display:    "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight:  arrowSize,
      }}>
        {renderArrow(arrow, arrowColor, arrowSize)}
      </div>

      {/* ── Label ── */}
      <span style={{
        color:      "#475569",
        fontSize:   fontSize,
        fontWeight: 500,
        textAlign:  "center",
        lineHeight: 1.3,
      }}>
        {label}
      </span>

    </div>
  );
}