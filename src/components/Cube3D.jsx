import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// Colour map matching your existing palette
const COLOR_HEX = {
  white:  "#f0f0eb",
  yellow: "#ffd700",
  red:    "#d22828",
  orange: "#ff6420",
  green:  "#1e7a3c",
  blue:   "#1e50b4",
  unknown: "#1e293b",
};

const BLACK = "#0a0a0f";

// ─────────────────────────────────────────────────────────────
// Sticker mapping
//
// For each cubie at position (x, y, z) where each coord is -1, 0, or 1,
// determine which face of `faceColors` and which tile index (0-8) shows
// on each of its 6 sides.
//
// Face tile index layout (looking at the face from outside):
//   0 1 2
//   3 4 5
//   6 7 8
//
// faceColors keys: U (top, y=+1), D (bottom, y=-1),
//                   R (right, x=+1), L (left, x=-1),
//                   F (front, z=+1), B (back, z=-1)
//
// Each cubie face direction maps to ONE face of the cube based on the
// cubie's position on that axis. The tile index within that face
// depends on the OTHER two coords.
// ─────────────────────────────────────────────────────────────

function getStickerColor(faceColors, x, y, z, direction) {
  // direction is one of "+x", "-x", "+y", "-y", "+z", "-z"
  // Returns the colour for that sticker, or null if it's an interior face (black)

  let face, row, col;

  if (direction === "+y" && y === 1) {
    // U face — looking down at the top from above
    // U tile layout: row 0 is the back (z = -1), row 2 is the front (z = +1)
    //                col 0 is the left (x = -1), col 2 is the right (x = +1)
    face = "U";
    row = z + 1;   // z=-1 -> 0, z=0 -> 1, z=+1 -> 2
    col = x + 1;   // x=-1 -> 0, x=0 -> 1, x=+1 -> 2
  } else if (direction === "-y" && y === -1) {
    // D face — looking up at the bottom from below
    // Standard kociemba layout: row 0 at front, row 2 at back
    face = "D";
    row = -z + 1;  // z=+1 -> 0, z=0 -> 1, z=-1 -> 2
    col = x + 1;
  } else if (direction === "+x" && x === 1) {
    // R face — looking at the right side from the right
    // row 0 at top (y=+1), col 0 at front (z=+1)... actually:
    // standard: row 0 top, row 2 bottom; col 0 is the side closer to F (z=+1)
    face = "R";
    row = -y + 1;  // y=+1 -> 0, y=-1 -> 2
    col = -z + 1;  // z=+1 -> 0, z=-1 -> 2
  } else if (direction === "-x" && x === -1) {
    // L face — looking at the left side from the left
    face = "L";
    row = -y + 1;
    col = z + 1;   // z=-1 -> 0, z=+1 -> 2
  } else if (direction === "+z" && z === 1) {
    // F face — looking at the front
    face = "F";
    row = -y + 1;
    col = x + 1;
  } else if (direction === "-z" && z === -1) {
    // B face — looking at the back from behind
    // The review screen stores B "read right to left" with yellow on top
    // Top row of grid = top in real world means row 0 = bottom (y=-1)?
    // The user's instruction is "Yellow on top, read right to left"
    // So grid (row 0, col 0) maps to physical (top, right when viewed from front)
    // Which means from behind: (row 0, col 0) = (y=+1, x=+1)
    face = "B";
    row = -y + 1;
    col = -x + 1;  // mirrored
  } else {
    return null; // interior face
  }

  const tileIndex = row * 3 + col;
  const tiles = faceColors?.[face] || [];
  const colour = tiles[tileIndex] || "unknown";
  return COLOR_HEX[colour] || COLOR_HEX.unknown;
}

// ─────────────────────────────────────────────────────────────
// Cubie — a single small cube with 6 materials
// ─────────────────────────────────────────────────────────────

function Cubie({ x, y, z, faceColors }) {
  // Three.js material order for BoxGeometry: +x, -x, +y, -y, +z, -z
  const directions = ["+x", "-x", "+y", "-y", "+z", "-z"];

  const materials = directions.map((dir, i) => {
    const colour = getStickerColor(faceColors, x, y, z, dir);
    return (
      <meshStandardMaterial
        key={i}
        attach={`material-${i}`}
        color={colour || BLACK}
        roughness={0.6}
        metalness={0.05}
      />
    );
  });

  const gap = 0.04;
  const size = 1 - gap;

  return (
    <mesh position={[x, y, z]} castShadow receiveShadow>
      <boxGeometry args={[size, size, size]} />
      {materials}
    </mesh>
  );
}

// ─────────────────────────────────────────────────────────────
// CubeGroup — all 27 cubies
// ─────────────────────────────────────────────────────────────

function CubeGroup({ faceColors }) {
  const cubies = [];
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        cubies.push(
          <Cubie
            key={`${x},${y},${z}`}
            x={x}
            y={y}
            z={z}
            faceColors={faceColors}
          />
        );
      }
    }
  }
  return <group>{cubies}</group>;
}

// ─────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────

export default function Cube3D({ faceColors }) {
  return (
    <Canvas
      shadows
      camera={{ position: [4, 4, 6], fov: 35 }}
      style={{ background: "#0a0a0f" }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={0.9}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-5, 3, -5]} intensity={0.3} />

      {/* The cube */}
      <CubeGroup faceColors={faceColors} />

      {/* Camera controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={4}
        maxDistance={12}
        autoRotate={false}
      />
    </Canvas>
  );
}