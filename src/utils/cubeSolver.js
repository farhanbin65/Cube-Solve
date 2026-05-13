export async function solveCube(faceColors) {
  if (isCubeSolved(faceColors)) return [];

  const cubeStr = buildCubeString(faceColors);
  if (!cubeStr) {
    console.error("❌ buildCubeString failed");
    return null;
  }

  console.log("✅ Cube string:", cubeStr);

  try {
    const kociemba = await import("kociemba-wasm");
    if (typeof kociemba.init === "function") await kociemba.init();
    const result = await kociemba.solve(cubeStr);
    console.log("🧩 Raw result:", result);

    if (!result || result.trim() === "") {
      console.error("❌ Empty result = invalid cube state");
      return null;
    }

    return result.trim().split(/\s+/).filter(Boolean);
  } catch (e) {
    console.error("💥 Solver error:", e);
    return null;
  }
}

function isCubeSolved(faceColors) {
  for (const face of ["U","R","F","D","L","B"]) {
    const tiles = faceColors[face] || [];
    const centre = tiles[4];
    if (!centre) return false;
    if (!tiles.every(t => t === centre)) return false;
  }
  return true;
}

function buildCubeString(faceColors) {
  const order = ["U", "R", "F", "D", "L", "B"];

  const colourToLetter = {};
  for (const face of order) {
    const centre = faceColors[face]?.[4];
    if (centre && centre !== "unknown") colourToLetter[centre] = face;
  }
  if (Object.keys(colourToLetter).length !== 6) return null;

  let str = "";
  for (const face of order) {
    const tiles = faceColors[face] || [];
    for (let i = 0; i < 9; i++) {
      const letter = colourToLetter[tiles[i]];
      if (!letter) return null;
      str += letter;
    }
  }
  return str;
}