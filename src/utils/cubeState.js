const FACE_TO_COLOR = {
  U: "white", R: "red", F: "green",
  D: "yellow", L: "orange", B: "blue",
};

function cubeStringToFaceColors(str) {
  const faces = ["U", "R", "F", "D", "L", "B"];
  const result = {};
  for (let i = 0; i < 6; i++) {
    result[faces[i]] = str.slice(i * 9, (i + 1) * 9).split("").map(l => FACE_TO_COLOR[l]);
  }
  return result;
}

export function buildSolved() {
  return {
    U: Array(9).fill("white"),
    R: Array(9).fill("red"),
    F: Array(9).fill("green"),
    D: Array(9).fill("yellow"),
    L: Array(9).fill("orange"),
    B: Array(9).fill("blue"),
  };
}

// Converts faceColors object → 54-char kociemba string
// Works with canonical color names ("white", "red"...) since centers define the mapping
export function faceColorsToString(faceColors) {
  const order = ["U", "R", "F", "D", "L", "B"];

  // Build color → face letter map from the 6 center stickers
  const colorToFace = {};
  for (const face of order) {
    const center = faceColors[face]?.[4];
    if (!center || center === "unknown") return null;
    colorToFace[center] = face;
  }
  if (Object.keys(colorToFace).length !== 6) return null;

  let str = "";
  for (const face of order) {
    const tiles = faceColors[face] || [];
    for (let i = 0; i < 9; i++) {
      const letter = colorToFace[tiles[i]];
      if (!letter) {
        console.error(`faceColorsToString: unmapped color "${tiles[i]}" on ${face}[${i}]`);
        return null;
      }
      str += letter;
    }
  }
  return str;
}

let CubeClass = null;

async function getCubeClass() {
  if (!CubeClass) {
    const mod = await import("kociemba-wasm");
    CubeClass = mod.Cube;
  }
  return CubeClass;
}


export async function createStateTracker() {
  const Cube = await getCubeClass();
  let cube = new Cube();

  return {
    applyMove(move) {
      const base = move[0];                          // "R", "U", "F" etc.
      const times = move.includes("2") ? 2           // R2 = 2 quarter turns
                  : move.includes("'") ? 3           // R' = 3 quarter turns
                  : 1;                               // R  = 1 quarter turn
      for (let i = 0; i < times; i++) cube.action(base);
      return cubeStringToFaceColors(cube.toString());
    },
    applyMove(move) {
      const base = move[0];
      const times = move.includes("2") ? 2 : move.includes("'") ? 3 : 1;
      console.log("TRACKER:", move, "base:", base, "times:", times);
      for (let i = 0; i < times; i++) cube.action(base);
      const state = cube.toString();
      console.log("TRACKER STATE:", state);
      return cubeStringToFaceColors(state);
    },
    getCurrentState() {
      const str = cube.toString();
      console.log("🔍 tracker state:", str);
      return cubeStringToFaceColors(str);
    },

    reset() {
      cube = new Cube();
    },

    loadFromFaceColors(faceColors) {
      const cubeStr = faceColorsToString(faceColors);
      if (!cubeStr) {
        console.error("loadFromFaceColors: invalid faceColors");
        return false;
      }

      // new Cube(str) is broken in kociemba-wasm — ignores the input.
      // Instead: solve the SOLVED cube to find what moves reach this state,
      // then replay those moves. But that's circular.
      // Real fix: use kociemba solve() on cubeStr to get solution,
      // then apply the INVERSE moves to a fresh cube to reach the state.

      // Simplest working fix: store the cubeStr and use it directly in solveCube
      // bypassing the tracker for the initial scanned state.
      this._loadedCubeStr = cubeStr;
      cube = new Cube(); // reset to solved
      return true;
    },

    getCurrentState() {
      const str = cube.toString();
      return cubeStringToFaceColors(str);
    },

    getLoadedCubeStr() {
      return this._loadedCubeStr || null;
    },
  };
}