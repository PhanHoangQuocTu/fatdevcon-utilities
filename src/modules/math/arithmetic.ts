import { NumericTypeError } from "../../utils/errors";
import { assertInteger, describeValue } from "../../utils/validate";
import {
  ExactDecimal,
  MAX_DECIMALS,
  MAX_EXPONENT,
  bigIntToDecimal,
  checkBigInt,
  decimalToBigInt,
  decimalToNumber,
  decimalToString,
  guardBigInt,
  divideDecimals,
  divisionByZero,
  invalidNumber,
  kindOf,
  log10Abs,
  outOfRange,
  overflowError,
  resolvePrecision,
  toDecimal,
  underflowError,
} from "../../utils/numeric";
import type { Decimal, NumericInput } from "../../utils/numeric";
import type { Rounding } from "../../utils/decimal";

export type { NumericInput };

export interface DivideOptions {
  /**
   * Significant digits kept when a quotient does not terminate (1 to 10000).
   * Default 40, which is more than a `number` can hold.
   */
  precision?: number;
}

/**
 * How `round` resolves the digits it drops.
 *
 * | mode          | 2.5 | -2.5 | 1.45 (1 dp) |
 * | ------------- | --- | ---- | ----------- |
 * | `"half-up"`   | 3   | -3   | 1.5         |
 * | `"half-down"` | 2   | -2   | 1.4         |
 * | `"half-even"` | 2   | -2   | 1.4         |
 * | `"up"`        | 3   | -3   | 1.5         |
 * | `"down"`      | 2   | -2   | 1.4         |
 * | `"ceil"`      | 3   | -2   | 1.5         |
 * | `"floor"`     | 2   | -3   | 1.4         |
 */
export type RoundingMode = "half-up" | "half-down" | "half-even" | "up" | "down" | "ceil" | "floor";

const ROUNDING_MODES: Record<RoundingMode, Rounding> = {
  up: 0,
  down: 1,
  ceil: 2,
  floor: 3,
  "half-up": 4,
  "half-down": 5,
  "half-even": 6,
};

type Fast = (a: number, b: number) => number | undefined;
interface BinaryOps {
  /** Exact result for safe integers, or undefined to fall back to decimal arithmetic. */
  fast?: Fast;
  bigint?: (a: bigint, b: bigint) => bigint;
  decimal: (a: Decimal, b: Decimal) => Decimal;
}

const safe = Number.isSafeInteger;

const binary = (a: unknown, b: unknown, ops: BinaryOps): NumericInput => {
  if (typeof a === "number" && typeof b === "number") {
    if (!Number.isFinite(a)) throw invalidNumber("a", a);
    if (!Number.isFinite(b)) throw invalidNumber("b", b);
    const fast = ops.fast?.(a, b);
    if (fast !== undefined) return fast === 0 ? 0 : fast;
    return decimalToNumber(ops.decimal(toDecimal(a, "a"), toDecimal(b, "b")));
  }
  if (typeof a === "bigint" && typeof b === "bigint" && ops.bigint) {
    checkBigInt(a, "a");
    checkBigInt(b, "b");
    return checkBigInt(guardBigInt(() => ops.bigint!(a, b)), "Result");
  }
  return decimalToString(ops.decimal(toDecimal(a, "a"), toDecimal(b, "b")));
};

/** `a + b`. Exact: `summary(0.1, 0.2)` is `0.3`. */
export function summary(a: number, b: number): number;
export function summary(a: bigint, b: bigint): bigint;
export function summary(a: NumericInput, b: NumericInput): string;
export function summary(a: NumericInput, b: NumericInput): NumericInput {
  return binary(a, b, {
    fast: (x, y) => (safe(x) && safe(y) && safe(x + y) ? x + y : undefined),
    bigint: (x, y) => x + y,
    decimal: (x, y) => x.add(y),
  });
}

/** `a - b`. Exact: `subtract(0.3, 0.1)` is `0.2`. */
export function subtract(a: number, b: number): number;
export function subtract(a: bigint, b: bigint): bigint;
export function subtract(a: NumericInput, b: NumericInput): string;
export function subtract(a: NumericInput, b: NumericInput): NumericInput {
  return binary(a, b, {
    fast: (x, y) => (safe(x) && safe(y) && safe(x - y) ? x - y : undefined),
    bigint: (x, y) => x - y,
    decimal: (x, y) => x.sub(y),
  });
}

