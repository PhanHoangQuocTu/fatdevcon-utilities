import {
  addDays,
  addMonths,
  addYears,
  differenceInCalendarDays,
  differenceInDays,
  differenceInMonths,
  differenceInYears,
  endOfDay,
  endOfISOWeek,
  endOfMonth,
  endOfWeek,
  endOfYear,
  formatDate,
  formatDuration,
  getDayOfYear,
  getDaysInMonth,
  getTimeZoneOffset,
  isLeapYear,
  parseDuration,
  parseISO,
  startOfDay,
  startOfISOWeek,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subMonths,
} from "../index";
import {
  addDays as oracleAddDays,
  addMonths as oracleAddMonths,
  addYears as oracleAddYears,
  differenceInCalendarDays as oracleDifferenceInCalendarDays,
  differenceInDays as oracleDifferenceInDays,
  differenceInMonths as oracleDifferenceInMonths,
  differenceInYears as oracleDifferenceInYears,
} from "date-fns";

/** Avoid the Date constructor's 1900 adjustment for years 0 through 99. */
const localDate = (year: number, month: number, day: number, hour = 12): Date => {
  const result = new Date(0);
  result.setHours(hour, 0, 0, 0);
  result.setFullYear(year, month, day);
  return result;
};

const utcDate = (year: number, month: number, day: number, hour = 0, minute = 0): Date => {
  const result = new Date(0);
  result.setUTCFullYear(year, month, day);
  result.setUTCHours(hour, minute, 0, 0);
  return result;
};

const ymd = (date: Date): string => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const ymdTime = (date: Date): string => `${ymd(date)} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}.${String(date.getMilliseconds()).padStart(3, "0")}`;

const mulberry32 = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
  return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
};

