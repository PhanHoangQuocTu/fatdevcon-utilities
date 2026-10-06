import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  endOfDay,
  escapeRegExp,
  formatBytes,
  formatDuration,
  parseBytes,
  parseDuration,
  parseISO,
  setByPath,
  startOfDay,
} from "../index";

const code = (fn: () => unknown): string | undefined => {
  try {
    fn();
  } catch (error) {
    return (error as { code?: string }).code ?? (error as Error).name;
  }
  return undefined;
};

describe("parseISO", () => {
  test("reads date-only strings as local midnight and offsets as given", () => {
    const local = parseISO("2026-10-03");
    expect([local.getFullYear(), local.getMonth(), local.getDate(), local.getHours()]).toEqual([2026, 9, 3, 0]);
    expect(parseISO("2026-10-03T10:30:15.250+07:00").toISOString()).toBe("2026-10-03T03:30:15.250Z");
    expect(parseISO("2026-W40-6T00:00Z").toISOString()).toBe("2026-10-03T00:00:00.000Z");
    expect(parseISO("2026-276T00:00Z").toISOString()).toBe("2026-10-03T00:00:00.000Z");
  });
  test("returns an Invalid Date, never throws, for malformed input", () => {
    for (const bad of ["", "nope", "2026-13-01", "2026-02-30", "2026-10-03T25:00"]) {
      expect(Number.isNaN(parseISO(bad).getTime())).toBe(true);
    }
  });
});

describe("calendar helpers", () => {
  test("addDays keeps local wall-clock time and handles negatives and month ends", () => {
    const start = new Date(2026, 2, 7, 12, 30);
    const next = addDays(start, 1);
    expect([next.getMonth(), next.getDate(), next.getHours(), next.getMinutes()]).toEqual([2, 8, 12, 30]);
    const back = addDays(new Date(2026, 0, 1), -1);
    expect([back.getFullYear(), back.getMonth(), back.getDate()]).toEqual([2025, 11, 31]);
    expect(addDays(new Date(2024, 1, 28), 2).getDate()).toBe(1);
    expect(addDays("2026-10-03", 0).getTime()).toBe(new Date(2026, 9, 3).getTime());
  });

  test("addDays and addMonths never mutate their input and validate arguments", () => {
    const original = new Date(2026, 0, 31);
    const stamp = original.getTime();
    addDays(original, 5);
    addMonths(original, 5);
    expect(original.getTime()).toBe(stamp);
    expect(code(() => addDays(original, 1.5))).toBe("ERR_NOT_INTEGER");
    expect(code(() => addMonths(original, NaN))).toBe("ERR_NOT_INTEGER");
    expect(code(() => addDays("garbage", 1))).toBe("RangeError");
    expect(code(() => addDays(new Date(8.64e15), 1))).toBe("RangeError");
  });

  test("addMonths clamps to the last day of shorter months", () => {
    const ymd = (d: Date) => [d.getFullYear(), d.getMonth() + 1, d.getDate()];
    expect(ymd(addMonths(new Date(2026, 0, 31), 1))).toEqual([2026, 2, 28]);
    expect(ymd(addMonths(new Date(2024, 0, 31), 1))).toEqual([2024, 2, 29]);
    expect(ymd(addMonths(new Date(2024, 1, 29), 12))).toEqual([2025, 2, 28]);
    expect(ymd(addMonths(new Date(2026, 2, 31), -1))).toEqual([2026, 2, 28]);
    expect(ymd(addMonths(new Date(2026, 10, 30), 3))).toEqual([2027, 2, 28]);
    expect(ymd(addMonths(new Date(2026, 5, 15), -18))).toEqual([2024, 12, 15]);
    expect(ymd(addMonths(new Date(2026, 5, 15), 0))).toEqual([2026, 6, 15]);
    expect(ymd(addMonths(new Date(2026, 11, 31), 2))).toEqual([2027, 2, 28]);
  });

  test("startOfDay and endOfDay bound the local day", () => {
    const noon = new Date(2026, 9, 3, 12, 34, 56, 789);
    const start = startOfDay(noon);
    const end = endOfDay(noon);
    expect([start.getDate(), start.getHours(), start.getMinutes(), start.getSeconds(), start.getMilliseconds()]).toEqual([3, 0, 0, 0, 0]);
    expect([end.getDate(), end.getHours(), end.getMinutes(), end.getSeconds(), end.getMilliseconds()]).toEqual([3, 23, 59, 59, 999]);
    expect(noon.getHours()).toBe(12);
  });

  test("differenceInCalendarDays ignores the time of day and DST", () => {
    expect(differenceInCalendarDays(new Date(2026, 9, 2, 0, 1), new Date(2026, 9, 1, 23, 59))).toBe(1);
    expect(differenceInCalendarDays(new Date(2026, 9, 1, 23, 59), new Date(2026, 9, 2, 0, 1))).toBe(-1);
    expect(differenceInCalendarDays(new Date(2026, 2, 9, 0, 30), new Date(2026, 2, 8, 23, 30))).toBe(1);
    expect(differenceInCalendarDays(new Date(2026, 0, 1), new Date(2025, 0, 1))).toBe(365);
    expect(differenceInCalendarDays(new Date(2024, 11, 31), new Date(2024, 0, 1))).toBe(365);
    expect(differenceInCalendarDays("2026-10-03", "2026-10-03")).toBe(0);
    for (let day = 0; day < 800; day += 7) {
      const base = new Date(2025, 0, 1, 13);
      expect(differenceInCalendarDays(addDays(base, day), base)).toBe(day);
    }
  });
});

