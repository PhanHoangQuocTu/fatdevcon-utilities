/**
 * Minimal arbitrary-precision decimal built on native `bigint`.
 *
 * A finite value is `±coefficient × 10^exponent`. Arithmetic is exact (`add`, `sub`, `mul`,
 * `mod`, integer `pow` of an exact result); only `div`, `toDecimalPlaces` and a rounded `pow`
 * round, and they do so correctly in the requested {@link Rounding} mode.
 *
 * Values whose leading digit sits above 10^MAX_EXPONENT overflow to a non-finite value and
 * values below 10^-MAX_EXPONENT underflow to zero, mirroring the contract the numeric
 * helpers were written against. Zero keeps its sign (`-0`), as callers rely on it for
 * direction.
 */

/** Largest decimal exponent supported: magnitudes up to about 1e300000, down to 1e-300000. */
export const MAX_EXPONENT = 300_000;

/** Rounding modes, numbered like the decimal.js constants they replace. */
export const ROUND_UP = 0;
export const ROUND_DOWN = 1;
export const ROUND_CEIL = 2;
export const ROUND_FLOOR = 3;
export const ROUND_HALF_UP = 4;
export const ROUND_HALF_DOWN = 5;
export const ROUND_HALF_EVEN = 6;
export type Rounding = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type DecimalValue = Decimal | number | bigint | string;

const SMALL_POWERS: bigint[] = [];
for (let i = 0, p = 1n; i <= 64; i++, p *= 10n) SMALL_POWERS.push(p);
const pow10 = (n: number): bigint => (n < SMALL_POWERS.length ? SMALL_POWERS[n] : 10n ** BigInt(n));

/**
 * Decimal text of very large bigints. Engines convert in quadratic time (JavaScriptCore needs seconds for
 * 300,000 digits), so past `CHUNK` digits the number is split on cached powers of ten and each half is
 * converted separately, which keeps worst-case inputs fast on every runtime.
 */
const CHUNK = 2048;
const CHUNK_POWERS: bigint[] = [10n ** BigInt(CHUNK)]; // CHUNK_POWERS[i] = 10 ^ (CHUNK * 2^i)
const chunkPower = (level: number): bigint => (CHUNK_POWERS[level] ??= chunkPower(level - 1) ** 2n);

/** `n` (below 10 ^ (CHUNK * 2^level)) as exactly CHUNK * 2^level digits, zero padded. */
const paddedDigits = (n: bigint, level: number): string => {
  if (level === 0) return n.toString().padStart(CHUNK, "0");
  const half = chunkPower(level - 1);
  const high = n / half;
  return paddedDigits(high, level - 1) + paddedDigits(n - high * half, level - 1);
};

/** Decimal digits of a non-negative bigint. */
const digitsOf = (n: bigint): string => {
  if (n < CHUNK_POWERS[0]) return n.toString();
  // Bit length from the (linear-time) hex form bounds the digit count; never build a power larger than n.
  const bound = Math.ceil(n.toString(16).length * 4 * Math.LOG10E * Math.LN2) + 1;
  let level = 1;
  while (CHUNK << level < bound) level++;
  return paddedDigits(n, level).replace(/^0+/, "");
};

/** The bigint written by a string of ASCII digits. */
const parseDigits = (digits: string): bigint => {
  if (digits.length <= CHUNK) return BigInt(digits);
  let level = 0;
  while (CHUNK << (level + 1) < digits.length) level++;
  const split = digits.length - (CHUNK << level);
  return parseDigits(digits.slice(0, split)) * chunkPower(level) + parseDigits(digits.slice(split));
};

const MAX_SAFE = BigInt(Number.MAX_SAFE_INTEGER);
/** Number of decimal digits in a non-negative bigint (1 for zero). */
const digitCount = (n: bigint): number => (n <= MAX_SAFE ? String(Number(n)).length : digitsOf(n).length);

