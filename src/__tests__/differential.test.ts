/**
 * Differential tests: every result is compared with an independent oracle written with
 * plain BigInt arithmetic (no decimal.js), over seeded random operands. A disagreement
 * means either decimal.js or this package's use of it is wrong.
 */
import {
  summary, subtract, multiply, divide, modulo, power, round, percentage, compareNumbers,
  toDecimalString, gcd, lcm, clamp, sumValueInArray, averageValueInArray, sumBig, averageBig, medianBig, median,
  formatNumber, formatBytes, formatCurrency, range, radixSort, countingSort,
} from "../index";
import type { RoundingMode } from "../index";

// ------------------------------------------------------------------ oracle
/** value = n / 10^e with e >= 0 */
interface Dec { n: bigint; e: number }
const pow10 = (k: number): bigint => 10n ** BigInt(k);
const abs = (x: bigint): bigint => (x < 0n ? -x : x);

const parse = (text: string): Dec => {
  const m = /^([+-]?)(\d*)\.?(\d*)(?:[eE]([+-]?\d+))?$/.exec(text);
  if (!m || (m[2] === "" && m[3] === "")) throw new Error(`oracle cannot parse ${text}`);
  const n = BigInt(`${m[2]}${m[3]}` || "0") * (m[1] === "-" ? -1n : 1n);
  const e = m[3].length - Number(m[4] ?? 0);
  return e < 0 ? { n: n * pow10(-e), e: 0 } : { n, e };
};
const align = (a: Dec, b: Dec): [bigint, bigint, number] => {
  const e = Math.max(a.e, b.e);
  return [a.n * pow10(e - a.e), b.n * pow10(e - b.e), e];
};
const show = (d: Dec): string => {
  const neg = d.n < 0n;
  const digits = abs(d.n).toString().padStart(d.e + 1, "0");
  const int = digits.slice(0, digits.length - d.e);
  const frac = digits.slice(digits.length - d.e).replace(/0+$/, "");
  return `${neg ? "-" : ""}${int}${frac ? `.${frac}` : ""}`;
};
const add = (a: Dec, b: Dec): Dec => { const [x, y, e] = align(a, b); return { n: x + y, e }; };
const sub = (a: Dec, b: Dec): Dec => { const [x, y, e] = align(a, b); return { n: x - y, e }; };
const mul = (a: Dec, b: Dec): Dec => ({ n: a.n * b.n, e: a.e + b.e });
const cmp = (a: Dec, b: Dec): number => { const [x, y] = align(a, b); return x < y ? -1 : x > y ? 1 : 0; };
const mod = (a: Dec, b: Dec): Dec => { const [x, y, e] = align(a, b); return { n: x % y, e }; };

/** Quotient rounded half-up to `p` significant digits. */
const div = (a: Dec, b: Dec, p: number): Dec => {
  if (a.n === 0n) return { n: 0n, e: 0 };
  const neg = a.n < 0n !== b.n < 0n;
  const num = abs(a.n) * pow10(b.e);
  const den = abs(b.n) * pow10(a.e);
  const s = p + 3 - (num.toString().length - den.toString().length);
  const q = s >= 0 ? (num * pow10(s)) / den : num / (den * pow10(-s));
  const t = q.toString().length - p;
  const drop = pow10(t);
  let qq = q / drop;
  if ((q % drop) * 2n >= drop) qq += 1n;
  const e = s - t;
  const n = neg ? -qq : qq;
  return e < 0 ? { n: n * pow10(-e), e: 0 } : { n, e };
};

const roundDec = (a: Dec, places: number, mode: RoundingMode): Dec => {
  if (a.e <= places) return a;
  const drop = pow10(a.e - places);
  const neg = a.n < 0n;
  let q = abs(a.n) / drop;
  const rem = abs(a.n) % drop;
  const half = rem * 2n === drop ? 0 : rem * 2n > drop ? 1 : -1;
  const any = rem > 0n;
  const up = {
    up: any, down: false, ceil: any && !neg, floor: any && neg,
    "half-up": half >= 0, "half-down": half > 0, "half-even": half > 0 || (half === 0 && q % 2n === 1n),
  }[mode];
  if (up) q += 1n;
  return { n: neg ? -q : q, e: places };
};

