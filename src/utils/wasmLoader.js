let initPromise = null;
let mod = null;

export async function getKociembaWasm() {
  if (mod) return mod;
  if (!initPromise) {
    initPromise = (async () => {
      console.log("🟡 importing kociemba-wasm...");
      const m = await import("kociemba-wasm");
      console.log("🟡 imported, keys:", Object.keys(m));
      if (typeof m.init === "function") {
        console.log("🟡 calling init...");
        await m.init();
        console.log("🟡 init done");
      } else {
        console.log("🟡 no init function found");
      }
      mod = m;
      console.log("✅ kociemba-wasm ready");
    })();
  }
  await initPromise;
  return mod;
}