/** `n / d` (both positive) rounded to an integer magnitude; `negative` is the sign of the true quotient. */
const divRound = (n: bigint, d: bigint, negative: boolean, mode: Rounding): bigint => {
  const q = n / d;
  const r = n - q * d;
  if (r === 0n) return q;
  switch (mode) {
    case ROUND_UP:
      return q + 1n;
    case ROUND_DOWN:
      return q;
    case ROUND_CEIL:
      return negative ? q : q + 1n;
    case ROUND_FLOOR:
      return negative ? q + 1n : q;
    default: {
      const twice = r * 2n;
      if (twice > d) return q + 1n;
      if (twice < d) return q;
      if (mode === ROUND_HALF_UP) return q + 1n;
      if (mode === ROUND_HALF_DOWN) return q;
      return q % 2n === 1n ? q + 1n : q;
    }
  }
};

const NUMBER_PATTERN = /^([+-]?)(\d*)(?:\.(\d*))?(?:[eE]([+-]?\d+))?$/;

/** Instances are immutable; construct, then call operations that return new instances. */
export class Decimal {
  /** @internal magnitude, always >= 0 */
  c: bigint = 0n;
  /** @internal power-of-ten exponent applied to `c` */
  x = 0;
  /** @internal sign; true for negatives and for -0 */
  neg = false;
  /** @internal false for the result of an overflow or an undefined operation */
  fin = true;
  private trimmedCache?: Decimal;
  private exponentCache?: number;

  constructor(value: DecimalValue) {
    if (value instanceof Decimal) {
      this.c = value.c;
      this.x = value.x;
      this.neg = value.neg;
      this.fin = value.fin;
      return;
    }
    if (typeof value === "bigint") {
      this.neg = value < 0n;
      this.c = this.neg ? -value : value;
      this.settle();
      return;
    }
    if (typeof value === "number") {
      if (!Number.isFinite(value)) {
        this.fin = false;
        this.neg = value < 0;
        return;
      }
      if (value === 0) {
        this.neg = Object.is(value, -0);
        return;
      }
      value = String(value);
    }
    const match = NUMBER_PATTERN.exec(value);
    if (!match || (match[2] === "" && !match[3])) throw new SyntaxError(`Invalid decimal: ${String(value).slice(0, 40)}`);
    const [, sign, whole, fraction = "", exponent] = match;
    this.neg = sign === "-";
    let digits = whole + fraction;
    let exp = (exponent === undefined ? 0 : Number(exponent)) - fraction.length;
    let end = digits.length;
    while (end > 1 && digits.charCodeAt(end - 1) === 48) end--;
    exp += digits.length - end;
    digits = digits.slice(0, end);
    this.c = parseDigits(digits);
    this.x = exp;
    this.settle();
  }

  /** Apply the overflow/underflow limits and normalize zero. */
  private settle(): void {
    if (this.c === 0n) {
      this.x = 0;
      return;
    }
    const e = this.e;
    if (e > MAX_EXPONENT) {
      this.fin = false;
      this.c = 0n;
      this.x = 0;
    } else if (e < -MAX_EXPONENT) {
      this.c = 0n;
      this.x = 0;
    }
  }

  /** @internal build from parts, without parsing */
  static from(neg: boolean, c: bigint, x: number): Decimal {
    const result = new Decimal(0);
    result.neg = neg;
    result.c = c;
    result.x = x;
    result.settle();
    return result;
  }

  /** @internal */
  static nonFinite(neg: boolean): Decimal {
    const result = new Decimal(0);
    result.fin = false;
    result.neg = neg;
    return result;
  }

  /** Exponent of the leading digit: 1 -> 0, 1234 -> 3, 0.012 -> -2. Zero reports 0. */
  get e(): number {
    if (this.c === 0n) return 0;
    return (this.exponentCache ??= digitCount(this.c) - 1 + this.x);
  }

  /** @internal same value without trailing zeros in the coefficient (cached) */
  trimmed(): Decimal {
    if (this.trimmedCache) return this.trimmedCache;
    let end = 0;
    let digits = "";
    if (this.fin && this.c !== 0n && this.c % 10n === 0n) {
      digits = digitsOf(this.c);
      end = digits.length;
      while (digits.charCodeAt(end - 1) === 48) end--;
    }
    if (end === 0) return (this.trimmedCache = this);
    const result = new Decimal(0);
    result.neg = this.neg;
    result.c = parseDigits(digits.slice(0, end));
    result.x = this.x + digits.length - end;
    return (this.trimmedCache = result);
  }

