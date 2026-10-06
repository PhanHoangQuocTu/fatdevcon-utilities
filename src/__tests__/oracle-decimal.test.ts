/**
 * Differential test: the built-in BigInt Decimal against decimal.js (a devDependency used only as an
 * independent oracle). Every operation the library relies on is compared on seeded random inputs.
 * Raise the load with FUZZ_SEEDS / FUZZ_CASES, e.g. `FUZZ_SEEDS=50 FUZZ_CASES=5000 npx jest oracle`.
 */
import OracleDecimal from "decimal.js";
import {
  Decimal,
  MAX_EXPONENT,
  ROUND_CEIL,
  ROUND_DOWN,
  ROUND_FLOOR,
  ROUND_HALF_DOWN,
  ROUND_HALF_EVEN,
  ROUND_HALF_UP,
  ROUND_UP,
} from "../utils/decimal";
import type { Rounding } from "../utils/decimal";

const SEEDS = Number(process.env.FUZZ_SEEDS ?? 6);
const CASES = Number(process.env.FUZZ_CASES ?? 1500);
const MODES: Rounding[] = [ROUND_UP, ROUND_DOWN, ROUND_CEIL, ROUND_FLOOR, ROUND_HALF_UP, ROUND_HALF_DOWN, ROUND_HALF_EVEN];

const mulberry32 = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const oracles = new Map<string, typeof OracleDecimal>();
const oracle = (precision: number, rounding: number): typeof OracleDecimal => {
  const key = `${precision}/${rounding}`;
  let ctor = oracles.get(key);
  if (!ctor) {
    ctor = OracleDecimal.clone({
      precision,
      rounding: rounding as OracleDecimal.Rounding,
      modulo: OracleDecimal.ROUND_DOWN,
      maxE: MAX_EXPONENT,
      minE: -MAX_EXPONENT,
      toExpNeg: -9e15,
      toExpPos: 9e15,
    });
    oracles.set(key, ctor);
  }
  return ctor;
};

/** A random numeric string biased toward the awkward shapes: ties, trailing zeros, long digit runs, exponents. */
const randomNumber = (rand: () => number): string => {
  const pick = (n: number) => Math.floor(rand() * n);
  const digits = (n: number) => Array.from({ length: n }, () => String(pick(10))).join("");
  const sign = rand() < 0.4 ? "-" : "";
  switch (pick(9)) {
    case 0:
      return `${sign}${pick(1000)}`;
    case 1:
      return `${sign}${pick(100)}.${digits(pick(6))}5`;
    case 2:
      return `${sign}${digits(1 + pick(60))}`;
    case 3:
      return `${sign}0.${"0".repeat(pick(30))}${digits(1 + pick(30))}`;
    case 4:
      return `${sign}${digits(1 + pick(20))}.${digits(1 + pick(20))}e${pick(80) - 40}`;
    case 5:
      return `${sign}${1 + pick(9)}${"0".repeat(pick(50))}`;
    case 6:
      return `${sign}${pick(10)}.${pick(10)}${"9".repeat(pick(25))}`;
    case 7:
      return `${sign}${pick(20)}e${(rand() < 0.5 ? "-" : "") + pick(400)}`;
    default:
      return `${sign}${pick(5)}.${["5", "25", "125", "0625"][pick(4)]}`;
  }
};

const same = (label: string, mine: () => string, theirs: () => string): void => {
  const expected = theirs();
  const actual = mine();
  if (actual !== expected) throw new Error(`${label}\n  expected ${expected}\n  received ${actual}`);
};

