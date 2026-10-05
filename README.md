# @fatdevcon/utilities

[![npm version](https://img.shields.io/npm/v/@fatdevcon/utilities.svg?style=flat-square)](https://www.npmjs.com/package/@fatdevcon/utilities)
[![npm downloads](https://img.shields.io/npm/dm/@fatdevcon/utilities.svg?style=flat-square)](https://www.npmjs.com/package/@fatdevcon/utilities)
[![types](https://img.shields.io/npm/types/@fatdevcon/utilities.svg?style=flat-square)](https://www.npmjs.com/package/@fatdevcon/utilities)
[![license](https://img.shields.io/npm/l/@fatdevcon/utilities.svg?style=flat-square)](LICENSE)

Typed utilities for everyday JavaScript and TypeScript: locale-aware number, currency and date formatting, Unicode-safe text helpers, precise decimal math, array and object helpers, and classic sort / search algorithms.

**[Documentation](https://phanhoangquoctu.github.io/fatdevcon-utilities/)** – every function with its signature, options and examples.

- **Locale-aware formatting** – compact numbers, percentages, currencies, units and byte sizes, built on `Intl`
- **Unicode-safe text** – truncating, masking and shortening count user-perceived characters, so emoji and accents are never cut in half
- **Precise math** – arithmetic runs on `decimal.js`, so `summary(0.1, 0.2)` is `0.3`, not `0.30000000000000004`
- **Typed, ESM and CommonJS** – type definitions included, tree-shakeable, inputs validated, nothing mutates what you pass in

## Installation

```bash
npm install @fatdevcon/utilities
```

Also works with `yarn add`, `pnpm add` and `bun add`. Requires Node.js 18+ or Bun 1.1.34+. The package ships prebuilt, so installing it needs no compiler or build step. Runtime dependencies: `date-fns` and `decimal.js`.

## Quick start

```typescript
import { formatCurrency, formatCompactNumber, truncateText, slugify, summary, groupBy } from "@fatdevcon/utilities";

formatCurrency(1234.5, "USD"); // "$1,234.50"
formatCompactNumber(12500); // "12.5K"
truncateText("Hello world", 8); // "Hello..."
slugify("Đặng Thị Tứ"); // "dang-thi-tu"
summary(0.1, 0.2); // 0.3

groupBy(
  [
    { name: "An", role: "dev" },
    { name: "Binh", role: "qa" },
  ],
  (user) => user.role
); // { dev: [{ name: "An", ... }], qa: [{ name: "Binh", ... }] }
```

CommonJS:

```javascript
const { formatCurrency } = require("@fatdevcon/utilities");
```

## API

The tables below are a quick reference; the [documentation site](https://phanhoangquoctu.github.io/fatdevcon-utilities/) has full signatures and more examples.

- [Number formatting](#number-formatting)
- [Currency metadata](#currency-metadata)
- [Text](#text)
- [Dates](#dates)
- [Math](#math)
- [Arrays](#arrays)
- [Sorting](#sorting)
- [Searching](#searching)
- [Objects](#objects)
- [Error handling](#error-handling)
- [Types](#types)

### Number formatting

`locale` defaults to `"en-US"` (except in `formatNumber`, which uses the runtime default). `options` are `Intl.NumberFormat` options.

| Function | Description | Example |
| --- | --- | --- |
| `formatNumber(value, locale?, options?)` | Plain `Intl.NumberFormat` wrapper | `formatNumber(1234567.89, "vi-VN")` → `"1.234.567,89"` |
| `formatCompactNumber(value, locale?, options?)` | Compact notation, at most 1 decimal by default | `formatCompactNumber(12500)` → `"12.5K"` |
| `formatPercent(value, locale?, options?)` | Formats a ratio as a percentage, at most 2 decimals by default | `formatPercent(0.125)` → `"12.5%"` |
| `formatCurrency(value, currency, locale?, options?)` | Formats money for an ISO 4217 code (case-insensitive) | `formatCurrency(1500, "JPY")` → `"¥1,500"` |
| `formatUnit(value, unit, locale?, options?)` | Formats with an `Intl` unit such as `"celsius"` or `"liter"` | `formatUnit(12, "kilometer-per-hour")` → `"12 km/h"` |
| `formatBytes(value, options?)` | Human-readable byte size, from B up to EB / EiB | `formatBytes(1500)` → `"1.5 kB"` |

`formatBytes` options: `base` (`1000` by default, or `1024` for KiB / MiB), `decimals` (0–20, default `2`, trailing zeroes dropped) and `locale`.

```typescript
formatCompactNumber(1200000, "en-US", { compactDisplay: "long" }); // "1.2 million"
formatCurrency(-12, "USD", "en-US", { currencySign: "accounting" }); // "($12.00)"
formatBytes(1536, { base: 1024 }); // "1.5 KiB"
```

Output comes from the runtime's `Intl` data, so spacing, symbols and abbreviations can differ slightly between runtimes.

### Currency metadata

| Function | Description | Example |
| --- | --- | --- |
| `getCountryCurrencies(countryCode)` | Active legal-tender currency codes for a two-letter region code; `[]` when unknown | `getCountryCurrencies("PA")` → `["PAB", "USD"]` |
| `getCurrencySymbol(currency, locale?, display?)` | Localized symbol; `display` is `"symbol"` (default) or `"narrowSymbol"` | `getCurrencySymbol("VND")` → `"₫"` |
| `getCurrencyName(currency, locale?)` | Localized currency name | `getCurrencyName("USD")` → `"US Dollar"` |

Country data is a bundled snapshot of [Unicode CLDR 48.2.0](https://github.com/unicode-org/cldr-json/tree/48.2.0) (see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)). When a country has several currencies, the order does not imply a preferred one. This package does not fetch exchange rates or convert between currencies.

### Text

Lengths count Unicode grapheme clusters (user-perceived characters), so emoji, flags and combining accents stay intact.

| Function | Description | Example |
| --- | --- | --- |
| `truncateText(text, maxLength, options?)` | Cut to `maxLength` including the ellipsis. Options: `ellipsis` (`"..."`), `preserveWords` (`false`) | `truncateText("Hello world", 8)` → `"Hello..."` |
| `shortenString(text, options?)` | Keep both ends. Options: `startLength` (`4`), `endLength` (`4`), `separator` (`"..."`) | `shortenString("abcdefghijklxyzc")` → `"abcd...xyzc"` |
| `maskString(text, options?)` | Hide characters. Options: `visibleStart` (`0`), `visibleEnd` (`4`), `mask` (`"*"`) | `maskString("1234567890")` → `"******7890"` |
| `normalizeWhitespace(text)` | Trim and collapse whitespace to single spaces | `normalizeWhitespace("  a   b ")` → `"a b"` |
| `removeDiacritics(text)` | Strip accents, including Vietnamese `đ` / `Đ` | `removeDiacritics("Đặng Thị Tứ")` → `"Dang Thi Tu"` |
| `slugify(text)` | Lowercase slug without accents; keeps non-Latin letters and numbers | `slugify("  Hello, World! ")` → `"hello-world"` |
| `capitalize(text, locale?)` | Uppercase the first character, leave the rest unchanged | `capitalize("istanbul", "tr")` → `"İstanbul"` |

```typescript
truncateText("Hello beautiful world", 12, { preserveWords: true }); // "Hello..."
shortenString("0x71C7656EC7ab88b098defB751B7401B5f6d8976F", { startLength: 6 }); // "0x71C7...976F"
maskString("user@example.com", { visibleStart: 2, visibleEnd: 4 }); // "us**********.com"
```

`maskString` is for display only; it is not encryption or secure redaction. `slugify` does not guarantee uniqueness.

### Dates

| Function | Description | Example |
| --- | --- | --- |
| `formatDate(date, formatStr, options?)` | Format a `Date`, millisecond timestamp or date string with [date-fns tokens](https://date-fns.org/docs/format), in the local timezone | `formatDate(new Date(2026, 9, 3), "yyyy-MM-dd")` → `"2026-10-03"` |

### Math

| Function | Description | Example |
| --- | --- | --- |
| `summary(a, b)` | Add two numbers | `summary(0.1, 0.2)` → `0.3` |
| `subtract(a, b)` | Subtract `b` from `a` | `subtract(0.3, 0.1)` → `0.2` |
| `multiply(a, b)` | Multiply two numbers | `multiply(0.1, 3)` → `0.3` |
| `divide(a, b)` | Divide `a` by `b`; throws on division by zero | `divide(10, 4)` → `2.5` |
| `percentage(value, total)` | `value` as a percentage of `total`; `0` when `total` is `0` | `percentage(25, 200)` → `12.5` |
| `round(value, decimals = 2)` | Round half up to `decimals` places | `round(3.14159)` → `3.14` |
| `factorial(n)` | Factorial of an integer, `0 ≤ n ≤ 170` | `factorial(5)` → `120` |
| `fibonacci(n)` | n-th Fibonacci number, `0 ≤ n ≤ 1476` | `fibonacci(10)` → `55` |
| `gcd(a, b)` | Greatest common divisor | `gcd(12, 18)` → `6` |
| `lcm(a, b)` | Least common multiple | `lcm(4, 6)` → `12` |
| `isPrime(n)` | Whether `n` is prime; `false` for non-integers | `isPrime(17)` → `true` |

### Arrays

| Function | Description | Example |
| --- | --- | --- |
| `unique(arr, keySelector?)` | Remove duplicates, optionally by key | `unique([1, 2, 2, 3])` → `[1, 2, 3]` |
| `filterBy(arr, predicate)` | Keep the items that match | `filterBy([1, 2, 3, 4], (x) => x > 2)` → `[3, 4]` |
| `sortBy(arr, keySelector, order = "asc")` | Sort by a key, `"asc"` or `"desc"` | `sortBy(users, (u) => u.name, "desc")` |
| `groupBy(arr, keySelector)` | Group items into an object by key | `groupBy(users, (u) => u.role)` |
| `chunk(arr, size)` | Split into chunks of `size` | `chunk([1, 2, 3, 4, 5], 2)` → `[[1, 2], [3, 4], [5]]` |
| `flatten(arr)` | Flatten one level | `flatten([[1, 2], [3]])` → `[1, 2, 3]` |
| `findIndexes(arr, predicate)` | Indexes of every match | `findIndexes([1, 2, 2, 3], (x) => x === 2)` → `[1, 2]` |
| `sumValueInArray(arr)` | Sum of the numbers | `sumValueInArray([0.1, 0.2, 0.3])` → `0.6` |
| `averageValueInArray(arr)` | Average of the numbers; `0` for an empty array | `averageValueInArray([1, 2, 3, 4])` → `2.5` |
| `findMin(arr, compareFn?)` | Smallest item; `undefined` for an empty array | `findMin([3, 1, 2])` → `1` |
| `findMax(arr, compareFn?)` | Largest item; `undefined` for an empty array | `findMax([3, 1, 2])` → `3` |

### Sorting

Every sort returns a new array and leaves the input untouched.

| Function | Complexity | Notes |
| --- | --- | --- |
| `quickSort(arr, compareFn?)` | O(n log n) average | Three-way partition, stays fast on sorted or duplicate-heavy input |
| `mergeSort(arr, compareFn?)` | O(n log n) | Stable |
| `heapSort(arr, compareFn?)` | O(n log n) | |
| `insertionSort(arr, compareFn?)` | O(n²) | Good for small or nearly sorted arrays |
| `selectionSort(arr, compareFn?)` | O(n²) | |
| `bubbleSort(arr, compareFn?)` | O(n²) | |
| `countingSort(arr)` | O(n + k) | Non-negative integers only, max value 10,000,000 |
| `radixSort(arr)` | O(d · n) | Non-negative integers only |

```typescript
quickSort([5, 2, 9, 1]); // [1, 2, 5, 9]
quickSort([5, 2, 9, 1], (a, b) => b - a); // [9, 5, 2, 1]
```

The low-level helpers `merge`, `heapify` and `countingSortByDigit` are still exported for backward compatibility; prefer the sort functions above.

### Searching

Both return the index of the match, or `-1` when it is not found.

| Function | Complexity | Example |
| --- | --- | --- |
| `binarySearch(arr, target, compareFn?)` | O(log n), `arr` must be sorted | `binarySearch([1, 3, 5, 7], 5)` → `2` |
| `linearSearch(arr, target, compareFn?)` | O(n) | `linearSearch(["a", "b"], "b")` → `1` |

### Objects

| Function | Description | Example |
| --- | --- | --- |
| `deepClone(obj)` | Deep copy with `structuredClone`; handles `Date`, `Map`, `Set` and circular references, throws on functions | `deepClone({ a: { b: 1 } })` |
| `mergeObjects(target, source)` | Shallow merge into a new object; `source` wins on conflicts | `mergeObjects({ a: 1, b: 1 }, { b: 2 })` → `{ a: 1, b: 2 }` |

### Error handling

Invalid input throws a standard error instead of returning `NaN` or a wrong result:

| Error | When | Example |
| --- | --- | --- |
| `TypeError` | An argument has the wrong type: not a finite number, not an integer, not an array, not a string | `factorial(Infinity)`, `sumValueInArray(null)`, `formatPercent(NaN)` |
| `RangeError` | A value is outside the supported range or malformed | `divide(1, 0)`, `chunk([1], 0)`, `formatCurrency(1, "US")`, `formatDate("nope", "yyyy")` |

```typescript
try {
  divide(total, count);
} catch (error) {
  if (error instanceof RangeError) {
    // count was 0
  }
}
```

The one exception is `formatNumber`, which keeps native `Intl` behavior: `formatNumber(NaN)` returns `"NaN"`.

### Types

```typescript
import type { Comparator, KeySelector } from "@fatdevcon/utilities";

type Comparator<T> = (a: T, b: T) => number; // negative, zero or positive, like Array.prototype.sort
type KeySelector<T> = (item: T) => any;
```

Option types are exported too: `CompactNumberOptions`, `PercentFormatOptions`, `CurrencyFormatOptions`, `UnitFormatOptions`, `BytesFormatOptions`, `TruncateTextOptions`, `ShortenStringOptions`, `MaskStringOptions`.

## Changelog

### 0.2.4

- Added the [documentation site](https://phanhoangquoctu.github.io/fatdevcon-utilities/) and linked it from the README and the npm homepage

### 0.2.3

- Rewrote the README as per-module tables with verified examples, and fixed garbled Unicode in the text examples
- Expanded the npm keywords; no API changes

### 0.2.2

- Updated runtime dependencies and development tools; refreshed transitive dependencies to clear npm audit findings
- The build now runs at pack time instead of on every install
- Corrected repository links

### 0.2.1

- Added compact, percent, currency, unit and byte formatting
- Added currency symbols and names, and country-to-currency lookup
- Added grapheme-aware truncation, middle shortening, masking, whitespace normalization, diacritic removal, slugs and capitalization
- Added Bun support and separate ESM / CommonJS type declarations

### 0.2.0

- Hardened input validation and edge cases in math, arrays, searching and sorting
- Fixed large-array sorting and prototype-key grouping; switched `deepClone` to `structuredClone`
- Added invalid-date errors and removed unused dependencies

## License

MIT; see [LICENSE](LICENSE). Bundled Unicode data keeps its own notice in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

Maintained by the package owner; external contributions are not accepted. Versions follow [SemVer](https://semver.org/).