  /** @internal significant digits of the magnitude, without trailing zeros */
  digits(): string {
    return digitsOf(this.trimmed().c);
  }

  isFinite(): boolean {
    return this.fin;
  }

  isZero(): boolean {
    return this.fin && this.c === 0n;
  }

  /** True for negative values and for -0, like Math.sign's sign bit. */
  isNeg(): boolean {
    return this.neg;
  }

  isInteger(): boolean {
    if (!this.fin) return false;
    if (this.c === 0n) return true;
    return this.trimmed().x >= 0;
  }

  /** Number of digits after the decimal point once trailing zeros are dropped. */
  decimalPlaces(): number {
    if (!this.fin || this.c === 0n) return 0;
    const { x } = this.trimmed();
    return x < 0 ? -x : 0;
  }

  abs(): Decimal {
    if (!this.neg) return this;
    return this.fin ? Decimal.from(false, this.c, this.x) : Decimal.nonFinite(false);
  }

  negated(): Decimal {
    return this.fin ? Decimal.from(!this.neg, this.c, this.x) : Decimal.nonFinite(!this.neg);
  }

  /** Magnitudes aligned to the smaller exponent. */
  private static align(a: Decimal, b: Decimal): [bigint, bigint, number] {
    if (a.x === b.x) return [a.c, b.c, a.x];
    if (a.x > b.x) return [a.c * pow10(a.x - b.x), b.c, b.x];
    return [a.c, b.c * pow10(b.x - a.x), a.x];
  }

  add(other: DecimalValue): Decimal {
    const o = new Decimal(other);
    if (!this.fin || !o.fin) return Decimal.nonFinite(this.neg);
    if (o.c === 0n) {
      if (this.c !== 0n) return this;
      return this.neg && o.neg ? this : new Decimal(0);
    }
    if (this.c === 0n) return o;
    const [a, b, x] = Decimal.align(this, o);
    const sum = (this.neg ? -a : a) + (o.neg ? -b : b);
    if (sum === 0n) return new Decimal(0);
    return Decimal.from(sum < 0n, sum < 0n ? -sum : sum, x);
  }

  sub(other: DecimalValue): Decimal {
    return this.add(new Decimal(other).negated());
  }

  mul(other: DecimalValue): Decimal {
    const o = new Decimal(other);
    if (!this.fin || !o.fin) return Decimal.nonFinite(this.neg !== o.neg);
    return Decimal.from(this.neg !== o.neg, this.c * o.c, this.x + o.x);
  }

  /**
   * Quotient rounded to `precision` significant digits in `mode`; exact quotients stay exact.
   * Dividing by zero yields a non-finite value.
   */
  div(other: DecimalValue, precision: number, mode: Rounding = ROUND_HALF_UP): Decimal {
    const o = new Decimal(other);
    const negative = this.neg !== o.neg;
    if (!this.fin || !o.fin || o.c === 0n) return Decimal.nonFinite(negative);
    if (this.c === 0n) return Decimal.from(negative, 0n, 0);
    // Scale so the integer quotient carries precision + 1 or precision + 2 digits.
    const shift = precision + 1 + digitCount(o.c) - digitCount(this.c);
    const numerator = shift > 0 ? this.c * pow10(shift) : this.c;
    const denominator = shift < 0 ? o.c * pow10(-shift) : o.c;
    const quotient = numerator / denominator;
    const exact = quotient * denominator === numerator;
    const drop = digitCount(quotient) - precision;
    const unit = pow10(drop);
    let kept = quotient / unit;
    const rest = quotient - kept * unit;
    if (rest !== 0n || !exact) {
      const twice = rest * 2n;
      const up =
        mode === ROUND_UP ? true
        : mode === ROUND_DOWN ? false
        : mode === ROUND_CEIL ? !negative
        : mode === ROUND_FLOOR ? negative
        : twice > unit ||
          (twice === unit && (!exact || mode === ROUND_HALF_UP || (mode === ROUND_HALF_EVEN && kept % 2n === 1n)));
      if (up) kept += 1n;
    }
    return Decimal.from(negative, kept, this.x - o.x - shift + drop);
  }

