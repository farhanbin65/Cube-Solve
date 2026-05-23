import { faceColorsToString } from "./cubeState";
import { getKociembaWasm } from "./wasmLoader";

const SOLVED_STRING = "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB";

async function getKociemba() {
  return getKociembaWasm();
}

export async function solveCube(faceColorsOrString) {
  const cubeStr = typeof faceColorsOrString === "string"
    ? faceColorsOrString
    : faceColorsToString(faceColorsOrString);

  if (!cubeStr) {
    console.error("❌ faceColorsToString failed");
    return null;
  }

  console.log("✅ Cube string:", cubeStr);

  if (cubeStr === SOLVED_STRING) {
    console.log("✅ Already solved");
    return [];
  }

  const colorCounts = {};
  for (const c of cubeStr) colorCounts[c] = (colorCounts[c] || 0) + 1;
  console.log("Color counts:", colorCounts);

  const allValid = ["U","R","F","D","L","B"].every(f => colorCounts[f] === 9);
  if (!allValid) {
    console.error("❌ Invalid cube string:", colorCounts);
    return null;
  }

  try {
    const kociemba = await getKociemba();
    console.log("Sending to kociemba:", cubeStr);
    const result = await kociemba.solve(cubeStr);
    console.log("🧩 Raw result:", result);
    if (result === null || result === undefined) return null;
    if (result.trim() === "") return null;
    return result.trim().split(/\s+/).filter(Boolean);
  } catch (e) {
    console.error("💥 Solver error:", e);
    return null;
  }
}