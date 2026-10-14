# v0.4.1 delivery report

Date: 2026-10-14 (Asia/Ho_Chi_Minh). **Final status: PASS — local upgrade verified for maintainer review.**

Version: **0.4.0 → 0.4.1**, one synchronized bump. No commit, tag, push, publication or release was performed.

Source brief: [upgrade-v0.4.1.md](upgrade-v0.4.1.md). Implementation plan: [upgrade-v0.4.1-plan.md](upgrade-v0.4.1-plan.md). Raw measurements and complete before/after export inventories: [upgrade-v0.4.1-measurements.json](upgrade-v0.4.1-measurements.json).

## A. Implementation summary

- Added six formatter cleaning helpers and five unknown-input nullable conversion helpers, through the existing formatter/helper barrels and root export.
- Preserved all **189** existing runtime exports; the new build has **200**. Generated declaration comparison showed only additive function declarations/exports; existing declarations and exported types are unchanged.
- Fixed eager `Intl.Segmenter` construction at import. Two lazy, fixed-size instance caches retain no caller text. New character endpoints have a tested code-point fallback.
- Optimized `capitalize` to extract the first grapheme instead of allocating the complete grapheme array. Kept casing, locale, input validation and remainder semantics.
- Reused the existing decimal-text grammar and display conversion; no second arithmetic engine, dependencies, new framework or publishing workflow.
- Preserved strict `toNumber`/`toBoolean`/`toString`, existing JSON result types, `normalizeWhitespace`, `removeDiacritics`, `titleCase`, and date APIs. No redundant aliases or generic cleanup modes.

The brief's proposed lowercase-rest `capitalize` default conflicts with the existing documented/tested contract. It was intentionally not introduced. `capitalize(text.toLowerCase())` provides that behavior explicitly. Safe integer/BigInt strings intentionally accept signed decimal digits only, rejecting dot/exponent notation rather than accidentally truncating a rounded fractional input. `safeToNumber` accepts scientific notation. All policies are documented.

## B. New public function inventory

| Function | Description | Return type | Test status |
| --- | --- | --- | --- |
| `strip` | Whitespace or code-point-set trimming at both ends | `string` | PASS |
| `lstrip` | Trim the beginning only | `string` | PASS |
| `rstrip` | Trim the end only | `string` | PASS |
| `title` | Unicode word casing, preserve separators and internal apostrophes | `string` | PASS |
| `firstChar` | First grapheme, or code-point fallback | `string` | PASS |
| `lastChar` | Last grapheme, or code-point fallback | `string` | PASS |
| `safeToNumber` | Finite numeric conversion with unsafe-integer/underflow rejection | `number \| null` | PASS |
| `safeToInteger` | Safe integer conversion without truncation | `number \| null` | PASS |
| `safeToBigInt` | Exact decimal integer conversion | `bigint \| null` | PASS |
| `safeToBoolean` | Explicit boolean representations | `boolean \| null` | PASS |
| `safeToString` | Primitive/Date/JSON display conversion with failure boundary | `string \| null` | PASS |

## C. Existing behavior changes and compatibility

| Function/area | Issue | Change | Compatibility |
| --- | --- | --- | --- |
| Root import / text formatters | Eager Segmenter construction fails before fallback APIs can be used | Construct Segmenters only on first relevant call | Existing supported-runtime results preserved; missing-feature imports now work |
| `capitalize` | Segmented and allocated the entire input just to change its beginning | Extract first grapheme and append untouched remainder | Existing signature, locale casing and output preserved |
| `truncateText`, `shortenString`, `maskString`, `countWords` | Shared eager Segmenter ownership | Use lazy instance access | Regression suite plus seeded baseline differential passed |
| Strict conversions and JSON | Existing policies differ from new nullable APIs | No production behavior change; expanded regressions | Existing errors, return types, whitespace and coercion policies preserved |

Legacy text differential: **6,000 calls** across 1,000 seeded Unicode strings, including malformed surrogates and Turkish casing, matched the saved v0.4.0 build exactly (seed `0x041cafe`). Exact math, dates, timezone, arrays, objects and async production source was not changed; existing oracle/security/regression suites passed.

## D. Testing report

| Check | Baseline | v0.4.1 |
| --- | --- | --- |
| `npm run check` | PASS | PASS |
| TypeScript no-emit + ESLint | PASS | PASS |
| Jest suites | 12 passed | 14 passed |
| Jest tests | 1,270 passed; 0 failed | **1,452 passed; 0 failed** |
| Statement coverage | 97.24% | 97.41% |
| Branch coverage | 92.36% | 92.87% |
| Function coverage | 98.50% | 98.56% |
| Line coverage | 98.77% | 98.81% |
| ESM/CJS build + Rollup declarations | PASS | PASS |
| `npm run docs:sync` | Existing asset matched build | PASS |
| `npm run test:package` | PASS | PASS |
| `npm run test:docs` | 184 functions, 326 examples, 5 illustrative skips | **195 functions, 359 examples, 5 illustrative skips** |
| `npm run test:site` | PASS | PASS |
| `npm run test:tarball` | PASS after sandbox retry | PASS |
| `npm run test:bun` | Not run separately | **1,144 passed, 2 skipped, 0 failed**, 190,015 expectations |
| `npm run test:bundle` | Measured with identical script | PASS, standalone browser bundles and export checks |
| `npm run test:cleaning:stress` | Legacy comparison fixture saved | PASS on Node; same script also passed on Bun |
| `npm pack --dry-run --json` | PASS (`--ignore-scripts`, after build) | PASS, including prepack build |
| `git diff --check` | Clean starting tracked tree | PASS |

