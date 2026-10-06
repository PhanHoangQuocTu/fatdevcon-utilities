import { formatTokens, localFields, shiftedFields } from "../../utils/date-format";
import type { FormatLocale, TokenFormatOptions } from "../../utils/date-format";
import { getOffsetSeconds } from "../../utils/zone";
import { ExactDecimal, outOfRange, overflowError, toDecimal } from "../../utils/numeric";
import { NumericRangeError, NumericTypeError } from "../../utils/errors";
import { describeValue } from "../../utils/validate";
import type { NumericInput } from "../../utils/numeric";
import { toValidDate } from "../../utils/date";
import type { DateInput } from "../../utils/date";

export type { DateInput } from "../../utils/date";

/** True for a `Date` instance that holds a real moment (not `Invalid Date`). */
export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

export type { FormatLocale, DateFnsLikeLocale } from "../../utils/date-format";

export interface FormatDateOptions extends TokenFormatOptions {
  /**
   * BCP 47 tag or `Intl.Locale` for month, weekday and AM/PM names, or a `date-fns` locale object
   * (`import { vi } from "date-fns/locale"`). Default: English.
   */
  locale?: FormatLocale;
  /** IANA time zone to read the fields in, e.g. "Asia/Ho_Chi_Minh". Default: the runtime's local zone. */
  timeZone?: string;
}

/**
 * Format with Unicode date tokens (`yyyy-MM-dd HH:mm:ss`, `EEEE, MMMM do`, `xxx`). Input may be a Date,
 * an ISO string (date-only strings are local midnight) or epoch milliseconds. Wrap literal text in single
 * quotes: `"yyyy-MM-dd'T'HH:mm"`.
 */
export function formatDate(
  date: DateInput,
  formatStr: string,
  options: FormatDateOptions = {}
): string {
  const instant = toValidDate(date);
  const fields =
    options.timeZone === undefined
      ? localFields(instant)
      : shiftedFields(instant, getOffsetSeconds(instant, options.timeZone));
  return formatTokens(fields, formatStr, options.locale, options);
}

export interface RelativeTimeOptions {
  locale?: Intl.LocalesArgument;
  /** Reference moment; defaults to the current time. */
  now?: DateInput;
  /** "auto" (default) gives "yesterday"; "always" gives "1 day ago". */
  numeric?: Intl.RelativeTimeFormatNumeric;
}

const SECOND = 1000;

/**
 * Whole units in `diff`, truncated toward zero, without floating-point division.
 * A tiny negative diff yields -0 on purpose: Intl reads it as "0 seconds ago", keeping the direction.
 */
const truncatedQuotient = (diff: number, size: number): number => {
  const whole = Number(BigInt(diff) / BigInt(size));
  return whole === 0 && diff < 0 ? -0 : whole;
};
const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365.25 * 24 * 3600 * SECOND],
  ["month", (365.25 / 12) * 24 * 3600 * SECOND],
  ["week", 7 * 24 * 3600 * SECOND],
  ["day", 24 * 3600 * SECOND],
  ["hour", 3600 * SECOND],
  ["minute", 60 * SECOND],
];

/** "3 hours ago", "in 2 days", "yesterday" using Intl.RelativeTimeFormat. */
export function formatRelativeTime(
  date: DateInput,
  options: RelativeTimeOptions = {}
): string {
  const { locale = "en-US", now = new Date(), numeric = "auto" } = options;
  const diff = toValidDate(date).getTime() - toValidDate(now).getTime();
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric });
  for (const [unit, size] of RELATIVE_UNITS) {
    if (Math.abs(diff) >= size) {
      return formatter.format(truncatedQuotient(diff, size), unit);
    }
  }
  return formatter.format(truncatedQuotient(diff, SECOND), "second");
}

export interface DurationOptions {
  /** Keep only the N largest non-zero units, e.g. 2 -> "1h 2m". Default: all. */
  maxUnits?: number;
}