describe("parseDuration", () => {
  test("understands compact, spaced, decimal and long forms", () => {
    expect(parseDuration("1h 2m 3s")).toBe(3_723_000);
    expect(parseDuration("1h2m3s")).toBe(3_723_000);
    expect(parseDuration("500ms")).toBe(500);
    expect(parseDuration("1.5h")).toBe(5_400_000);
    expect(parseDuration("2 days, 4 hours and 30 minutes")).toBe(2 * 86_400_000 + 4 * 3_600_000 + 30 * 60_000);
    expect(parseDuration("1w")).toBe(604_800_000);
    expect(parseDuration("  90  ")).toBe(90);
    expect(parseDuration("0.5ms")).toBe(1);
    expect(parseDuration("0.4ms")).toBe(0);
    expect(parseDuration("0.1s 0.2s")).toBe(300);
    expect(parseDuration("1H 2M")).toBe(3_720_000);
  });

  test("is the inverse of formatDuration", () => {
    for (const ms of [0, 1, 999, 1000, 61_000, 3_723_000, 86_400_000, 90_061_000, 31_536_000_000]) {
      expect(parseDuration(formatDuration(ms))).toBe(ms);
    }
  });

  test("rejects unreadable text and unsafe sizes with stable codes", () => {
    for (const bad of ["", "  ", "abc", "1x", "h", "1h 2", "-5s", "1h ??", "1 2 3", "--1s"]) {
      expect(code(() => parseDuration(bad))).toBe("ERR_INVALID_FORMAT");
    }
    expect(code(() => parseDuration(5 as unknown as string))).toBe("ERR_INVALID_FORMAT");
    expect(code(() => parseDuration("99999999999999999999 w"))).toBe("ERR_OVERFLOW");
  });
});

describe("parseBytes", () => {
  test("reads SI and IEC units, exactly", () => {
    expect(parseBytes("1.5 GB")).toBe(1_500_000_000);
    expect(parseBytes("512 KiB")).toBe(524_288);
    expect(parseBytes("2tb")).toBe(2_000_000_000_000);
    expect(parseBytes("1e3 B")).toBe(1000);
    expect(parseBytes("1024")).toBe(1024);
    expect(parseBytes("0.5 kB")).toBe(500);
    expect(parseBytes("1.0001 kB")).toBe(1000);
    expect(parseBytes("1.0005 kB")).toBe(1001);
    expect(parseBytes("1 GiB")).toBe(1_073_741_824);
    expect(parseBytes(".5 MiB")).toBe(524_288);
    expect(parseBytes("5.")).toBe(5);
  });

  test("base 1024 changes what KB/MB mean but never KiB", () => {
    expect(parseBytes("1 KB", { base: 1024 })).toBe(1024);
    expect(parseBytes("1 MB", { base: 1024 })).toBe(1_048_576);
    expect(parseBytes("1 KiB", { base: 1000 })).toBe(1024);
    expect(parseBytes("1 kB", { base: 1000 })).toBe(1000);
  });

  test("handles sizes beyond a safe integer with bigint, and refuses silently wrong numbers", () => {
    expect(parseBytes("1.5 QB", { bigint: true })).toBe(1_500_000_000_000_000_000_000_000_000_000n);
    expect(parseBytes("1 YiB", { bigint: true })).toBe(2n ** 80n);
    expect(parseBytes("9007199254740991")).toBe(Number.MAX_SAFE_INTEGER);
    expect(code(() => parseBytes("9007199254740992"))).toBe("ERR_OVERFLOW");
    expect(code(() => parseBytes("1 EB"))).toBe("ERR_OVERFLOW");
    expect(parseBytes("1 EB", { bigint: true })).toBe(10n ** 18n);
  });

  test("is the inverse of formatBytes for round values", () => {
    for (const bytes of [0, 1, 999, 1000, 1_500, 1_500_000, 2_000_000_000, 3_500_000_000_000]) {
      expect(parseBytes(formatBytes(bytes))).toBe(bytes);
    }
    for (const bytes of [1024, 1536, 1_048_576, 5_368_709_120]) {
      expect(parseBytes(formatBytes(bytes, { base: 1024 }))).toBe(bytes);
    }
  });

  test("rejects unreadable text", () => {
    for (const bad of ["", "GB", "1 XB", "1 ZZ", "1..5 MB", "-1 MB", "1 RiB", "1 QiB", "1 MB MB", "1,5 MB", "abc"]) {
      expect(code(() => parseBytes(bad))).toBe("ERR_INVALID_FORMAT");
    }
    expect(code(() => parseBytes(10 as unknown as string))).toBe("ERR_INVALID_FORMAT");
    expect(code(() => parseBytes("1", { base: 10 as 1000 }))).toBe("ERR_OUT_OF_RANGE");
  });
});