const gcdBig = (a: bigint, b: bigint): bigint => { a = abs(a); b = abs(b); while (b) [a, b] = [b, a % b]; return a; };

// ------------------------------------------------------------------ generators
const lcg = (seed: number) => () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;
const MODES: RoundingMode[] = ["half-up", "half-down", "half-even", "up", "down", "ceil", "floor"];

const makeGenerators = (seed: number) => {
  const next = lcg(seed);
  const int = (max: number) => Math.floor(next() * (max + 1));
  const digits = (n: number) => Array.from({ length: n }, () => int(9)).join("");
  /** A valid numeric string in assorted notations; up to `maxDigits` digits. */
  const decimalString = (maxDigits = 30): string => {
    const sign = ["", "", "-", "+"][int(3)];
    let intPart = digits(int(Math.min(maxDigits, 22)));
    let fracPart = next() < 0.6 ? digits(int(Math.min(maxDigits, 22))) : "";
    if (intPart === "" && fracPart === "") intPart = digits(1);
    const point = fracPart || next() < 0.1 ? "." : "";
    const exponent = next() < 0.25 ? `${["e", "E"][int(1)]}${["", "+", "-"][int(2)]}${int(25)}` : "";
    return `${sign}${intPart}${point}${fracPart}${exponent}`;
  };
  /** A double built from ≤ 15 digits, so its shortest representation is the intended decimal. */
  const double = (): number => {
    const r = next();
    if (r < 0.3) return int(2_000_000) * (next() < 0.5 ? -1 : 1); // safe integers: native fast path
    if (r < 0.4) return Number(`${digits(1 + int(14))}e${int(40) - 20}`);
    return Number(`${next() < 0.5 ? "-" : ""}${digits(1 + int(7))}.${digits(1 + int(7))}`);
  };
  const bigint = (): bigint => BigInt(`${next() < 0.5 ? "-" : ""}${digits(1 + int(60)).replace(/^0+(?=.)/, "")}`);
  return { next, int, decimalString, double, bigint };
};

// Raise DIFF_SEEDS / DIFF_CASES for a longer soak run, e.g. DIFF_SEEDS=25 DIFF_CASES=4000 npx jest differential
const CASES = Number(process.env.DIFF_CASES) || 1500;
const SEEDS = Array.from({ length: Number(process.env.DIFF_SEEDS) || 3 }, (_, i) => i + 1);

