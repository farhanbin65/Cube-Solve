import { getKociembaWasm } from "./wasmLoader";

const FACE_TO_COLOR = {
  U: "white", R: "red", F: "green",
  D: "yellow", L: "orange", B: "blue",
};

export function cubeStringToFaceColors(str) {
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

export function faceColorsToString(faceColors) {
  const order = ["U", "R", "F", "D", "L", "B"];
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
      if (!letter) return null;
      str += letter;
    }
  }
  return str;
}

async function getCubeClass() {
  const m = await getKociembaWasm();
  return m.Cube;
}

export async function createStateTracker() {
  const Cube = await getCubeClass();
  let cube = new Cube();
  // Tracks the last known faceColors — updated on load and after every move
  let _faceColors = cubeStringToFaceColors(cube.toString());

  return {
    applyMove(move) {
      const base = move[0];
      const times = move.includes("2") ? 2
                  : move.includes("'") ? 3
                  : 1;
      for (let i = 0; i < times; i++) cube.action(base);
      // Keep _faceColors in sync after every move
      _faceColors = cubeStringToFaceColors(cube.toString());
      return _faceColors;
    },

    reset() {
      cube = new Cube();
      _faceColors = cubeStringToFaceColors(cube.toString());
    },

    loadFromFaceColors(faceColors) {
      const cubeStr = faceColorsToString(faceColors);
      if (!cubeStr) {
        console.error("loadFromFaceColors: invalid faceColors");
        return false;
      }
      // Store both the raw string and faceColors
      this._loadedCubeStr = cubeStr;
      _faceColors = faceColors; // ← keep the exact incoming colors
      cube = new Cube();        // reset for future move tracking
      return true;
    },

    loadFromCubeString(cubeStr) {
      if (!cubeStr) {
        console.error("loadFromCubeString: missing cubeStr");
        return false;
      }
      try {
        cube = new Cube(cubeStr);
        _faceColors = cubeStringToFaceColors(cubeStr);
        this._loadedCubeStr = cubeStr;
        return true;
      } catch (err) {
        console.error("loadFromCubeString: invalid cubeStr", err);
        return false;
      }
    },

    // Always returns faceColors object — for 3D visual and Review screen
    getCurrentState() {
      return _faceColors;
    },

    // Returns raw kociemba string — for solver only
    getCurrentStateString() {
      if (this._loadedCubeStr) {
        const str = this._loadedCubeStr;
        this._loadedCubeStr = null;
        return str;
      }
      return cube.toString();
    },
  };
}