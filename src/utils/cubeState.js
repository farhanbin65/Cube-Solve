function rotateCW(t) {
  return [t[6],t[3],t[0], t[7],t[4],t[1], t[8],t[5],t[2]];
}

function clone(fc) {
  const r = {};
  for (const k of Object.keys(fc)) r[k] = [...fc[k]];
  return r;
}

function applyCW(fc, base) {
  const r = clone(fc);
  switch (base) {
    case "U":
      r.U = rotateCW(fc.U);
      [r.R[0],r.R[1],r.R[2]] = [fc.B[0],fc.B[1],fc.B[2]];
      [r.F[0],r.F[1],r.F[2]] = [fc.R[0],fc.R[1],fc.R[2]];
      [r.L[0],r.L[1],r.L[2]] = [fc.F[0],fc.F[1],fc.F[2]];
      [r.B[0],r.B[1],r.B[2]] = [fc.L[0],fc.L[1],fc.L[2]];
      break;
    case "D":
      r.D = rotateCW(fc.D);
      [r.F[6],r.F[7],r.F[8]] = [fc.R[6],fc.R[7],fc.R[8]];
      [r.L[6],r.L[7],r.L[8]] = [fc.F[6],fc.F[7],fc.F[8]];
      [r.B[6],r.B[7],r.B[8]] = [fc.L[6],fc.L[7],fc.L[8]];
      [r.R[6],r.R[7],r.R[8]] = [fc.B[6],fc.B[7],fc.B[8]];
      break;
    case "R":
      r.R = rotateCW(fc.R);
      [r.U[2],r.U[5],r.U[8]] = [fc.F[2],fc.F[5],fc.F[8]];
      [r.F[2],r.F[5],r.F[8]] = [fc.D[2],fc.D[5],fc.D[8]];
      [r.D[2],r.D[5],r.D[8]] = [fc.B[6],fc.B[3],fc.B[0]];
      [r.B[0],r.B[3],r.B[6]] = [fc.U[8],fc.U[5],fc.U[2]];
      break;
    case "L":
      r.L = rotateCW(fc.L);
      [r.U[0],r.U[3],r.U[6]] = [fc.B[8],fc.B[5],fc.B[2]];
      [r.F[0],r.F[3],r.F[6]] = [fc.U[0],fc.U[3],fc.U[6]];
      [r.D[0],r.D[3],r.D[6]] = [fc.F[0],fc.F[3],fc.F[6]];
      [r.B[2],r.B[5],r.B[8]] = [fc.D[6],fc.D[3],fc.D[0]];
      break;
    case "F":
      r.F = rotateCW(fc.F);
      [r.U[6],r.U[7],r.U[8]] = [fc.L[8],fc.L[5],fc.L[2]];
      [r.R[0],r.R[3],r.R[6]] = [fc.U[6],fc.U[7],fc.U[8]];
      [r.D[0],r.D[1],r.D[2]] = [fc.R[6],fc.R[3],fc.R[0]];
      [r.L[2],r.L[5],r.L[8]] = [fc.D[0],fc.D[1],fc.D[2]];
      break;
    case "B":
      r.B = rotateCW(fc.B);
      [r.U[0],r.U[1],r.U[2]] = [fc.R[2],fc.R[5],fc.R[8]];
      [r.R[2],r.R[5],r.R[8]] = [fc.D[8],fc.D[7],fc.D[6]];
      [r.D[6],r.D[7],r.D[8]] = [fc.L[0],fc.L[3],fc.L[6]];
      [r.L[0],r.L[3],r.L[6]] = [fc.U[2],fc.U[1],fc.U[0]];
      break;
    default: return fc;
  }
  return r;
}

export function applyMoveToState(state, move) {
  const base = move[0];
  const isPrime = move.includes("'");
  const isDouble = move.includes("2");
  const times = isPrime ? 3 : isDouble ? 2 : 1;
  let result = state;
  for (let i = 0; i < times; i++) result = applyCW(result, base);
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

export function createStateTracker(initialState) {
  let currentState = JSON.parse(JSON.stringify(initialState));

  return {
    applyMove: (move) => {
      currentState = applyMoveToState(currentState, move);
      return currentState;
    },
    getCurrentState: () => currentState,
    reset: () => {
      currentState = JSON.parse(JSON.stringify(initialState));
    },
  };
}