describe.each(SEEDS)("differential vs BigInt oracle (seed %i)", (seed) => {
  const g = makeGenerators(seed * 7919);

  test("string arithmetic is exact", () => {
    for (let i = 0; i < CASES; i++) {
      const sa = g.decimalString();
      const sb = g.decimalString();
      const a = parse(sa);
      const b = parse(sb);
      expect(summary(sa, sb)).toBe(show(add(a, b)));
      expect(subtract(sa, sb)).toBe(show(sub(a, b)));
      expect(multiply(sa, sb)).toBe(show(mul(a, b)));
      expect(compareNumbers(sa, sb)).toBe(cmp(a, b));
      expect(toDecimalString(sa)).toBe(show(a));
      if (b.n !== 0n) {
        expect(modulo(sa, sb)).toBe(show(mod(a, b)));
        for (const precision of [1, 7, 40]) {
          expect(divide(sa, sb, { precision })).toBe(show(div(a, b, precision)));
        }
        expect(percentage(sa, sb, { precision: 25 })).toBe(show(div(mul(a, { n: 100n, e: 0 }), b, 25)));
      }
    }
  });

  test("number arithmetic equals the exact result rounded once to a double", () => {
    for (let i = 0; i < CASES; i++) {
      const x = g.double();
      const y = g.double();
      const a = parse(String(x));
      const b = parse(String(y));
      expect(summary(x, y)).toBe(Number(show(add(a, b))) || 0);
      expect(subtract(x, y)).toBe(Number(show(sub(a, b))) || 0);
      expect(multiply(x, y)).toBe(Number(show(mul(a, b))) || 0);
      if (y !== 0) expect(divide(x, y)).toBe(Number(show(div(a, b, 40))) || 0);
      if (y !== 0) expect(modulo(x, y)).toBe(Number(show(mod(a, b))) || 0);
    }
  });

  test("bigint arithmetic matches native BigInt", () => {
    for (let i = 0; i < CASES; i++) {
      const a = g.bigint();
      const b = g.bigint();
      expect(summary(a, b)).toBe(a + b);
      expect(subtract(a, b)).toBe(a - b);
      expect(multiply(a, b)).toBe(a * b);
      if (b !== 0n) {
        expect(modulo(a, b)).toBe(a % b);
        expect(divide(a, b, { precision: 30 })).toBe(show(div(parse(String(a)), parse(String(b)), 30)));
      }
      expect(gcd(a, b)).toBe(gcdBig(a, b));
      if (a !== 0n && b !== 0n) expect(lcm(a, b)).toBe(abs(a * b) / gcdBig(a, b));
    }
  });

  test("round matches the oracle for every mode and place count", () => {
    for (let i = 0; i < CASES; i++) {
      const text = g.decimalString(25);
      const places = g.int(30);
      const mode = MODES[g.int(MODES.length - 1)];
      const expected = show(roundDec(parse(text), places, mode));
      expect(round(text, places, mode)).toBe(expected === "-0" ? "0" : expected);
    }
    for (let i = 0; i < CASES; i++) {
      const x = g.double();
      const places = g.int(8);
      const mode = MODES[g.int(MODES.length - 1)];
      expect(round(x, places, mode)).toBe(Number(show(roundDec(parse(String(x)), places, mode))) || 0);
    }
  });

  test("power is exact whenever the exact result fits the default 40 digits", () => {
    let checked = 0;
    for (let i = 0; i < 600; i++) {
      const text = g.decimalString(5).replace(/[eE].*$/, "");
      const base = parse(text);
      const exponent = g.int(6);
      const exact: Dec = { n: base.n ** BigInt(exponent), e: base.e * exponent };
      if (abs(exact.n).toString().length > 40) continue; // longer results are rounded: see the next test
      checked++;
      expect(power(text, exponent)).toBe(show(exact));
      if (base.n !== 0n) expect(power(text, -exponent, { precision: 60 })).toBe(show(div({ n: 1n, e: 0 }, exact, 60)));
    }
    expect(checked).toBeGreaterThan(150);
  });

  test("power of long results stays within 2 units of the last kept digit", () => {
    for (let i = 0; i < 300; i++) {
      const text = g.decimalString(8).replace(/[eE].*$/, "");
      const base = parse(text);
      if (base.n === 0n) continue;
      const exponent = 5 + g.int(40);
      const exact: Dec = { n: base.n ** BigInt(exponent), e: base.e * exponent };
      const got = parse(power(text, exponent, { precision: 30 }));
      const [gotN, exactN] = align(got, exact);
      const digits = abs(exactN).toString().length; // significant digits of the exact value, aligned
      const unit = digits > 30 ? pow10(digits - 30) : 1n; // one unit of the 30th significant digit
      expect(abs(gotN - exactN) <= 2n * unit).toBe(true);
    }
  });

  test("clamp, gcd and lcm of decimals match scaled-integer arithmetic", () => {
    for (let i = 0; i < CASES / 2; i++) {
      const sa = g.decimalString(15).replace(/[eE].*$/, "");
      const sb = g.decimalString(15).replace(/[eE].*$/, "");
      const [x, y, e] = align(parse(sa), parse(sb));
      const g1 = gcdBig(x, y);
      expect(gcd(sa, sb)).toBe(show({ n: g1, e }));
      expect(lcm(sa, sb)).toBe(show({ n: x === 0n || y === 0n ? 0n : abs(x * y) / g1, e }));
      const lo = parse(sa);
      const hi = parse(sb);
      if (cmp(lo, hi) <= 0) {
        const v = g.decimalString(15);
        const val = parse(v);
        const want = cmp(val, lo) < 0 ? lo : cmp(val, hi) > 0 ? hi : val;
        expect(clamp(v, sa, sb)).toBe(show(want));
      }
    }
  });

  test("array aggregates equal the exact oracle", () => {
    for (let i = 0; i < 300; i++) {
      const size = 1 + g.int(40);
      const values = Array.from({ length: size }, () => g.double());
      const decs = values.map((v) => parse(String(v)));
      const total = decs.reduce(add, { n: 0n, e: 0 });
      expect(sumValueInArray(values)).toBe(Number(show(total)) || 0);
      expect(sumBig(values)).toBe(show(total));
      expect(averageValueInArray(values)).toBe(Number(show(div(total, { n: BigInt(size), e: 0 }, 40))) || 0);
      expect(averageBig(values.map(String), { precision: 30 })).toBe(show(div(total, { n: BigInt(size), e: 0 }, 30)));
      const sorted = [...decs].sort(cmp);
      const mid = size >> 1;
      const medianDec = size % 2 ? sorted[mid] : div(add(sorted[mid - 1], sorted[mid]), { n: 2n, e: 0 }, 60);
      expect(medianBig(values.map(String))).toBe(show(medianDec));
      expect(median(values)).toBe(Number(show(medianDec)) || 0);
    }
  });

  test("mixed kinds in one aggregate stay exact", () => {
    for (let i = 0; i < 200; i++) {
      const items = Array.from({ length: 1 + g.int(10) }, () => {
        const r = g.next();
        return r < 0.33 ? g.bigint() : r < 0.66 ? g.decimalString(20) : g.double();
      });
      const total = items.reduce<Dec>((acc, v) => add(acc, parse(typeof v === "bigint" ? String(v) : String(v))), { n: 0n, e: 0 });
      expect(sumBig(items)).toBe(show(total));
    }
  });

  test("range with fractional steps has no drift or off-by-one", () => {
    for (let i = 0; i < 300; i++) {
      const stepText = `0.${g.int(9) + 1}${g.next() < 0.5 ? g.int(9) : ""}`;
      const startText = `${g.int(5)}.${g.int(99)}`;
      const count = g.int(25);
      const step = parse(stepText);
      const start = parse(startText);
      const endText = show(add(start, mul(step, { n: BigInt(count), e: 0 })));
      const expected = Array.from({ length: count }, (_, k) => Number(show(add(start, mul(step, { n: BigInt(k), e: 0 })))));
      expect(range(Number(startText), Number(endText), Number(stepText))).toEqual(expected);
    }
  });
});

