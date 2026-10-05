import Decimal from "decimal.js";
import { NumericRangeError, NumericTypeError } from "./errors";
import { describeValue } from "./validate";

/** A number accepted by the numeric functions. Strings use plain or exponent decimal notation: "12.5", "-1e-30". */
export type NumericInput = number | bigint | string;

/**
 * Largest decimal exponent supported: magnitudes up to about 1e300000, down to 1e-300000.
 * Chosen so every runtime copes: JavaScriptCore (Bun, Safari) caps a BigInt near 2^20 bits,
 * far below V8, and 10^300000 needs 996,578 bits.
 */
export const MAX_EXPONENT = 300_000;
/** Most significant digits a division may be asked for. */
export const MAX_PRECISION = 10_000;
/** Significant digits used by division when `precision` is not given. */
export const DEFAULT_PRECISION = 40;
/** Largest `decimals` accepted by rounding. */
export const MAX_DECIMALS = MAX_EXPONENT;

// Private Decimal constructors: they never touch the global decimal.js config of
// applications that also use the library directly.
const SHARED_CONFIG = {
  rounding: Decimal.ROUND_HALF_UP,
  modulo: Decimal.ROUND_DOWN,
  maxE: MAX_EXPONENT,
  minE: -MAX_EXPONENT,
  toExpNeg: -9e15,
  toExpPos: 9e15,
} as const;

/** Effectively unlimited precision: + - * and % are exact. Never divide with it. */
export const ExactDecimal = Decimal.clone({ ...SHARED_CONFIG, precision: 1e9 });

const precisionCache = new Map<number, typeof Decimal>();
/** Decimal constructor whose division keeps `precision` significant digits. */
export const decimalWithPrecision = (precision: number): typeof Decimal => {
  let ctor = precisionCache.get(precision);
  if (!ctor) {
    ctor = Decimal.clone({ ...SHARED_CONFIG, precision });
    precisionCache.set(precision, ctor);
  }
  return ctor;
};

export type { Decimal };
export type NumericKind = "number" | "bigint" | "string";

const NUMERIC_STRING = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;
const MAX_STRING_LENGTH = 2 * MAX_EXPONENT + 100;

let maxBigInt: bigint | undefined;
/** Smallest bigint magnitude that is out of range: 2^996578 is about 1e300000. */
const bigIntLimit = (): bigint => (maxBigInt ??= 1n << 996_578n);

export const invalidNumber = (name: string, value: unknown): NumericTypeError =>
  new NumericTypeError(
    "ERR_INVALID_NUMBER",
    `${name} must be a finite number, bigint or numeric string, received ${describeValue(value)}`
  );

export const overflowError = (what: string): NumericRangeError =>
  new NumericRangeError(
    "ERR_OVERFLOW",
    `${what} exceeds the supported magnitude of about 1e${MAX_EXPONENT}`
  );

export const underflowError = (what: string): NumericRangeError =>
  new NumericRangeError(
    "ERR_UNDERFLOW",
    `${what} is smaller than the supported magnitude of about 1e-${MAX_EXPONENT}`
  );

export const divisionByZero = (what = "Division by zero"): NumericRangeError =>
  new NumericRangeError("ERR_DIVISION_BY_ZERO", what);

export const outOfRange = (message: string): NumericRangeError =>
  new NumericRangeError("ERR_OUT_OF_RANGE", message);

/**
 * Run a native bigint operation. Operands within the limit can still produce a result
 * the engine refuses to build (V8: "Maximum BigInt size exceeded", JavaScriptCore:
 * "Out of memory"); report that as ERR_OVERFLOW like any other oversize result.
 */
export const guardBigInt = <T>(operation: () => T, what = "Result"): T => {
  try {
    return operation();
  } catch (error) {
    if (error instanceof RangeError && !(error instanceof NumericRangeError)) throw overflowError(what);
    throw error;
  }
};

