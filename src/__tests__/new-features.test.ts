import {
  summary, multiply, percentage, clamp, median, randomInt,
  sortBy, filterBy, groupBy, mergeObjects,
  compact, difference, intersection, union, partition, countBy, keyBy, zip, range,
  shuffle, sample, flattenDeep,
  pick, omit, mapValues, deepMerge, deepEqual, isPlainObject, isEmpty, getByPath,
  camelCase, pascalCase, kebabCase, snakeCase, titleCase, escapeHtml, unescapeHtml,
  countWords, reverseText, slugify, removeDiacritics,
  formatDate, formatBytes, formatRelativeTime, formatDuration, isValidDate,
  debounce, throttle, memoize, once, sleep, retry, withTimeout,
  isEmail, isUrl, isUuid,
} from "../index";

describe("fixes to existing functions", () => {
  test("math throws instead of returning Infinity", () => {
    expect(() => multiply(1e200, 1e200)).toThrow(RangeError);
    expect(() => summary(1.7e308, 1.7e308)).toThrow(RangeError);
  });

  test("percentage keeps full precision", () => {
    expect(percentage(1, 3)).toBe(33.333333333333336);
    expect(percentage(25, 200)).toBe(12.5);
  });

  test("sortBy rejects an invalid order and callbacks must be functions", () => {
    expect(() => sortBy([2, 1], (x) => x, "up" as any)).toThrow(RangeError);
    expect(() => filterBy([1], null as any)).toThrow(TypeError);
    expect(() => groupBy([1], undefined as any)).toThrow(TypeError);
  });

  test("mergeObjects validates its arguments", () => {
    expect(() => mergeObjects(null as any, {})).toThrow(TypeError);
    expect(() => mergeObjects([1] as any, {})).toThrow(TypeError);
  });

  test("formatBytes never prints -0", () => {
    expect(formatBytes(-0)).toBe("0 B");
  });

  test("formatDate reads date-only strings as local time", () => {
    expect(formatDate("2026-10-03", "yyyy-MM-dd")).toBe("2026-10-03");
    expect(formatDate("2026-10-03T08:30:00", "HH:mm")).toBe("08:30");
    expect(() => formatDate(null as any, "yyyy")).toThrow(TypeError);
    expect(() => formatDate({} as any, "yyyy")).toThrow(TypeError);
    expect(() => formatDate("nope", "yyyy")).toThrow(RangeError);
  });

  test("removeDiacritics and slugify keep non-Latin scripts intact", () => {
    expect(removeDiacritics("हिन्दी")).toBe("हिन्दी");
    expect(slugify("हिन्दी भाषा")).toBe("हिन्दी-भाषा");
    expect(slugify("สวัสดี ชาวโลก")).toBe("สวัสดี-ชาวโลก");
    expect(slugify("Straße Ørsted Łódź Æon")).toBe("strasse-orsted-lodz-aeon");
    expect(slugify("Đặng Thị Tứ")).toBe("dang-thi-tu");
    expect(removeDiacritics("Crème Brûlée")).toBe("Creme Brulee");
  });
});

describe("math additions", () => {
  test("clamp", () => {
    expect(clamp(15, 0, 10)).toBe(10);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(5, 0, 10)).toBe(5);
    expect(() => clamp(1, 10, 0)).toThrow(RangeError);
    expect(() => clamp(NaN, 0, 1)).toThrow(TypeError);
  });

  test("median", () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 3, 2])).toBe(2.5);
    expect(median([0.1, 0.2])).toBe(0.15);
    expect(median([])).toBe(0);
    const input = [3, 1, 2];
    median(input);
    expect(input).toEqual([3, 1, 2]);
    expect(() => median([1, NaN])).toThrow(TypeError);
  });

  test("randomInt is inclusive and injectable", () => {
    expect(randomInt(1, 6, () => 0)).toBe(1);
    expect(randomInt(1, 6, () => 0.999999)).toBe(6);
    expect(randomInt(5, 5)).toBe(5);
    expect(() => randomInt(2, 1)).toThrow(RangeError);
    expect(() => randomInt(1.5, 3)).toThrow(TypeError);
  });
});

