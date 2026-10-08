import Decimal from "decimal.js";
import {
  buildQueryString,
  countingSortByDigit,
  compareNumbers,
  deepEqual,
  difference,
  divide,
  formatBytes,
  getByPath,
  groupBy,
  medianBig,
  merge,
  omit,
  parseBytes,
  pick,
  range,
  setByPath,
  shuffle,
  heapify,
  sort,
  sumBig,
  summary,
  unique,
  safeJsonParse,
  safeJsonStringify,
  toArray,
  toBoolean,
  toNumber,
  toString,
} from "../index";

const seededRandom = (seed: number): (() => number) => {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
};

const own = (key: string, value: unknown): Record<string, unknown> => {
  const result = Object.create(null) as Record<string, unknown>;
  Object.defineProperty(result, key, { configurable: true, enumerable: true, value, writable: true });
  return result;
};

describe("pre-release object and query security regressions", () => {
  it("preserves an own __proto__ key without mutating the result prototype or Object.prototype", () => {
    const input = own("__proto__", { marker: "data" });
    const selected = pick(input, ["__proto__"]);
    const retained = omit({ ...input, normal: 1 }, ["normal"]);

    expect(Object.getPrototypeOf(selected)).toBe(Object.prototype);
    expect(Object.getPrototypeOf(retained)).toBe(Object.prototype);
    expect(Object.prototype.hasOwnProperty.call(selected, "__proto__")).toBe(true);
    expect(Object.prototype.hasOwnProperty.call(retained, "__proto__")).toBe(true);
    expect(({} as Record<string, unknown>).marker).toBeUndefined();
  });

  it("accepts ordinary and null-prototype records, but rejects arrays and class instances", () => {
    expect(buildQueryString(Object.assign(Object.create(null), { a: 1, flag: false }))).toBe("a=1&flag=false");
    expect(() => buildQueryString([] as unknown as Record<string, never>)).toThrow(TypeError);
    expect(() => buildQueryString(new (class Query { a = 1; })() as unknown as Record<string, never>)).toThrow(TypeError);
  });

  it("keeps path writes immutable and blocks prototype-path injection", () => {
    const original = Object.freeze({ account: Object.freeze({ balances: [1, 2] }) });
    const changed = setByPath(original, "account.balances[1]", 9);
    expect(changed).toEqual({ account: { balances: [1, 9] } });
    expect(original).toEqual({ account: { balances: [1, 2] } });
    expect(() => setByPath({}, "__proto__.polluted", true)).toThrow(/unsafe key/);
    expect(getByPath({ inherited: 1 }, "__proto__.inherited", "safe")).toBe("safe");
  });

  it("handles repeated references and cyclic equality without stack overflow", () => {
    const left: { self?: unknown; payload: number } = { payload: 1 };
    const right: { self?: unknown; payload: number } = { payload: 1 };
    left.self = left;
    right.self = right;
    expect(deepEqual(left, right)).toBe(true);
    expect(deepEqual(left, { payload: 2, self: left })).toBe(false);
  });
});

describe("pre-release exported-helper and conversion boundaries", () => {
  it("directly verifies stable merge, digit counting and heap repair helpers", () => {
    const left = [{ key: 1, id: "left" }, { key: 3, id: "last" }];
    const right = [{ key: 1, id: "right" }, { key: 2, id: "middle" }];
    expect(merge(left, right, (a, b) => a.key - b.key).map((item) => item.id)).toEqual(["left", "right", "middle", "last"]);
    expect(countingSortByDigit([170, 45, 75, 90, 802, 24, 2, 66], 1)).toEqual([170, 90, 802, 2, 24, 45, 75, 66]);
    const heap = [1, 3, 2];
    heapify(heap, heap.length, 0, (a, b) => a - b);
    expect(heap).toEqual([3, 1, 2]);
  });

  it("rejects unsupported conversions and preserves JSON failures as data", () => {
    expect(() => safeJsonParse(null as unknown as string)).toThrow(TypeError);
    expect(safeJsonStringify(1n)).toMatchObject({ ok: false });
    expect(toString(new Date("invalid"))).toBe("Invalid Date");
    expect(() => toString(new Map())).toThrow(TypeError);
    expect(toNumber(42)).toBe(42);
    expect(toNumber(42n)).toBe(42);
    expect(() => toNumber(Infinity)).toThrow(TypeError);
    expect(() => toNumber(9_007_199_254_740_992n)).toThrow(RangeError);
    expect(toBoolean(0)).toBe(false);
    expect(toArray(undefined)).toEqual([]);
  });
});