New focused suites contain **182 tests**. `cleaning.ts` and the lazy Segmenter helper have 100% statement/branch/function/line coverage. Combined legacy/new conversion module has 97.32% statements, 97.12% branches and 100% functions/lines.

Property/oracle tests include 500 seeded Unicode cleaning cases and 1,500 decimal/scientific cases against development-only decimal.js, plus unsafe integer/BigInt boundaries, signed zero, nonzero underflow, malformed data, throwing getters/coercion hooks, revoked proxies, cycles, JSON prototype-sensitive keys and no-coercion checks. Existing decimal/date oracle suites remain in the full gate.

Stress checks cover 0, 1, 10, 100, 1,000, 10,000, 100,000 and 1,000,000-character inputs; invalid numeric suffixes, leading-zero text, underflow, long words/Unicode endpoints, a 10,000-record JSON document and 10,000-level JSON nesting. These bounded stress/benchmark runs are separate from ordinary CI unit tests.

Installed package fixtures compile `.mts` and `.cts` under strict NodeNext with declaration checking enabled, positive inference assertions and negative `@ts-expect-error` cases. Package installation adds only `@fatdevcon/utilities`; no runtime dependency is missing.

Bun's two skipped tests are the existing Node-specific isolated Intl.NumberFormat fallback tests, not failures. Actual Node 18 package loading was verified separately.

## E. Bundle and performance measurements

All sizes below are **bytes**. esbuild **0.27.2**, ES2020 target, browser IIFE, minification and tree-shaking enabled, gzip level 9. Every selected export is retained through a global consumer object. This is one consistent reproducible fixture, so its baseline differs slightly from older README measurements. Published ESM/CJS remains unminified.

| Package | v0.4.0 | v0.4.1 | Difference |
| --- | --- | --- | --- |
| npm tarball | 112,878 | 119,687 | +6,809 |
| Unpacked package | 416,413 | 440,313 | +23,900 |

The tarball increase includes added implementation, duplicated CJS/ESM declarations and expanded README/changelog; it is not the cost paid by a named browser import.

| Artifact | Baseline raw | Final raw | Baseline gzip | Final gzip |
| --- | --- | --- | --- | --- |
| `index.mjs` | 130,946 | 135,634 | 33,009 | 33,972 |
| `index.js` | 134,826 | 139,736 | 33,599 | 34,596 |
| `index.d.ts` | 47,272 | 49,929 | 13,525 | 14,311 |
| `index.d.mts` | 47,272 | 49,929 | 13,525 | 14,311 |

| Browser consumer fixture | Baseline minified | Final minified | Baseline gzip | Final gzip |
| --- | --- | --- | --- | --- |
| `full` | 68,168 | 70,801 | 23,982 | 24,783 |
| `toNumber` | 1,854 | 1,746 | 922 | 878 |
| `normalizeWhitespace` | 1,231 | 1,123 | 725 | 674 |
| `capitalize` | 1,322 | 1,268 | 769 | 759 |
| `legacyMixed` | 2,189 | 2,135 | 1,079 | 1,073 |
| `strip` | — | 1,449 | — | 849 |
| `title` | — | 1,253 | — | 755 |
| `firstChar` | — | 1,483 | — | 859 |
| `lastChar` | — | 1,482 | — | 858 |
| `safeToNumber` | — | 1,510 | — | 806 |
| `safeToInteger` | — | 1,721 | — | 866 |
| `safeToBigInt` | — | 1,185 | — | 671 |
| `safeToBoolean` | — | 1,131 | — | 664 |
| `safeToString` | — | 1,842 | — | 969 |
| `cleaningMixed` | — | 2,570 | — | 1,316 |

The full retained-export browser fixture grows **2,633 minified bytes / 801 gzip bytes**. Legacy `toNumber` saves 44 gzip bytes and `normalizeWhitespace` saves 51 by dropping unused eager Segmenter construction. No claim is made that published `dist` minification would improve actual consumer tree-shaking. No runtime or development dependency was added; lockfile changes are version fields only.

The benchmark warms each operation, then reports the median of five runs of 10,000 calls. Local Node 22 results:

| Operation | v0.4.0 median ms | v0.4.1 median ms |
| --- | --- | --- |
| `capitalize` | 75.915 | 8.296 |
| `truncateText` | 112.330 | 125.990 |
| `countWords` | 53.608 | 46.925 |
| `normalizeWhitespace` | 3.565 | 3.413 |
| `toNumber` | 1.057 | 1.023 |