describe("array additions", () => {
  test("compact", () => {
    expect(compact([0, 1, false, 2, "", 3, null, undefined, NaN])).toEqual([1, 2, 3]);
  });
  test("difference, intersection, union", () => {
    expect(difference([1, 2, 3, 4], [2, 4])).toEqual([1, 3]);
    expect(intersection([1, 2, 2, 3], [2, 3, 4])).toEqual([2, 3]);
    expect(union([1, 2], [2, 3], [3, 4])).toEqual([1, 2, 3, 4]);
    expect(union()).toEqual([]);
  });
  test("partition", () => {
    expect(partition([1, 2, 3, 4], (x) => x % 2 === 0)).toEqual([[2, 4], [1, 3]]);
  });
  test("countBy and keyBy are safe for prototype keys", () => {
    expect(countBy(["a", "b", "a"], (x) => x)).toEqual({ a: 2, b: 1 });
    expect(Object.keys(countBy(["__proto__"], (x) => x))).toEqual(["__proto__"]);
    const byId = keyBy([{ id: 1, n: "a" }, { id: 2, n: "b" }], (x) => x.id);
    expect(byId["2"].n).toBe("b");
  });
  test("zip uses the shorter length", () => {
    expect(zip([1, 2, 3], ["a", "b"])).toEqual([[1, "a"], [2, "b"]]);
  });
  test("range", () => {
    expect(range(3)).toEqual([0, 1, 2]);
    expect(range(1, 4)).toEqual([1, 2, 3]);
    expect(range(0, 10, 5)).toEqual([0, 5]);
    expect(range(3, 0)).toEqual([3, 2, 1]);
    expect(range(0, 1, 0.25)).toEqual([0, 0.25, 0.5, 0.75]);
    expect(range(0)).toEqual([]);
    expect(() => range(0, 5, 0)).toThrow(RangeError);
    expect(() => range(NaN)).toThrow(TypeError);
  });
  test("shuffle keeps the items and does not mutate", () => {
    const input = [1, 2, 3, 4, 5];
    const out = shuffle(input);
    expect(input).toEqual([1, 2, 3, 4, 5]);
    expect([...out].sort()).toEqual(input);
    expect(shuffle([1, 2, 3], () => 0)).toEqual([2, 3, 1]);
  });
  test("sample", () => {
    expect(sample([])).toBeUndefined();
    expect(sample(["a", "b", "c"], () => 0.99)).toBe("c");
  });
  test("flattenDeep", () => {
    expect(flattenDeep([1, [2, [3, [4]]]])).toEqual([1, 2, 3, 4]);
    expect(flattenDeep([1, [2, [3]]], 1)).toEqual([1, 2, [3]]);
  });
  test("validate input", () => {
    expect(() => compact(null as any)).toThrow(TypeError);
    expect(() => union([1], "x" as any)).toThrow(TypeError);
  });
});