/** Validate a bigint input or result against the supported magnitude. */
export const checkBigInt = (value: bigint, what: string): bigint => {
  const limit = bigIntLimit();
  if (value >= limit || value <= -limit) throw overflowError(what);
  return value;
};

/** Parse any NumericInput into an exact Decimal, or throw a descriptive error. */
export const toDecimal = (value: unknown, name: string): Decimal => {
  switch (typeof value) {
    case "number":
      if (!Number.isFinite(value)) throw invalidNumber(name, value);
      return new ExactDecimal(value);
    case "bigint":
      checkBigInt(value, name);
      return new ExactDecimal(value.toString());
    case "string": {
      if (!NUMERIC_STRING.test(value)) throw invalidNumber(name, value);
      if (value.length > MAX_STRING_LENGTH) throw overflowError(name);
      const decimal = new ExactDecimal(value);
      if (!decimal.isFinite()) throw overflowError(name);
      if (decimal.isZero() && /[1-9]/.test(value.split(/[eE]/, 1)[0])) throw underflowError(name);
      return decimal;
    }
    default:
      throw invalidNumber(name, value);
  }
};

/** "number" when every value is a number, "bigint" when every value is a bigint, otherwise "string". */
export const kindOf = (...values: unknown[]): NumericKind => {
  if (values.every((v) => typeof v === "number")) return "number";
  if (values.every((v) => typeof v === "bigint")) return "bigint";
  return "string";
};

/** Convert to a double, refusing to silently produce Infinity or round a non-zero value to 0. */
export const decimalToNumber = (value: Decimal): number => {
  if (!value.isFinite()) throw overflowError("Result");
  const result = value.toNumber();
  if (!Number.isFinite(result)) {
    throw new NumericRangeError(
      "ERR_OVERFLOW",
      "Result exceeds the largest representable number (1.7976931348623157e+308); pass bigint or numeric-string arguments for an exact result"
    );
  }
  if (result === 0) {
    if (!value.isZero()) {
      throw new NumericRangeError(
        "ERR_UNDERFLOW",
        "Result is too small to represent as a number (below 5e-324); pass bigint or numeric-string arguments for an exact result"
      );
    }
    return 0; // also normalizes -0
  }
  return result;
};

/** Plain decimal notation without exponent, "-0" normalized to "0". */
export const decimalToString = (value: Decimal): string => {
  if (!value.isFinite()) throw overflowError("Result");
  return value.isZero() ? "0" : value.toFixed();
};

/** The value must already be an integer. */
export const decimalToBigInt = (value: Decimal): bigint => {
  if (!value.isFinite()) throw overflowError("Result");
  return BigInt(value.toFixed());
};

export const bigIntToDecimal = (value: bigint): Decimal => new ExactDecimal(value.toString());

/** Validate `precision` (significant digits) and apply the default. */
export const resolvePrecision = (precision: number | undefined): number => {
  if (precision === undefined) return DEFAULT_PRECISION;
  if (typeof precision !== "number" || !Number.isInteger(precision)) {
    throw new NumericTypeError("ERR_NOT_INTEGER", `precision must be an integer, received ${describeValue(precision)}`);
  }
  if (precision < 1 || precision > MAX_PRECISION) {
    throw outOfRange(`precision must be between 1 and ${MAX_PRECISION}`);
  }
  return precision;
};

/** Approximate base-10 logarithm of |value|, for cheap size estimates. */
export const log10Abs = (value: Decimal): number => {
  const mantissa = value.abs().mul(new ExactDecimal(`1e${-value.e}`)).toNumber();
  return value.e + Math.log10(mantissa);
};

/** Quotient of two exact decimals at `precision` significant digits. */
export const divideDecimals = (a: Decimal, b: Decimal, precision: number): Decimal => {
  if (b.isZero()) throw divisionByZero();
  const result = new (decimalWithPrecision(precision))(a).div(b);
  if (result.isZero() && !a.isZero()) throw underflowError("Result");
  return result;
};
