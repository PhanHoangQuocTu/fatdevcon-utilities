import {
  addWeeks,
  subDays,
  subWeeks,
  subMonths,
  addYears,
  subYears,
  startOfWeek,
  endOfWeek,
  startOfISOWeek,
  endOfISOWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isBefore,
  isAfter,
  isEqualDate,
  isSameDay,
  isSameMonth,
  isSameYear,
  isToday,
  isYesterday,
  isTomorrow,
  isWithinInterval,
  differenceInDays,
  differenceInMonths,
  differenceInYears,
  differenceInCalendarMonths,
  getDaysInMonth,
  getDayOfYear,
  isLeapYear,
  isBrowser,
  isClient,
  isNode,
  isServer,
  isWebWorker,
  hasDOM,
  sort,
  enumerate,
  take,
  drop,
  first,
  last,
  minBy,
  maxBy,
  sumBy,
  safeJsonParse,
  safeJsonStringify,
  toString,
  toNumber,
  toBoolean,
  toArray,
  buildQueryString,
  parseQueryString,
  isNil,
  isDefined,
  isString,
  isNumber,
  isBoolean,
  isFunction,
  isPromiseLike,
} from "../index";

const ymd = (value: Date): string => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
const time = (value: Date): string => `${ymd(value)} ${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}:${String(value.getSeconds()).padStart(2, "0")}.${String(value.getMilliseconds()).padStart(3, "0")}`;

describe("v0.4 date helpers", () => {
  it("uses local calendar arithmetic without mutating its input", () => {
    const original = new Date(2024, 0, 31, 12, 30);
    expect(ymd(addWeeks(original, 1))).toBe("2024-02-07");
    expect(ymd(subDays(original, 1))).toBe("2024-01-30");
    expect(ymd(subWeeks(original, 2))).toBe("2024-01-17");
    expect(ymd(subMonths(original, 1))).toBe("2023-12-31");
    expect(ymd(addYears(new Date(2024, 1, 29), 1))).toBe("2025-02-28");
    expect(ymd(subYears(new Date(2024, 1, 29), 4))).toBe("2020-02-29");
    expect(time(original)).toBe("2024-01-31 12:30:00.000");
    expect(() => addWeeks(original, 0.5)).toThrow(/integer/);
    expect(() => addYears(original, Infinity)).toThrow(/integer/);
  });

  it("finds local boundaries and validates week starts", () => {
    const wednesday = new Date(2026, 9, 7, 13, 14, 15, 16);
    expect(time(startOfWeek(wednesday))).toBe("2026-10-04 00:00:00.000");
    expect(time(endOfWeek(wednesday))).toBe("2026-10-10 23:59:59.999");
    expect(time(startOfISOWeek(wednesday))).toBe("2026-10-05 00:00:00.000");
    expect(time(endOfISOWeek(wednesday))).toBe("2026-10-11 23:59:59.999");
    expect(time(startOfMonth(wednesday))).toBe("2026-10-01 00:00:00.000");
    expect(time(endOfMonth(wednesday))).toBe("2026-10-31 23:59:59.999");
    expect(time(startOfYear(wednesday))).toBe("2026-01-01 00:00:00.000");
    expect(time(endOfYear(wednesday))).toBe("2026-12-31 23:59:59.999");
    expect(() => startOfWeek(wednesday, { weekStartsOn: 7 as 0 })).toThrow(/0 through 6/);
  });

  it("distinguishes instants from local calendar fields and uses injectable now", () => {
    const now = new Date(2026, 9, 7, 12);
    expect(isBefore(new Date(1), new Date(2))).toBe(true);
    expect(isAfter(new Date(2), new Date(1))).toBe(true);
    expect(isEqualDate(new Date(1), 1)).toBe(true);
    expect(isSameDay(new Date(2026, 9, 7, 0), now)).toBe(true);
    expect(isSameMonth(new Date(2026, 9, 1), now)).toBe(true);
    expect(isSameYear(new Date(2026, 0, 1), now)).toBe(true);
    expect(isToday(new Date(2026, 9, 7, 23), { now })).toBe(true);
    expect(isYesterday(new Date(2026, 9, 6), { now })).toBe(true);
    expect(isTomorrow(new Date(2026, 9, 8), { now })).toBe(true);
    expect(isWithinInterval(now, { start: now, end: now })).toBe(true);
    expect(isWithinInterval(new Date(2026, 9, 8), { start: now, end: now })).toBe(false);
    expect(() => isWithinInterval(now, { start: new Date(2), end: new Date(1) })).toThrow(/before/);
  });

  it("calculates full units and calendar metadata without millisecond day arithmetic", () => {
    expect(differenceInDays(new Date(2026, 9, 2, 11), new Date(2026, 9, 1, 12))).toBe(0);
    expect(differenceInDays(new Date(2026, 9, 2, 12), new Date(2026, 9, 1, 12))).toBe(1);
    expect(differenceInDays(new Date(2026, 9, 1, 12), new Date(2026, 9, 2, 11))).toBe(0);
    expect(differenceInCalendarMonths(new Date(2026, 2, 1), new Date(2025, 11, 31))).toBe(3);
    expect(differenceInMonths(new Date(2026, 1, 27), new Date(2026, 0, 31))).toBe(0);
    expect(differenceInMonths(new Date(2026, 1, 28), new Date(2026, 0, 31))).toBe(1);
    expect(differenceInYears(new Date(2025, 1, 27), new Date(2024, 1, 29))).toBe(0);
    expect(differenceInYears(new Date(2025, 1, 28), new Date(2024, 1, 29))).toBe(1);
    expect(getDaysInMonth(new Date(2000, 1, 1))).toBe(29);
    expect(getDaysInMonth(new Date(1900, 1, 1))).toBe(28);
    expect(getDayOfYear(new Date(2024, 11, 31))).toBe(366);
    expect(isLeapYear(new Date(2000, 0, 1))).toBe(true);
    expect(isLeapYear(new Date(1900, 0, 1))).toBe(false);
  });
});