describe("cross-path consistency", () => {
  const g = makeGenerators(424242);

  test("a number and its decimal string give the same result (modulo the single final rounding)", () => {
    for (let i = 0; i < 1500; i++) {
      const x = g.double();
      const y = g.double();
      // a number result is the exact result rounded once to a double
      expect(Number(summary(String(x), String(y)))).toBe(summary(x, y));
      expect(Number(multiply(String(x), String(y)))).toBe(multiply(x, y));
      expect(formatNumber(x, "en-US")).toBe(formatNumber(toDecimalString(x), "en-US"));
      expect(formatCurrency(x, "USD")).toBe(formatCurrency(toDecimalString(x), "USD"));
      if (x >= 0) expect(formatBytes(x)).toBe(formatBytes(toDecimalString(x)));
    }
  });

  test("algebraic identities hold exactly for decimal strings", () => {
    for (let i = 0; i < 800; i++) {
      const a = g.decimalString();
      const b = g.decimalString();
      expect(summary(a, b)).toBe(summary(b, a));
      expect(multiply(a, b)).toBe(multiply(b, a));
      expect(subtract(summary(a, b), b)).toBe(toDecimalString(a));
      if (parse(b).n !== 0n) {
        expect(divide(multiply(a, b), b, { precision: 400 })).toBe(toDecimalString(a));
        const q = divide(a, b, { precision: 400 });
        const r = modulo(a, b);
        expect(compareNumbers(abs2(r), abs2(b))).toBe(-1);
        void q;
      }
      expect(round(round(a, 5), 5)).toBe(round(a, 5));
    }
  });

  test("integer sorts agree with Array#sort", () => {
    for (let i = 0; i < 200; i++) {
      const size = g.int(60);
      const values = Array.from({ length: size }, () => g.int(2000) - 1000);
      const expected = [...values].sort((x, y) => x - y);
      expect(countingSort(values)).toEqual(expected);
      expect(radixSort(values)).toEqual(expected);
      const bigs = Array.from({ length: size }, () => g.bigint());
      expect(radixSort(bigs)).toEqual([...bigs].sort((x, y) => (x < y ? -1 : x > y ? 1 : 0)));
    }
  });
});