New endpoints measured about 14 ms/10,000 calls; `strip` 0.260 ms, `title` 8.332 ms, `safeToNumber` 0.757 ms. These are workload/machine-specific observations, not universal throughput promises. `truncateText` was about 12% slower in this fixture; do not claim all legacy operations improved. Lazy reuse avoids the much larger first implementation's per-call constructor regression (~201 ms for truncateText). No text cache or unbounded cache was introduced.

Reproduce with `npm run test:bundle` and `npm run test:cleaning:stress -- /path/to/baseline/index.mjs`. The measurement script also accepts an alternate ESM artifact path directly for like-for-like bundle comparisons.

## F. Compatibility and package contents

| Environment/contract | Result | Evidence |
| --- | --- | --- |
| Node 18.20.8 | PASS | ESM/CJS package probe using isolated temporary runtime |
| Node 20.20.2 | PASS | ESM/CJS package probe |
| Node 22.22.3 | PASS | Full checks plus installed-tarball ESM/CJS consumers |
| Node 24.21.0 | PASS | ESM/CJS package probe |
| Bun 1.3.5 | PASS | Installed-tarball probe, existing Bun suite, large-input stress |
| Browser bundling | PASS | All named/full fixtures bundle without unresolved imports; execute without Node globals |
| Real Chromium | PASS | Chrome 154.0.8037.92 headless: 17 built-ESM checks, including fresh import with Segmenter absent |
| No Intl / no Segmenter | PASS | Fresh full-browser bundle contexts plus unit fallback and real browser checks |
| TypeScript declarations | PASS | Installed strict NodeNext `.mts`/`.cts`, inference and negative cases |
| Tree-shaking | PASS | Measured small imports, retained-export verification, zero external imports |
| Firefox/Safari, other OS/ICU combinations | NOT VERIFIED | Not installed/tested in this task |

All 10 packed files are expected: package metadata, README, changelog, security/license/notices and four build outputs. No source maps, task files, test code, node_modules or docs assets are shipped. Tarball metadata matches the authoritative manifest. The tarball is local at `.release/fatdevcon-utilities-0.4.1.tgz`.

## G. Documentation and metadata

Updated `README.md`, `CHANGELOG.md`, `docs/api-data.js`, `docs/index.html`, `docs/assets/app.js`, and synced `docs/assets/fatdevcon-utilities.mjs`. Added Cleaning and Safe conversion playground samples. Every new function has parameters, return type, examples and edge-policy notes. Current version labels and bundle measurements match 0.4.1; historical release entries remain intact. Package description/keywords add the actual cleaning/conversion capabilities, preserving other metadata and all import paths/engine declarations.

## H. Risks and limits

- `safeToNumber` uses ordinary floating-point rounding for fractions/subnormals; it rejects nonzero underflow and unsafe integer results, not every inexact decimal. Exact decimal callers should retain strings/BigInts and use the exact math APIs.
- `safeToInteger`/`safeToBigInt` reject dot/exponent string spellings by policy, even when mathematically integral.
- Existing `toNumber` still accepts already-unsafe number inputs and can underflow text to zero. Changing those observable legacy defaults was deferred; new safe APIs reject them and regressions make the distinction explicit.
- Fallback character endpoints are code-point-aware, not a full grapheme polyfill. Existing word/grapheme formatters still need Segmenter when called. Already-malformed UTF-16 is preserved.
- `title` is a documented casing policy, not perfect personal-name title casing or Python equivalence; Unicode casing expansions and runtime Unicode data can affect output. Diacritics are never removed implicitly.
- JSON display conversion inherits omission/null substitution and invokes getters/toJSON. Synchronous failures return null; user callbacks can mutate or exhaust resources. This is not an execution sandbox or a lossless serializer.
- The recorded truncateText timing increase is a local performance tradeoff; no broad performance-improvement claim is made.
- Initial tarball subprocess and headless-browser attempts hit sandbox restrictions; authorized execution outside that restriction passed. No approval rejection or unresolved blocking check remains.
- Firefox/Safari and additional platform/ICU versions remain outside the executed matrix. Existing CI compatibility jobs were preserved.

## I. Acceptance and final status

**PASS.** All mandatory local gates executed successfully; the implementation is ready for maintainer review, not published.

- [x] New cleaning and safe conversion functions, without redundant aliases.
- [x] Existing names, signatures, documented results and import paths preserved.
- [x] Explicit invalid-input, precision, Unicode and mutation/callback contracts.
- [x] Meaningful tests for every new function and relevant legacy regressions.
- [x] Unit/property/oracle/stress tests, TypeScript, lint and build pass.
- [x] Installed tarball, ESM/CJS, declarations, Node/Bun/browser consumers verified.
- [x] Tree-shaking and before/after package/consumer sizes measured.
- [x] Zero runtime dependencies preserved; production output stays unminified.
- [x] README, API reference, playground, changelog, metadata and version synchronized.
- [x] npm contents verified; generated docs artifact matches the build.
- [x] Final source/declaration/export/diff review completed; risks stated above.

Local command logs are in `/tmp/fatdevcon-*.log`; durable numerical evidence is in the linked measurements file. The supplied task brief was not modified.
