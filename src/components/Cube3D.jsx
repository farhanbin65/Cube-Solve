import { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

const COLOR_HEX = {
  white:   "#f0f0eb",
  yellow:  "#ffd700",
  red:     "#d22828",
  orange:  "#ff6420",
  green:   "#1e7a3c",
  blue:    "#1e50b4",
  unknown: "#1e293b",
};
const BLACK = "#111118";
const ANIM_MS = 300;

const FACE_TO_COLOR = {
  U: "white", D: "yellow", R: "red",
  L: "orange", F: "green", B: "blue"
};

function getStickerColor(faceColors, x, y, z, direction) {
  let face, row, col;
  if      (direction === "+y" && y ===  1) { face = "U"; row = z+1;  col = x+1;  }
  else if (direction === "-y" && y === -1) { face = "D"; row = -z+1; col = x+1;  }
  else if (direction === "+x" && x ===  1) { face = "R"; row = -y+1; col = -z+1; }
  else if (direction === "-x" && x === -1) { face = "L"; row = -y+1; col = z+1;  }
  else if (direction === "+z" && z ===  1) { face = "F"; row = -y+1; col = x+1;  }
  else if (direction === "-z" && z === -1) { face = "B"; row = -y+1; col = -x+1; }
  else return BLACK;
  const idx = row * 3 + col;
  const tiles = faceColors?.[face] || [];
  return COLOR_HEX[tiles[idx]] || BLACK;
}

const MOVE_DEF = {
  "U":  { axis: "y", layer:  1, angle: -Math.PI/2 },
  "U'": { axis: "y", layer:  1, angle:  Math.PI/2 },
  "U2": { axis: "y", layer:  1, angle: -Math.PI   },
  "D":  { axis: "y", layer: -1, angle:  Math.PI/2 },
  "D'": { axis: "y", layer: -1, angle: -Math.PI/2 },
  "D2": { axis: "y", layer: -1, angle:  Math.PI   },
  "R":  { axis: "x", layer:  1, angle: -Math.PI/2 },
  "R'": { axis: "x", layer:  1, angle:  Math.PI/2 },
  "R2": { axis: "x", layer:  1, angle: -Math.PI   },
  "L":  { axis: "x", layer: -1, angle:  Math.PI/2 },
  "L'": { axis: "x", layer: -1, angle: -Math.PI/2 },
  "L2": { axis: "x", layer: -1, angle:  Math.PI   },
  "F":  { axis: "z", layer:  1, angle: -Math.PI/2 },
  "F'": { axis: "z", layer:  1, angle:  Math.PI/2 },
  "F2": { axis: "z", layer:  1, angle: -Math.PI   },
  "B":  { axis: "z", layer: -1, angle:  Math.PI/2 },
  "B'": { axis: "z", layer: -1, angle: -Math.PI/2 },
  "B2": { axis: "z", layer: -1, angle:  Math.PI   },
};

function buildInitialCubies(faceColors) {
  const cubies = [];
  const dirs = ["+x", "-x", "+y", "-y", "+z", "-z"];
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        const colors = dirs.map(d => getStickerColor(faceColors, x, y, z, d));
        cubies.push({
          id: `${x},${y},${z}`,
          pos: new THREE.Vector3(x, y, z),
          quat: new THREE.Quaternion(),
          colors,
        });
      }
    }
  }
  return cubies;
}

function snapVec(v) {
  return new THREE.Vector3(Math.round(v.x), Math.round(v.y), Math.round(v.z));
}

// ── Use world-space face normal to determine clicked face ──
// This is rotation-invariant: works correctly after any cube moves
function getClickedFace(event) {
  if (!event.face || !event.object) return null;

  // Transform the face normal from local to world space
  const normal = event.face.normal.clone();
  normal.transformDirection(event.object.matrixWorld);

  // Find which world axis it aligns with most
  const ax = Math.abs(normal.x);
  const ay = Math.abs(normal.y);
  const az = Math.abs(normal.z);

  if (ax > ay && ax > az) return normal.x > 0 ? "R" : "L";
  if (ay > ax && ay > az) return normal.y > 0 ? "U" : "D";
  return normal.z > 0 ? "F" : "B";
}