const abs2 = (text: string): string => text.replace(/^-/, "");

describe("edge doubles against the oracle", () => {
  const EDGES = [
    0, -0, 1, -1, 0.1, 0.2, 0.3, 1 / 3, Math.PI, 4.35, 1.005, 123456789.123456789,
    Number.EPSILON, Number.MIN_VALUE, 2 * Number.MIN_VALUE, 2.2250738585072014e-308,
    Number.MAX_SAFE_INTEGER, -Number.MAX_SAFE_INTEGER, 2 ** 53, 2 ** 53 + 2, 1e21, 1e22,
    Number.MAX_VALUE, -Number.MAX_VALUE, Number.MAX_VALUE / 2, 1e-7, 5e-324,
  ];

  /** The exact result as a double, or the error code a number result must raise. */
  const expectedNumber = (exact: Dec): number | "ERR_OVERFLOW" | "ERR_UNDERFLOW" => {
    const text = show(exact);
    const value = Number(text);
    if (!Number.isFinite(value)) return "ERR_OVERFLOW";
    if (value === 0 && exact.n !== 0n) return "ERR_UNDERFLOW";
    return value === 0 ? 0 : value;
  };
  const check = (run: () => number, exact: Dec) => {
    const want = expectedNumber(exact);
    if (typeof want === "number") {
      const got = run();
      expect(Object.is(got, want)).toBe(true); // also proves -0 is never returned
    } else {
      let error: { code?: string } | undefined;
      try { run(); } catch (e) { error = e as { code?: string }; }
      expect(error?.code).toBe(want);
    }
  };

  test.each(EDGES.flatMap((x) => EDGES.map((y) => [x, y] as const)))("%p and %p", (x, y) => {
    const a = parse(String(x));
    const b = parse(String(y));
    check(() => summary(x, y), add(a, b));
    check(() => subtract(x, y), sub(a, b));
    check(() => multiply(x, y), mul(a, b));
    if (y !== 0) {
      check(() => divide(x, y), div(a, b, 40));
      check(() => modulo(x, y), mod(a, b));
    }
    expect(compareNumbers(x, y)).toBe(cmp(a, b));
  });

  test.each(EDGES)("round(%p) in every mode", (x) => {
    for (const mode of MODES) {
      for (const places of [0, 1, 2, 10, 300, 330]) {
        check(() => round(x, places, mode), roundDec(parse(String(x)), places, mode));
      }
    }
  });

  test("the library never mutates the global decimal.js configuration", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Decimal = require("decimal.js");
    const before = JSON.stringify({ p: Decimal.precision, r: Decimal.rounding, m: Decimal.modulo, e: [Decimal.minE, Decimal.maxE, Decimal.toExpNeg, Decimal.toExpPos] });
    divide("1", "3", { precision: 500 });
    power("2", "-100");
    multiply("1e-200000", "1e-1000");
    sumBig(["0.1", "0.2"]);
    expect(JSON.stringify({ p: Decimal.precision, r: Decimal.rounding, m: Decimal.modulo, e: [Decimal.minE, Decimal.maxE, Decimal.toExpNeg, Decimal.toExpPos] })).toBe(before);
    expect(new Decimal(1).div(3).toString()).toBe("0.33333333333333333333"); // an application's own Decimal still uses precision 20
    Decimal.set({ precision: 5, rounding: Decimal.ROUND_DOWN });
    try {
      expect(divide("2", "3", { precision: 10 })).toBe("0.6666666667"); // unaffected by the application's config
      expect(summary("1.23456789", "0.00000001")).toBe("1.2345679"); // 8 significant digits survive a global precision of 5
    } finally {
      Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });
    }
  });
});
