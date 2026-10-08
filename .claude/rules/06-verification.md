# Verification — repository-specific test and release gates

**Do not claim checked unless executed.** Start with the nearest test; increase scope for public, algorithmic, build or release impact. Read current `package.json` scripts first because they may evolve.

## Known existing npm commands (verify availability locally)

| Command | Purpose |
| --- | --- |
| `npm run typecheck` | TS compiler check |
| `npm run lint` | ESLint `src` |
| `npm test -- --runInBand` | Jest suite |
| `npm run check` | typecheck + lint + Jest + JS/declaration build |
| `npm run test:coverage` | Jest coverage where useful |
| `npm run test:package` | Built package ESM/CJS functional and export parity smoke check |
| `npm run docs:sync` | Copy built `dist/index.mjs` to docs playground asset |
| `npm run test:docs` | Verify documentation API examples/data consistency |
| `npm run test:site` | Site metadata, anchors, crawlers, version and synced playground |
| `npm run test:tarball` | Packed install + Node/Bun + `.mts`/`.cts` consumer contract checks (requires Bun) |
| `npm pack --dry-run --json` | Check publication contents, sizes and required files |

## Change-based verification

- **Any production TS change:** focused Jest test(s) (discover current test names), then `npm run check` before claiming a completed deliverable.
- **Numeric/BigInt/date/Intl/Unicode logic:** also use relevant differential oracle and edge-case suites; do not accept output snapshots alone as proof of semantic compatibility.
- **Exports, overloads, `types`, build configuration:** also `npm run test:package` plus published tarball/import/type consumer tests as applicable; `npm run test:tarball` for release-level confidence.
- **Docs/Playground/API data:** build if source changed; run `npm run docs:sync`, `npm run test:docs`, `npm run test:site`. `test:site` intentionally compares the synced asset to the built ESM file.
- **Version/release candidate:** `npm run check` -> `npm run docs:sync` -> `npm run test:package` -> `npm run test:docs` -> `npm run test:site` -> `npm run test:tarball` if Bun available -> `npm pack --dry-run --json`. Follow `prepublishOnly` as configured, but **do not publish** without authorization.
- **Docs-only typo:** run affected docs checks and version metadata checks; full numeric fuzzing is not automatically needed. Verify build/dist prerequisite and report when it is unavailable.

## Special regression matrix

- **Numeric:** 0.1+0.2, 1.005 rounding, input-kinds/return-kinds, extreme exponents, divisor zero, repeating vs terminating decimals, precision limits, non-finite input, negative zero, BigInt large values.
- **Date/timezone:** date-only local semantics, invalid ISO result policy, DST gaps/folds, leap years, week/year boundaries, offset signs, Intl/locale-dependent behavior.
- **Strings:** Unicode grapheme clusters, combining marks, ZWJ emoji, flags, diacritics and locale-sensitive case handling.
- **Objects/arrays:** prototype pollution, getters, sparse arrays, stable ordering, empty/duplicate data, immutability, cycles where supported.
- **Async:** aborted timers, cancellation races, rejection propagation, retry bounds, cleanup and throttling/debouncing timing.
- **Packaging:** import/require parity, `.d.ts`/`.d.mts` inference and negative type tests, tested minimal consumer import, license and notices, no runtime dependencies.

## Verification honesty and discipline

- Review `git diff --check`, `git diff` and `git status` for unrequested edits and generated churn.
- Do not delete/weaken failing tests, suppress TypeScript errors, or label skipped/blocked checks as success.
- `npm run test:tarball` may require a Bun binary and npm access; clearly state what could not run and why. Beware repeated heavy `npm pack` hooks; choose meaningful verification frequency.
- If a check fails, reproduce, isolate the cause and fix newly introduced regressions. Explain pre-existing failures based on evidence only.
- State command-by-command **pass / fail / not run**, plus measured/not-measured bundle impact. `npm run check` does not automatically prove browser tree-shaking or published tarball install works.
