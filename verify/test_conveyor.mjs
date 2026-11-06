// verify/test_conveyor.mjs — Autobolge 2.0 & XLAT2 Ripple Counter Verification Suite
import { run } from "../src/malbolge-core.mjs";
import { synthesizeConveyor, canConveyorFit } from "../src/conveyor-gen.mjs";
import { getRippleProgram, RIPPLE_METADATA } from "../src/ripple-gen.mjs";

let failures = 0;
function check(name, ok, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  " + detail : ""}`);
  if (!ok) failures++;
}

// V6: Autobolge 2.0 Conveyor — "hola" instant synthesis (< 10 ms)
{
  const t0 = Date.now();
  try {
    const res = synthesizeConveyor("hola", { verify: true });
    check(
      "V6 conveyor(hola)",
      res.verified && res.verification.output === "hola" && res.verification.status === "HALTED",
      `${res.totalCells} celdas / ${res.verification.steps} pasos / ${Date.now() - t0}ms`,
    );
  } catch (e) {
    check("V6 conveyor(hola)", false, e.message);
  }
}

// V7: Autobolge 2.0 Conveyor — Don Quijote Opening Paragraph (380 chars, monolithic single .mal)
{
  const quijoteOpening = "En un lugar de la Mancha, de cuyo nombre no quiero acordarme, no ha mucho tiempo que vivia un hidalgo de los de lanza en astillero, adarga antigua, rocin flaco y galgo corredor. Una olla de algo mas vaca que carnero, salpicon las mas noches, duelos y quebrantos los sabados, lantejas los viernes, algun palomino de anadidura los domingos, consumian las tres partes de su hacienda.";
  const t0 = Date.now();
  try {
    const res = synthesizeConveyor(quijoteOpening, { verify: true });
    check(
      `V7 conveyor(quijote_380chars)`,
      res.verified && res.verification.output === quijoteOpening && res.verification.status === "HALTED",
      `${res.totalCells} celdas / ${res.verification.steps} pasos / ${Date.now() - t0}ms`,
    );
  } catch (e) {
    check("V7 conveyor(quijote_380chars)", false, e.message);
  }
}

// V8: XLAT2 Ripple Counter — Positive Expansion (Stage 7: 78,125 bytes, ratio 14.58x)
{
  const t0 = Date.now();
  try {
    const r7 = getRippleProgram(7);
    const res = run(r7.program, "", 5_000_000, { maxOutput: 100_000 });
    const isExact = (res.output.length === 78125) && (res.output === "A".repeat(78125));
    const isHalted = res.status === "HALTED";
    const ratio = res.output.length / r7.sourceBytes;
    check(
      "V8 ripple_counter(stage7)",
      isExact && isHalted && ratio > 14.0,
      `${r7.sourceBytes}B src -> ${res.output.length}B out (${ratio.toFixed(2)}x) / ${res.steps} pasos / ${Date.now() - t0}ms`,
    );
  } catch (e) {
    check("V8 ripple_counter(stage7)", false, e.message);
  }
}

console.log(failures === 0 ? "\nAUTOBOLGE & RIPPLE VERIFICATION SUITE ✓" : `\n${failures} FALLO(S)`);
process.exit(failures === 0 ? 0 : 1);
