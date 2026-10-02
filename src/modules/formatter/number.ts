import { assertFiniteNumber } from "../../utils/validate";

export type CompactNumberOptions = Omit<Intl.NumberFormatOptions, "notation">;
export type CurrencyFormatOptions = Omit<Intl.NumberFormatOptions, "style" | "currency">;
export type PercentFormatOptions = Omit<Intl.NumberFormatOptions, "style">;
export type UnitFormatOptions = Omit<Intl.NumberFormatOptions, "style" | "unit">;

/** Format abbreviated magnitudes, e.g. 1200 -> "1.2K" in en-US. */
export function formatCompactNumber(
  value: number,
  locale: Intl.LocalesArgument = "en-US",
  options: CompactNumberOptions = {}
): string {
  assertFiniteNumber(value, "value");
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 1, ...options, notation: "compact",
  }).format(value);
}

/** Input is a ratio: 0.125 -> "12.5%". */
export function formatPercent(
  value: number,
  locale: Intl.LocalesArgument = "en-US",
  options: PercentFormatOptions = {}
): string {
  assertFiniteNumber(value, "value");
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2, ...options, style: "percent",
  }).format(value);
}

export function formatCurrency(
  value: number,
  currency: string,
  locale: Intl.LocalesArgument = "en-US",
  options: CurrencyFormatOptions = {}
): string {
  assertFiniteNumber(value, "value");
  return new Intl.NumberFormat(locale, {
    ...options, style: "currency", currency: normalizeCurrency(currency),
  }).format(value);
}

/** Validates code syntax; Intl accepts well-formed unassigned codes too. */
export function normalizeCurrency(currency: string): string {
  if (typeof currency !== "string") throw new TypeError("currency must be a string");
  if (!/^[a-z]{3}$/i.test(currency)) throw new RangeError("currency must be a three-letter ISO 4217 code");
  return currency.toUpperCase();
}

export function formatUnit(
  value: number,
  unit: string,
  locale: Intl.LocalesArgument = "en-US",
  options: UnitFormatOptions = {}
): string {
  assertFiniteNumber(value, "value");
  return new Intl.NumberFormat(locale, { ...options, style: "unit", unit }).format(value);
}

export interface BytesFormatOptions {
  /** SI (1000) by default; use 1024 for IEC units. */
  base?: 1000 | 1024;
  /** Integer from 0 to 20; trailing zeroes are omitted. */
  decimals?: number;
  locale?: Intl.LocalesArgument;
}

export function formatBytes(value: number, options: BytesFormatOptions = {}): string {
  assertFiniteNumber(value, "value");
  const { base = 1000, decimals = 2, locale = "en-US" } = options;
  if (value < 0) throw new RangeError("value must be non-negative");
  if (base !== 1000 && base !== 1024) throw new RangeError("base must be 1000 or 1024");
  if (!Number.isInteger(decimals)) throw new TypeError("decimals must be an integer");
  if (decimals < 0 || decimals > 20) throw new RangeError("decimals must be between 0 and 20");
  const units = base === 1000
    ? ["B", "kB", "MB", "GB", "TB", "PB", "EB"]
    : ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB"];
  let amount = value;
  let index = 0;
  while (amount >= base && index < units.length - 1) { amount /= base; index++; }
  // Promote values that round to the next unit, e.g. 999999 -> "1 MB".
  if (Number(amount.toFixed(decimals)) >= base && index < units.length - 1) {
    amount /= base;
    index++;
  }
  return new Intl.NumberFormat(locale, { maximumFractionDigits: decimals }).format(amount) + " " + units[index];
}