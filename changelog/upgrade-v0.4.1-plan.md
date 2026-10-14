# v0.4.1 implementation and verification plan

Source brief: `tasks/upgrade-v0.4.1.md`. Local starting version: **0.4.0**.
The supplied task directory was untracked before work began. No commit, tag,
push, release, or publication is part of this task.

## Contracts and scope

- Add `strip`, `lstrip`, `rstrip` to the formatter module. Default whitespace
  follows ECMAScript trim (not Python's exact whitespace table); optional `chars`
  is a Unicode code-point set, never a substring or regex. Empty set is a no-op.
- Add `title`: lowercase Unicode words, uppercase their first letter, preserve
  separators/spacing; internal straight/curly apostrophes stay in a word;
  hyphens, underscores and numbers delimit words. Locale-independent Unicode
  casing; no accent removal or normalization.
- Add `firstChar`, `lastChar`: Intl grapheme endpoints when available; otherwise
  code-point endpoints, preserving valid surrogate pairs but not multi-point
  emoji/combining sequences. Empty input gives an empty string. Text APIs reject
  non-string input with TypeError, consistent with existing formatters.
- Preserve `capitalize(text, locale?)`: uppercase the first grapheme and leave
  the rest unchanged. The requested lowercase-rest default would break an
  existing documented and tested API. Use `capitalize(text.toLowerCase())` for
  that behavior. Preserve existing `titleCase` word-reformatting semantics.
- Reuse `normalizeWhitespace`, `removeDiacritics`, `safeJsonParse`,
  `safeJsonStringify`, `parseISO` and existing predicates; no redundant aliases,
  new date parser, fallback option objects, or second decimal engine.
- Add unknown-input, null-on-failure `safeToNumber`, `safeToInteger`,
  `safeToBigInt`, `safeToBoolean`, `safeToString` in the helper module.
  Number accepts trimmed ASCII decimal/scientific text, finite safe-range
  numbers and safe BigInts; reject unsafe integer results and nonzero underflow.
  Ordinary fractional binary rounding is documented. Integer/BigInt text uses
  signed decimal digits only (no fractional/exponent spelling); never truncate.
  Boolean accepts booleans, numeric 0/1, trimmed case-insensitive true/false and
  string 0/1 only. String accepts primitives, valid Dates and JSON-serializable
  arrays/plain objects via existing conversion; nullish/nonfinite/unsupported
  values and synchronous conversion failures return null. JSON semantics apply.
- Correct the confirmed import-time Intl.Segmenter dependency without changing
  supported-runtime legacy string results. Add import-without-Segmenter proof.
- Keep zero runtime dependencies, existing exports/signatures/error behavior,
  unminified JS, ESM/CJS outputs and package paths.

## Work sequence

1. [x] Inspect task, repository instructions, conversion/text source, exports,
   existing regression/oracle suites, metadata, build, docs and release workflow.
2. [x] Record v0.4.0 check/coverage, package/docs/tarball gates, export inventory,
   raw/gzip outputs and identical esbuild consumer fixture baseline.
3. [x] Implement focused helpers and import-safety fix; add unit/edge/property,
   hostile-object, Unicode fallback and bounded large-input tests.
4. [x] Extend ESM/CJS package probes and installed .mts/.cts inference/negative
   type fixtures. Add reproducible bundle/browser and performance verification.
5. [x] Bump once to 0.4.1, preserve dependency lock entries, synchronize README,
   changelog, API reference, website labels/release copy and playground examples.
6. [x] Run focused tests then `npm run check`, docs sync, package/docs/site,
   installed tarball Node/Bun/types, browser bundle and stress/benchmark checks,
   `npm pack --dry-run --json`, and diff review.
7. [x] Record actual baseline/final counts, coverage, sizes, compatibility and
   limitations in `tasks/upgrade-v0.4.1-report.md`; review acceptance individually.

## Verification evidence

Baseline complete: `/tmp/fatdevcon-baseline-check.log` — 1,270 tests, typecheck, lint and build passed. Package/docs/site and installed tarball checks also passed.
Baseline runtime: Node v22.22.3, Bun 1.3.5. The release commands are existing
repository commands, not new publishing automation. Expensive size/stress work
will remain separate from normal unit CI. Unsupported environments or blocked
checks must be reported as unverified, never counted as passing.

Final result: **PASS**. See [delivery report](upgrade-v0.4.1-report.md) for actual checks, coverage, consumer measurements and limitations. The final build has 200 exports (all 189 previous exports retained). Full Jest gate: 1,452 passed, 0 failed. Node 18/20/22/24, Bun and headless Chrome probes passed.