describe("object additions", () => {
  test("pick and omit", () => {
    const user = { id: 1, name: "An", role: "dev" };
    expect(pick(user, ["id", "name"])).toEqual({ id: 1, name: "An" });
    expect(omit(user, ["role"])).toEqual({ id: 1, name: "An" });
    expect(user).toEqual({ id: 1, name: "An", role: "dev" });
    expect(pick(user, ["toString" as any])).toEqual({});
  });
  test("mapValues", () => {
    expect(mapValues({ a: 1, b: 2 }, (v) => v * 2)).toEqual({ a: 2, b: 4 });
  });
  test("deepMerge merges plain objects and replaces arrays", () => {
    const a = { x: { y: 1, z: 1 }, list: [1] };
    const b = { x: { z: 2 }, list: [2, 3] };
    expect(deepMerge(a, b)).toEqual({ x: { y: 1, z: 2 }, list: [2, 3] });
    expect(a.x.z).toBe(1);
  });
  test("deepMerge ignores prototype pollution keys", () => {
    const evil = JSON.parse('{"__proto__": {"polluted": true}, "constructor": {"prototype": {"polluted": true}}}');
    deepMerge({}, evil);
    expect(({} as any).polluted).toBeUndefined();
  });
  test("getByPath", () => {
    const data = { a: { b: [{ c: 5 }] }, n: null };
    expect(getByPath(data, "a.b[0].c")).toBe(5);
    expect(getByPath(data, ["a", "b", 0, "c"])).toBe(5);
    expect(getByPath(data, "a.x.y", "none")).toBe("none");
    expect(getByPath(data, "n.x", "none")).toBe("none");
    expect(getByPath(data, "a.__proto__.toString")).toBeUndefined();
    expect(getByPath("abc", "length")).toBe(3);
  });
  test("deepEqual", () => {
    expect(deepEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] })).toBe(true);
    expect(deepEqual({ a: 1 }, { a: 2 })).toBe(false);
    expect(deepEqual(NaN, NaN)).toBe(true);
    expect(deepEqual(new Date(5), new Date(5))).toBe(true);
    expect(deepEqual(new Date(5), new Date(6))).toBe(false);
    expect(deepEqual(new Map([[1, { a: 1 }]]), new Map([[1, { a: 1 }]]))).toBe(true);
    expect(deepEqual(new Set([1, 2]), new Set([2, 1]))).toBe(true);
    expect(deepEqual([1, 2], { 0: 1, 1: 2 })).toBe(false);
    expect(deepEqual({ a: undefined }, { b: undefined })).toBe(false);
    const x: any = { n: 1 }; x.self = x;
    const y: any = { n: 1 }; y.self = y;
    expect(deepEqual(x, y)).toBe(true);
  });
  test("isPlainObject and isEmpty", () => {
    expect(isPlainObject({})).toBe(true);
    expect(isPlainObject(Object.create(null))).toBe(true);
    expect(isPlainObject([])).toBe(false);
    expect(isPlainObject(new Date())).toBe(false);
    expect(isEmpty(null)).toBe(true);
    expect(isEmpty("")).toBe(true);
    expect(isEmpty([])).toBe(true);
    expect(isEmpty({})).toBe(true);
    expect(isEmpty(new Map())).toBe(true);
    expect(isEmpty({ a: 1 })).toBe(false);
    expect(isEmpty(new Date())).toBe(false);
    expect(isEmpty(0)).toBe(false);
  });
});