// ── CubieScene ─────────────────────────────────────────────
const CubieScene = forwardRef(function CubieScene({ faceColors, onStateChange }, ref) {
  const [cubies, setCubies] = useState(() => buildInitialCubies(faceColors));
  const anim = useRef(null);
  const groupRefs = useRef({});
  const queue = useRef([]);
  const busy = useRef(false);

  useEffect(() => {
    setCubies(buildInitialCubies(faceColors));
    queue.current = [];
    busy.current = false;
    anim.current = null;
  }, [faceColors]);

  useImperativeHandle(ref, () => ({
    applyMove: (move) => {
      const def = MOVE_DEF[move];
      if (!def) return;
      queue.current.push(def);
      processQueue();
    },
    reset: () => {
      setCubies(buildInitialCubies(faceColors));
      queue.current = [];
      busy.current = false;
      anim.current = null;
    },
    scramble: () => {
      const moves = Object.keys(MOVE_DEF);
      for (let i = 0; i < 20; i++) {
        queue.current.push(MOVE_DEF[moves[Math.floor(Math.random() * moves.length)]]);
      }
      processQueue();
    },
    getCurrentState: () => getCurrentCubeState(cubies),
  }));

  const getCurrentCubeState = (currentCubies) => {
    const faces = {
      U: Array(9).fill(null), R: Array(9).fill(null), F: Array(9).fill(null),
      D: Array(9).fill(null), L: Array(9).fill(null), B: Array(9).fill(null),
    };
    currentCubies.forEach(cubie => {
      const { pos, colors } = cubie;
      const [x, y, z] = [Math.round(pos.x), Math.round(pos.y), Math.round(pos.z)];
      if (y ===  1) { const idx = (-z+1)*3+(x+1); const n = getColorNameFromHex(colors[2]); if (n) faces.U[idx] = n; }
      if (y === -1) { const idx = ( z+1)*3+(x+1); const n = getColorNameFromHex(colors[3]); if (n) faces.D[idx] = n; }
      if (x ===  1) { const idx = (-y+1)*3+(-z+1); const n = getColorNameFromHex(colors[0]); if (n) faces.R[idx] = n; }
      if (x === -1) { const idx = (-y+1)*3+( z+1); const n = getColorNameFromHex(colors[1]); if (n) faces.L[idx] = n; }
      if (z ===  1) { const idx = (-y+1)*3+(x+1); const n = getColorNameFromHex(colors[4]); if (n) faces.F[idx] = n; }
      if (z === -1) { const idx = (-y+1)*3+(-x+1); const n = getColorNameFromHex(colors[5]); if (n) faces.B[idx] = n; }
    });
    for (const [face, stickers] of Object.entries(faces)) {
      for (let i = 0; i < 9; i++) {
        if (!stickers[i]) stickers[i] = FACE_TO_COLOR[face] || "white";
      }
    }
    return faces;
  };

  function getColorNameFromHex(hex) {
    for (const [name, colorHex] of Object.entries(COLOR_HEX)) {
      if (colorHex === hex) return name;
    }
    return null;
  }

  const processQueue = useCallback(() => {
    if (busy.current || queue.current.length === 0) return;
    busy.current = true;
    anim.current = { ...queue.current.shift(), elapsed: 0, done: false };
  }, []);

  const applyMoveToCube = useCallback((move) => {
    const def = MOVE_DEF[move];
    if (!def) return;
    queue.current.push(def);
    processQueue();
  }, [processQueue]);

  // ── Click handler: face normal → axis, cubie pos → layer ──
  const handleFaceClick = useCallback((face, cubie) => {
    const x = Math.round(cubie.pos.x);
    const y = Math.round(cubie.pos.y);
    const z = Math.round(cubie.pos.z);

    let move = null;
    if (face === "U" || face === "D") {
      if      (y ===  1) move = "U";
      else if (y === -1) move = "D";
      // y === 0: middle E-slice — skip (no standard single-letter move)
    } else if (face === "R" || face === "L") {
      if      (x ===  1) move = "R";
      else if (x === -1) move = "L";
      // x === 0: middle M-slice — skip
    } else if (face === "F" || face === "B") {
      if      (z ===  1) move = "F";
      else if (z === -1) move = "B";
      // z === 0: middle S-slice — skip
    }

    if (move) applyMoveToCube(move);
  }, [applyMoveToCube]);

  useFrame((_, delta) => {
    if (!anim.current) return;
    const a = anim.current;
    if (a.done) return;

    a.elapsed = (a.elapsed || 0) + delta * 1000;
    const t = Math.min(a.elapsed / ANIM_MS, 1);
    const ease = t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;
    const currentAngle = a.angle * ease;

    const axisVec = new THREE.Vector3(
      a.axis === "x" ? 1 : 0,
      a.axis === "y" ? 1 : 0,
      a.axis === "z" ? 1 : 0,
    );
    const rotQuat = new THREE.Quaternion().setFromAxisAngle(axisVec, currentAngle);

    cubies.forEach(c => {
      if (Math.round(c.pos[a.axis]) !== a.layer) return;
      const mesh = groupRefs.current[c.id];
      if (!mesh) return;
      const rotPos = c.pos.clone().applyQuaternion(rotQuat);
      mesh.position.set(rotPos.x, rotPos.y, rotPos.z);
      mesh.quaternion.copy(rotQuat.clone().multiply(c.quat));
    });

    if (t >= 1) {
      a.done = true;
      anim.current = null;
      const axisVec2 = new THREE.Vector3(
        a.axis === "x" ? 1 : 0,
        a.axis === "y" ? 1 : 0,
        a.axis === "z" ? 1 : 0,
      );
      const finalQuat = new THREE.Quaternion().setFromAxisAngle(axisVec2, a.angle);
      setCubies(prev => {
        const newCubies = prev.map(c => {
          if (Math.round(c.pos[a.axis]) !== a.layer) return c;
          return {
            ...c,
            pos: snapVec(c.pos.clone().applyQuaternion(finalQuat)),
            quat: finalQuat.clone().multiply(c.quat),
          };
        });
        if (onStateChange) onStateChange(getCurrentCubeState(newCubies));
        return newCubies;
      });
      busy.current = false;
      processQueue();
    }
  });

  return (
    <group>
      {cubies.map(c => (
        <CubieMesh
          key={c.id}
          cubie={c}
          meshRef={el => { groupRefs.current[c.id] = el; }}
          onFaceClick={handleFaceClick}
        />
      ))}
    </group>
  );
});

