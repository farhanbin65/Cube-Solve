import { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// ── Constants ──────────────────────────────────────────────

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

// Color name to face letter mapping
const COLOR_TO_FACE = {
  white: "U",
  yellow: "D",
  red: "R",
  orange: "L",
  green: "F",
  blue: "B"
};

// Face letter to color name
const FACE_TO_COLOR = {
  U: "white",
  D: "yellow",
  R: "red",
  L: "orange",
  F: "green",
  B: "blue"
};

// ── Sticker colour from faceColors ─────────────────────────

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

// ── Move definitions ───────────────────────────────────────

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

// ── Build initial cubie state from faceColors ──────────────

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

// ── CubieScene ───────────────────────────────────────────────

const CubieScene = forwardRef(function CubieScene({ faceColors, onStateChange, onFaceClick }, ref) {
  const [cubies, setCubies] = useState(() => buildInitialCubies(faceColors));
  const [selectedFace, setSelectedFace] = useState(null);
  const [rotationDirection, setRotationDirection] = useState(null);
  const anim = useRef(null);
  const groupRefs = useRef({});
  const queue = useRef([]);
  const busy = useRef(false);

  // Re-init when faceColors prop changes
  useEffect(() => {
    setCubies(buildInitialCubies(faceColors));
    queue.current = [];
    busy.current = false;
    anim.current = null;
  }, [faceColors]);

  // Expose methods to parent
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
      const count = 20;
      for (let i = 0; i < count; i++) {
        queue.current.push(MOVE_DEF[moves[Math.floor(Math.random() * moves.length)]]);
      }
      processQueue();
    },
    getCurrentState: () => {
      return getCurrentCubeState(cubies);
    }
  }));

  const getCurrentCubeState = (currentCubies) => {
    const faces = { U: Array(9).fill(null), R: Array(9).fill(null), F: Array(9).fill(null), D: Array(9).fill(null), L: Array(9).fill(null), B: Array(9).fill(null) };
    
    currentCubies.forEach(cubie => {
      const { pos, colors } = cubie;
      const [x, y, z] = [Math.round(pos.x), Math.round(pos.y), Math.round(pos.z)];
      
      // U face (y = 1)
      if (y === 1) {
        const col = x + 1;
        const row = -z + 1;
        const idx = row * 3 + col;
        const colorName = getColorNameFromHex(colors[2]);
        if (colorName) faces.U[idx] = colorName;
      }
      // D face (y = -1)
      if (y === -1) {
        const col = x + 1;
        const row = z + 1;
        const idx = row * 3 + col;
        const colorName = getColorNameFromHex(colors[3]);
        if (colorName) faces.D[idx] = colorName;
      }
      // R face (x = 1)
      if (x === 1) {
        const col = -z + 1;
        const row = -y + 1;
        const idx = row * 3 + col;
        const colorName = getColorNameFromHex(colors[0]);
        if (colorName) faces.R[idx] = colorName;
      }
      // L face (x = -1)
      if (x === -1) {
        const col = z + 1;
        const row = -y + 1;
        const idx = row * 3 + col;
        const colorName = getColorNameFromHex(colors[1]);
        if (colorName) faces.L[idx] = colorName;
      }
      // F face (z = 1)
      if (z === 1) {
        const col = x + 1;
        const row = -y + 1;
        const idx = row * 3 + col;
        const colorName = getColorNameFromHex(colors[4]);
        if (colorName) faces.F[idx] = colorName;
      }
      // B face (z = -1)
      if (z === -1) {
        const col = -x + 1;
        const row = -y + 1;
        const idx = row * 3 + col;
        const colorName = getColorNameFromHex(colors[5]);
        if (colorName) faces.B[idx] = colorName;
      }
    });
    
    // Validate all positions are filled
    for (const [face, stickers] of Object.entries(faces)) {
      for (let i = 0; i < 9; i++) {
        if (!stickers[i]) {
          console.warn(`Missing sticker at ${face}[${i}]`);
          stickers[i] = FACE_TO_COLOR[face] || "white";
        }
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
    const def = queue.current.shift();
    startAnim(def);
  }, []);

  const startAnim = useCallback((def) => {
    anim.current = { ...def, elapsed: 0, done: false };
  }, []);

  const applyMoveToCube = useCallback((move) => {
    const def = MOVE_DEF[move];
    if (!def) return;
    queue.current.push(def);
    processQueue();
  }, [processQueue]);

  function getMoveFromFace(face) {
    // For now, rotate clockwise on click.
    const moves = {
      U: "U",
      D: "D",
      R: "R",
      L: "L",
      F: "F",
      B: "B",
    };
    return moves[face];
  }

  const handleFaceClick = useCallback((face, cubie) => {
    console.log(`Clicked face: ${face}`);
    setSelectedFace(face);
    setRotationDirection("clockwise");

    if (onFaceClick) {
      onFaceClick(face, cubie);
    }

    const move = getMoveFromFace(face);
    if (move) {
      applyMoveToCube(move);
    }
  }, [applyMoveToCube, onFaceClick]);

  useEffect(() => {
    if (selectedFace) {
      console.log(`Selected face updated: ${selectedFace}`, rotationDirection);
    }
  }, [selectedFace, rotationDirection]);

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
      const layerVal = Math.round(c.pos[a.axis]);
      if (layerVal !== a.layer) return;
      const mesh = groupRefs.current[c.id];
      if (!mesh) return;

      const rotPos = c.pos.clone().applyQuaternion(rotQuat);
      mesh.position.set(rotPos.x, rotPos.y, rotPos.z);
      const newQuat = rotQuat.clone().multiply(c.quat);
      mesh.quaternion.copy(newQuat);
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
          const layerVal = Math.round(c.pos[a.axis]);
          if (layerVal !== a.layer) return c;
          const newPos = snapVec(c.pos.clone().applyQuaternion(finalQuat));
          const newQuat = finalQuat.clone().multiply(c.quat);
          return { ...c, pos: newPos, quat: newQuat };
        });
        
        // Notify parent of state change
        if (onStateChange) {
          onStateChange(getCurrentCubeState(newCubies));
        }
        
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

// ── Helper: determine which face was clicked ──────────────

function getClickedFace(event, mesh) {
  // Get the intersection point
  const point = event.point;
  // Convert from world to local coordinates
  const localPoint = mesh.worldToLocal(point.clone());
  
  // Determine which face based on the largest absolute coordinate
  const absX = Math.abs(localPoint.x);
  const absY = Math.abs(localPoint.y);
  const absZ = Math.abs(localPoint.z);
  
  if (absX > absY && absX > absZ) {
    return localPoint.x > 0 ? 'R' : 'L';
  } else if (absY > absX && absY > absZ) {
    return localPoint.y > 0 ? 'U' : 'D';
  } else {
    return localPoint.z > 0 ? 'F' : 'B';
  }
}

// ── CubieMesh ──────────────────────────────────────────────

function CubieMesh({ cubie, meshRef, onFaceClick }) {
  const { pos, quat, colors } = cubie;
  const gap = 0.03;
  const size = 1 - gap;
  const meshRef_local = useRef();

  useEffect(() => {
    if (meshRef) meshRef(meshRef_local.current);
  }, [meshRef]);

  const handleClick = (event) => {
    event.stopPropagation();
    // Calculate which face was clicked
    const face = getClickedFace(event, meshRef_local.current);
    if (face && onFaceClick) {
      onFaceClick(face, cubie);
    }
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
      />
    </Canvas>
  );
});

export default Cube3D;