describe("setByPath", () => {
  test("writes immutably and shares untouched branches", () => {
    const source = { a: { b: 1, c: [1, 2] }, keep: { x: 1 } };
    const next = setByPath(source, "a.c[1]", 99);
    expect(next).toEqual({ a: { b: 1, c: [1, 99] }, keep: { x: 1 } });
    expect(source.a.c).toEqual([1, 2]);
    expect(next.keep).toBe(source.keep);
    expect(next).not.toBe(source);
  });

  test("creates missing containers, arrays for index keys", () => {
    expect(setByPath({}, "a.b.c", 1)).toEqual({ a: { b: { c: 1 } } });
    expect(setByPath({}, "list[2]", "x")).toEqual({ list: [undefined, undefined, "x"] });
    expect(setByPath({}, ["a", 0, "id"], 7)).toEqual({ a: [{ id: 7 }] });
    expect(setByPath({ a: 5 }, "a.b", 1)).toEqual({ a: { b: 1 } });
    expect(setByPath({ a: null }, "a.b", 1)).toEqual({ a: { b: 1 } });
    expect(setByPath([1, 2, 3], "1", 9)).toEqual([1, 9, 3]);
  });

  test("blocks prototype pollution and non-plain traversal", () => {
    for (const path of ["__proto__.polluted", "a.constructor.prototype.x", ["prototype", "x"], "constructor"]) {
      expect(() => setByPath({}, path, 1)).toThrow(TypeError);
    }
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    expect(() => setByPath({ when: new Date(0) }, "when.x", 1)).toThrow(TypeError);
    expect(() => setByPath({ m: new Map() }, "m.x", 1)).toThrow(TypeError);
    expect(() => setByPath({}, "", 1)).toThrow(RangeError);
    expect(() => setByPath(null as unknown as object, "a", 1)).toThrow(TypeError);
    expect(() => setByPath({}, 5 as unknown as string, 1)).toThrow(TypeError);
  });

  test("does not follow inherited properties and refuses class instances it cannot copy faithfully", () => {
    expect(setByPath({}, "toString.x", 1)).toEqual({ toString: { x: 1 } });
    expect(setByPath(Object.create(null) as object, "a", 1)).toEqual({ a: 1 });
    class Point {
      x = 1;
    }
    expect(() => setByPath(new Point(), "x", 2)).toThrow(TypeError);
  });
});

describe("escapeRegExp", () => {
  test("makes any text match literally", () => {
    const samples = ["a.b*c", "(1+1)=[2]", "^start$", "a|b", "back\\slash", "{3}", "x-y", "a/b", "?", "", "plain", "$&", "é\u{1F600}"];
    for (const text of samples) {
      expect(new RegExp(`^${escapeRegExp(text)}$`).test(text)).toBe(true);
      expect(new RegExp(`^${escapeRegExp(text)}$`, "u").test(text)).toBe(true);
      expect(new RegExp(`^[${escapeRegExp(text)}]*$`, "u").test(text)).toBe(true);
    }
    expect("1+1=2".replace(new RegExp(escapeRegExp("1+1"), "g"), "two")).toBe("two=2");
    expect(new RegExp(escapeRegExp(".")).test("a")).toBe(false);
  });
  test("rejects non-strings", () => {
    expect(() => escapeRegExp(5 as unknown as string)).toThrow(TypeError);
  });
});
