# @fatdevcon/utilities v0.2.2

[![npm version](https://img.shields.io/npm/v/@fatdevcon/utilities.svg)](https://www.npmjs.com/package/@fatdevcon/utilities)

Typed utilities for locale-aware formatting, Unicode text, currency metadata, math, arrays, objects, sorting and searching. ESM and CommonJS builds include TypeScript declarations. Runtime dependencies: `date-fns` and `decimal.js`.

## Installation

Requires Node.js 18+ or Bun 1.1.34+. Formatting uses the runtime's Intl/ICU data, including Intl.Segmenter and Intl.DisplayNames. Locale-specific spacing, names and abbreviations can differ between runtimes.

```sh
npm install @fatdevcon/utilities
yarn add @fatdevcon/utilities
pnpm add @fatdevcon/utilities
bun add @fatdevcon/utilities
```

## Usage

```ts
import { formatCompactNumber, formatCurrency, truncateText, shortenString, getCountryCurrencies, slugify } from '@fatdevcon/utilities';

formatCompactNumber(12500); // '12.5K'
formatCurrency(1234.5, 'USD'); // '$1,234.50'
getCountryCurrencies('VN'); // ['VND']
truncateText('Hello world', 8); // 'Hello...'
shortenString('abcdefghijklxyzc'); // 'abcd...xyzc'
slugify('??ng Th? T?'); // 'dang-thi-tu'
```

CommonJS: `const { formatCurrency } = require('@fatdevcon/utilities');`

Bun uses the same imports. Save the example in `example.ts` and run `bun run example.ts` after installation. See the [Bun package manager documentation](https://bun.com/docs/pm/cli/install).

## Number formatting

New number formatters require finite numbers; NaN, infinities and non-number inputs throw TypeError. Locale arguments accept Intl.LocalesArgument; defaults below are en-US unless stated otherwise. Intl validates locale, currency syntax, unit and digit options.

| Function | Behavior |
| --- | --- |
|`formatNumber(value, locale?, options?)`|Existing Intl.NumberFormat wrapper; preserves the runtime locale default and native NaN/Infinity behavior.|
|`formatCompactNumber(value, locale?, options?)`|Compact notation, maximum 1 fractional digit by default. Supports compactDisplay: 'long'.|
|`formatPercent(value, locale?, options?)`|Ratio input: 0.125 becomes 12.5%; maximum 2 fractional digits by default.|
|`formatCurrency(value, currency, locale?, options?)`|ISO 4217 code (case-insensitive); standard currency minor units; supports accounting, display and precision options.|
|`formatUnit(value, unit, locale?, options?)`|Intl unit such as 'kilometer-per-hour', 'celsius' or 'liter'.|
|`formatBytes(value, options?)`|Non-negative bytes; SI base 1000 by default, IEC base 1024 optional; units through EB/EiB.|

Number options extend Intl.NumberFormatOptions, excluding the fixed notation/style/currency/unit as appropriate. These fixed fields cannot be overridden. Bytes options: `{ base?: 1000 | 1024, decimals?: number, locale?: Intl.LocalesArgument }`. decimals defaults to 2, must be an integer from 0 to 20, and does not pad trailing zeroes. Values rounding up to the next unit are promoted. Values above EB/EiB remain in the largest unit. Fractional bytes are accepted.

```ts
import { formatPercent, formatUnit, formatBytes, formatCurrency } from '@fatdevcon/utilities';
formatPercent(0.125); // '12.5%'
formatUnit(12, 'kilometer-per-hour'); // '12 km/h'
formatBytes(1500); // '1.5 kB'
formatBytes(1536, { base: 1024 }); // '1.5 KiB'
formatCurrency(-12, 'USD', 'en-US', { currencySign: 'accounting' }); // '($12.00)'
```

## Currency metadata

| Function | Behavior |
| --- | --- |
|`getCountryCurrencies(countryCode)`|Returns a fresh string[] of active legal-tender currency codes for a two-letter CLDR region code, case-insensitive.|
|`getCurrencySymbol(currency, locale?, display?)`|Localized currency symbol; display is 'symbol' (default) or 'narrowSymbol'.|
|`getCurrencyName(currency, locale?)`|Localized currency name, e.g. 'US Dollar'.|

Country data is a bundled snapshot derived from [Unicode CLDR 48.2.0](https://github.com/unicode-org/cldr-json/tree/48.2.0), filtered for 2026-10-03: 255 regions. Historical and non-tender currencies are excluded. Some countries have multiple currencies: `getCountryCurrencies('PA')` includes PAB and USD. Array order does not imply a preferred currency. Unknown regions or regions without recorded tender return []; malformed codes throw RangeError and non-string codes throw TypeError. Region codes include CLDR territories, not only sovereign countries.

Currency functions validate three-letter code syntax; Intl may echo unknown well-formed codes such as ZZZ. Symbols are not unique identifiers. This package does not fetch exchange rates, convert currencies, or provide live monetary data. Names and symbols come from the runtime's Intl data; country mappings come from the bundled snapshot and may differ from older runtimes. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Text formatting

Length-based functions count Unicode grapheme clusters (user-perceived characters), preserving emoji sequences, flags and combining accents. Inputs must be strings. Lengths must be non-negative safe integers (TypeError for non-integers, RangeError for negative values).

| Function | Defaults and behavior |
| --- | --- |
|`truncateText(text, maxLength, options?)`|Total output length includes ellipsis ('...' by default). Options: ellipsis, preserveWords (false). If marker exceeds maxLength, marker itself is clipped. Zero returns ''.|
|`shortenString(text, options?)`|Keep startLength: 4 and endLength: 4, joined by separator: '...'. Returns original text if it already fits the resulting length.|
|`normalizeWhitespace(text)`|Trim and collapse whitespace to a single space.|
|`removeDiacritics(text)`|NFD decomposition and removal of Unicode combining marks; also maps Vietnamese ?/? to d/D. Not a general transliteration engine.|
|`slugify(text)`|Remove diacritics, lowercase, join non-letter/number runs with '-', trim separators. Retains non-Latin letters and numbers.|
|`capitalize(text, locale?)`|Uppercase the first grapheme, preserving the remainder; uses runtime locale by default. Some uppercase mappings expand to multiple characters.|
|`maskString(text, options?)`|visibleStart: 0, visibleEnd: 4, mask: '*'. Mask must be exactly one grapheme; each hidden grapheme gets one mask.|

preserveWords uses whitespace boundaries and falls back to grapheme clipping when the first word does not fit. It is not language-specific word segmentation. Short strings within maskString's visible lengths remain visible. Masking is presentation only, not encryption or secure redaction. slugify does not guarantee uniqueness or safe HTML/URL encoding; encode where appropriate.

```ts
import { truncateText, shortenString, maskString, capitalize } from '@fatdevcon/utilities';
truncateText('Hello beautiful world', 12, { preserveWords: true }); // 'Hello...'
shortenString('abcdefghijklmnop', { startLength: 2, endLength: 3 }); // 'ab...nop'
maskString('1234567890'); // '******7890'
capitalize('istanbul', 'tr'); // '?stanbul'
```

## Date formatting

`formatDate(date: Date | string | number, formatStr: string, options?: FormatOptions): string` uses date-fns format tokens and locale options. Invalid dates throw RangeError. Strings/numbers use the native Date constructor; numeric timestamps are milliseconds. Output follows the local timezone.

```ts
import { formatDate } from '@fatdevcon/utilities';
formatDate(new Date(2026, 9, 3), 'yyyy-MM-dd'); // '2026-10-03'
```

## Math

| Function | Behavior |
| --- | --- |
|`summary(a, b)`, `subtract(a, b)`, `multiply(a, b)`, `divide(a, b)`|Arithmetic; division by zero throws RangeError.|
|`percentage(value, total)`|Compute value / total * 100 (returns 0 when total is 0); distinct from formatPercent's ratio input.|
|`round(value, decimals = 2)`|Round to a non-negative integer number of decimal places.|
|`factorial(n)`|Non-negative integer, n <= 170.|
|`gcd(a, b)`, `lcm(a, b)`|Greatest common divisor and least common multiple.|
|`isPrime(n)`|Primality; false for non-integers and non-finite input.|
|`fibonacci(n)`|Non-negative integer, n <= 1476.|

## Array, object and algorithm API

### Array Manipulation

- `unique<T>(arr: T[], keySelector?: KeySelector<T>): T[]` - Get unique values in array (optionally by key)
- `filterBy<T>(arr: T[], predicate: (item: T, index: number, array: T[]) => boolean): T[]` - Filter array by predicate
- `sortBy<T>(arr: T[], keySelector: KeySelector<T>, order?: "asc" | "desc"): T[]` - Sort array by key
- `chunk<T>(arr: T[], size: number): T[][]` - Chunk array into smaller arrays (`size` must be a positive integer)
- `flatten<T>(arr: T[][]): T[]` - Flatten array of arrays
- `findIndexes<T>(arr: T[], predicate: (item: T, index: number, array: T[]) => boolean): number[]` - Find indexes of matching elements
- `groupBy<T>(arr: T[], keySelector: KeySelector<T>): Record<string, T[]>` - Group array by key

### Sorting Algorithms

- `quickSort<T>(arr: T[], compareFn?: Comparator<T>): T[]` - Quick sort
- `mergeSort<T>(arr: T[], compareFn?: Comparator<T>): T[]` - Merge sort
- `insertionSort<T>(arr: T[], compareFn?: Comparator<T>): T[]` - Insertion sort
- `selectionSort<T>(arr: T[], compareFn?: Comparator<T>): T[]` - Selection sort
- `bubbleSort<T>(arr: T[], compareFn?: Comparator<T>): T[]` - Bubble sort
- `heapSort<T>(arr: T[], compareFn?: Comparator<T>): T[]` - Heap sort
- `countingSort(arr: number[]): number[]` - Counting sort for non-negative integers (max value ≤ 10,000,000)
- `radixSort(arr: number[]): number[]` - Radix sort for non-negative integers

### Search Algorithms

- `binarySearch<T>(arr: T[], target: T, compareFn?: Comparator<T>): number` - Binary search on sorted array
- `linearSearch<T>(arr: T[], target: T, compareFn?: Comparator<T>): number` - Linear search

### Array Utilities

- `sumValueInArray(arr: number[]): number` - Sum of array elements
- `averageValueInArray(arr: number[]): number` - Average of array elements
- `findMin<T>(arr: T[], compareFn?: Comparator<T>): T | undefined` - Find minimum value in array
- `findMax<T>(arr: T[], compareFn?: Comparator<T>): T | undefined` - Find maximum value in array

### Object Utilities

- `deepClone<T>(obj: T): T` - Create a deep clone using `structuredClone` (supports `Date`, `Map`, `Set`, circular references)
- `mergeObjects<T, U>(target: T, source: U): T & U` - Shallow merge two objects

### Error Handling

Math, array and algorithm helpers validate their inputs. Existing formatNumber follows native Intl behavior; new formatter validation is documented above:

- `TypeError` - argument is not a finite number / integer / array (e.g. `NaN`, `Infinity`, `null`)
- `RangeError` - value is out of the supported range (division by zero, negative factorial, `chunk` size < 1, `countingSort` with negative numbers, ...)

```typescript
try {
  factorial(Infinity);
} catch (error) {
  if (error instanceof TypeError) {
    // invalid input type
  }
}
```

### Types

- `Comparator<T>` - Type for comparison function `(a: T, b: T) => number`
- `KeySelector<T>` - Type for key selector function `(item: T) => any`


Exported formatting option types: `CompactNumberOptions`, `PercentFormatOptions`, `CurrencyFormatOptions`, `UnitFormatOptions`, `BytesFormatOptions`, `TruncateTextOptions`, `ShortenStringOptions`, `MaskStringOptions`. Comparator and KeySelector are also exported from the package root.

Legacy algorithm helpers `merge(left, right, compareFn)`, `heapify(arr, n, i, compareFn)` and `countingSortByDigit(arr, exp)` remain exported for compatibility. Prefer the documented sorting functions for application code.

## Installation notes

The published package includes compiled ESM/CommonJS and declarations. Installing it from npm does not require a compiler or run a build. Source builds use Node.js 24+ and npm 11.19+; the published runtime API continues to support Node.js 18+ and Bun.

Version 0.2.2 refreshes the dependency lockfile, including development tools. TypeScript 7.0.2 runs typechecking; TypeScript's official 6.x compatibility package supplies the compiler API required by ts-jest, tsup and typescript-eslint. This follows [Microsoft's side-by-side setup](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/). The build runs at pack/release time, rather than on every install.

The source project records explicit npm install-script decisions for native build tools. Glob 13 overrides in sucrase and test-exclude remove their deprecated Glob 10 dependency; build and coverage checks validate this combination. Dependency advisories can change after a release, so a clean audit reflects the release verification date.

An npm warning about an unknown `python` setting comes from a local/user npm configuration, not this package. Remove that obsolete setting from your user .npmrc if it exists; installing this package does not modify users' npm configuration.

## Changelog

### 0.2.2

- Updated runtime dependencies and all direct development tools to current stable releases, with TypeScript 7 and the official 6.x compiler-API compatibility alias.
- Refreshed transitive dependencies to address the full project's npm audit findings.
- Added explicit install-script policy and replaced deprecated transitive Glob 10.
- Moved the installation-time build to prepack; removed the deprecated TypeScript baseUrl option and separated declaration bundling from tsup's deprecated configuration.
- Updated package verification to exercise normal consumer installation and TypeScript 7.
- Corrected repository links to the current GitHub location.

### 0.2.1

- Added compact, percent, currency, unit and byte formatting.
- Added currency symbols/names and CLDR country-currency lookup.
- Added grapheme-aware truncation, middle shortening, masking, whitespace normalization, diacritic removal, slugs and capitalization.
- Added Bun usage and runtime package checks; separate ESM/CommonJS declaration resolution.
- Fixed ESLint 9 configuration and release checks; exported shared types.
- Corrected dependency claims and removed contributor/development instructions.

### 0.2.0

- Hardened input validation and edge cases in math, arrays, searching and sorting.
- Fixed large-array sorting and prototype-key grouping; switched deepClone to structuredClone.
- Added invalid-date errors and removed unused dependencies.

## Maintenance and license

Maintained independently by the package owner. External contributions are not accepted. Version numbers follow SemVer.

MIT; see [LICENSE](LICENSE). Derived Unicode data retains its own notice in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