  /** Remainder with the sign of the dividend (truncated division), exact. Zero divisor yields a non-finite value. */
  mod(other: DecimalValue): Decimal {
    const o = new Decimal(other);
    if (!this.fin || !o.fin || o.c === 0n) return Decimal.nonFinite(this.neg);
    if (this.c === 0n) return this;
    const [a, b, x] = Decimal.align(this, o);
    const remainder = a % b;
    return Decimal.from(this.neg, remainder, x);
  }

  /**
   * Integer power. Without `precision` the result is exact (and the exponent must not be negative).
   * With it, a result needing more than `precision` significant digits is correctly rounded half-up.
   */
  pow(exponent: number, precision?: number): Decimal {
    if (!Number.isInteger(exponent)) throw new RangeError("pow exponent must be an integer");
    if (precision === undefined && exponent < 0) throw new RangeError("pow needs a precision for a negative exponent");
    if (!this.fin) return Decimal.nonFinite(this.neg);
    const negative = this.neg && exponent % 2 !== 0;
    if (exponent === 0) return new Decimal(1);
    if (this.c === 0n) return exponent < 0 ? Decimal.nonFinite(negative) : Decimal.from(negative, 0n, 0);
    const base = this.trimmed();
    const times = Math.abs(exponent);
    if (precision === undefined) return Decimal.from(negative, base.c ** BigInt(times), base.x * times);
    return powRounded(base, times, exponent < 0, negative, precision);
  }

  cmp(other: DecimalValue): -1 | 0 | 1 {
    const o = new Decimal(other);
    if (!this.fin || !o.fin) {
      if (this.fin) return o.neg ? 1 : -1;
      if (o.fin) return this.neg ? -1 : 1;
      return this.neg === o.neg ? 0 : this.neg ? -1 : 1;
    }
    const zeroA = this.c === 0n;
    const zeroB = o.c === 0n;
    if (zeroA && zeroB) return 0;
    if (zeroA) return o.neg ? 1 : -1;
    if (zeroB) return this.neg ? -1 : 1;
    if (this.neg !== o.neg) return this.neg ? -1 : 1;
    const flip = this.neg ? -1 : 1;
    const ea = this.e;
    const eb = o.e;
    if (ea !== eb) return (ea > eb ? flip : -flip) as -1 | 1;
    const [a, b] = Decimal.align(this, o);
    return a === b ? 0 : ((a > b ? flip : -flip) as -1 | 1);
  }

  eq(other: DecimalValue): boolean {
    return this.cmp(other) === 0;
  }
  gt(other: DecimalValue): boolean {
    return this.cmp(other) === 1;
  }
  gte(other: DecimalValue): boolean {
    return this.cmp(other) >= 0;
  }
  lt(other: DecimalValue): boolean {
    return this.cmp(other) === -1;
  }
  lte(other: DecimalValue): boolean {
    return this.cmp(other) <= 0;
  }

  /** Round to `places` digits after the decimal point in `mode` (default half-up). */
  toDecimalPlaces(places: number, mode: Rounding = ROUND_HALF_UP): Decimal {
    if (!this.fin || this.c === 0n) return this;
    const drop = -places - this.x;
    if (drop <= 0) return this;
    const digits = digitCount(this.c);
    let rounded: bigint;
    if (drop > digits + 1) {
      // |value| < 0.1 of the last kept unit: only directed modes can round away from zero.
      rounded = mode === ROUND_UP || (mode === ROUND_CEIL && !this.neg) || (mode === ROUND_FLOOR && this.neg) ? 1n : 0n;
    } else {
      rounded = divRound(this.c, pow10(drop), this.neg, mode);
    }
    return Decimal.from(this.neg, rounded, this.x + drop);
  }

  floor(): Decimal {
    return this.toDecimalPlaces(0, ROUND_FLOOR);
  }

