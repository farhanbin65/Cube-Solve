import { faceColorsToString } from "./cubeState";

const SOLVED_STRING = "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB";

export async function solveCube(faceColors, tracker = null) {
  // If tracker has a directly loaded string, use it (bypasses broken Cube constructor)
  const cubeStr = tracker?.getLoadedCubeStr() || faceColorsToString(faceColors);

  if (!cubeStr) {
    console.error("❌ faceColorsToString failed");
    return null;
  }

  console.log("✅ Cube string:", cubeStr);

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
    return result.trim().split(/\s+/).filter(Boolean);
  } catch (e) {
    console.error("💥 Solver error:", e);
    return null;
  }
}