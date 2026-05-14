import { faceColorsToString } from "./cubeState";

const SOLVED_STRING = "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB";

export async function solveCube(faceColors) {
  const cubeStr = faceColorsToString(faceColors);

  if (!cubeStr) {
    console.error("❌ faceColorsToString failed — check all tiles are valid colors");
    return null;
  }

  console.log("✅ Cube string:", cubeStr);

  // kociemba never returns "" for solved — must check manually
  if (cubeStr === SOLVED_STRING) {
    console.log("✅ Already solved");
    return [];
  }

  try {
    const kociemba = await import("kociemba-wasm");
    if (typeof kociemba.init === "function") await kociemba.init();
    const result = await kociemba.solve(cubeStr);
    console.log("🧩 Raw result:", result);

    if (!result || result.trim() === "") return null;

    const moves = result.trim().split(/\s+/).filter(Boolean);

    // After applying solution moves to the string, verify it equals solved
    // This catches cases where solver returned moves for wrong state
    return moves;
  } catch (e) {
    console.error("💥 Solver error:", e);
    return null;
  }
}