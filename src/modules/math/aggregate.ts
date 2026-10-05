import { assertArray } from "../../utils/validate";
import {
  ExactDecimal,
  bigIntToDecimal,
  checkBigInt,
  decimalToNumber,
  decimalToString,
  divideDecimals,
  guardBigInt,
  invalidNumber,
  resolvePrecision,
  toDecimal,
} from "../../utils/numeric";
import type { Decimal, NumericInput } from "../../utils/numeric";
import type { DivideOptions } from "./arithmetic";

type Accumulated = { fast: number } | { exact: Decimal };

/**
 * Sum numbers exactly. Safe integers are added natively until a fraction or an unsafe
 * value shows up, then the rest is accumulated in exact decimal arithmetic. Intermediate
 * totals never overflow, so `[1e308, 1e308, -1e308]` is `1e308`.
 */
const accumulate = (values: number[]): Accumulated => {
  let fast = 0;
  let i = 0;
  for (; i < values.length; i++) {
    const v = values[i];
    if (typeof v !== "number" || !Number.isFinite(v)) throw invalidNumber(`arr[${i}]`, v);
    if (Number.isSafeInteger(v) && Number.isSafeInteger(fast + v)) fast += v;
    else break;
  }
  if (i === values.length) return { fast };
  let exact = new ExactDecimal(fast);
  for (; i < values.length; i++) {
    const v = values[i];
    if (typeof v !== "number" || !Number.isFinite(v)) throw invalidNumber(`arr[${i}]`, v);
    exact = exact.add(v);
  }
  return { exact };
};

/**
 * Sum of the numbers, free of floating-point drift: `sumValueInArray([0.1, 0.2, 0.3])` is `0.6`.
 * Returns 0 for an empty array. For bigint or string items use `sumBig`.
 */
export function sumValueInArray(arr: number[]): number {
  assertArray(arr, "arr");
  const total = accumulate(arr);
  return "fast" in total ? total.fast : decimalToNumber(total.exact);
}

/**
 * Mean of the numbers; 0 for an empty array. The sum is exact and the division keeps
 * `options.precision` significant digits (default 40) before converting to a `number`.
 * For bigint or string items use `averageBig`.
 */
export function averageValueInArray(arr: number[], options: DivideOptions = {}): number {
  assertArray(arr, "arr");
  const precision = resolvePrecision(options.precision);
  if (arr.length === 0) return 0;
  const total = accumulate(arr);
  if ("fast" in total) {
    return total.fast % arr.length === 0
      ? total.fast / arr.length
      : decimalToNumber(divideDecimals(new ExactDecimal(total.fast), new ExactDecimal(arr.length), precision));
  }
  return decimalToNumber(divideDecimals(total.exact, new ExactDecimal(arr.length), precision));
}

/** Parse every item, naming the offending index in the error. */
const parseAll = (values: readonly NumericInput[]): Decimal[] => {
  assertArray(values, "values");
  return values.map((value, index) => toDecimal(value, `values[${index}]`));
};

const sumExact = (values: readonly NumericInput[]): Decimal => {
  assertArray(values, "values");
  if (values.every((v) => typeof v === "bigint")) {
    let total = 0n;
    guardBigInt(() => {
      for (const v of values as bigint[]) total += checkBigInt(v, "values[]");
    });
    return bigIntToDecimal(checkBigInt(total, "Result"));
  }
  let total = new ExactDecimal(0);
  values.forEach((value, index) => {
    total = total.add(toDecimal(value, `values[${index}]`));
  });
  return total;
};

/**
 * Exact sum of numbers, bigints and numeric strings, returned as a plain-notation string
 * (`"0"` for an empty array): `sumBig(["0.1", "0.2", 10n ** 30n])`.
 */
export function sumBig(values: readonly NumericInput[]): string {
  return decimalToString(sumExact(values));
}

/** Exact mean of numbers, bigints and numeric strings as a string; `"0"` for an empty array. */
export function averageBig(values: readonly NumericInput[], options: DivideOptions = {}): string {
  const precision = resolvePrecision(options.precision);
  assertArray(values, "values");
  if (values.length === 0) return "0";
  return decimalToString(divideDecimals(sumExact(values), new ExactDecimal(values.length), precision));
}

/**
 * Median of the numbers; 0 for an empty array. Averages the two middle values when the
 * count is even (`median([0.1, 0.2])` is `0.15`). Does not reorder the input.
 */
export function median(values: number[]): number {
  assertArray(values, "values");
  if (values.length === 0) return 0;
  values.forEach((value, index) => {
    if (typeof value !== "number" || !Number.isFinite(value)) throw invalidNumber(`values[${index}]`, value);
  });
  const sorted = Float64Array.from(values).sort();
  const mid = sorted.length >> 1;
  if (sorted.length % 2 === 1) return sorted[mid] === 0 ? 0 : sorted[mid];
  return decimalToNumber(new ExactDecimal(sorted[mid - 1]).add(sorted[mid]).mul(0.5));
}

/** Median of numbers, bigints and numeric strings as an exact string; `"0"` for an empty array. */
export function medianBig(values: readonly NumericInput[]): string {
  const parsed = parseAll(values);
  if (parsed.length === 0) return "0";
  parsed.sort((a, b) => a.cmp(b));
  const mid = parsed.length >> 1;
  return decimalToString(parsed.length % 2 === 1 ? parsed[mid] : parsed[mid - 1].add(parsed[mid]).mul(0.5));
}
