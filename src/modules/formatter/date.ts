import { format, FormatOptions } from "date-fns";
import { ExactDecimal, outOfRange, toDecimal } from "../../utils/numeric";
import type { NumericInput } from "../../utils/numeric";
import { toValidDate } from "../../utils/date";
import type { DateInput } from "../../utils/date";

export type { DateInput } from "../../utils/date";

/** True for a `Date` instance that holds a real moment (not `Invalid Date`). */
export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

/** Format with date-fns tokens in the local timezone. */
export function formatDate(
  date: DateInput,
  formatStr: string,
  options?: FormatOptions
): string {
  return format(toValidDate(date), formatStr, options);
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
const truncatedQuotient = (diff: number, size: number): number =>
  new ExactDecimal(diff).divToInt(size).toNumber();
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
