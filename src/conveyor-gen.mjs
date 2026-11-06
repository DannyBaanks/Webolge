// conveyor-gen.mjs — Autobolge 2.0 Constructive O(N) Synthesizer for Malbolge Classic
// Generates autonomous, self-contained Malbolge Classic programs in O(N) time with ZERO brute-force search.
import { MEM_SIZE, crazyOp, rot10, run } from "./malbolge-core.mjs";

const XLAT1 = "+b(29e*j1VMEKLyC})8&m#~W>qxdRp0wkrUo[D7,XTcA\"lI.v%{gJh4G\\-=O@5`_3i<?Z';FNQuY]szf$!BS/|t:Pn6^Ha";
const XLAT2 = "5z]&gqtyfr$(we4{WP)H-Zn,[%\\3dL+Q;>U!pJS72FhOA1CB6v^=I_0/8|jsb9m<.TVac`uY*MK'X~xDl}REokN:#?G\"i@";

export const C_START = 3315;
export const D_START = 121;
export const STERILE_GAP = C_START - D_START; // 3,194 cells

function charFor(opChar, c) {
  const idx = XLAT1.indexOf(opChar);
  return (((idx - (c % 94) + 94) % 94) + 33);
}

// Build constructive emission matrix for Latin-1 bytes
const RECIPES = new Map();

// Special fixed cases
RECIPES.set(10, ["rot", 118]); // '\n'
RECIPES.set(43, ["rot_crazy_crazy", 33, 54, 60]); // '+'

// Precompute single rotation and rot+crazy pairs
for (let v1 = 33; v1 <= 126; v1++) {
  const r1 = rot10(v1);
  const b1 = r1 % 256;
  if (!RECIPES.has(b1)) {
    RECIPES.set(b1, ["rot", v1]);
  }
  for (let v2 = 33; v2 <= 126; v2++) {
    const b2 = crazyOp(r1, v2) % 256;
    if (!RECIPES.has(b2)) {
      RECIPES.set(b2, ["rot_crazy", v1, v2]);
    }
  }
}

export function canConveyorFit(target) {
  if (typeof target !== "string" || target.length === 0) return false;
  let dataCount = 0;
  for (let i = 0; i < target.length; i++) {
    const b = target.charCodeAt(i);
    if (!RECIPES.has(b)) return false;
    const rec = RECIPES.get(b);
    const kind = rec[0];
    if (kind === "rot") dataCount += 2;
    else if (kind === "rot_crazy") dataCount += 3;
    else if (kind === "rot_crazy_crazy") dataCount += 4;
  }
  return (D_START + dataCount) <= C_START;
}

export function conveyorCapacity() {
  return STERILE_GAP;
}

export function synthesizeConveyor(target, { verify = true } = {}) {
  const t0 = Date.now();
  if (typeof target !== "string" || target.length === 0) {
    throw new Error("Target string cannot be empty");
  }

  const codeOps = [];
  const dataBytes = [];

  for (let i = 0; i < target.length; i++) {
    const b = target.charCodeAt(i);
    const rec = RECIPES.get(b);
    if (!rec) {
      throw new Error(`Byte ${b} ('${target[i]}') has no constructive recipe`);
    }
    const kind = rec[0];
    if (kind === "rot") {
      codeOps.push("*", "<");
      dataBytes.push(rec[1], 111); // 111 = 'o' (NOP)
    } else if (kind === "rot_crazy") {
      codeOps.push("*", "p", "<");
      dataBytes.push(rec[1], rec[2], 111);
    } else if (kind === "rot_crazy_crazy") {
      codeOps.push("*", "p", "p", "<");
      dataBytes.push(rec[1], rec[2], rec[3], 111);
    }
  }

  codeOps.push("v"); // Clean HALT

  const totalLen = C_START + codeOps.length;
  const dataCells = D_START + dataBytes.length;

  if (dataCells > C_START) {
    throw new Error(
      `Target too long for conveyor layout: data needs ${dataBytes.length} cells from D_START=${D_START} ` +
      `(reaches ${dataCells}), but code starts at C_START=${C_START}. Sterile gap is ${STERILE_GAP} cells.`
    );
  }

  if (totalLen > MEM_SIZE) {
    throw new Error(`Synthesized program length ${totalLen} exceeds Malbolge Classic limit (${MEM_SIZE})`);
  }

  const prog = new Uint8Array(totalLen);
  prog.fill(111); // Fill with 'o'

  // Portal jump from c=0 -> 98 (landing on 99):
  prog[0] = 98; // 'b'
  prog[98] = 111; // 'o'

  // Low-memory data pointers:
  prog[1] = 93;
  prog[94] = 80; // 'P': Y1
  prog[95] = 93;
  prog[96] = 73;
  prog[74] = 72; // 'H': Y2 (crazy produces 3312)
  prog[75] = 73;
  prog[76] = D_START - 1; // 120: target for j at c=3314 to initialize d=121

  // Discriminator / jump sequence at c=99..107:
  prog[99] = charFor("j", 99);
  prog[100] = charFor("*", 100);
  prog[101] = charFor("j", 101);
  prog[102] = charFor("*", 102);
  prog[103] = charFor("o", 103);
  prog[104] = charFor("j", 104);
  prog[105] = charFor("p", 105);
  prog[106] = charFor("j", 106);
  prog[107] = charFor("i", 107);

  // Cushion and bridge at c=3312..3314:
  prog[3312] = 111;
  prog[3313] = charFor("o", 3313);
  prog[3314] = charFor("j", 3314);

  // Place data segment:
  for (let idx = 0; idx < dataBytes.length; idx++) {
    prog[D_START + idx] = dataBytes[idx];
  }

  // Place code segment:
  for (let idx = 0; idx < codeOps.length; idx++) {
    prog[C_START + idx] = charFor(codeOps[idx], C_START + idx);
  }

  let progStr = "";
  for (let i = 0; i < prog.length; i += 4096) {
    progStr += String.fromCharCode(...prog.subarray(i, i + 4096));
  }

  let verification = null;
  if (verify) {
    verification = run(progStr, "", 2_000_000, { maxOutput: target.length + 1 });
    if (verification.status !== "HALTED" || verification.output !== target) {
      throw new Error(
        `Conveyor verification mismatch: status=${verification.status}, output=${JSON.stringify(verification.output)}`
      );
    }
  }

  const elapsedMs = Date.now() - t0;
  return {
    target,
    program: progStr,
    opcodeCount: codeOps.length,
    dataCells: dataBytes.length,
    totalCells: prog.length,
    elapsedMs,
    verification,
    verified: verification ? verification.status === "HALTED" : false,
  };
}
