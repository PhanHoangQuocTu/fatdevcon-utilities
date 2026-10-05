import { NumericTypeError } from "../../utils/errors";
import { assertInteger, describeValue } from "../../utils/validate";
import {
  ExactDecimal,
  checkBigInt,
  guardBigInt,
  decimalToNumber,
  decimalToString,
  kindOf,
  outOfRange,
  toDecimal,
} from "../../utils/numeric";
import type { Decimal, NumericInput } from "../../utils/numeric";

/** Largest `n` with a finite `number` factorial: 171! overflows IEEE 754 doubles. */
const MAX_FACTORIAL_NUMBER = 170;
/** Largest `n` accepted for a `bigint` / string factorial (65000! has about 287,000 digits). */
export const MAX_FACTORIAL_BIG = 65_000;
/** Largest `n` with a finite `number` Fibonacci: F(1477) overflows IEEE 754 doubles. */
const MAX_FIBONACCI_NUMBER = 1476;
/** Largest `n` accepted for a `bigint` / string Fibonacci (F(1000000) has 208,988 digits). */
export const MAX_FIBONACCI_BIG = 1_000_000;
/** Most decimal places `gcd` / `lcm` will scale to integers. */
const MAX_GCD_SCALE = 1_000;
/** Largest integer `isPrime` accepts, in bits. */
export const MAX_PRIME_BITS = 2048;

/** Parse an integer argument given as a string or bigint. */
const toInteger = (value: NumericInput, name: string): bigint => {
  if (typeof value === "bigint") return checkBigInt(value, name);
  const decimal = toDecimal(value, name);
  if (!decimal.isInteger()) {
    throw new NumericTypeError("ERR_NOT_INTEGER", `${name} must be an integer, received ${describeValue(value)}`);
  }
  return BigInt(decimal.toFixed());
};

// ---------------------------------------------------------------- factorial

let factorialTable: number[] | undefined;
const numberFactorial = (n: number): number => {
  if (!factorialTable) {
    factorialTable = [1];
    let acc = 1n;
    for (let i = 1; i <= MAX_FACTORIAL_NUMBER; i++) {
      acc *= BigInt(i);
      factorialTable.push(Number(acc));
    }
  }
  return factorialTable[n];
};

/** Product of lo..hi by binary splitting: balanced multiplications are far faster than a running product. */
const product = (lo: number, hi: number): bigint => {
  if (hi - lo < 16) {
    let acc = BigInt(lo);
    for (let i = lo + 1; i <= hi; i++) acc *= BigInt(i);
    return acc;
  }
  const mid = (lo + hi) >> 1;
  return product(lo, mid) * product(mid + 1, hi);
};

/**
 * `n!`. A `number` argument returns a `number` (0 to 170). A `bigint` or numeric-string
 * argument returns the exact value, for `n` up to 65,000.
 */
export function factorial(n: number): number;
export function factorial(n: bigint): bigint;
export function factorial(n: string): string;
export function factorial(n: NumericInput): NumericInput {
  if (typeof n === "number") {
    assertInteger(n, "n");
    if (n < 0) throw outOfRange("Factorial of negative number is not defined");
    if (n > MAX_FACTORIAL_NUMBER) {
      throw outOfRange(
        `Factorial of ${n} exceeds the maximum representable number; pass a bigint (factorial(${n}n)) for an exact result`
      );
    }
    return numberFactorial(n);
  }
  const k = toInteger(n, "n");
  if (k < 0n) throw outOfRange("Factorial of negative number is not defined");
  if (k > BigInt(MAX_FACTORIAL_BIG)) {
    throw outOfRange(`Factorial is supported up to ${MAX_FACTORIAL_BIG}, received ${k}`);
  }
  const result = k < 2n ? 1n : product(2, Number(k));
  return typeof n === "bigint" ? result : result.toString();
}

// ---------------------------------------------------------------- fibonacci