/** Compact duration: 3723000 -> "1h 2m 3s"; under one second shows "ms". Accepts number, bigint and numeric strings; fractions of a millisecond are dropped. */
export function formatDuration(
  milliseconds: NumericInput,
  options: DurationOptions = {}
): string {
  const parsed = toDecimal(milliseconds, "milliseconds");
  if (parsed.isNeg() && !parsed.isZero()) throw outOfRange("milliseconds must be non-negative");
  const { maxUnits = Infinity } = options;
  if (maxUnits !== Infinity && (!Number.isInteger(maxUnits) || maxUnits < 1)) {
    throw outOfRange("maxUnits must be a positive integer");
  }
  const total = BigInt(parsed.floor().toFixed());
  if (total < 1000n) return `${total}ms`;
  let seconds = total / 1000n;
  const parts: string[] = [];
  for (const [label, size] of [["d", 86400n], ["h", 3600n], ["m", 60n], ["s", 1n]] as const) {
    const amount = seconds / size;
    seconds -= amount * size;
    if (amount > 0n) parts.push(`${amount}${label}`);
  }
  return parts.slice(0, maxUnits).join(" ");
}

const DURATION_UNITS: Record<string, number> = {};
for (const [names, size] of [
  [["ms", "msec", "msecs", "millisecond", "milliseconds"], 1],
  [["s", "sec", "secs", "second", "seconds"], 1000],
  [["m", "min", "mins", "minute", "minutes"], 60_000],
  [["h", "hr", "hrs", "hour", "hours"], 3_600_000],
  [["d", "day", "days"], 86_400_000],
  [["w", "wk", "wks", "week", "weeks"], 604_800_000],
] as const) {
  for (const name of names) DURATION_UNITS[name] = size;
}

const DURATION_PART = /\s*(?:,|\band\b)?\s*([0-9]*\.?[0-9]+)\s*([a-z]*)/iy;

/**
 * Inverse of `formatDuration`: `"1h 2m 3s"`, `"1.5h"`, `"2 days, 4 hours"` or `"500ms"` to whole milliseconds.
 * Units: ms, s, m, h, d, w (and their long forms). A bare number is milliseconds. Sums are exact and a
 * fraction of a millisecond is rounded half-up. Throws `ERR_INVALID_FORMAT` for text it cannot read and
 * `ERR_OVERFLOW` beyond `Number.MAX_SAFE_INTEGER`.
 */
export function parseDuration(text: string): number {
  if (typeof text !== "string") {
    throw new NumericTypeError("ERR_INVALID_FORMAT", `text must be a string, received ${describeValue(text)}`);
  }
  const invalid = (): never => {
    throw new NumericTypeError("ERR_INVALID_FORMAT", `Cannot read ${describeValue(text)} as a duration such as "1h 2m 3s"`);
  };
  const source = text.trim();
  if (source === "") return invalid();
  let total = new ExactDecimal(0);
  let position = 0;
  let parts = 0;
  while (position < source.length) {
    DURATION_PART.lastIndex = position;
    const match = DURATION_PART.exec(source);
    if (!match) return invalid();
    const size = match[2] === "" ? 1 : DURATION_UNITS[match[2].toLowerCase()];
    // A bare number means milliseconds, but only when it is the whole text.
    if (size === undefined || (match[2] === "" && (parts > 0 || DURATION_PART.lastIndex < source.length))) return invalid();
    parts++;
    total = total.add(new ExactDecimal(match[1]).mul(size));
    position = DURATION_PART.lastIndex;
  }
  const rounded = total.toDecimalPlaces(0);
  const milliseconds = rounded.toNumber();
  if (!rounded.isFinite()) throw overflowError("Duration");
  if (milliseconds > Number.MAX_SAFE_INTEGER) {
    throw new NumericRangeError("ERR_OVERFLOW", "Duration exceeds Number.MAX_SAFE_INTEGER milliseconds");
  }
  return milliseconds;
}
