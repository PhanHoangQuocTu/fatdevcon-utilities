---
paths:
  - "src/modules/math/**/*"
  - "src/modules/formatter/**/*"
  - "src/**/*numeric*"
  - "src/**/*decimal*"
  - "src/**/*bigint*"
  - "src/__tests__/*numeric*"
  - "src/__tests__/*decimal*"
  - "src/__tests__/*differential*"
  - "src/__tests__/*edge-cases*"
---

# Exact decimal, BigInt and numeric contract invariants

**This is the library's differentiator.** The numeric API must fail loudly instead of silently rounding, overflowing or changing a result's type. Read the existing public contract/tests for each function before editing.

## NumericInput and observable output-kind matrix

Use the **current implementation/docs** as final authority; the following is the project's established behavior and must not be silently changed:

| Inputs | Expected kind / behavior |
| --- | --- |
| All `number` | Return `number` when representable under the public contract; **throw** on overflow/underflow instead of silently returning Infinity/0 |
| All `bigint`, whole-number operation | Return `bigint` for published integer operations (`summary`, `multiply`, `factorial`, etc.) |
| All `bigint`, fractional operation | Return decimal `string` where documented (e.g. `divide`) |
| Any `string` or mixed kinds | Return plain decimal **string** where documented; preserve all supported digits; no exponent text output |

- Never coerce arbitrary `bigint`/decimal strings through `Number()` to perform exact calculations or comparisons. Use exact integer/scale representation in the existing decimal engine.
- Honor input normalization/rejection: valid exponent notation where documented, reject blank strings, separators, hex, `NaN`, Infinity or surrounding whitespace if the contract rejects them.
- Preserve round-trip semantics for signs, trailing zeros where meaningful, negative zero and the documented scientific-notation parsing/format policy; do not invent automatic coercion.
- Keep division precision and rounding-mode interpretation identical to the current public API. Public docs have described division default precision **40** significant digits, configurable **1–10000**; check actual current source before relying on a number.
- Keep guardrails for huge exponents/magnitude and resource use. Public docs have described a magnitude range near 1e±300000; verify actual implementation before changing boundaries.

## Error contracts and exceptions

- Preserve `NumericRangeError` and stable `code` values including `ERR_INVALID_NUMBER`, `ERR_OVERFLOW`, `ERR_UNDERFLOW`; inspect the codebase for divide-by-zero and additional error codes rather than inventing a replacement.
- Do not silently return `NaN`, `Infinity`, zero or a shortened string on invalid/overflow input. Preserve useful error causes and expected `instanceof` behavior.
- Avoid catch-all catches around exact math; use input validation at the public boundary and explicit domain errors.

## Exactness, interoperability, performance

- Exercise nonterminating division and midpoint rounding (positive/negative), very small and very large values, zero divisors, mixed `number`/`bigint`/`string`, negative zero, exponents, huge integer inputs and precision edges.
- For formatting: ensure currency/percent/bytes and `Intl` do not lose significant digits for supported `bigint`/decimal strings; account for runtime Intl differences and document precise compatibility/fallback behavior.
- Reuse dev-only `decimal.js` as an **oracle** in differential tests where semantics overlap; it must not become a runtime dependency or a promise of complete parity.
- Existing repo test families include numeric, differential, oracle-decimal and edge-cases; inspect names before running focused Jest suites. Use deterministic randomized/property tests with reproducible seeds when practical.
- For performance changes, benchmark representative integer fast paths and decimal extremes with before/after measurements **without weakening correctness**. Do not add unbounded caches or convert exact intermediates to doubles as an optimization.

## Merge criteria

- Existing public return-kind and error-code matrix unchanged or explicitly versioned as breaking.
- New/changed numeric behavior covered by tests including edge cases and meaningful oracle comparison.
- No additional runtime dependencies; import only the necessary internal primitives; bundle/tree-shaking impact evaluated if relevant.
