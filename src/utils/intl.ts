import { NumericRangeError } from "./errors";
import { ExactDecimal, invalidNumber, toDecimal } from "./numeric";
import type { NumericInput } from "./numeric";

const CACHE_LIMIT = 64;
const formatCache = new Map<string, Intl.NumberFormat>();

const cacheKey = (locale: Intl.LocalesArgument, options: Intl.NumberFormatOptions): string | undefined => {
  const plainLocale =
    locale === undefined ||
    typeof locale === "string" ||
    (Array.isArray(locale) && locale.every((item) => typeof item === "string"));
  if (!plainLocale) return undefined; // Intl.Locale objects do not serialize
  try {
    return JSON.stringify([locale ?? null, options]);
  } catch {
    return undefined;
  }
};

/** `new Intl.NumberFormat` costs far more than `format`, so reuse instances for repeated option sets. */
export const getNumberFormat = (
  locale: Intl.LocalesArgument,
  options: Intl.NumberFormatOptions
): Intl.NumberFormat => {
  const key = cacheKey(locale, options);
  if (key === undefined) return new Intl.NumberFormat(locale, options);
  const cached = formatCache.get(key);
  if (cached) {
    formatCache.delete(key); // refresh recency
    formatCache.set(key, cached);
    return cached;
  }
  const created = new Intl.NumberFormat(locale, options);
  formatCache.set(key, created);
  if (formatCache.size > CACHE_LIMIT) formatCache.delete(formatCache.keys().next().value as string);
  return created;
};

let exactStrings: boolean | undefined;
/** Intl.NumberFormat v3 (Node 20+, current browsers) formats decimal strings without going through a double. */
const supportsExactStrings = (): boolean =>
  (exactStrings ??=
    (() => {
      try {
        return (
          new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
            "12345678901234567890" as unknown as number
          ) === "12,345,678,901,234,567,890"
        );
      } catch {
        return false;
      }
    })());

export type IntlNumber = number | bigint | string;

/**
 * Validate a formatter input and return what `Intl.NumberFormat#format` should receive.
 * Strings and bigints keep every digit on runtimes with Intl.NumberFormat v3; older
 * runtimes only accept a string that survives conversion to a double unchanged.
 */
export const toIntlNumber = (value: unknown, name: string): IntlNumber => {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw invalidNumber(name, value);
    return value;
  }
  const decimal = toDecimal(value, name); // validates strings and bigints
  if (typeof value === "bigint" || supportsExactStrings()) return value as IntlNumber;
  const asNumber = Number(value);
  if (!Number.isFinite(asNumber) || !new ExactDecimal(asNumber).eq(decimal)) {
    throw new NumericRangeError(
      "ERR_PRECISION_LOSS",
      `${name} cannot be formatted exactly on this runtime (needs Intl.NumberFormat v3, Node 20+); received ${String(value).slice(0, 40)}`
    );
  }
  return asNumber;
};

export type { NumericInput };
