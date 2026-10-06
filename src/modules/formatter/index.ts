import { getNumberFormat, toIntlNumber } from "../../utils/intl";
import type { NumericInput } from "../../utils/numeric";

/* Formatting utilities */
/**
 * Plain `Intl.NumberFormat` wrapper. Accepts number, bigint and numeric strings.
 * A `number` is passed through untouched, so `formatNumber(NaN)` is "NaN"; bigint and
 * string inputs are validated.
 */
const formatNumber = (
  value: NumericInput,
  locale?: Intl.LocalesArgument,
  options?: Intl.NumberFormatOptions
): string => {
  const input = typeof value === "number" ? value : toIntlNumber(value, "value");
  return getNumberFormat(locale, options ?? {}).format(input as number);
};

export { formatNumber };

export { formatCompactNumber, formatPercent, formatCurrency, formatUnit, formatBytes, parseBytes } from "./number";
export type { CompactNumberOptions, PercentFormatOptions, CurrencyFormatOptions, UnitFormatOptions, BytesFormatOptions, ParseBytesOptions } from "./number";
export * from "./text";
export * from "./currency";
export * from "./date";
export * from "./case";