let fibonacciTable: number[] | undefined;
const numberFibonacci = (n: number): number => {
  if (!fibonacciTable) {
    fibonacciTable = [0, 1];
    let a = 0n;
    let b = 1n;
    for (let i = 2; i <= MAX_FIBONACCI_NUMBER; i++) {
      [a, b] = [b, a + b];
      fibonacciTable.push(Number(b));
    }
  }
  return fibonacciTable[n];
};

/** Fast doubling: F(2k) = F(k)(2F(k+1) - F(k)), F(2k+1) = F(k)^2 + F(k+1)^2. */
const bigFibonacci = (n: number): bigint => {
  let a = 0n;
  let b = 1n;
  for (let bit = 31 - Math.clz32(n); bit >= 0; bit--) {
    const c = a * (2n * b - a);
    const d = a * a + b * b;
    if ((n >> bit) & 1) {
      a = d;
      b = c + d;
    } else {
      a = c;
      b = d;
    }
  }
  return a;
};

/**
 * The n-th Fibonacci number, with `fibonacci(0) = 0`. A `number` argument returns a
 * `number` (0 to 1476). A `bigint` or numeric-string argument returns the exact value,
 * for `n` up to 1,000,000.
 */
export function fibonacci(n: number): number;
export function fibonacci(n: bigint): bigint;
export function fibonacci(n: string): string;
export function fibonacci(n: NumericInput): NumericInput {
  if (typeof n === "number") {
    assertInteger(n, "n");
    if (n < 0) throw outOfRange("Fibonacci of negative number is not defined");
    if (n > MAX_FIBONACCI_NUMBER) {
      throw outOfRange(
        `Fibonacci of ${n} exceeds the maximum representable number; pass a bigint (fibonacci(${n}n)) for an exact result`
      );
    }
    return numberFibonacci(n);
  }
  const k = toInteger(n, "n");
  if (k < 0n) throw outOfRange("Fibonacci of negative number is not defined");
  if (k > BigInt(MAX_FIBONACCI_BIG)) {
    throw outOfRange(`Fibonacci is supported up to ${MAX_FIBONACCI_BIG}, received ${k}`);
  }
  const result = bigFibonacci(Number(k));
  return typeof n === "bigint" ? result : result.toString();
}

// ---------------------------------------------------------------- gcd / lcm

const gcdBig = (a: bigint, b: bigint): bigint => {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b !== 0n) [a, b] = [b, a % b];
  return a;
};

interface Scaled {
  a: bigint;
  b: bigint;
  places: number;
}

/** Scale two decimals to integers by the larger number of decimal places. */
const scale = (da: Decimal, db: Decimal): Scaled => {
  const places = Math.max(da.decimalPlaces(), db.decimalPlaces());
  if (places > MAX_GCD_SCALE) {
    throw outOfRange(`Arguments may have at most ${MAX_GCD_SCALE} decimal places, received ${places}`);
  }
  const factor = new ExactDecimal(`1e${places}`);
  return {
    a: BigInt(da.abs().mul(factor).toFixed()),
    b: BigInt(db.abs().mul(factor).toFixed()),
    places,
  };
};

const fromScaled = (value: bigint, places: number): Decimal => new ExactDecimal(`${value}e-${places}`);

/**
 * Greatest common divisor; the sign of the arguments is ignored and decimals are supported
 * (`gcd(0.5, 0.25)` is `0.25`). `number` returns `number`, `bigint` returns `bigint`.
 */
export function gcd(a: number, b: number): number;
export function gcd(a: bigint, b: bigint): bigint;
export function gcd(a: NumericInput, b: NumericInput): string;
export function gcd(a: NumericInput, b: NumericInput): NumericInput {
  if (typeof a === "bigint" && typeof b === "bigint") {
    return gcdBig(checkBigInt(a, "a"), checkBigInt(b, "b"));
  }
  if (typeof a === "number" && typeof b === "number" && Number.isSafeInteger(a) && Number.isSafeInteger(b)) {
    let x = Math.abs(a);
    let y = Math.abs(b);
    while (y !== 0) [x, y] = [y, x % y];
    return x;
  }
  const kind = kindOf(a, b);
  const { a: x, b: y, places } = scale(toDecimal(a, "a"), toDecimal(b, "b"));
  const result = fromScaled(gcdBig(x, y), places);
  return kind === "number" ? decimalToNumber(result) : decimalToString(result);
}