/** `a * b`. Exact: `multiply(0.1, 3)` is `0.3`. */
export function multiply(a: number, b: number): number;
export function multiply(a: bigint, b: bigint): bigint;
export function multiply(a: NumericInput, b: NumericInput): string;
export function multiply(a: NumericInput, b: NumericInput): NumericInput {
  return binary(a, b, {
    fast: (x, y) => (safe(x) && safe(y) && safe(x * y) ? x * y : undefined),
    bigint: (x, y) => x * y,
    decimal: (x, y) => {
      const product = x.mul(y);
      if (product.isZero() && !x.isZero() && !y.isZero()) throw underflowError("Result");
      return product;
    },
  });
}

/**
 * `a / b`. A quotient that does not terminate keeps `options.precision` significant
 * digits (default 40). Never returns `bigint`: pass a `bigint` pair and you get a string.
 */
export function divide(a: number, b: number, options?: DivideOptions): number;
export function divide(a: NumericInput, b: NumericInput, options?: DivideOptions): string;
export function divide(a: NumericInput, b: NumericInput, options: DivideOptions = {}): NumericInput {
  const precision = resolvePrecision(options.precision);
  return binary(a, b, {
    fast: (x, y) => {
      if (y === 0) throw divisionByZero();
      return safe(x) && safe(y) && x % y === 0 ? x / y : undefined;
    },
    decimal: (x, y) => divideDecimals(x, y, precision),
  });
}

/** Remainder with the sign of the dividend, like the `%` operator: `modulo(-7, 3)` is `-1`. Exact for decimals. */
export function modulo(a: number, b: number): number;
export function modulo(a: bigint, b: bigint): bigint;
export function modulo(a: NumericInput, b: NumericInput): string;
export function modulo(a: NumericInput, b: NumericInput): NumericInput {
  return binary(a, b, {
    fast: (x, y) => {
      if (y === 0) throw divisionByZero("Modulo by zero");
      return safe(x) && safe(y) ? x % y : undefined;
    },
    bigint: (x, y) => {
      if (y === 0n) throw divisionByZero("Modulo by zero");
      return x % y;
    },
    decimal: (x, y) => {
      if (y.isZero()) throw divisionByZero("Modulo by zero");
      return x.mod(y);
    },
  });
}

/**
 * `base ** exponent` for an integer exponent.
 * An integer base with a non-negative exponent is computed exactly; any other base is
 * kept to `options.precision` significant digits (default 40).
 */
export function power(base: number, exponent: number, options?: DivideOptions): number;
export function power(base: bigint, exponent: bigint): bigint;
export function power(base: NumericInput, exponent: NumericInput, options?: DivideOptions): string;
export function power(base: NumericInput, exponent: NumericInput, options: DivideOptions = {}): NumericInput {
  const kind = kindOf(base, exponent);
  const precision = resolvePrecision(options.precision);
  const b = toDecimal(base, "base");
  const e = toDecimal(exponent, "exponent");
  if (!e.isInteger()) {
    throw new NumericTypeError("ERR_NOT_INTEGER", `exponent must be an integer, received ${describeValue(exponent)}`);
  }
  if (kind === "bigint" && e.isNeg()) {
    throw outOfRange("exponent must be non-negative when both arguments are bigint; pass numeric strings for negative exponents");
  }
  const emit = (value: Decimal): NumericInput => {
    if (value.isZero() && !b.isZero()) throw underflowError("Result");
    if (kind === "bigint") return checkBigInt(decimalToBigInt(value), "Result");
    return kind === "number" ? decimalToNumber(value) : decimalToString(value);
  };

  if (b.isZero()) {
    if (e.isNeg()) throw divisionByZero("Zero cannot be raised to a negative power");
    return emit(new ExactDecimal(e.isZero() ? 1 : 0));
  }
  if (b.abs().eq(1)) return emit(new ExactDecimal(b.isNeg() && e.mod(2).abs().eq(1) ? -1 : 1));
  if (e.isZero()) return emit(new ExactDecimal(1));

  // Reject results that would need more than ~1e6 digits before doing any work.
  const exp = e.toNumber();
  if (Math.abs(exp) * Math.abs(log10Abs(b)) > MAX_EXPONENT + 1) {
    const grows = log10Abs(b) > 0 === exp > 0;
    throw grows ? overflowError("Result") : underflowError("Result");
  }

  if (b.isInteger() && !e.isNeg()) {
    const exact = guardBigInt(() => b.toBigInt() ** e.toBigInt());
    return emit(bigIntToDecimal(exact));
  }
  return emit(b.pow(exp, precision));
}

/** Absolute value; keeps the input kind. */
export function abs(value: number): number;
export function abs(value: bigint): bigint;
export function abs(value: NumericInput): string;
export function abs(value: NumericInput): NumericInput {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw invalidNumber("value", value);
    return Math.abs(value);
  }
  if (typeof value === "bigint") return value < 0n ? -checkBigInt(value, "value") : checkBigInt(value, "value");
  return decimalToString(toDecimal(value, "value").abs());
}

