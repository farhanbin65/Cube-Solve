// MoveDiagram.jsx — Arrow drawn ON the cube face, on the correct layer

const FACE_COLORS = {
  white:  "#f0f0eb",
  yellow: "#ffd700",
  red:    "#d22828",
  orange: "#ff6420",
  green:  "#1e7a3c",
  blue:   "#1e50b4",
  dark:   "#0f172a",
};

// For each move: which face to show as FRONT (facing user), what's on top,
// which row/col gets the arrow, and arrow direction
const MOVE_VISUAL = {
  // U moves — white on top, show green front face, TOP ROW gets arrow
  "U":  { front:"green", top:"white", left:"orange", right:"red", bottom:"yellow", highlight:"row0", arrow:"left"  },
  "U'": { front:"green", top:"white", left:"orange", right:"red", bottom:"yellow", highlight:"row0", arrow:"right" },
  "U2": { front:"green", top:"white", left:"orange", right:"red", bottom:"yellow", highlight:"row0", arrow:"left2" },

  "D":  { front:"green", top:"white", left:"orange", right:"red", bottom:"yellow", highlight:"row2", arrow:"right" },
  "D'": { front:"green", top:"white", left:"orange", right:"red", bottom:"yellow", highlight:"row2", arrow:"left"  },
  "D2": { front:"green", top:"white", left:"orange", right:"red", bottom:"yellow", highlight:"row2", arrow:"right2"},

  // R moves — red on right, show green front, RIGHT COL gets arrow
  "R":  { front:"green", top:"white", left:"orange", right:"red",   bottom:"yellow", highlight:"col2", arrow:"up"   },
  "R'": { front:"green", top:"white", left:"orange", right:"red",   bottom:"yellow", highlight:"col2", arrow:"down" },
  "R2": { front:"green", top:"white", left:"orange", right:"red",   bottom:"yellow", highlight:"col2", arrow:"up2"  },

  // L moves — orange on left, show green front, LEFT COL gets arrow
  "L":  { front:"green", top:"white", left:"orange", right:"red",   bottom:"yellow", highlight:"col0", arrow:"down" },
  "L'": { front:"green", top:"white", left:"orange", right:"red",   bottom:"yellow", highlight:"col0", arrow:"up"   },
  "L2": { front:"green", top:"white", left:"orange", right:"red",   bottom:"yellow", highlight:"col0", arrow:"down2"},

  // F moves — green face rotates, show green front, WHOLE FACE gets arrow
  "F":  { front:"green", top:"white", left:"orange", right:"red",   bottom:"yellow", highlight:"face", arrow:"cw"   },
  "F'": { front:"green", top:"white", left:"orange", right:"red",   bottom:"yellow", highlight:"face", arrow:"ccw"  },
  "F2": { front:"green", top:"white", left:"orange", right:"red",   bottom:"yellow", highlight:"face", arrow:"cw2"  },

  // B moves — show blue face as front so user can see it, WHOLE FACE gets arrow
  "B":  { front:"blue", top:"white", left:"orange", right:"red",   bottom:"yellow", highlight:"face", arrow:"cw"  },
  "B'": { front:"blue", top:"white", left:"orange", right:"red",   bottom:"yellow", highlight:"face", arrow:"ccw" },
  "B2": { front:"blue", top:"white", left:"orange", right:"red",   bottom:"yellow", highlight:"face", arrow:"cw2" },
};

// Which cells belong to each highlight zone
const HIGHLIGHT_CELLS = {
  row0: [0,1,2],
  row2: [6,7,8],
  col0: [0,3,6],
  col2: [2,5,8],
  face: [0,1,2,3,4,5,6,7,8],
};