describe("release calendar matrix", () => {
  test.each([
    [1600, true], [1700, false], [1800, false], [1900, false], [1996, true], [2000, true],
    [2023, false], [2024, true], [2025, false], [2026, false], [2028, true], [2100, false], [2400, true],
    [0, true], [99, false],
  ])("Gregorian leap-year rule: %i -> %s", (year, expected) => {
    expect(isLeapYear(localDate(year, 0, 1))).toBe(expected);
    expect(getDaysInMonth(localDate(year, 1, 1))).toBe(expected ? 29 : 28);
  });

  test.each([
    [2024, [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], 366],
    [2025, [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], 365],
  ])("every month in %i has its independently specified length", (year, lengths, total) => {
    expect(lengths.reduce((sum, value) => sum + value, 0)).toBe(total);
    lengths.forEach((expected, month) => expect(getDaysInMonth(localDate(year, month, 1))).toBe(expected));
    expect(getDayOfYear(localDate(year, 11, 31))).toBe(total);
  });

  test("leap-day, month-end and year-end arithmetic is clamped and immutable", () => {
    const original = localDate(2024, 0, 31, 9);
    expect(ymd(addDays(localDate(2024, 1, 28), 1))).toBe("2024-02-29");
    expect(ymd(addDays(localDate(2024, 1, 29), 1))).toBe("2024-03-01");
    expect(ymd(addDays(localDate(2025, 1, 28), 1))).toBe("2025-03-01");
    expect(ymd(addMonths(original, 1))).toBe("2024-02-29");
    expect(ymd(addMonths(localDate(2025, 0, 31), 1))).toBe("2025-02-28");
    expect(ymd(addYears(localDate(2024, 1, 29), 1))).toBe("2025-02-28");
    expect(ymd(subMonths(localDate(2024, 2, 31), 1))).toBe("2024-02-29");
    expect(ymd(subMonths(localDate(2025, 2, 31), 1))).toBe("2025-02-28");
    expect(ymd(addDays(localDate(2024, 11, 31), 1))).toBe("2025-01-01");
    expect(ymd(addDays(localDate(2025, 0, 1), -1))).toBe("2024-12-31");
    expect(ymd(addMonths(localDate(2024, 11, 31), 1))).toBe("2025-01-31");
    expect(ymd(original)).toBe("2024-01-31");
    // Clamping deliberately makes month arithmetic non-invertible at a month end.
    expect(ymd(subMonths(addMonths(original, 1), 1))).toBe("2024-01-29");
  });

  test("years 0 through 99 are not accidentally shifted by 1900", () => {
    expect(ymd(addMonths(localDate(0, 0, 31), 1))).toBe("0-02-29");
    expect(ymd(addMonths(localDate(96, 0, 31), 1))).toBe("96-02-29");
    expect(ymd(addMonths(localDate(99, 0, 31), 1))).toBe("99-02-28");
    expect(getTimeZoneOffset(utcDate(99, 0, 15), "UTC")).toBe(0);
  });

  test("boundaries, ISO weeks and intervals preserve calendar semantics", () => {
    const leap = localDate(2024, 1, 29, 15);
    expect(ymdTime(startOfDay(leap))).toBe("2024-02-29 00:00:00.000");
    expect(ymdTime(endOfDay(leap))).toBe("2024-02-29 23:59:59.999");
    expect(ymdTime(startOfMonth(leap))).toBe("2024-02-01 00:00:00.000");
    expect(ymdTime(endOfMonth(leap))).toBe("2024-02-29 23:59:59.999");
    expect(ymdTime(startOfYear(leap))).toBe("2024-01-01 00:00:00.000");
    expect(ymdTime(endOfYear(leap))).toBe("2024-12-31 23:59:59.999");
    expect(ymd(startOfWeek(localDate(2021, 0, 1), { weekStartsOn: 0 }))).toBe("2020-12-27");
    expect(ymd(startOfISOWeek(localDate(2021, 0, 1)))).toBe("2020-12-28");
    expect(ymd(endOfWeek(localDate(2021, 0, 1), { weekStartsOn: 1 }))).toBe("2021-01-03");
    expect(ymd(endOfISOWeek(localDate(2021, 0, 1)))).toBe("2021-01-03");
    expect(formatDate(localDate(2020, 11, 31), "RRRR-'W'II")).toBe("2020-W53");
    expect(formatDate(localDate(2021, 0, 1), "RRRR-'W'II")).toBe("2020-W53");
    expect(formatDate(localDate(2019, 11, 30), "RRRR-'W'II")).toBe("2020-W01");
  });

  test("parsing keeps date-only input local and malformed ISO values invalid", () => {
    const localLeapDay = parseISO("2024-02-29");
    expect(ymdTime(localLeapDay)).toBe("2024-02-29 00:00:00.000");
    expect(parseISO("2026-10-03T10:30:15.250+07:00").toISOString()).toBe("2026-10-03T03:30:15.250Z");
    for (const input of ["2025-02-29", "2024-02-30", "2026-04-31", "2026-00-10", "2026-13-01", "", " ", "2026-10-03T10:30+07:60"]) {
      expect(Number.isNaN(parseISO(input).getTime())).toBe(true);
    }
  });

  test("fixed durations are distinct from local calendar helpers", () => {
    expect(formatDuration(86_400_000)).toBe("1d");
    expect(parseDuration("1d")).toBe(86_400_000);
    expect(parseDuration("1w")).toBe(604_800_000);
  });

  test("range checks reject impossible calendar results", () => {
    expect(() => addDays(new Date(8.64e15), 1)).toThrow(RangeError);
    expect(() => getDaysInMonth(new Date(NaN))).toThrow(RangeError);
  });
});

