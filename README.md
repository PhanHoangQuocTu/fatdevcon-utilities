<div align="center">

# @fatdevcon/utilities

**Exact math and everyday helpers for TypeScript. Zero dependencies.**

[![npm version](https://img.shields.io/npm/v/@fatdevcon/utilities.svg?style=flat-square)](https://www.npmjs.com/package/@fatdevcon/utilities)
[![npm downloads](https://img.shields.io/npm/dm/@fatdevcon/utilities.svg?style=flat-square)](https://www.npmjs.com/package/@fatdevcon/utilities)
[![minzipped size](https://img.shields.io/bundlephobia/minzip/@fatdevcon/utilities?style=flat-square)](https://bundlephobia.com/package/@fatdevcon/utilities)
![dependencies](https://img.shields.io/badge/dependencies-0-brightgreen?style=flat-square)
[![types](https://img.shields.io/npm/types/@fatdevcon/utilities.svg?style=flat-square)](https://www.npmjs.com/package/@fatdevcon/utilities)
[![CI](https://img.shields.io/github/actions/workflow/status/PhanHoangQuocTu/fatdevcon-utilities/ci.yml?branch=master&style=flat-square&label=CI)](https://github.com/PhanHoangQuocTu/fatdevcon-utilities/actions/workflows/ci.yml)
[![Socket](https://socket.dev/api/badge/npm/package/@fatdevcon/utilities)](https://socket.dev/npm/package/@fatdevcon/utilities)
[![license](https://img.shields.io/npm/l/@fatdevcon/utilities.svg?style=flat-square)](LICENSE)

[Documentation](https://phanhoangquoctu.github.io/fatdevcon-utilities/) ·
[Live playground](https://phanhoangquoctu.github.io/fatdevcon-utilities/#playground) ·
[API reference](https://phanhoangquoctu.github.io/fatdevcon-utilities/#api) ·
[Changelog](CHANGELOG.md)

</div>

```typescript
import { summary, round, formatCurrency, formatDate } from "@fatdevcon/utilities";

0.1 + 0.2;                       // 0.30000000000000004
summary(0.1, 0.2);               // 0.3
round(1.005, 2);                 // 1.01 (Math.round gives 1)
formatCurrency("12345678901234567890.129", "USD"); // "$12,345,678,901,234,567,890.13"
formatDate(new Date("2026-01-15T17:30:00Z"), "yyyy-MM-dd HH:mm xxx", { timeZone: "Asia/Ho_Chi_Minh" }); // "2026-01-16 00:30 +07:00"
```

## Why @fatdevcon/utilities

JavaScript numbers are binary doubles: `0.1 + 0.2` is not `0.3`, integers above 2^53 lose digits, and `Math.round(1.005 * 100) / 100` is `1`. This package gives you drop-in helpers that calculate exactly, then covers the formatting, date, text, collection and async work that surrounds real applications, in one small typed package.

- **Exact decimal and big-number math** – numbers, `bigint` and numeric strings of any practical size, with no float drift and no silent wrong answers: overflow, underflow and bad input throw typed errors with a stable `code`.
- **Zero runtime dependencies** – about 21 kB minified and gzipped for the whole package, tree-shakeable, and `npm install` adds exactly one package to `node_modules`.
- **Locale, currency and time zone aware** – compact numbers, percentages, currencies, byte sizes and dates through `Intl`, with ISO 4217 country metadata and DST-aware UTC offsets for any IANA zone.
- **Dates without a date library** – ISO 8601 parsing, token formatting compatible with date-fns, calendar arithmetic and time zone formatting.
- **Unicode-safe text** – truncating, masking and shortening count user-perceived characters, so emoji, flags and accents are never cut in half.
- **Everyday helpers** – `groupBy`, `deepMerge`, `setByPath`, `debounce`, `throttle`, abort-aware `wait` / `withRetry`, validators and classic sort and search algorithms, with no lodash required.
- **Typed, ESM and CommonJS** – declarations included, inputs validated, nothing mutates what you pass in. Runs on Node.js 18+, Bun and modern browsers.

## Installation

```bash
npm install @fatdevcon/utilities
```

Also works with `yarn add`, `pnpm add` and `bun add`. Requires Node.js 18+ or Bun 1.1.34+ (and any modern browser through a bundler). The package ships prebuilt and has no runtime dependencies, so installing it needs no compiler or build step.

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

Big numbers work the same way: pass a `bigint` or a numeric string and nothing is rounded.

```typescript
import { summary, multiply, divide, factorial, formatCurrency } from "@fatdevcon/utilities";

summary("100000000000000000000000000000", "1"); // "100000000000000000000000000001"
multiply(2n ** 64n, 2n ** 64n); // 340282366920938463463374607431768211456n
divide("1", "3", { precision: 5 }); // "0.33333"
factorial(25n); // 15511210043330985984000000n
formatCurrency("12345678901234567890.129", "USD"); // "$12,345,678,901,234,567,890.13"
multiply(1e200, 1e200); // throws NumericRangeError ERR_OVERFLOW, not Infinity
```

CommonJS:

```javascript
const { formatCurrency } = require("@fatdevcon/utilities");
```

## Common tasks

<details>
<summary>How do I fix floating-point errors like 0.1 + 0.2 in JavaScript?</summary>

Use `summary`, `subtract`, `multiply`, `divide` and `round`; they calculate in exact decimal arithmetic. For lists use `sumValueInArray`, `averageValueInArray` and `median`, and pass `bigint` or numeric strings when values exceed 2^53.

</details>

<details>
<summary>How do I format currency, bytes or compact numbers for a locale?</summary>

`formatCurrency(1234.5, "VND", "vi-VN")`, `formatBytes(1536, { base: 1024 })` and `formatCompactNumber(12500)` use the runtime's `Intl` data and keep every digit of big values. Go the other way with `parseBytes("1.5 GB")` and `parseDuration("1h 2m")`.

</details>

<details>
<summary>How do I format a date in a specific time zone?</summary>

`formatDate(date, "yyyy-MM-dd HH:mm xxx", { timeZone: "Asia/Ho_Chi_Minh" })`, or `formatInTimeZone(date, zone, locale, options)` for `Intl` styles, and `getTimeZoneOffset(date, zone)` for DST-aware offsets.

</details>

<details>
<summary>How do I update nested state without mutating it?</summary>

`setByPath(state, "user.tags[1]", "b")` returns a copy that shares every untouched branch and refuses `__proto__`, `constructor` and `prototype` keys.

</details>

<details>
<summary>Can it replace decimal.js, date-fns or lodash?</summary>

For everyday cases, yes: exact arithmetic with seven rounding modes, ISO parsing, date-fns-compatible formatting and the common collection helpers are covered. It is a focused toolkit rather than a full replacement; keep a dedicated library when you need its broader scope.

</details>

## Big numbers

A JavaScript `number` is a 64-bit double: about 16 significant digits, a ceiling near 1.8e308, and no exact 0.1. Every numeric function here accepts a `NumericInput` (`number | bigint | string`) and the **return kind follows the input kind**, so existing number code keeps returning numbers.

| Arguments | Result |
| --- | --- |
| all `number` | `number` (a result that does not fit throws instead of returning `Infinity` or `0`) |
| all `bigint`, whole-number result | `bigint` (`summary`, `subtract`, `multiply`, `modulo`, `power`, `gcd`, `lcm`, `factorial`, `fibonacci`, `clamp`, `abs`, `randomInt`) |
| all `bigint`, fractional result | `string` (`divide`, `percentage`) |
| any `string`, or mixed kinds | `string` in plain decimal notation, never an exponent |

Strings use decimal notation (`"12.5"`, `"-.5"`, `"1e-30"`). Blank text, surrounding spaces, separators (`"1,000"`), `"0x10"`, `"NaN"` and `"Infinity"` are rejected with `ERR_INVALID_NUMBER`. Use `isNumeric(value)` to test first.

- **Exact, on native `bigint`** – the package ships its own decimal engine, so there is no dependency to install and no global configuration to collide with. Addition, subtraction, multiplication, modulo and integer powers never round. Division is exact when the quotient terminates, otherwise it keeps `precision` significant digits (1 to 10000, default 40).
- **Range** – magnitudes from about 1e-300,000 to 1e300,000 (the same on Node, Bun and browsers). Beyond that: `ERR_OVERFLOW` / `ERR_UNDERFLOW`.
- **Fast** – safe integers take a native path, `factorial(65000n)` and `fibonacci(1000000n)` take well under 0.2 s, and a million-element `sumValueInArray` about 10 ms (integers) or 0.4 s (fractions).
- **Formatters keep every digit** – `formatNumber`, `formatCurrency`, `formatPercent`, `formatCompactNumber`, `formatUnit`, `formatBytes` and `formatDuration` accept bigint and numeric strings. This needs `Intl.NumberFormat` v3 (Node 20+, current browsers); older runtimes accept a string only when it survives conversion to a double unchanged.

The [documentation site](https://phanhoangquoctu.github.io/fatdevcon-utilities/#big-numbers) lists every limit, parameter and error code.

## API index

The tables below are a quick reference; the [documentation site](https://phanhoangquoctu.github.io/fatdevcon-utilities/) has full signatures and more examples.

- [Big numbers](#big-numbers)
- [Number formatting](#number-formatting)
- [Currency metadata](#currency-metadata)
- [Text](#text)
- [Dates](#dates)
- [Time zones](#time-zones)
- [Math](#math)
- [Integer math](#integer-math)
- [Statistics and random](#statistics-and-random)
- [Arrays](#arrays)
- [Sorting](#sorting)
- [Searching](#searching)
- [Objects](#objects)
- [Functions](#functions)
- [Validators](#validators)
- [Error handling](#error-handling)
- [Types](#types)

### Number formatting

`value` is a `number`, `bigint` or numeric string. `locale` defaults to `"en-US"` (except in `formatNumber`, which uses the runtime default). `options` are `Intl.NumberFormat` options.

| Function | Description | Example |
| --- | --- | --- |
| `formatNumber(value, locale?, options?)` | Plain `Intl.NumberFormat` wrapper | `formatNumber(1234567.89, "vi-VN")` → `"1.234.567,89"` |
| `formatCompactNumber(value, locale?, options?)` | Compact notation, at most 1 decimal by default | `formatCompactNumber(12500)` → `"12.5K"` |
| `formatPercent(value, locale?, options?)` | Formats a ratio as a percentage, at most 2 decimals by default | `formatPercent(0.125)` → `"12.5%"` |
| `formatCurrency(value, currency, locale?, options?)` | Formats money for an ISO 4217 code (case-insensitive) | `formatCurrency(1500, "JPY")` → `"¥1,500"` |
| `formatUnit(value, unit, locale?, options?)` | Formats with an `Intl` unit such as `"celsius"` or `"liter"` | `formatUnit(12, "kilometer-per-hour")` → `"12 km/h"` |
| `formatBytes(value, options?)` | Human-readable byte size, from B up to QB / YiB | `formatBytes(1500)` → `"1.5 kB"` |
| `parseBytes(text, options?)` | Inverse of `formatBytes`: `"1.5 GB"`, `"512 KiB"`, `"2tb"` to exact bytes. Options: `base` (`1000`), `bigint` (`false`) | `parseBytes("1.5 GB")` → `1500000000` |

`formatBytes` options: `base` (`1000` by default, or `1024` for KiB / MiB), `decimals` (0–20, default `2`, trailing zeroes dropped) and `locale`. SI units run B kB MB GB TB PB EB ZB YB RB QB; IEC units run to YiB.

```typescript
formatCompactNumber(1200000, "en-US", { compactDisplay: "long" }); // "1.2 million"
formatCurrency(-12, "USD", "en-US", { currencySign: "accounting" }); // "($12.00)"
formatBytes(1536, { base: 1024 }); // "1.5 KiB"
formatBytes("1500000000000000000000000000000"); // "1.5 QB"
formatNumber(10n ** 30n); // "1,000,000,000,000,000,000,000,000,000,000"
parseBytes("512 KiB"); // 524288
parseBytes("1.5 QB", { bigint: true }); // 1500000000000000000000000000000n
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
| `removeDiacritics(text)` | Strip Latin accents and transliterate `đ`, `ø`, `ł`, `ß`, `æ`…; other scripts are left intact | `removeDiacritics("Đặng Thị Tứ")` → `"Dang Thi Tu"` |
| `slugify(text)` | Lowercase slug without accents; keeps non-Latin letters, marks and numbers | `slugify("Straße Ørsted")` → `"strasse-orsted"` |
| `capitalize(text, locale?)` | Uppercase the first character, leave the rest unchanged | `capitalize("istanbul", "tr")` → `"İstanbul"` |
| `camelCase(text)` | Convert to camelCase, splitting on separators and case boundaries | `camelCase("Hello-World_foo")` → `"helloWorldFoo"` |
| `pascalCase(text)` | Convert to PascalCase | `pascalCase("hello world")` → `"HelloWorld"` |
| `kebabCase(text)` | Convert to kebab-case, keeping accents | `kebabCase("XMLHttpRequest")` → `"xml-http-request"` |
| `snakeCase(text)` | Convert to snake_case | `snakeCase("Hello World")` → `"hello_world"` |
| `titleCase(text)` | Capitalize every word | `titleCase("hello-world FOO")` → `"Hello World Foo"` |
| `escapeHtml(text)` | Escape `& < > " '` for HTML | `escapeHtml("<b>Tom & Jerry</b>")` → `"&lt;b&gt;Tom &amp; Jerry&lt;/b&gt;"` |
| `unescapeHtml(text)` | Reverse `escapeHtml` in a single pass | `unescapeHtml("&lt;b&gt;")` → `"<b>"` |
| `countWords(text)` | Count words by Unicode word boundaries | `countWords("Hello, world!")` → `2` |
| `escapeRegExp(text)` | Escape every regular-expression special character so the text matches literally | `escapeRegExp("a.b*")` → `"a\\.b\\*"` |
| `reverseText(text)` | Reverse by user-perceived character | `reverseText("a👨‍👩‍👧‍👦b")` → `"b👨‍👩‍👧‍👦a"` |

```typescript
truncateText("Hello beautiful world", 12, { preserveWords: true }); // "Hello..."
shortenString("0x71C7656EC7ab88b098defB751B7401B5f6d8976F", { startLength: 6 }); // "0x71C7...976F"
maskString("user@example.com", { visibleStart: 2, visibleEnd: 4 }); // "us**********.com"
```

`maskString` is for display only; it is not encryption or secure redaction. `slugify` does not guarantee uniqueness.

### Dates

Dates are plain `Date` objects in the runtime's local time zone unless a function says otherwise. Input may be a `Date`, a millisecond timestamp or a string; date-only ISO strings such as `"2026-10-03"` are read as **local** dates, so the day never shifts with the time zone. No dependency is involved: parsing and formatting are built into the package.

| Function | Description | Example |
| --- | --- | --- |
| `formatDate(date, format, options?)` | Format with Unicode date tokens (`yyyy-MM-dd HH:mm:ss`, `EEEE`, `MMM do`, `xxx`, `PPpp`…). Options: `timeZone`, `locale`, `weekStartsOn`, `firstWeekContainsDate` | `formatDate("2026-10-03", "dd/MM/yyyy")` → `"03/10/2026"` |
| `parseISO(text)` | Parse ISO 8601 (calendar, week and ordinal dates, offsets, fractions); an Invalid Date for malformed text, never throws | `parseISO("2026-10-03T10:30+07:00")` |
| `addDays(date, amount)` | Calendar days later or earlier, keeping the wall-clock time across DST | `addDays("2026-03-01", -1)` → 28 Feb 2026 |
| `addMonths(date, amount)` | Calendar months later or earlier, clamped to the last day of shorter months | `addMonths("2026-01-31", 1)` → 28 Feb 2026 |
| `startOfDay(date)` / `endOfDay(date)` | `00:00:00.000` / `23:59:59.999` of the local day | `endOfDay(now)` |
| `differenceInCalendarDays(later, earlier)` | Whole calendar days between two dates, ignoring time of day and DST | `differenceInCalendarDays("2026-01-01", "2025-01-01")` → `365` |
| `formatRelativeTime(date, options?)` | "3 hours ago" / "in 2 days" via `Intl.RelativeTimeFormat`. Options: `locale`, `now`, `numeric` | `formatRelativeTime(yesterday)` → `"yesterday"` |
| `formatDuration(milliseconds, options?)` | Compact duration; `maxUnits` keeps the largest N units | `formatDuration(3723000)` → `"1h 2m 3s"` |
| `parseDuration(text)` | Inverse of `formatDuration`: `"1h 2m 3s"`, `"1.5h"`, `"2 days, 4 hours"` to milliseconds | `parseDuration("1h 2m 3s")` → `3723000` |
| `isValidDate(value)` | `true` for a `Date` that holds a real moment | `isValidDate(new Date("nope"))` → `false` |

```typescript
formatDate(new Date(2026, 0, 15, 9, 30), "EEEE, do MMMM yyyy 'at' HH:mm"); // "Thursday, 15th January 2026 at 09:30"
formatDate(new Date("2026-01-15T17:30:00Z"), "yyyy-MM-dd HH:mm xxx", { timeZone: "Asia/Ho_Chi_Minh" }); // "2026-01-16 00:30 +07:00"
formatDate("2026-01-15", "EEEE", { locale: "fr" }); // "jeudi"
formatDate("2026-01-15", "yyyy 'W'II"); // "2026 W03"
```

The most used tokens: `yyyy` year, `MM` / `MMM` / `MMMM` month, `dd` / `do` day, `EEE` / `EEEE` weekday, `HH` / `hh a` hours, `mm` minutes, `ss` seconds, `SSS` milliseconds, `xxx` offset (`+07:00`), `X` offset or `Z`, `Q` quarter, `w` / `I` week and ISO week, `P` / `p` localized date and time. The tokens match [date-fns](https://date-fns.org/docs/format), so existing patterns keep working. Wrap literal text in single quotes. English names are built in; any other `locale` string uses the runtime's `Intl` data, and a date-fns `Locale` object (`import { vi } from "date-fns/locale"`) is used as given. `YY`, `YYYY`, `D` and `DD` throw unless enabled with `useAdditionalWeekYearTokens` / `useAdditionalDayOfYearTokens`, because they are usually typos for `yy`, `yyyy`, `d` and `dd`.

### Time zones

Timezone helpers use the runtime's IANA data through `Intl` and operate on a moment in time. `getTimeZoneOffset` defaults to the familiar UTC convention: `Asia/Ho_Chi_Minh` is `+420` minutes, `+25,200` seconds or `+7` hours. Daylight-saving zones can return a different offset at different dates.

| Function | Description | Example |
| --- | --- | --- |
| `isTimeZone(value)` | Test whether the runtime recognizes an IANA timezone | `isTimeZone("Asia/Ho_Chi_Minh")` → `true` |
| `getTimeZoneOffset(date?, timeZone?, options?)` | DST-aware UTC offset in seconds, minutes or hours; `direction: "native"` matches `Date#getTimezoneOffset()` | `getTimeZoneOffset(date, "Asia/Ho_Chi_Minh", { unit: "hours" })` → `7` |
| `getTimeZoneName(date, timeZone, locale?, style?)` | Localized name or GMT offset label | `getTimeZoneName(date, "Asia/Ho_Chi_Minh", "en-US", "shortOffset")` → `"GMT+7"` |
| `formatInTimeZone(date, timeZone, locale?, options?)` | Format an instant in an IANA timezone with `Intl.DateTimeFormat` | `formatInTimeZone(date, "Asia/Ho_Chi_Minh")` |

```typescript
const instant = new Date("2026-01-15T12:00:00Z");

getTimeZoneOffset(instant, "Asia/Ho_Chi_Minh"); // 420
getTimeZoneOffset(instant, "Asia/Ho_Chi_Minh", { unit: "seconds" }); // 25200
getTimeZoneOffset(instant, "Asia/Ho_Chi_Minh", { unit: "hours" }); // 7
getTimeZoneOffset(instant, "Asia/Ho_Chi_Minh", { direction: "native" }); // -420, like Date#getTimezoneOffset()
getTimeZoneOffset(instant, "America/New_York"); // -300 in winter
formatInTimeZone(instant, "Asia/Ho_Chi_Minh", "en-GB", {
  dateStyle: "short",
  timeStyle: "short",
  hourCycle: "h23",
}); // "15/01/2026, 19:00"
```

### Math

Arguments are `number | bigint | string`; see [Big numbers](#big-numbers) for the return kind.

| Function | Description | Example |
| --- | --- | --- |
| `summary(a, b)` | Add two numbers | `summary(0.1, 0.2)` → `0.3` |
| `subtract(a, b)` | Subtract `b` from `a` | `subtract(0.3, 0.1)` → `0.2` |
| `multiply(a, b)` | Multiply two numbers | `multiply(0.1, 3)` → `0.3` |
| `divide(a, b, options?)` | Divide `a` by `b`; `options.precision` for non-terminating quotients | `divide("1", "3", { precision: 5 })` → `"0.33333"` |
| `modulo(a, b)` | Exact remainder with the sign of `a` | `modulo(0.3, 0.1)` → `0` |
| `power(base, exponent, options?)` | Integer power; exact for integer bases | `power(2n, 100n)` → `2n ** 100n` |
| `abs(value)` | Absolute value | `abs("-1.50")` → `"1.5"` |
| `percentage(value, total, options?)` | `value` as a percentage of `total`; `0` when `total` is `0` | `percentage(25, 200)` → `12.5` |
| `round(value, decimals = 2, mode = "half-up")` | Round to `decimals` places; modes `half-up`, `half-down`, `half-even`, `up`, `down`, `ceil`, `floor` | `round(1.005, 2)` → `1.01` |
| `clamp(value, min, max)` | Limit `value` to `[min, max]` | `clamp(15, 0, 10)` → `10` |
| `compareNumbers(a, b)` | Exact `-1 / 0 / 1` across kinds; works as a `compareFn` | `compareNumbers("10", "9")` → `1` |
| `isNumeric(value)` | Type guard for valid numeric input; never throws | `isNumeric("1e5")` → `true` |
| `toDecimalString(value)` | Canonical plain-notation string | `toDecimalString("1e3")` → `"1000"` |

```typescript
round(2.5, 0, "half-even"); // 2
divide(10, 4); // 2.5
multiply("1e299999", "10"); // "1" followed by 300,000 zeros
quickSort(["10", "9", "100"], compareNumbers); // ["9", "10", "100"]
```

A `number` result that does not fit a double throws `ERR_OVERFLOW` or `ERR_UNDERFLOW` (for example `multiply(1e200, 1e200)`), and the message points at the bigint or string call that gives the exact answer.

### Integer math

| Function | Description | Example |
| --- | --- | --- |
| `factorial(n)` | `n!`; a number is limited to 170, a bigint or string to 65,000 | `factorial(25n)` → `15511210043330985984000000n` |
| `fibonacci(n)` | n-th Fibonacci number; a number is limited to 1476, a bigint or string to 1,000,000 | `fibonacci(100n)` → `354224848179261915075n` |
| `gcd(a, b)` | Greatest common divisor; supports decimals | `gcd(0.5, 0.25)` → `0.25` |
| `lcm(a, b)` | Least common multiple; supports decimals | `lcm(10n ** 20n, 15n)` → `300000000000000000000n` |
| `isPrime(n)` | Whether `n` is prime; up to 2048 bits. A proof below about 3.3e24, a strong probable-prime test beyond | `isPrime(2n ** 127n - 1n)` → `true` |

`isPrime` never throws for a `number` (`NaN`, non-integers and values below 2 are `false`); a bigint or string is validated.

### Statistics and random

| Function | Description | Example |
| --- | --- | --- |
| `median(values)` | Median of numbers; `0` for an empty array, input is not reordered | `median([4, 1, 3, 2])` → `2.5` |
| `medianBig(values)` | Exact median of numbers, bigints and numeric strings, as a string | `medianBig(["1e30", 3, 5n])` → `"5"` |
| `sumBig(values)` | Exact sum of any numeric kinds, as a string | `sumBig(["0.1", "0.2"])` → `"0.3"` |
| `averageBig(values, options?)` | Exact mean of any numeric kinds, as a string | `averageBig(["1", "2", "4"], { precision: 6 })` → `"2.33333"` |
| `randomInt(min, max, random?)` | Random integer in `[min, max]`; bigint bounds of any size are uniform; inject `random` for tests | `randomInt(1n, 10n ** 40n)` |

`randomInt` uses `Math.random` by default, which is not cryptographically secure.

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
| `sumValueInArray(arr)` | Exact sum of numbers; intermediate totals never overflow (use `sumBig` for bigint / strings) | `sumValueInArray([0.1, 0.2, 0.3])` → `0.6` |
| `averageValueInArray(arr, options?)` | Exact average of numbers; `0` for an empty array | `averageValueInArray([1, 2, 3, 4])` → `2.5` |
| `findMin(arr, compareFn?)` | Smallest item; `undefined` for an empty array. The default comparison refuses `NaN` | `findMin([3, 1, 2])` → `1` |
| `findMax(arr, compareFn?)` | Largest item; `undefined` for an empty array | `findMax([3, 1, 2])` → `3` |
| `compact(arr)` | Drop `false`, `null`, `undefined`, `0`, `""`, `NaN` | `compact([0, 1, "", 2])` → `[1, 2]` |
| `difference(arr, values)` | Items not in `values` | `difference([1, 2, 3], [2])` → `[1, 3]` |
| `intersection(arr, values)` | Unique items in both | `intersection([1, 2, 2], [2, 3])` → `[2]` |
| `union(...arrays)` | Unique items across arrays | `union([1, 2], [2, 3])` → `[1, 2, 3]` |
| `partition(arr, predicate)` | Split into `[matching, rest]` in one pass | `partition([1, 2, 3, 4], (x) => x % 2 === 0)` → `[[2, 4], [1, 3]]` |
| `countBy(arr, keySelector)` | Count items per key | `countBy(["a", "b", "a"], (x) => x)` → `{ a: 2, b: 1 }` |
| `keyBy(arr, keySelector)` | Index items by key | `keyBy(users, (u) => u.id)` |
| `zip(a, b)` | Pair items by index | `zip([1, 2], ["a", "b"])` → `[[1, "a"], [2, "b"]]` |
| `range(start, end?, step?)` | Numbers from `start` up to, not including, `end`; fractional steps are exact; at most 10,000,000 items | `range(0, 1, 0.1)` → `[0, 0.1, …, 0.9]` |
| `shuffle(arr, random?)` | Fisher-Yates shuffle into a new array | `shuffle([1, 2, 3])` |
| `sample(arr, random?)` | Random item; `undefined` for an empty array | `sample(["a", "b"])` |
| `flattenDeep(arr, depth?)` | Flatten any depth of nesting | `flattenDeep([1, [2, [3]]])` → `[1, 2, 3]` |

### Sorting

Every sort returns a new array and leaves the input untouched. The default comparison orders numbers, bigints, strings and dates and refuses `NaN`; for numeric strings pass `compareNumbers`.

| Function | Complexity | Notes |
| --- | --- | --- |
| `quickSort(arr, compareFn?)` | O(n log n) average | Three-way partition, stays fast on sorted or duplicate-heavy input |
| `mergeSort(arr, compareFn?)` | O(n log n) | Stable |
| `heapSort(arr, compareFn?)` | O(n log n) | |
| `insertionSort(arr, compareFn?)` | O(n²) | Good for small or nearly sorted arrays |
| `selectionSort(arr, compareFn?)` | O(n²) | |
| `bubbleSort(arr, compareFn?)` | O(n²) | |
| `countingSort(arr)` | O(n + k) | Safe integers, negatives included, `max - min` at most 10,000,000 |
| `radixSort(arr)` | O(d · n) | Safe integers or bigints, negatives included, no range limit |

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
| `deepMerge(target, source)` | Recursive merge of plain objects; arrays are replaced; ignores `__proto__` / `constructor` / `prototype` keys | `deepMerge({ a: { b: 1 } }, { a: { c: 2 } })` → `{ a: { b: 1, c: 2 } }` |
| `deepEqual(a, b)` | Structural equality for arrays, objects, `Date`, `RegExp`, `Map`, `Set`, circular references | `deepEqual({ a: [1] }, { a: [1] })` → `true` |
| `pick(obj, keys)` | Copy with only the listed keys | `pick(user, ["id", "name"])` |
| `omit(obj, keys)` | Copy without the listed keys | `omit(user, ["password"])` |
| `mapValues(obj, fn)` | Same keys, transformed values | `mapValues({ a: 1 }, (v) => v * 2)` → `{ a: 2 }` |
| `getByPath(obj, path, default?)` | Safe deep read with dot / bracket paths | `getByPath(data, "a.b[0].c", "n/a")` |
| `setByPath(obj, path, value)` | Immutable deep write that shares untouched branches; creates missing arrays and objects; refuses `__proto__` / `constructor` / `prototype` | `setByPath({}, "a.b[0]", 1)` → `{ a: { b: [1] } }` |
| `isPlainObject(value)` | `true` for object literals and `Object.create(null)` | `isPlainObject([])` → `false` |
| `isEmpty(value)` | `true` for `null`, `""`, `[]`, empty `Map` / `Set` / plain object | `isEmpty({})` → `true` |

### Functions

Time arguments are milliseconds; callbacks must be functions.

| Function | Description |
| --- | --- |
| `debounce(fn, wait, options?)` | Run `fn` after `wait` ms without another call. Options: `leading`, `trailing`. Has `cancel()` and `flush()` |
| `throttle(fn, wait, options?)` | Run `fn` at most once per `wait` ms. Options: `leading`, `trailing`. Has `cancel()` |
| `memoize(fn, options?)` | Cache results by the first argument, or by `resolver`; `maxSize` evicts the oldest entry |
| `once(fn)` | Run `fn` on the first call only |
| `sleep(ms)` | Promise that resolves after `ms` |
| `retry(fn, options?)` | Retry a failing function: `retries`, `delayMs`, `factor` (backoff), `shouldRetry` |
| `wait(time, { signal }?)` | Promise that resolves after `time`, or rejects with `AbortError` when its signal aborts |
| `withRetry(fn, options?)` | Abort-aware async retry: `delay`, `retryCount`, async or sync `shouldRetry`, `signal` |
| `getAbortError(signal?)` / `isAbortError(error)` | Create or identify the standard cancellation error |
| `withTimeout(promise, ms, message?)` | Reject with a `TimeoutError` if the promise is too slow |

```typescript
const onResize = debounce(recalculateLayout, 200);
const data = await retry(() => fetchJson(url), { retries: 4, delayMs: 200, factor: 2 });
const controller = new AbortController();
const resilientData = await withRetry(() => fetchJson(url), {
  delay: ({ count }) => 200 * 2 ** count,
  retryCount: 4,
  signal: controller.signal,
});
const result = await withTimeout(fetch(url), 5000);
```

`withRetry` retries twice after the initial call by default, waiting 100 ms between attempts. It does not retry an error whose `name` is `"AbortError"`; aborting its `signal` also stops a pending delay and rejects with the signal's `reason` (when present). Use `wait(time, { signal })` for the same cancellable delay behavior.

### Validators

Type guards that return a boolean and never throw. They check syntax only; they cannot tell whether an address or URL really exists.

| Function | Description | Example |
| --- | --- | --- |
| `isEmail(value)` | Pragmatic `local@domain.tld` check (254 / 64 character limits) | `isEmail("user@example.com")` → `true` |
| `isUrl(value, options?)` | Absolute URL with an allowed protocol (`http:` / `https:` by default) | `isUrl("javascript:alert(1)")` → `false` |
| `isUuid(value, version?)` | UUID string, versions 1 to 8 | `isUuid("123e4567-e89b-12d3-a456-426614174000")` → `true` |

### Error handling

Invalid input throws a standard error instead of returning `NaN` or a wrong result. Numeric errors are `NumericTypeError` (extends `TypeError`) or `NumericRangeError` (extends `RangeError`) and carry a stable `code`, so `instanceof` checks keep working while you can branch on the exact reason. Messages name the argument and show the value, e.g. `a must be a finite number, bigint or numeric string, received "12abc"`.

| `code` | Class | When | Example |
| --- | --- | --- | --- |
| `ERR_INVALID_NUMBER` | `TypeError` | Not a finite number, bigint or numeric string; `NaN` met by the default comparison | `summary(NaN, 1)`, `divide("12abc", 2)`, `findMin([1, NaN])` |
| `ERR_NOT_INTEGER` | `TypeError` | A whole number is required | `factorial(1.5)`, `round(1, 1.5)` |
| `ERR_DIVISION_BY_ZERO` | `RangeError` | Divisor or modulus is 0 | `divide(1, 0)`, `modulo(1, 0)` |
| `ERR_OVERFLOW` | `RangeError` | An input or result is too large for the kind it must be returned as | `multiply(1e200, 1e200)` |
| `ERR_UNDERFLOW` | `RangeError` | A non-zero result is too small to represent | `divide(1e-300, 1e300)` |
| `ERR_OUT_OF_RANGE` | `RangeError` | An argument is outside its supported range | `factorial(171)`, `clamp(1, 5, 0)`, `formatBytes(-1)` |
| `ERR_PRECISION_LOSS` | `RangeError` | The runtime cannot format a big string exactly (needs Node 20+) | `formatNumber("12345678901234567890.5")` on Node 18 |
| `ERR_INVALID_FORMAT` | `TypeError` | Text cannot be read as a size or duration | `parseBytes("12 gigs")`, `parseDuration("soon")` |

Other argument mistakes (a non-array, a non-function callback, non-string text) throw a plain `TypeError` or `RangeError` without a `code`.

```typescript
import { divide, NumericRangeError } from "@fatdevcon/utilities";

try {
  divide(total, count);
} catch (error) {
  if (error instanceof NumericRangeError && error.code === "ERR_DIVISION_BY_ZERO") {
    // count was 0
  } else {
    throw error;
  }
}
```

### Types

```typescript
import type { Comparator, KeySelector, NumericInput, DivideOptions, RoundingMode, NumericErrorCode, ErrorType, AbortErrorType, WithRetryParameters, DateInput, TimeZoneNameStyle, TimeZoneOffsetOptions, TimeZoneOffsetUnit, TimeZoneOffsetDirection, FormatDateOptions, ParseBytesOptions } from "@fatdevcon/utilities";

type Comparator<T> = (a: T, b: T) => number; // negative, zero or positive, like Array.prototype.sort
type KeySelector<T> = (item: T) => any;
type NumericInput = number | bigint | string;
type RoundingMode = "half-up" | "half-down" | "half-even" | "up" | "down" | "ceil" | "floor";
interface DivideOptions { precision?: number } // significant digits, 1 to 10000, default 40
type ErrorType<Name extends string = "Error"> = Error & { name: Name };
type AbortErrorType = ErrorType<"AbortError">;
interface WithRetryParameters { delay?: number | ({ count, error }) => number; retryCount?: number; shouldRetry?: ({ count, error }) => boolean | Promise<boolean>; signal?: AbortSignal }
type DateInput = Date | string | number;
type TimeZoneNameStyle = "short" | "long" | "shortOffset" | "longOffset" | "shortGeneric" | "longGeneric";
type TimeZoneOffsetUnit = "seconds" | "minutes" | "hours";
type TimeZoneOffsetDirection = "utc" | "native";
interface TimeZoneOffsetOptions { unit?: TimeZoneOffsetUnit; direction?: TimeZoneOffsetDirection }
interface FormatDateOptions { timeZone?: string; locale?: string | Intl.Locale | DateFnsLikeLocale; weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6; firstWeekContainsDate?: 1 | 2 | 3 | 4 | 5 | 6 | 7; useAdditionalWeekYearTokens?: boolean; useAdditionalDayOfYearTokens?: boolean }
interface ParseBytesOptions { base?: 1000 | 1024; bigint?: boolean }
```

The error classes `NumericTypeError` and `NumericRangeError` are exported as values. Option types are exported too: `CompactNumberOptions`, `PercentFormatOptions`, `CurrencyFormatOptions`, `UnitFormatOptions`, `BytesFormatOptions`, `TruncateTextOptions`, `ShortenStringOptions`, `MaskStringOptions`, `RelativeTimeOptions`, `DurationOptions`, `FormatDateOptions`, `ParseBytesOptions`, `DebounceOptions`, `ThrottleOptions`, `MemoizeOptions`, `RetryOptions`, `WithRetryParameters`, `TimeZoneNameStyle`, `TimeZoneOffsetOptions`, `IsUrlOptions`.

## Quality and security

- **Differential testing.** The internal decimal engine and the date engine are compared with `decimal.js` and `date-fns` (kept as development-only oracles) on hundreds of thousands of seeded random inputs covering every rounding mode, tie, exponent range and DST edge, in several time zones. A differential run over the public API against version 0.3.4 compared 720,000 calls with no differences.
- **Mutation-checked tests.** Deliberately broken rounding and tie handling is caught by the oracle suites.
- **Cross-runtime.** The suite and the packaged tarball are verified on Node.js and Bun, as ESM and CommonJS, with strict TypeScript consumers.
- **Supply chain.** No runtime dependencies, no install scripts, readable unminified output, no use of `eval`, the network, the file system or environment variables, and releases published from CI with npm provenance. See [SECURITY.md](SECURITY.md).

## Documentation and support

- [Documentation site](https://phanhoangquoctu.github.io/fatdevcon-utilities/) with a live playground and every function, parameter, error and example (all examples are executed before each release)
- [Changelog](CHANGELOG.md) and [GitHub releases](https://github.com/PhanHoangQuocTu/fatdevcon-utilities/releases)
- [Issues](https://github.com/PhanHoangQuocTu/fatdevcon-utilities/issues) for bugs and requests; security reports go through [SECURITY.md](SECURITY.md)

## License

MIT; see [LICENSE](LICENSE). Bundled Unicode data keeps its own notice in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

Maintained by the package owner; external contributions are not accepted. Versions follow [SemVer](https://semver.org/).