/**
 * `value` as a percentage of `total`: `percentage(25, 200)` is `12.5`.
 * Returns 0 when `total` is 0. Computed as `value * 100 / total` without intermediate rounding.
 */
export function percentage(value: number, total: number, options?: DivideOptions): number;
export function percentage(value: NumericInput, total: NumericInput, options?: DivideOptions): string;
export function percentage(value: NumericInput, total: NumericInput, options: DivideOptions = {}): NumericInput {
  const precision = resolvePrecision(options.precision);
  const kind = kindOf(value, total);
  const v = toDecimal(value, "value");
  const t = toDecimal(total, "total");
  if (t.isZero()) return kind === "number" ? 0 : "0";
  const result = divideDecimals(v.mul(100), t, precision);
  return kind === "number" ? decimalToNumber(result) : decimalToString(result);
}

/**
 * Round to `decimals` places (0 to 300,000). Operates on the decimal value, so
 * `round(1.005, 2)` is `1.01`. A `bigint` is already whole and is returned unchanged.
 */
export function round(value: number, decimals?: number, mode?: RoundingMode): number;
export function round(value: bigint, decimals?: number, mode?: RoundingMode): bigint;
export function round(value: string, decimals?: number, mode?: RoundingMode): string;
export function round(value: NumericInput, decimals = 2, mode: RoundingMode = "half-up"): NumericInput {
  assertInteger(decimals, "decimals");
  if (decimals < 0 || decimals > MAX_DECIMALS) {
    throw outOfRange(`decimals must be a non-negative integer no greater than ${MAX_DECIMALS}`);
  }
  const rounding = ROUNDING_MODES[mode];
  if (rounding === undefined || !Object.prototype.hasOwnProperty.call(ROUNDING_MODES, mode)) {
    throw outOfRange(`mode must be one of ${Object.keys(ROUNDING_MODES).join(", ")}, received ${describeValue(mode)}`);
  }
  if (typeof value === "bigint") return checkBigInt(value, "value");
  const rounded = toDecimal(value, "value").toDecimalPlaces(decimals, rounding);
  return typeof value === "number" ? decimalToNumber(rounded) : decimalToString(rounded);
}

/** Limit `value` to the inclusive range `[min, max]`; keeps the input kind. */
export function clamp(value: number, min: number, max: number): number;
export function clamp(value: bigint, min: bigint, max: bigint): bigint;
export function clamp(value: NumericInput, min: NumericInput, max: NumericInput): string;
export function clamp(value: NumericInput, min: NumericInput, max: NumericInput): NumericInput {
  const kind = kindOf(value, min, max);
  const v = toDecimal(value, "value");
  const lo = toDecimal(min, "min");
  const hi = toDecimal(max, "max");
  if (lo.gt(hi)) throw outOfRange("min must be less than or equal to max");
  if (kind === "bigint") return (value as bigint) < (min as bigint) ? (min as bigint) : (value as bigint) > (max as bigint) ? (max as bigint) : (value as bigint);
  const chosen = v.lt(lo) ? lo : v.gt(hi) ? hi : v;
  return kind === "number" ? decimalToNumber(chosen) : decimalToString(chosen);
}

/**
 * Exact comparison of any two numeric inputs: `-1` when `a < b`, `0` when equal, `1` when `a > b`.
 * Usable as a `compareFn`: `quickSort(["10", "9", "100"], compareNumbers)`.
 */
export function compareNumbers(a: NumericInput, b: NumericInput): -1 | 0 | 1 {
  if (typeof a === "number" && typeof b === "number") {
    if (!Number.isFinite(a)) throw invalidNumber("a", a);
    if (!Number.isFinite(b)) throw invalidNumber("b", b);
    return a < b ? -1 : a > b ? 1 : 0;
  }
  if (typeof a === "bigint" && typeof b === "bigint") return a < b ? -1 : a > b ? 1 : 0;
  return toDecimal(a, "a").cmp(toDecimal(b, "b")) as -1 | 0 | 1;
}

/** True for a finite number, a bigint, or a string in decimal notation within the supported magnitude. Never throws. */
export function isNumeric(value: unknown): value is NumericInput {
  try {
    toDecimal(value, "value");
    return true;
  } catch {
    return false;
  }
}

/** Canonical plain-notation string: `"1e3"` becomes `"1000"`, `"+0.50"` becomes `"0.5"`, `-0` becomes `"0"`. */
export function toDecimalString(value: NumericInput): string {
  return decimalToString(toDecimal(value, "value"));
}
