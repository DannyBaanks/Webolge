# Webolge v2.0 (malbolge·translate) — Google Translate para Malbolge en el Navegador

[![Version](https://img.shields.io/badge/version-2.0-blue.svg)](https://github.com/DannyBaanks/Webolge)
[![Cloudflare Pages](https://img.shields.io/badge/deployment-Cloudflare%20Pages-orange.svg)](https://malbolge-translate.pages.dev/)
[![Autobolge 2.0](https://img.shields.io/badge/synthesis-Autobolge%202.0%20O(N)-brightgreen.svg)]()

Google Translate, pero de **Malbolge**: texto humano ⇄ programa ejecutable.
Todo corre localmente en el navegador; no hay servidor de ejecución.

Sitio: `https://malbolge-translate.pages.dev/`

## Qué hace v2.0 (2026 Edition — Autobolge 2.0 & Ripple Engine)

- **Síntesis Constructiva Autobolge 2.0 en $O(N)$:** sintetiza programas Malbolge reales para textos de hasta ~1,000–1,500 caracteres en **2–6 milisegundos**, con salto cuántico algebraico ($c=0 \to 3315, d=121$) y hueco estéril de 3,194 celdas. Permite generar la apertura completa de *El Quijote* (380 caracteres) en 3 ms sin búsqueda heurística ni congelamiento de UI.
- **Demostración de Expansión Positiva (XLAT2 Ripple Counter):** emite hasta **78,125 bytes** de salida limpia desde programas de tan solo 5.3 KB (factor de expansión **14.58x**), demostrando formal y empíricamente que la salida de Malbolge no está acotada por las 59,049 celdas de memoria.
- **Texto → Malbolge (modo rápido):** genera **un programa Malbolge real**, lo vuelve a ejecutar con el núcleo JS y solo lo muestra si la salida coincide exactamente.
- **Malbolge → texto:** ejecuta el programa con límites de pasos/salida y muestra su output.
- **Automático:** intenta reconocer si la entrada ya es un programa; si no, genera Malbolge.
- **Webolge anti-freeze:** generación en `Worker`, checkpoints en IndexedDB, pausa/reanudación, auto-bisección de chunks y descarga de manifiesto.
- **Lotes:** cada chunk es un programa Malbolge **independiente y verificado**. No se venden como un único stream concatenable.
- **Ejemplos Rápidos:** botones preset para *El Quijote (Apertura)*, *Hola mundo*, y *Ripple Counter x14.58*.

Prueba mínima:

```text
entrada: hola
modo: texto → Malbolge
Convertir
```

La salida es un programa printable de Malbolge. Antes de mostrar `VERIFICADO`, Webolge exige:

```text
generar → ejecutar → output === "hola" → HALTED
```

## Piezas

| pieza | qué es |
|---|---|
| `src/malbolge-core.mjs` | intérprete canónico JS (`op=(v+c)%94`, crazy-op, cifrado post-ejecución) |
| `src/conveyor-gen.mjs` | sintetizador algebraico constructivo $O(N)$ Autobolge 2.0 (~2-6 ms) |
| `src/ripple-gen.mjs` | generador y catálogo del contador ripple XLAT2 (expansión hasta 14.58x) |
| `src/toolkit-gen.mjs` | generador snapshot/BFS rápido, portado/adaptado a JS |
| `src/meowbolge-gen.mjs` | generador toroidal previo, conservado como fallback |
| `src/gen-worker.mjs` | generación fuera del hilo de UI con soporte Conveyor, BFS y Ripple |
| `app.js` | interfaz, presets (Quijote, Ripple), conversión, verificación y lotes |
| `verify/test_conveyor.mjs` | verificación de Autobolge 2.0, Quijote 380 chars y Ripple x14.58 |
| `verify/vectors.mjs` | suite portable de vectores y generación real |
| `verify/test_freezes.mjs` | regresión: `hola` debe generarse, no basta con timeout seguro |

## Verificación

Desde el root del repo:

```bash
node verify/test_conveyor.mjs
node verify/vectors.mjs
node verify/test_freezes.mjs
```

La suite no depende de rutas absolutas del host.

## Alcance honesto

El programa rápido está demostrado para entradas ASCII/Latin-1 comunes y verifica cada resultado antes de mostrarlo. El espacio de búsqueda de Malbolge sigue siendo hostil: algunos bytes pueden agotar el presupuesto y se reportan como fallo, no como traducción inventada.

El modo por lotes sirve para textos largos sin congelar la UI, pero sus chunks son **programas independientes**. Esta versión no afirma producir un único `.mal` continuo arbitrariamente largo.

Caracteres con code point >255 (por ejemplo emoji) todavía no están soportados por el generador actual.

## Página / deploy

Cloudflare Pages, estática, sin build:

```powershell
npx wrangler pages deploy . --project-name malbolge-translate
```

## Licencias / procedencia

`src/toolkit-gen.mjs` es un port/adaptación en JavaScript de la estrategia `ProgramGenerator` de `wallstop/malbolge-toolkit` (MIT). El aviso de licencia original se conserva en `THIRD_PARTY_NOTICES.md`.