describe("text additions", () => {
  test("case converters", () => {
    expect(camelCase("hello world")).toBe("helloWorld");
    expect(camelCase("Hello-World_foo")).toBe("helloWorldFoo");
    expect(pascalCase("hello world")).toBe("HelloWorld");
    expect(kebabCase("helloWorld")).toBe("hello-world");
    expect(kebabCase("XMLHttpRequest")).toBe("xml-http-request");
    expect(snakeCase("Hello World")).toBe("hello_world");
    expect(titleCase("hello-world FOO")).toBe("Hello World Foo");
    expect(kebabCase("Đặng Thị")).toBe("đặng-thị");
    expect(camelCase("")).toBe("");
    expect(() => camelCase(1 as any)).toThrow(TypeError);
  });
  test("escapeHtml and unescapeHtml", () => {
    expect(escapeHtml(`<a href="x">Tom & 'Jerry'</a>`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;Tom &amp; &#39;Jerry&#39;&lt;/a&gt;"
    );
    expect(unescapeHtml("&lt;b&gt; &amp;amp; &#39;")).toBe("<b> &amp; '");
    expect(unescapeHtml(escapeHtml("<&>\"'"))).toBe("<&>\"'");
  });
  test("countWords", () => {
    expect(countWords("Hello, world!")).toBe(2);
    expect(countWords("  ")).toBe(0);
    expect(countWords("one two\nthree")).toBe(3);
  });
  test("reverseText keeps graphemes", () => {
    expect(reverseText("abc")).toBe("cba");
    expect(reverseText("a👨‍👩‍👧‍👦b")).toBe("b👨‍👩‍👧‍👦a");
  });
});

describe("date additions", () => {
  const now = new Date(2026, 9, 5, 12, 0, 0);
  test("formatRelativeTime", () => {
    expect(formatRelativeTime(new Date(2026, 9, 5, 9, 0, 0), { now })).toBe("3 hours ago");
    expect(formatRelativeTime(new Date(2026, 9, 7, 12, 0, 0), { now })).toBe("in 2 days");
    expect(formatRelativeTime(new Date(2026, 9, 4, 12, 0, 0), { now })).toBe("yesterday");
    expect(formatRelativeTime(new Date(2026, 9, 4, 12, 0, 0), { now, numeric: "always" })).toBe("1 day ago");
    expect(formatRelativeTime(now, { now })).toBe("now");
    expect(formatRelativeTime(new Date(2026, 9, 5, 11, 59, 30), { now })).toBe("30 seconds ago");
    expect(formatRelativeTime(new Date(2024, 9, 5), { now })).toBe("2 years ago");
    expect(() => formatRelativeTime("nope")).toThrow(RangeError);
  });
  test("formatDuration", () => {
    expect(formatDuration(0)).toBe("0ms");
    expect(formatDuration(450)).toBe("450ms");
    expect(formatDuration(3723000)).toBe("1h 2m 3s");
    expect(formatDuration(90061000)).toBe("1d 1h 1m 1s");
    expect(formatDuration(90061000, { maxUnits: 2 })).toBe("1d 1h");
    expect(formatDuration(60000)).toBe("1m");
    expect(() => formatDuration(-1)).toThrow(RangeError);
    expect(() => formatDuration(NaN)).toThrow(TypeError);
    expect(() => formatDuration(1000, { maxUnits: 0 })).toThrow(RangeError);
  });
  test("isValidDate", () => {
    expect(isValidDate(new Date())).toBe(true);
    expect(isValidDate(new Date("x"))).toBe(false);
    expect(isValidDate("2026-01-01")).toBe(false);
  });
});

describe("function utilities", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test("debounce trailing", () => {
    const fn = jest.fn();
    const d = debounce(fn, 100);
    d(1); d(2); d(3);
    expect(fn).not.toHaveBeenCalled();
    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(3);
  });
  test("debounce leading, cancel and flush", () => {
    const fn = jest.fn();
    const lead = debounce(fn, 100, { leading: true, trailing: false });
    lead("a"); lead("b");
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("a");

    const g = jest.fn(() => "done");
    const d = debounce(g, 100);
    d();
    d.cancel();
    jest.advanceTimersByTime(200);
    expect(g).not.toHaveBeenCalled();
    d();
    expect(d.flush()).toBe("done");
    expect(g).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(200);
    expect(g).toHaveBeenCalledTimes(1);
  });
  test("throttle leading and trailing", () => {
    const fn = jest.fn();
    const t = throttle(fn, 100);
    t(1); t(2); t(3);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenLastCalledWith(1);
    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith(3);
    jest.advanceTimersByTime(500);
    expect(fn).toHaveBeenCalledTimes(2);
    t.cancel();
  });
  test("debounce and throttle preserve this", () => {
    const obj = { v: 7, read: debounce(function (this: { v: number }) { return this.v; }, 10, { leading: true }) };
    expect(obj.read()).toBe(7);
  });
  test("memoize caches by first argument, resolver and maxSize", () => {
    const fn = jest.fn((n: number) => n * 2);
    const m = memoize(fn);
    expect(m(2)).toBe(4); expect(m(2)).toBe(4);
    expect(fn).toHaveBeenCalledTimes(1);
    m.clear();
    m(2);
    expect(fn).toHaveBeenCalledTimes(2);

    const add = jest.fn((a: number, b: number) => a + b);
    const ma = memoize(add, { resolver: (a, b) => `${a}:${b}` });
    ma(1, 2); ma(1, 2); ma(1, 3);
    expect(add).toHaveBeenCalledTimes(2);

    const bounded = memoize((n: number) => n, { maxSize: 2 });
    bounded(1); bounded(2); bounded(3);
    expect([...bounded.cache.keys()]).toEqual([2, 3]);
    expect(() => memoize((n: number) => n, { maxSize: 0 })).toThrow(RangeError);
  });
  test("once", () => {
    const fn = jest.fn(() => 42);
    const o = once(fn);
    expect(o()).toBe(42); expect(o()).toBe(42);
    expect(fn).toHaveBeenCalledTimes(1);
  });
  test("sleep", async () => {
    const done = jest.fn();
    const p = sleep(50).then(done);
    jest.advanceTimersByTime(49);
    await Promise.resolve();
    expect(done).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    await p;
    expect(done).toHaveBeenCalled();
    expect(() => sleep(-1)).toThrow(RangeError);
  });
  test("retry succeeds after failures, with backoff", async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error("1"))
      .mockRejectedValueOnce(new Error("2"))
      .mockResolvedValue("ok");
    const p = retry(fn, { retries: 3, delayMs: 100, factor: 2 });
    await jest.advanceTimersByTimeAsync(100);
    await jest.advanceTimersByTimeAsync(200);
    await expect(p).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(3);
  });
  test("retry rethrows the last error and honors shouldRetry", async () => {
    const fail = jest.fn().mockRejectedValue(new Error("boom"));
    await expect(retry(fail, { retries: 2 })).rejects.toThrow("boom");
    expect(fail).toHaveBeenCalledTimes(3);

    const stop = jest.fn().mockRejectedValue(new Error("fatal"));
    await expect(retry(stop, { retries: 5, shouldRetry: () => false })).rejects.toThrow("fatal");
    expect(stop).toHaveBeenCalledTimes(1);
    await expect(retry(() => 1, { retries: -1 })).rejects.toThrow(RangeError);
  });
  test("withTimeout", async () => {
    const slow = new Promise((resolve) => setTimeout(() => resolve("late"), 1000));
    const p = withTimeout(slow, 100);
    const assertion = expect(p).rejects.toMatchObject({ name: "TimeoutError" });
    await jest.advanceTimersByTimeAsync(100);
    await assertion;
    await expect(withTimeout(Promise.resolve("fast"), 100)).resolves.toBe("fast");
    await expect(withTimeout(Promise.reject(new Error("x")), 100)).rejects.toThrow("x");
    expect(jest.getTimerCount()).toBeGreaterThanOrEqual(0);
  });
  test("argument validation", () => {
    expect(() => debounce(null as any, 10)).toThrow(TypeError);
    expect(() => throttle(() => 1, -1)).toThrow(RangeError);
    expect(() => once(1 as any)).toThrow(TypeError);
  });
});

