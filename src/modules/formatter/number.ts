import Decimal from "decimal.js";
import { ExactDecimal, outOfRange, toDecimal } from "../../utils/numeric";
import { assertInteger } from "../../utils/validate";
import type { NumericInput } from "../../utils/numeric";
import { getNumberFormat, toIntlNumber } from "../../utils/intl";


export type CompactNumberOptions = Omit<Intl.NumberFormatOptions, "notation">;
export type CurrencyFormatOptions = Omit<Intl.NumberFormatOptions, "style" | "currency">;
export type PercentFormatOptions = Omit<Intl.NumberFormatOptions, "style">;
export type UnitFormatOptions = Omit<Intl.NumberFormatOptions, "style" | "unit">;

const formatWith = (
  value: unknown,
  locale: Intl.LocalesArgument,
  options: Intl.NumberFormatOptions
): string => getNumberFormat(locale, options).format(toIntlNumber(value, "value") as number);

/** Format abbreviated magnitudes, e.g. 1200 -> "1.2K" in en-US. Accepts number, bigint and numeric strings. */
export function formatCompactNumber(
  value: NumericInput,
  locale: Intl.LocalesArgument = "en-US",
  options: CompactNumberOptions = {}
): string {
  return formatWith(value, locale, { maximumFractionDigits: 1, ...options, notation: "compact" });
}

/** Input is a ratio: 0.125 -> "12.5%". Accepts number, bigint and numeric strings. */
export function formatPercent(
  value: NumericInput,
  locale: Intl.LocalesArgument = "en-US",
  options: PercentFormatOptions = {}
): string {
  return formatWith(value, locale, { maximumFractionDigits: 2, ...options, style: "percent" });
}

/** Format money for an ISO 4217 code. Accepts number, bigint and numeric strings, so amounts keep every digit. */
export function formatCurrency(
  value: NumericInput,
  currency: string,
  locale: Intl.LocalesArgument = "en-US",
  options: CurrencyFormatOptions = {}
): string {
  const code = normalizeCurrency(currency);
  return formatWith(value, locale, { ...options, style: "currency", currency: code });
}

/** Validates code syntax; Intl accepts well-formed unassigned codes too. */
export function normalizeCurrency(currency: string): string {
  if (typeof currency !== "string") throw new TypeError("currency must be a string");
  if (!/^[a-z]{3}$/i.test(currency)) throw new RangeError("currency must be a three-letter ISO 4217 code");
  return currency.toUpperCase();
}

export function formatUnit(
  value: NumericInput,
  unit: string,
  locale: Intl.LocalesArgument = "en-US",
  options: UnitFormatOptions = {}
): string {
  return formatWith(value, locale, { ...options, style: "unit", unit });
}

export interface BytesFormatOptions {
  /** SI (1000) by default; use 1024 for IEC units. */
  base?: 1000 | 1024;
  /** Integer from 0 to 20; trailing zeroes are omitted. */
  decimals?: number;
  locale?: Intl.LocalesArgument;
}

const SI_UNITS = ["B", "kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB", "RB", "QB"];
const IEC_UNITS = ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];

// 1 / 1000^k = 10^-3k and 1 / 1024^k = 5^10k * 10^-10k: both are exact decimal factors.
const unitThresholds = new Map<number, Decimal[]>();
const unitFactors = new Map<number, Decimal[]>();
const unitTable = (base: 1000 | 1024, count: number): { thresholds: Decimal[]; factors: Decimal[] } => {
  let thresholds = unitThresholds.get(base);
  let factors = unitFactors.get(base);
  if (!thresholds || !factors) {
    thresholds = [];
    factors = [];
    for (let k = 0; k < count; k++) {
      thresholds.push(new ExactDecimal(base).pow(k));
      factors.push(
        base === 1000
          ? new ExactDecimal(`1e-${3 * k}`)
          : new ExactDecimal(5).pow(10 * k).mul(new ExactDecimal(`1e-${10 * k}`))
      );
    }
    unitThresholds.set(base, thresholds);
    unitFactors.set(base, factors);
  }
  return { thresholds, factors };
};

/**
 * Human-readable size from B up to QB (SI) or YiB (IEC). Accepts number, bigint and
 * numeric strings and scales them exactly, so `formatBytes("1500000000000000000000000000000")`
 * is "1.5 QB".
 */
export function formatBytes(value: NumericInput, options: BytesFormatOptions = {}): string {
  const { base = 1000, decimals = 2, locale = "en-US" } = options;
  const bytes = toDecimal(value, "value");
  if (bytes.isNeg() && !bytes.isZero()) throw outOfRange("value must be non-negative");
  if (base !== 1000 && base !== 1024) throw outOfRange("base must be 1000 or 1024");
  assertInteger(decimals, "decimals");
  if (decimals < 0 || decimals > 20) throw outOfRange("decimals must be between 0 and 20");

  const units = base === 1000 ? SI_UNITS : IEC_UNITS;
  const last = units.length - 1;
  const { thresholds, factors } = unitTable(base, units.length);
  let index = 0;
  while (index < last && bytes.gte(thresholds[index + 1])) index++;
  let rounded = bytes.mul(factors[index]).toDecimalPlaces(decimals, Decimal.ROUND_HALF_UP);
  // Promote values that round up to the next unit, e.g. 999999 -> "1 MB".
  if (index < last && rounded.gte(base)) {
    index++;
    rounded = bytes.mul(factors[index]).toDecimalPlaces(decimals, Decimal.ROUND_HALF_UP);
  }
  const text = getNumberFormat(locale, { maximumFractionDigits: decimals }).format(
    toIntlNumber(rounded.toFixed(), "value") as number
  );
  return `${text} ${units[index]}`;
}