describe("pre-release deterministic property matrix", () => {
  it("matches native immutable sorting and preserves multiset/order invariants over 1,000 generated arrays", () => {
    const random = seededRandom(0x40a11ce);
    for (let iteration = 0; iteration < 1000; iteration++) {
      const values = Array.from({ length: Math.floor(random() * 80) }, () => Math.floor(random() * 41) - 20);
      const snapshot = [...values];
      const expected = [...values].sort((a, b) => a - b);
      expect(sort(values, (a, b) => a - b)).toEqual(expected);
      expect(values).toEqual(snapshot);
      expect(unique(values)).toEqual([...new Set(values)]);
      expect(difference(values, values.filter((_, index) => index % 3 === 0))).toEqual(
        values.filter((value) => !new Set(values.filter((_, index) => index % 3 === 0)).has(value)),
      );
      expect(shuffle(values, () => 0)).toHaveLength(values.length);
      expect([...shuffle(values, () => 0)].sort((a, b) => a - b)).toEqual(expected);
    }
  });

  it("partitions hostile grouping keys into null-prototype records without prototype pollution", () => {
    const grouped = groupBy(["__proto__", "constructor", "prototype", "x", "__proto__"], (value) => value);
    expect(Object.getPrototypeOf(grouped)).toBeNull();
    expect(grouped.__proto__).toEqual(["__proto__", "__proto__"]);
    expect(grouped.constructor).toEqual(["constructor"]);
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });

  it("keeps decimal arithmetic exact against decimal.js for a replayable 750-case seed", () => {
    const random = seededRandom(0xd3c1aa1);
    const Oracle = Decimal.clone({ precision: 100, rounding: Decimal.ROUND_HALF_UP });
    for (let iteration = 0; iteration < 750; iteration++) {
      const signA = random() < 0.5 ? "-" : "";
      const signB = random() < 0.5 ? "-" : "";
      const a = `${signA}${Math.floor(random() * 1_000_000)}.${String(Math.floor(random() * 1_000_000)).padStart(6, "0")}`;
      const b = `${signB}${Math.floor(random() * 1_000_000)}.${String(Math.floor(random() * 1_000_000)).padStart(6, "0")}`;
      expect(summary(a, b)).toBe(new Oracle(a).plus(b).toFixed());
      expect(compareNumbers(a, b)).toBe(new Oracle(a).cmp(b));
      if (new Oracle(b).isZero()) continue;
      expect(divide(a, b, { precision: 40 })).toBe(new Oracle(a).div(b).toSignificantDigits(40, Oracle.ROUND_HALF_UP).toFixed());
    }
  });

  it("preserves exact aggregate contracts across huge bigint/string cancellation cases", () => {
    const huge = 10n ** 200n;
    expect(sumBig([huge, huge, -huge, -huge, "0.3", "-0.2"])).toBe("0.1");
    expect(medianBig(["-1e100", "0.1", "0.2", "1e100"])).toBe("0.15");
  });

  it("keeps range exact at decimal boundaries and byte parsing within documented round-trip tolerance", () => {
    expect(range(0, 0.5, 0.1)).toEqual([0, 0.1, 0.2, 0.3, 0.4]);
    for (const bytes of [0, 1, 1023, 1024, 1536, 1_000_000, 2 ** 32]) {
      const formatted = formatBytes(bytes, { decimals: 6 });
      const unitIndex = bytes === 0 ? 0 : Math.floor(Math.log(bytes) / Math.log(1000));
      const maximumRoundTripError = Math.max(0.5, 0.5 * 1000 ** unitIndex * 10 ** -6 + 0.5);
      expect(Math.abs(parseBytes(formatted) - bytes)).toBeLessThanOrEqual(maximumRoundTripError);
    }
  });
});
