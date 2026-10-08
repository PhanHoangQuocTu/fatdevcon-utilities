---
paths:
  - "src/**/*"
  - "src/__tests__/**/*"
---

# Utility contracts — behavior before convenience

A public helper needs an explicit stable signature, inputs, failure policy, output kind, mutation guarantee, runtime assumptions and tests. Be predictable for both TypeScript and JavaScript users; do not expand the surface with speculative aliases.

## Dates, zones and Intl

- Dates use `Date`, numbers or strings according to existing contracts. Keep **date-only strings as local calendar dates** if that is the published behavior; distinguish an instant from a civil date.
- Respect `parseISO` invalid-input policy (documented Invalid Date rather than thrown error where applicable). Don't replace it with permissive native `Date.parse` semantics.
- Calendar `addDays` should preserve the intended wall-clock behavior over DST, and `addMonths` should maintain existing end-of-month clamping. Test leap years, offsets, DST folds/gaps, years/week numbers and invalid dates.
- Only claim date-fns-style **specific token/function subset compatibility**, not a complete replacement. Cross-check affected functions against dev-only `date-fns` oracle tests when available.
- Locale-dependent separators, currency names, symbols, time zone identifiers and Unicode data can vary by runtime; compare normalized semantic expectations when strings are runtime-dependent.

## Unicode strings

- For `truncateText`, `maskString`, `shortenString`, `reverseText` etc., preserve **grapheme** rather than UTF-16-code-unit semantics. Test combining characters, ZWJ emoji, flags, multicodepoint clusters and boundaries.
- For `slugify`, `removeDiacritics`, `capitalize` and case helpers, cover Vietnamese characters and locale-special case rules (e.g. Turkish). Never destroy non-Latin text without an explicit documented policy.
- Conversion helpers (such as `toString` if introduced) must specify `null`, `undefined`, objects, arrays, `Symbol`, `BigInt` and recursion/circular behavior instead of opaque "Python-like" conversions.

## Arrays, objects and algorithms

- Prefer non-mutating behavior unless an existing documented function says otherwise. Explicitly define stable sorting, numeric vs lexicographic ordering, comparator ties and `NaN` behavior when applicable.
- Collections: test `[]`, duplicates, sparse arrays, nested objects, immutability and realistic large arrays. Avoid accidental quadratic complexity on common operations.
- Object helpers: protect against inherited keys, prototype pollution and unwanted getter invocation; define identity preservation and unsupported special objects/cycles honestly.
- For memoization and cache-like helpers, account for object-identity keys, eviction policy (if any), lifecycle and memory growth.

## Validators, environment and async

- Predicates must define exact classification of null/arrays/empty strings/boxed values, not rely on TypeScript narrowing alone.
- Environment helpers should detect availability safely; browser/SSR/worker/Node semantics are not simply complementary.
- Async retries and timers: test abort, rejection, cleanup, concurrency and retry boundaries. Avoid idempotency assumptions.

## Definition of done

- Public/private visibility chosen intentionally; public export and `.d.ts` verified.
- Runtime invalid-input/return/mutation contracts specified and tested.
- Relevant existing dev oracle/property/regression tests run.
- README and docs API index/playground updated where necessary; version/changelog consistent.
- No unjustified runtime dependencies, cycles or consumer import-size regression.