  ceil(): Decimal {
    return this.toDecimalPlaces(0, ROUND_CEIL);
  }

  /** Integer value as a bigint; a fraction is truncated toward zero. Throws for non-finite values. */
  toBigInt(): bigint {
    if (!this.fin) throw new RangeError("Cannot convert a non-finite value to bigint");
    if (this.c === 0n) return 0n;
    const { c, x } = this.trimmed();
    const magnitude = x >= 0 ? c * pow10(x) : c / pow10(-x);
    return this.neg ? -magnitude : magnitude;
  }

  /** Plain decimal notation, never an exponent. Zero prints as "0" whatever its sign. */
  toFixed(): string {
    if (!this.fin) return this.neg ? "-Infinity" : "Infinity";
    if (this.c === 0n) return "0";
    const sign = this.neg ? "-" : "";
    const { c, x } = this.trimmed();
    const digits = digitsOf(c);
    if (x >= 0) return sign + digits + "0".repeat(x);
    const point = digits.length + x;
    if (point > 0) return `${sign}${digits.slice(0, point)}.${digits.slice(point)}`;
    return `${sign}0.${"0".repeat(-point)}${digits}`;
  }

  /** The nearest double, `-0` for negative zero, ±Infinity beyond the double range. */
  toNumber(): number {
    if (!this.fin) return this.neg ? -Infinity : Infinity;
    if (this.c === 0n) return this.neg ? -0 : 0;
    const { c, x } = this.trimmed();
    return Number(`${this.neg ? "-" : ""}${c}e${x}`);
  }

  toString(): string {
    return this.toFixed();
  }
}

/** Round a finite non-zero magnitude to `precision` significant digits, half-up. */
const roundSignificant = (value: Decimal, precision: number): Decimal => {
  const digits = digitCount(value.c);
  if (digits <= precision) return value;
  const drop = digits - precision;
  return Decimal.from(value.neg, divRound(value.c, pow10(drop), value.neg, ROUND_HALF_UP), value.x + drop);
};

/**
 * `base^times` (or its reciprocal) rounded half-up to `precision` digits. Intermediate products are
 * truncated to a working width, so the computed magnitude `low` never exceeds the true one and the true
 * one stays below `high`; when both bounds round alike the answer is known, otherwise the width doubles.
 * Exact results never truncate, so exact ties round exactly.
 */
const powRounded = (base: Decimal, times: number, reciprocal: boolean, negative: boolean, precision: number): Decimal => {
  const one = new Decimal(1);
  const guard = String(times).length + 4;
  const errorFactor = BigInt(times) * 4n + 4n;
  for (let width = precision + guard; ; width *= 2) {
    let truncated = false;
    const shrink = (value: Decimal): Decimal => {
      const exact = value.trimmed();
      const digits = digitCount(exact.c);
      if (digits <= width) return exact;
      truncated = true;
      const drop = digits - width;
      return Decimal.from(false, exact.c / pow10(drop), exact.x + drop);
    };
    let low = one;
    let square = Decimal.from(false, base.c, base.x);
    for (let n = times; n > 0; n = Math.floor(n / 2)) {
      if (n % 2 === 1) low = shrink(low.mul(square));
      if (n > 1) square = shrink(square.mul(square));
      if (!low.fin || !square.fin) return Decimal.nonFinite(negative);
    }
    const signed = (value: Decimal): Decimal => Decimal.from(negative, value.c, value.x);
    if (!truncated) {
      if (!reciprocal) return signed(roundSignificant(low, precision));
      return signed(one.div(low, precision));
    }
    if (low.c === 0n) return reciprocal ? Decimal.nonFinite(negative) : signed(low);
    const high = Decimal.from(false, low.c + (low.c * errorFactor) / pow10(width - 1) + 2n, low.x);
    const lower = reciprocal ? one.div(high, precision) : roundSignificant(low, precision);
    const upper = reciprocal ? one.div(low, precision) : roundSignificant(high, precision);
    if (lower.cmp(upper) === 0 || width > precision * 8 + 400) return signed(lower);
  }
};
