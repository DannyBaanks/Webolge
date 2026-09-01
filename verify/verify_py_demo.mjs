import { readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { run } from "../src/malbolge-core.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");

const tmpFile = process.env.MALBOLGE_TRANSLATE_INPUT
  || join(tmpdir(), "py_print_full.mal");
const src = readFileSync(tmpFile, "latin1");
const r = run(src);
const ok = r.output === 'print("hola")' && r.status === "HALTED";
console.log(`JS_CORE: ${r.status}/${r.steps} match=${ok}`);

if (ok) {
  copyFileSync(tmpFile, join(repoRoot, "examples", "python_print.malbolge"));
  writeFileSync(join(repoRoot, "examples", "python_print_salida.txt"),
                r.output, "latin1");
  console.log("guardado en examples/");
}
process.exit(ok ? 0 : 1);