describe("v0.4 runtime, collection and practical helpers", () => {
  it("is safe to import and classifies the current Node runtime without DOM globals", () => {
    expect(isNode()).toBe(true);
    expect(isServer()).toBe(true);
    expect(isBrowser()).toBe(false);
    expect(hasDOM()).toBe(false);
    expect(isWebWorker()).toBe(false);
    expect(isClient()).toBe(false);
  });

  it("reads browser and worker capabilities only when called", () => {
    const replaceGlobal = (key: string, value: unknown): (() => void) => {
      const previous = Object.getOwnPropertyDescriptor(globalThis, key);
      Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
      return () => {
        if (previous) Object.defineProperty(globalThis, key, previous);
        else Reflect.deleteProperty(globalThis, key);
      };
    };

    const restoreWindow = replaceGlobal("window", { document: {} });
    const restoreDocument = replaceGlobal("document", { createElement: () => ({}) });
    try {
      expect(isBrowser()).toBe(true);
      expect(hasDOM()).toBe(true);
      expect(isClient()).toBe(true);
    } finally {
      restoreDocument();
      restoreWindow();
    }

    class WorkerScope {}
    const restoreWorkerGlobalScope = replaceGlobal("WorkerGlobalScope", WorkerScope);
    const restoreSelf = replaceGlobal("self", new WorkerScope());
    try {
      expect(isBrowser()).toBe(false);
      expect(hasDOM()).toBe(false);
      expect(isWebWorker()).toBe(true);
      expect(isClient()).toBe(true);
    } finally {
      restoreSelf();
      restoreWorkerGlobalScope();
    }
  });

  it("provides immutable Python-inspired collection helpers", () => {
    const input = [3, 1, 2] as const;
    expect(sort(input)).toEqual([1, 2, 3]);
    expect(input).toEqual([3, 1, 2]);
    expect(enumerate(["a", "b"], 1)).toEqual([[1, "a"], [2, "b"]]);
    expect(take(input, 2)).toEqual([3, 1]);
    expect(drop(input, 2)).toEqual([2]);
    expect(first([])).toBeUndefined();
    expect(last(input)).toBe(2);
    const prices = [{ id: "a", price: 20 }, { id: "b", price: 10 }, { id: "c", price: 10 }];
    expect(minBy(prices, (item) => item.price)).toBe(prices[1]);
    expect(maxBy(prices, (item) => item.price)).toBe(prices[0]);
    expect(sumBy(prices, (item) => item.price)).toBe(40);
    expect(sumBy([{ value: "0.1" }, { value: "0.2" }], (item) => item.value)).toBe("0.3");
    expect(() => take(input, -1)).toThrow(/non-negative/);
    expect(() => enumerate(input, 0.5)).toThrow(/integer/);
  });

  it("makes conversion, JSON and query behavior explicit and safe", () => {
    expect(safeJsonParse('{"ok":true}')).toEqual({ ok: true, value: { ok: true } });
    expect(safeJsonParse("nope").ok).toBe(false);
    expect(safeJsonStringify({ ok: true })).toEqual({ ok: true, value: '{"ok":true}' });
    const circular: { self?: unknown } = {};
    circular.self = circular;
    expect(safeJsonStringify(circular).ok).toBe(false);
    expect(toString(1n)).toBe("1");
    expect(toString(new Date("2026-01-01T00:00:00.000Z"))).toBe("2026-01-01T00:00:00.000Z");
    expect(toString({ a: [1, true] })).toBe('{"a":[1,true]}');
    expect(() => toString(circular)).toThrow(/deterministic JSON/);
    expect(toNumber("1.5")).toBe(1.5);
    expect(() => toNumber("9007199254740992")).toThrow(/safe integer/);
    expect(() => toNumber("0x10")).toThrow(/decimal numeric/);
    expect(toBoolean("true")).toBe(true);
    expect(() => toBoolean("yes")).toThrow(/must be a boolean/);
    const items = [1, 2] as const;
    expect(toArray(items)).toEqual([1, 2]);
    expect(toArray(null)).toEqual([]);
    expect(toArray("x")).toEqual(["x"]);
    expect(buildQueryString({ q: "hello world", tag: ["a", "b"], skip: null })).toBe("q=hello+world&tag=a&tag=b");
    expect(parseQueryString("?tag=a&tag=b&q=hello+world")).toEqual(Object.assign(Object.create(null), { tag: ["a", "b"], q: "hello world" }));
    expect(() => parseQueryString("__proto__=bad")).toThrow(/unsafe key/);
  });

  it("offers sound primitive and promise guards", () => {
    expect(isNil(null)).toBe(true);
    expect(isDefined(0)).toBe(true);
    expect(isString("x")).toBe(true);
    expect(isNumber(NaN)).toBe(false);
    expect(isBoolean(false)).toBe(true);
    expect(isFunction(() => undefined)).toBe(true);
    expect(isPromiseLike(Promise.resolve())).toBe(true);
    expect(isPromiseLike({ then: 1 })).toBe(false);
    expect(isPromiseLike({ get then() { throw new Error("nope"); } })).toBe(false);
  });
});
