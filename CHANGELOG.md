# Changelog

All notable changes to `@fatdevcon/utilities`. The project follows [semantic versioning](https://semver.org/).

## 0.4.1

### Added

- `strip`, `lstrip`, `rstrip`: ECMAScript whitespace trimming or an explicit Unicode code-point set.
- `title`: Unicode word casing that preserves whitespace/punctuation and internal apostrophes.
- `firstChar`, `lastChar`: grapheme endpoints with a documented code-point fallback without `Intl.Segmenter`.
- `safeToNumber`, `safeToInteger`, `safeToBigInt`, `safeToBoolean`, `safeToString`: unknown-input conversion with explicit `null` failure results, safe integer checks and no object coercion in numeric/boolean conversion.

### Improved

- `capitalize` extracts only the first grapheme instead of segmenting the entire input; the rest of the string and the existing locale argument remain unchanged.
- Segmenter instances initialize lazily and are reused without retaining user text.

### Fixed

- Importing the root package no longer fails solely because `Intl.Segmenter` is absent. Existing grapheme/word formatters still require it when called; new endpoints provide their documented fallback.

### Tests

- Added Unicode, hostile-object/proxy, precision, strict-API compatibility, JSON and seeded property/oracle regressions.
- Extended installed ESM/CJS and TypeScript consumer probes for the new APIs and version consistency.
- Added reproducible browser-consumer bundle measurement and bounded million-character/10,000-level JSON stress checks and benchmarks.

### Documentation

- Documented all new signatures, failure contracts, numeric syntax, floating-point limits, Unicode fallback and casing differences in README and the API reference.
- Updated website release metadata and playground examples; preserved existing strict conversions, JSON result types and capitalization behavior.
- Zero runtime dependencies, unminified builds and existing public import paths remain unchanged.

## 0.4.0

### Added

- Local-calendar date arithmetic (`addWeeks`, subtraction helpers and year helpers), boundaries, comparisons, injectable-now predicates, full-unit differences and calendar metadata.
- Import-safe runtime capability checks for browser, DOM, Node, Bun-backed server contexts and browser workers.
- Immutable collection ergonomics: `sort`, `enumerate`, `take`, `drop`, `first`, `last`, `minBy`, `maxBy` and exact `sumBy`.
- Strict primitive guards, safe JSON result helpers, strict conversion helpers and prototype-safe query-string helpers.

### Changed

- Date/month arithmetic and IANA offset calculation now preserve proleptic Gregorian years `0`–`99` instead of inheriting JavaScript's `Date` constructor/`Date.UTC` 1900-year adjustment.
- Package verification now validates SemVer shape instead of a release-specific version literal, so future release candidates do not inherit a stale assertion.
- README and static API reference document the new API contracts, local-date semantics, runtime definitions and 0.3.7 → 0.4.0 upgrade path.

### Compatibility

- No intentional breaking changes. Existing root imports, exact numeric behavior, zero runtime dependencies and readable ESM/CJS output are retained.

## 0.3.7

- README: the Socket badge rendered as a broken image on npm (its endpoint is behind a bot challenge); replaced with a static badge that links to the live report. The bundlephobia badge is replaced with a registry-backed unpacked-size badge.
- Documentation site: the size comparison and release notes now show the current version.

## 0.3.6

- Clearer package description for npm search and a more precise keyword set.
- Test-only fix: the local time zone offset assertion no longer fails on runtimes whose zone is UTC (it compared `0` with `-0`). The library itself is unchanged.

## 0.3.5

### Changed

- **No runtime dependencies.** `decimal.js` and `date-fns` are replaced by an in-package BigInt decimal engine and an ISO 8601 parser and formatter. The bundle shrinks from 90.9 kB to 59.1 kB minified (32.3 kB to 21.4 kB gzipped) as measured on the full package, and installing the package adds nothing else to `node_modules`.
- The old engines moved to `devDependencies` and act as test oracles: hundreds of thousands of seeded random operations are compared against `decimal.js` and `date-fns`, and a differential run over the public API compared 720,000 calls with 0.3.4 with no differences.
- Published files are no longer minified and no longer ship source maps, so they read like source and are easy to audit.
- Very long numbers convert to and from text in chunks, which keeps 300,000-digit values fast on JavaScriptCore (Bun) as well as V8.
- `formatDate` now accepts `FormatDateOptions` (`timeZone`, `locale`, `weekStartsOn`, `firstWeekContainsDate`, `useAdditionalWeekYearTokens`, `useAdditionalDayOfYearTokens`). The tokens match date-fns, and a date-fns `Locale` object is still accepted as `locale`.
- `formatDate(date, "")` returns `""` instead of throwing a `TypeError`.
- The protected-token error for `YY`, `YYYY`, `D` and `DD` has a shorter message, and no console warning is printed for the other protected tokens.

### Added

- `parseISO`, `addDays`, `addMonths`, `startOfDay`, `endOfDay`, `differenceInCalendarDays`.
- `parseDuration` (inverse of `formatDuration`) and `parseBytes` (inverse of `formatBytes`, with `base` and `bigint` options).
- `setByPath` (immutable, prototype-pollution safe) and `escapeRegExp`.
- Error code `ERR_INVALID_FORMAT`.
- A redesigned documentation site with a live playground that runs the real package in the browser, and a CHANGELOG, a security policy, CI and publish workflows with npm provenance.

## 0.3.4

- Package landing page and discoverability metadata for the documentation site.

## 0.3.3

- Time zone offsets in seconds, minutes or hours, with an optional native `Date#getTimezoneOffset` direction.

## 0.3.2

- Time zone utilities: `isTimeZone`, `getTimeZoneOffset`, `getTimeZoneName`, `formatInTimeZone`.

## 0.3.1

- Abort-aware `wait`, `withRetry`, `sleep`, `retry` and related helpers.

## 0.3.0

- Big-number support: every numeric helper accepts numbers, bigints and numeric strings, with exact decimal math, stable error codes and common helpers.