function ArrowSVG({ arrow, cellSize, gridSize }) {
  const s   = cellSize;
  const g   = gridSize;
  const mid = g / 2;
  const pad = s * 0.18;
  const stroke = "#fff";
  const sw = Math.max(2.5, s * 0.1);
  const head = s * 0.28;

  const Line = ({ x1,y1,x2,y2 }) => (
    <line x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={stroke} strokeWidth={sw} strokeLinecap="round"/>
  );
  const Head = ({ points }) => (
    <polyline points={points} fill="none"
      stroke={stroke} strokeWidth={sw}
      strokeLinecap="round" strokeLinejoin="round"/>
  );

  // ── ROW ARROWS ──────────────────────────────────────────────
  if (arrow === "right" || arrow === "right2") {
    const y = s * 0.5;
    return <>
      <Line x1={pad} y1={y} x2={g-pad} y2={y}/>
      <Head points={`${g-pad-head},${y-head/2} ${g-pad},${y} ${g-pad-head},${y+head/2}`}/>
      {arrow==="right2" && <text x={g/2} y={y-s*0.15} textAnchor="middle"
        fill={stroke} fontSize={s*0.38} fontWeight="900">×2</text>}
    </>;
  }
  if (arrow === "left" || arrow === "left2") {
    const y = s * 0.5;
    return <>
      <Line x1={g-pad} y1={y} x2={pad} y2={y}/>
      <Head points={`${pad+head},${y-head/2} ${pad},${y} ${pad+head},${y+head/2}`}/>
      {arrow==="left2" && <text x={g/2} y={y-s*0.15} textAnchor="middle"
        fill={stroke} fontSize={s*0.38} fontWeight="900">×2</text>}
    </>;
  }

  // ── COL ARROWS ──────────────────────────────────────────────
  // up = R2 (col2): offset ×2 LEFT to avoid clipping
  if (arrow === "up" || arrow === "up2") {
    const x = s * 0.5;
    return <>
      <Line x1={x} y1={g-pad} x2={x} y2={pad}/>
      <Head points={`${x-head/2},${pad+head} ${x},${pad} ${x+head/2},${pad+head}`}/>
      {arrow==="up2" && (
        <text
          x={x - s * 0.42}
          y={g / 2}
          textAnchor="end"
          dominantBaseline="middle"
          fill={stroke}
          fontSize={s*0.38}
          fontWeight="900"
        >×2</text>
      )}
    </>;
  }
  // down = L2 (col0): offset ×2 RIGHT
  if (arrow === "down" || arrow === "down2") {
    const x = s * 0.5;
    return <>
      <Line x1={x} y1={pad} x2={x} y2={g-pad}/>
      <Head points={`${x-head/2},${g-pad-head} ${x},${g-pad} ${x+head/2},${g-pad-head}`}/>
      {arrow==="down2" && (
        <text
          x={x + s * 0.42}
          y={g / 2}
          textAnchor="start"
          dominantBaseline="middle"
          fill={stroke}
          fontSize={s*0.38}
          fontWeight="900"
        >×2</text>
      )}
    </>;
  }

  // ── FACE ARROWS (F / B moves) ────────────────────────────────
  if (arrow === "cw" || arrow === "cw2") {
    const r = g * 0.28;
    const cx = mid, cy = mid;
    const endAngleDeg = 200;
    const endRad = (endAngleDeg * Math.PI) / 180;
    const ex = cx + r * Math.cos(endRad);
    const ey = cy + r * Math.sin(endRad);
    const tx = -Math.sin(endRad);
    const ty =  Math.cos(endRad);
    const arrowAngle = Math.atan2(ty, tx) * (180 / Math.PI);
    return <>
      <path
        d={`M ${cx},${cy - r} A ${r},${r} 0 1 1 ${ex},${ey}`}
        fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round"
      />
      <g transform={`translate(${ex},${ey}) rotate(${arrowAngle})`}>
        <polygon
          points={`${head*0.9},0 ${-head*0.5},${-head*0.55} ${-head*0.5},${head*0.55}`}
          fill={stroke}
        />
      </g>
      {arrow==="cw2" && (
        <text x={cx + r*0.25} y={cy + r*0.35} textAnchor="middle"
          fill={stroke} fontSize={s*0.36} fontWeight="900">×2</text>
      )}
    </>;
  }
  if (arrow === "ccw" || arrow === "ccw2") {
    const r = g * 0.28;
    const cx = mid, cy = mid;
    const startAngleDeg = 200;
    const startRad = (startAngleDeg * Math.PI) / 180;
    const sx = cx + r * Math.cos(startRad);
    const sy = cy + r * Math.sin(startRad);
    const endRad = (270 * Math.PI) / 180;
    const ex = cx + r * Math.cos(endRad);
    const ey = cy + r * Math.sin(endRad);
    const tx = Math.sin(endRad);
    const ty = -Math.cos(endRad);
    const arrowAngle = Math.atan2(ty, tx) * (180 / Math.PI);
    return <>
      <path
        d={`M ${sx},${sy} A ${r},${r} 0 1 0 ${ex},${ey}`}
        fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round"
      />
      <g transform={`translate(${ex},${ey}) rotate(${arrowAngle})`}>
        <polygon
          points={`${head*0.9},0 ${-head*0.5},${-head*0.55} ${-head*0.5},${head*0.55}`}
          fill={stroke}
        />
      </g>
      {arrow==="ccw2" && (
        <text x={cx + r*0.25} y={cy + r*0.35} textAnchor="middle"
          fill={stroke} fontSize={s*0.36} fontWeight="900">×2</text>
      )}
    </>;
  }

  return null;
}
export default function MoveDiagram({ move, size = "md" }) {
  const meta = MOVE_VISUAL[move];
  if (!meta) return null;

  const { front, top, left, right, bottom, highlight, arrow } = meta;
  const highlightCells = HIGHLIGHT_CELLS[highlight] || [];

  // Size config
  const cellSize  = size === "sm" ? 26 : size === "lg" ? 52 : 38;
  const gap       = size === "sm" ? 2  : size === "lg" ? 4  : 3;
  const stripSize = size === "sm" ? 7  : size === "lg" ? 14 : 10;
  const gridSize  = cellSize * 3 + gap * 2;

  // Build 9 cells — front face colour unless highlighted
  const cells = Array(9).fill(null).map((_, i) => {
    const isHighlighted = highlightCells.includes(i);
    return {
      color: FACE_COLORS[front],
      highlighted: isHighlighted,
    };
  });

  const col = (i) => i % 3;
  const row = (i) => Math.floor(i / 3);

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap: size==="sm"?4:10 }}>

      {/* Top strip */}
      <div style={{
        width: gridSize,
        height: stripSize,
        background: FACE_COLORS[top],
        borderRadius: "5px 5px 0 0",
        marginBottom: -1,
      }}/>

      <div style={{ display:"flex", alignItems:"center" }}>

        {/* Left strip */}
        <div style={{
          width: stripSize,
          height: gridSize,
          background: FACE_COLORS[left],
          borderRadius: "5px 0 0 5px",
          marginRight: -1,
        }}/>

        {/* SVG grid — cells + arrow overlay */}
        <svg
          width={gridSize}
          height={gridSize}
          style={{ display:"block", flexShrink:0 }}
        >
          {/* Cell backgrounds */}
          {cells.map(({ color, highlighted }, i) => {
            const x = col(i) * (cellSize + gap);
            const y = row(i) * (cellSize + gap);
            return (
              <g key={i}>
                <rect
                  x={x} y={y}
                  width={cellSize} height={cellSize}
                  fill={color}
                  rx={size==="lg"?4:2}
                />
                {/* Dim overlay on non-highlighted cells (for row/col moves) */}
                {highlight !== "face" && !highlighted && (
                  <rect
                    x={x} y={y}
                    width={cellSize} height={cellSize}
                    fill="rgba(0,0,0,0.42)"
                    rx={size==="lg"?4:2}
                  />
                )}
              </g>
            );
          })}

          {/* Arrow drawn in SVG coordinate space of the highlighted zone */}
          {highlight === "row0" && (
            <g transform={`translate(0, 0)`}>
              <ArrowSVG arrow={arrow} cellSize={cellSize} gridSize={gridSize}/>
            </g>
          )}
          {highlight === "row2" && (
            <g transform={`translate(0, ${2*(cellSize+gap)})`}>
              <ArrowSVG arrow={arrow} cellSize={cellSize} gridSize={gridSize}/>
            </g>
          )}
          {highlight === "col0" && (
            <g transform={`translate(0, 0)`}>
              <ArrowSVG arrow={arrow} cellSize={cellSize} gridSize={gridSize}/>
            </g>
          )}
          {highlight === "col2" && (
            <g transform={`translate(${2*(cellSize+gap)}, 0)`}>
              <ArrowSVG arrow={arrow} cellSize={cellSize} gridSize={gridSize}/>
            </g>
          )}
          {highlight === "face" && (
            <ArrowSVG arrow={arrow} cellSize={cellSize} gridSize={gridSize}/>
          )}
        </svg>

        {/* Right strip */}
        <div style={{
          width: stripSize,
          height: gridSize,
          background: FACE_COLORS[right],
          borderRadius: "0 5px 5px 0",
          marginLeft: -1,
        }}/>

      </div>

      {/* Bottom strip */}
      <div style={{
        width: gridSize,
        height: stripSize,
        background: FACE_COLORS[bottom],
        borderRadius: "0 0 5px 5px",
        marginTop: -1,
      }}/>

    </div>
  );
}