/**
 * Least common multiple; `0` when either argument is `0`. Decimals are supported.
 * `number` returns `number` (throws `ERR_OVERFLOW` when it does not fit), `bigint` returns `bigint`.
 */
export function lcm(a: number, b: number): number;
export function lcm(a: bigint, b: bigint): bigint;
export function lcm(a: NumericInput, b: NumericInput): string;
export function lcm(a: NumericInput, b: NumericInput): NumericInput {
  if (typeof a === "bigint" && typeof b === "bigint") {
    checkBigInt(a, "a");
    checkBigInt(b, "b");
    if (a === 0n || b === 0n) return 0n;
    const g = gcdBig(a, b);
    const result = guardBigInt(() => (a / g) * b);
    return checkBigInt(result < 0n ? -result : result, "Result");
  }
  const kind = kindOf(a, b);
  const { a: x, b: y, places } = scale(toDecimal(a, "a"), toDecimal(b, "b"));
  const multiple = x === 0n || y === 0n ? 0n : guardBigInt(() => (x / gcdBig(x, y)) * y);
  const result = fromScaled(multiple, places);
  return kind === "number" ? decimalToNumber(result) : decimalToString(result);
}

// ---------------------------------------------------------------- isPrime

const BASES = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n, 41n, 43n, 47n, 53n, 59n, 61n, 67n, 71n];
/** The first 13 prime bases are a proof of primality below this bound. */
const DETERMINISTIC_BOUND = 3_317_044_064_679_887_385_961_981n;

const modPow = (base: bigint, exponent: bigint, modulus: bigint): bigint => {
  let result = 1n;
  base %= modulus;
  while (exponent > 0n) {
    if (exponent & 1n) result = (result * base) % modulus;
    base = (base * base) % modulus;
    exponent >>= 1n;
  }
  return result;
};

const millerRabin = (n: bigint): boolean => {
  for (const p of BASES) {
    if (n === p) return true;
    if (n % p === 0n) return false;
  }
  let d = n - 1n;
  let s = 0;
  while ((d & 1n) === 0n) {
    d >>= 1n;
    s++;
  }
  const bases = n < DETERMINISTIC_BOUND ? BASES.slice(0, 13) : BASES;
  witness: for (const a of bases) {
    let x = modPow(a, d, n);
    if (x === 1n || x === n - 1n) continue;
    for (let r = 1; r < s; r++) {
      x = (x * x) % n;
      if (x === n - 1n) continue witness;
    }
    return false;
  }
  return true;
};

const trialDivision = (n: number): boolean => {
  if (n <= 3) return n > 1;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
};

/**
 * Whether `n` is prime. A `number` never throws: NaN, Infinity, non-integers and anything
 * below 2 are `false`. A `bigint` or numeric string is validated (invalid text throws) and
 * may have up to 2048 bits. Up to about 3.3e24 the answer is a proof; beyond that it is a
 * strong probable-prime test over 20 fixed bases, which a deliberately constructed
 * composite can pass.
 */
export function isPrime(n: NumericInput): boolean {
  if (typeof n === "number") {
    if (!Number.isInteger(n) || n <= 1) return false;
    if (n < 1_000_000) return trialDivision(n);
    // Integers above 2^53 are always even, so only safe integers can be prime.
    return Number.isSafeInteger(n) ? millerRabin(BigInt(n)) : false;
  }
  if (typeof n === "string") {
    if (!toDecimal(n, "n").isInteger()) return false;
  }
  const value = typeof n === "bigint" ? n : BigInt(toDecimal(n, "n").toFixed());
  if (value <= 1n) return false;
  if (value >= 1n << BigInt(MAX_PRIME_BITS)) {
    throw outOfRange(`n may have at most ${MAX_PRIME_BITS} bits for a primality test`);
  }
  return value < 1_000_000n ? trialDivision(Number(value)) : millerRabin(value);
}