describe("Decimal vs decimal.js oracle", () => {
  for (let seed = 1; seed <= SEEDS; seed++) {
    test(`seed ${seed}: arithmetic, rounding and conversions agree (${CASES} cases)`, () => {
      const rand = mulberry32(seed * 7919);
      const pick = (n: number) => Math.floor(rand() * n);
      for (let i = 0; i < CASES; i++) {
        const a = randomNumber(rand);
        const b = randomNumber(rand);
        const x = new Decimal(a);
        const y = new Decimal(b);
        const X = new (oracle(1e9, OracleDecimal.ROUND_HALF_UP))(a);
        const Y = new (oracle(1e9, OracleDecimal.ROUND_HALF_UP))(b);
        const tag = (op: string) => `${op}(${a}, ${b})`;

        same(tag("parse"), () => x.toFixed(), () => X.toFixed());
        same(tag("add"), () => x.add(y).toFixed(), () => X.add(Y).toFixed());
        same(tag("sub"), () => x.sub(y).toFixed(), () => X.sub(Y).toFixed());
        same(tag("mul"), () => x.mul(y).toFixed(), () => X.mul(Y).toFixed());
        same(tag("cmp"), () => String(x.cmp(y)), () => String(X.cmp(Y)));
        same(tag("isInteger"), () => String(x.isInteger()), () => String(X.isInteger()));
        same(tag("decimalPlaces"), () => String(x.decimalPlaces()), () => String(X.decimalPlaces()));
        same(tag("e"), () => String(x.e), () => String(X.e));
        same(tag("toNumber"), () => String(x.toNumber()), () => String(X.toNumber()));
        same(tag("floor"), () => x.floor().toFixed(), () => X.floor().toFixed());
        same(tag("ceil"), () => x.ceil().toFixed(), () => X.ceil().toFixed());
        if (!Y.isZero()) same(tag("mod"), () => x.mod(y).toFixed(), () => X.mod(Y).toFixed());

        const mode = MODES[pick(MODES.length)];
        const precision = 1 + pick(60);
        if (!Y.isZero()) {
          same(
            `${tag("div")} p=${precision} m=${mode}`,
            () => x.div(y, precision, mode).toFixed(),
            () => new (oracle(precision, mode))(a).div(new (oracle(precision, mode))(b)).toFixed()
          );
        }
        const places = pick(25);
        same(
          `toDecimalPlaces(${a}, ${places}, m=${mode})`,
          () => x.toDecimalPlaces(places, mode).toFixed(),
          () => X.toDecimalPlaces(places, mode as OracleDecimal.Rounding).toFixed()
        );
      }
    });

    test(`seed ${seed}: integer powers agree (${Math.ceil(CASES / 5)} cases)`, () => {
      const rand = mulberry32(seed * 104729);
      const pick = (n: number) => Math.floor(rand() * n);
      for (let i = 0; i < Math.ceil(CASES / 5); i++) {
        const a = randomNumber(rand);
        const exponent = pick(60) - 20;
        const precision = 1 + pick(50);
        const O = oracle(precision, OracleDecimal.ROUND_HALF_UP);
        if (new O(a).isZero() && exponent < 0) continue;
        const mine = new Decimal(a).pow(exponent, precision).toFixed();
        const theirs = new O(a).pow(exponent).toFixed();
        if (mine !== theirs) {
          // decimal.js is not always correctly rounded for pow; accept only when the exact rational oracle sides with us.
          const exactCtor = oracle(5000, OracleDecimal.ROUND_HALF_UP);
          const exact = new exactCtor(a).pow(Math.abs(exponent));
          const value = exponent < 0 ? new exactCtor(1).div(exact) : exact;
          const reference = new O(value.toFixed()).toFixed();
          const rounded = new O(new O(value).toSignificantDigits(precision, OracleDecimal.ROUND_HALF_UP)).toFixed();
          expect({ a, exponent, precision, mine }).toEqual({ a, exponent, precision, mine: rounded });
          void reference;
        }
      }
    });
  }

  test("large exponents are correctly rounded (checked against a 600-digit oracle)", () => {
    const rand = mulberry32(2026);
    const pick = (n: number) => Math.floor(rand() * n);
    const wide = oracle(600, OracleDecimal.ROUND_HALF_UP);
    for (let i = 0; i < 400; i++) {
      const base = `${pick(2)}.${"0".repeat(pick(6))}${1 + pick(999999)}${["", "5", "49999", "50001"][pick(4)]}`;
      const exponent = (pick(2) ? 1 : -1) * (30 + pick(90));
      const precision = 1 + pick(40);
      const mine = new Decimal(base).pow(exponent, precision);
      const exact = new wide(base).pow(exponent);
      const expected = exact.toSignificantDigits(precision, OracleDecimal.ROUND_HALF_UP).toFixed();
      expect({ base, exponent, precision, value: mine.toFixed() }).toEqual({ base, exponent, precision, value: expected });
    }
  });

  test("very long numbers survive the chunked text conversion at every boundary length", () => {
    const rand = mulberry32(4242);
    for (const length of [1, 2, 2047, 2048, 2049, 4095, 4096, 4097, 6000, 8192, 8193, 20000, 65536, 70001, 150000]) {
      const digits = String(1 + Math.floor(rand() * 9)) + Array.from({ length: length - 1 }, () => Math.floor(rand() * 10)).join("");
      const parsed = new Decimal(digits);
      expect(parsed.toFixed()).toBe(digits);
      expect(parsed.mul(1).toBigInt()).toBe(BigInt(digits));
      expect(new Decimal(BigInt(digits)).toFixed()).toBe(digits);
      expect(new Decimal(`${digits}e-${length}`).toFixed()).toBe(`0.${digits}`.replace(/0+$/, ""));
      expect(parsed.e).toBe(digits.length - 1);
    }
  });

  test("pow is exact without precision", () => {
    expect(new Decimal("1.5").pow(10).toFixed()).toBe("57.6650390625");
    expect(new Decimal("-3").pow(3).toFixed()).toBe("-27");
    expect(new Decimal("1000").pow(30).toFixed()).toBe(`1${"0".repeat(90)}`);
    expect(() => new Decimal(2).pow(-1)).toThrow(RangeError);
  });

  test("overflow and underflow follow the supported exponent range", () => {
    expect(new Decimal(`1e${MAX_EXPONENT}`).isFinite()).toBe(true);
    expect(new Decimal(`1e${MAX_EXPONENT + 1}`).isFinite()).toBe(false);
    expect(new Decimal(`1e-${MAX_EXPONENT}`).isZero()).toBe(false);
    expect(new Decimal(`1e-${MAX_EXPONENT + 1}`).isZero()).toBe(true);
    expect(new Decimal(`9.99e${MAX_EXPONENT}`).mul(10).isFinite()).toBe(false);
  });

  test("zero keeps its sign where callers need it", () => {
    expect(new Decimal(-0).isNeg()).toBe(true);
    expect(Object.is(new Decimal(-0).toNumber(), -0)).toBe(true);
    expect(new Decimal(-0).toFixed()).toBe("0");
    expect(new Decimal("-0.001").toDecimalPlaces(2).isNeg()).toBe(true);
    expect(new Decimal(5).sub(5).isNeg()).toBe(false);
  });
});