// ── CubieMesh ──────────────────────────────────────────────
function CubieMesh({ cubie, meshRef, onFaceClick }) {
  const { pos, quat, colors } = cubie;
  const size = 0.97;
  const meshRef_local = useRef();

  useEffect(() => {
    if (meshRef) meshRef(meshRef_local.current);
  }, [meshRef]);

  const handleClick = (event) => {
    event.stopPropagation();
    const face = getClickedFace(event); // world-space normal
    if (face && onFaceClick) onFaceClick(face, cubie);
  };

  return (
    <mesh
      ref={meshRef_local}
      position={[pos.x, pos.y, pos.z]}
      quaternion={[quat.x, quat.y, quat.z, quat.w]}
      castShadow
      onClick={handleClick}
    >
      <boxGeometry args={[size, size, size]} />
      {colors.map((col, i) => (
        <meshStandardMaterial
          key={i}
          attach={`material-${i}`}
          color={col}
          roughness={0.55}
          metalness={0.05}
        />
      ))}
    </mesh>
  );
}

// ── Main export ────────────────────────────────────────────
const Cube3D = forwardRef(function Cube3D({ faceColors, onStateChange }, ref) {
  const sceneRef = useRef();

  useImperativeHandle(ref, () => ({
    applyMove: (move) => sceneRef.current?.applyMove(move),
    reset: () => sceneRef.current?.reset(),
    scramble: () => sceneRef.current?.scramble(),
    getCurrentState: () => sceneRef.current?.getCurrentState(),
  }));

  return (
    <Canvas
      shadows
      camera={{ position: [4, 4, 6], fov: 35 }}
      style={{ background: "#0a0a0f", width: "100%", height: "100%" }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 8, 5]} intensity={0.9} castShadow />
      <directionalLight position={[-5, 3, -5]} intensity={0.3} />

      <CubieScene ref={sceneRef} faceColors={faceColors} onStateChange={onStateChange} />

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={4}
        maxDistance={12}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI * 5 / 6}
      />
    </Canvas>
  );
});

export default Cube3D;