describe("date-fns differential and seeded calendar invariants", () => {
  test("400 seeded local-calendar cases agree with date-fns equivalents", () => {
    const random = mulberry32(0x4d415452);
    for (let index = 0; index < 400; index++) {
      const year = 1600 + Math.floor(random() * 801);
      const month = Math.floor(random() * 12);
      const day = 1 + Math.floor(random() * 28);
      const hour = Math.floor(random() * 24);
      const date = localDate(year, month, day, hour);
      const amount = Math.floor(random() * 1459) - 729;
      const other = localDate(1600 + Math.floor(random() * 801), Math.floor(random() * 12), 1 + Math.floor(random() * 28), Math.floor(random() * 24));

      expect(addDays(date, amount).getTime()).toBe(oracleAddDays(date, amount).getTime());
      expect(addMonths(date, amount).getTime()).toBe(oracleAddMonths(date, amount).getTime());
      expect(addYears(date, amount).getTime()).toBe(oracleAddYears(date, amount).getTime());
      expect(differenceInCalendarDays(other, date)).toBe(oracleDifferenceInCalendarDays(other, date));
      expect(differenceInDays(other, date)).toBe(oracleDifferenceInDays(other, date));
      expect(differenceInMonths(other, date)).toBe(oracleDifferenceInMonths(other, date));
      expect(differenceInYears(other, date)).toBe(oracleDifferenceInYears(other, date));
      expect(differenceInCalendarDays(addDays(date, amount), date)).toBe(amount);
      expect(addDays(date, 0)).not.toBe(date);
      expect(addDays(date, 0).getTime()).toBe(date.getTime());
    }
  });
});

describe("IANA offset and DST fixtures", () => {
  test("uses documented offsets at New York and Berlin transitions", () => {
    expect(getTimeZoneOffset(utcDate(2026, 2, 8, 6, 59), "America/New_York")).toBe(-300);
    expect(getTimeZoneOffset(utcDate(2026, 2, 8, 7), "America/New_York")).toBe(-240);
    expect(getTimeZoneOffset(utcDate(2026, 10, 1, 5, 59), "America/New_York")).toBe(-240);
    expect(getTimeZoneOffset(utcDate(2026, 10, 1, 6), "America/New_York")).toBe(-300);
    expect(getTimeZoneOffset(utcDate(2026, 2, 29, 0, 59), "Europe/Berlin")).toBe(60);
    expect(getTimeZoneOffset(utcDate(2026, 2, 29, 1), "Europe/Berlin")).toBe(120);
    expect(getTimeZoneOffset(utcDate(2026, 5, 1), "Asia/Ho_Chi_Minh", { unit: "hours" })).toBe(7);
  });

  test("addDays preserves local wall time while DST changes elapsed time", () => {
    const beforeSpring = localDate(2026, 2, 7, 12);
    const afterSpring = addDays(beforeSpring, 1);
    const beforeFall = localDate(2026, 9, 31, 12);
    const afterFall = addDays(beforeFall, 1);
    expect(ymdTime(afterSpring)).toBe("2026-03-08 12:00:00.000");
    expect(ymdTime(afterFall)).toBe("2026-11-01 12:00:00.000");
    expect(differenceInCalendarDays(afterSpring, beforeSpring)).toBe(1);
    expect(differenceInCalendarDays(afterFall, beforeFall)).toBe(1);
    if (Intl.DateTimeFormat().resolvedOptions().timeZone === "America/New_York") {
      expect(afterSpring.getTime() - beforeSpring.getTime()).toBe(23 * 60 * 60 * 1000);
      expect(afterFall.getTime() - beforeFall.getTime()).toBe(25 * 60 * 60 * 1000);
    }
  });

  test("formatting uses the offset for the requested historical instant", () => {
    const instant = utcDate(2026, 2, 8, 7);
    expect(formatDate(instant, "yyyy-MM-dd HH:mm xxx", { timeZone: "America/New_York" })).toBe("2026-03-08 03:00 -04:00");
    expect(formatDate(instant, "yyyy-MM-dd HH:mm xxx", { timeZone: "Asia/Ho_Chi_Minh" })).toBe("2026-03-08 14:00 +07:00");
  });
});