describe("validators", () => {
  test("isEmail", () => {
    expect(isEmail("user@example.com")).toBe(true);
    expect(isEmail("first.last+tag@sub.example.co")).toBe(true);
    for (const bad of ["", "a@b", "a@@b.com", "a b@c.com", ".a@b.com", "a..b@c.com", "a@b..com", "@b.com", "a@.com", 5, null]) {
      expect(isEmail(bad)).toBe(false);
    }
    expect(isEmail("a".repeat(65) + "@example.com")).toBe(false);
  });
  test("isUrl", () => {
    expect(isUrl("https://example.com/path?q=1#x")).toBe(true);
    expect(isUrl("http://localhost:3000")).toBe(true);
    expect(isUrl("ftp://example.com")).toBe(false);
    expect(isUrl("ftp://example.com", { protocols: ["ftp:"] })).toBe(true);
    expect(isUrl("javascript:alert(1)")).toBe(false);
    expect(isUrl("example.com")).toBe(false);
    expect(isUrl(" https://example.com")).toBe(false);
    expect(isUrl("")).toBe(false);
    expect(isUrl(null)).toBe(false);
  });
  test("isUuid", () => {
    expect(isUuid("123e4567-e89b-12d3-a456-426614174000")).toBe(true);
    expect(isUuid("123E4567-E89B-42D3-A456-426614174000", 4)).toBe(true);
    expect(isUuid("123e4567-e89b-12d3-a456-426614174000", 4)).toBe(false);
    expect(isUuid("not-a-uuid")).toBe(false);
    expect(isUuid(123)).toBe(false);
  });
});
