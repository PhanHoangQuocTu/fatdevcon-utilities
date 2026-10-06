/**
 * Differential test: the built-in ISO parser and token formatter against date-fns (a devDependency used
 * only as an oracle). Run under several TZ values to cover DST gaps and fractional-hour zones:
 * `TZ=America/Sao_Paulo npx jest oracle-date`.
 */
import { format, parseISO as oracleParseISO } from "date-fns";
import { enUS, fr, vi, de, ja } from "date-fns/locale";
import { formatDate } from "../index";
import { parseISO } from "../utils/date-format";

const SEEDS = Number(process.env.FUZZ_SEEDS ?? 4);
const CASES = Number(process.env.FUZZ_CASES ?? 1500);

const mulberry32 = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const TOKENS = [
  "G", "GGGG", "GGGGG", "y", "yo", "yy", "yyy", "yyyy", "yyyyy", "Y", "Yo", "YYY", "u", "uu", "uuuu", "R", "RR", "RRRR",
  "Q", "Qo", "QQ", "QQQ", "QQQQ", "QQQQQ", "q", "qo", "qq", "qqq", "qqqq", "qqqqq", "M", "Mo", "MM", "MMM", "MMMM", "MMMMM",
  "L", "LL", "LLL", "LLLL", "LLLLL", "w", "wo", "ww", "I", "Io", "II", "d", "do", "dd", "D", "Do", "DDD", "DDDD",
  "E", "EE", "EEE", "EEEE", "EEEEE", "EEEEEE", "i", "io", "ii", "iii", "iiii", "iiiii", "iiiiii", "e", "eo", "ee", "eee", "eeee",
  "eeeee", "eeeeee", "c", "co", "cc", "ccc", "cccc", "ccccc", "cccccc", "a", "aa", "aaa", "aaaa", "aaaaa", "b", "bb", "bbb",
  "bbbb", "bbbbb", "B", "BB", "BBB", "BBBB", "BBBBB", "h", "ho", "hh", "H", "Ho", "HH", "K", "Ko", "KK", "k", "ko", "kk",
  "m", "mo", "mm", "s", "so", "ss", "S", "SS", "SSS", "SSSS", "X", "XX", "XXX", "XXXX", "XXXXX", "x", "xx", "xxx", "xxxx",
  "xxxxx", "O", "OO", "OOO", "OOOO", "z", "zz", "zzz", "zzzz", "t", "tt", "T", "TTT",
  "P", "PP", "PPP", "PPPP", "p", "pp", "ppp", "pppp", "Pp", "PPpp", "PPPppp", "PPPPpppp",
];
const PROTECTED = new Set(["D", "DD", "YY", "YYYY"]);
const LITERALS = ["-", "/", " ", ", ", ":", "'T'", "'at'", "''", "'o''clock'", ".", " | "];

const randomInstant = (rand: () => number): Date => {
  const pick = (n: number) => Math.floor(rand() * n);
  switch (pick(6)) {
    case 0:
      return new Date(pick(2_000_000_000) * 1000 + pick(1000));
    case 1:
      return new Date(Date.UTC(1900 + pick(300), pick(12), 1 + pick(31), pick(24), pick(60), pick(60), pick(1000)));
    case 2: // year boundaries and week-year edge cases
      return new Date(Date.UTC(1990 + pick(60), pick(2) ? 11 : 0, pick(2) ? 25 + pick(7) : 1 + pick(7), pick(24), 59, 59, 999));
    case 3: // DST transition neighbourhoods (March / October / November)
      return new Date(Date.UTC(2000 + pick(40), [2, 9, 10][pick(3)], 1 + pick(31), pick(24), pick(60)));
    case 4: // very old and far-future years
      return new Date(Date.UTC(-500 + pick(3000), pick(12), 1 + pick(28), pick(24), pick(60)));
    default:
      return new Date(-1e12 + pick(2) * 2e12 + pick(1e9));
  }
};

beforeAll(() => {
  // date-fns prints a console warning for every protected token; the comparison does not need the noise.
  jest.spyOn(console, "warn").mockImplementation(() => undefined);
});
afterAll(() => jest.restoreAllMocks());

describe("formatDate vs date-fns oracle", () => {
  for (let seed = 1; seed <= SEEDS; seed++) {
    test(`seed ${seed}: every token in the default (English) locale (${CASES} cases)`, () => {
      const rand = mulberry32(seed * 31337);
      const pick = (n: number) => Math.floor(rand() * n);
      for (let i = 0; i < CASES; i++) {
        const date = randomInstant(rand);
        const tokens = Array.from({ length: 1 + pick(4) }, () => TOKENS[pick(TOKENS.length)]);
        const parts = tokens.map((token) => (rand() < 0.5 ? token : token + LITERALS[pick(LITERALS.length)]));
        const pattern = parts.join(rand() < 0.5 ? " " : "");
        const options = {
          weekStartsOn: [undefined, 0, 1, 2, 3, 4, 5, 6][pick(8)] as 0 | undefined,
          firstWeekContainsDate: [undefined, 1, 2, 3, 4, 5, 6, 7][pick(8)] as 1 | undefined,
          useAdditionalWeekYearTokens: true,
          useAdditionalDayOfYearTokens: true,
        };
        let expected: string;
        try {
          expected = format(date, pattern, options);
        } catch (error) {
          expect(() => formatDate(date, pattern, options)).toThrow();
          void error;
          continue;
        }
        const actual = formatDate(date, pattern, options);
        if (actual !== expected) throw new Error(`format(${date.toISOString()}, ${JSON.stringify(pattern)}, ${JSON.stringify(options)})\n  expected ${expected}\n  received ${actual}`);
      }
    });
  }

  test("protected tokens throw unless explicitly allowed, like date-fns", () => {
    const date = new Date(2026, 9, 3);
    for (const token of PROTECTED) {
      expect(() => format(date, token)).toThrow();
      expect(() => formatDate(date, token)).toThrow(RangeError);
      expect(formatDate(date, token, { useAdditionalWeekYearTokens: true, useAdditionalDayOfYearTokens: true })).toBe(
        format(date, token, { useAdditionalWeekYearTokens: true, useAdditionalDayOfYearTokens: true })
      );
    }
  });

  test("unescaped letters and bad options throw RangeError, quoted text passes", () => {
    const date = new Date(2026, 9, 3);
    for (const pattern of ["yyyy-MM-dd J", "A", "ZZ", "yyyy 'abc", "n"]) {
      let expectedThrows = false;
      try {
        format(date, pattern);
      } catch {
        expectedThrows = true;
      }
      if (expectedThrows) expect(() => formatDate(date, pattern)).toThrow(RangeError);
      else expect(formatDate(date, pattern)).toBe(format(date, pattern));
    }
    expect(() => formatDate(date, "yyyy", { weekStartsOn: 9 as 0 })).toThrow(RangeError);
    expect(() => formatDate(date, "yyyy", { firstWeekContainsDate: 9 as 1 })).toThrow(RangeError);
    expect(formatDate(date, "'It''s' yyyy")).toBe(format(date, "'It''s' yyyy"));
  });

  test("date-fns locale objects are used as given", () => {
    const rand = mulberry32(99);
    for (const locale of [enUS, fr, vi, de, ja]) {
      for (let i = 0; i < 120; i++) {
        const date = randomInstant(rand);
        const pattern = "EEEE d MMMM yyyy, EEE MMM do QQQ a bbbb B P pp PPPp";
        expect(formatDate(date, pattern, { locale })).toBe(format(date, pattern, { locale }));
      }
    }
  });

  test("an Intl locale string uses runtime names for months and weekdays", () => {
    const date = new Date(2026, 9, 3, 15, 4, 5);
    expect(formatDate(date, "EEEE d MMMM yyyy", { locale: "en-US" })).toBe("Saturday 3 October 2026");
    expect(formatDate(date, "EEEE", { locale: "fr" })).toBe("samedi");
    expect(formatDate(date, "MMMM", { locale: "de" })).toBe("Oktober");
    expect(formatDate(date, "EEEE", { locale: "vi" })).toMatch(/Thứ Bảy|thứ bảy/i);
  });
});

describe("formatDate with an explicit time zone", () => {
  const instant = new Date("2026-01-15T17:30:45.123Z");
  test("reads fields in the requested zone", () => {
    expect(formatDate(instant, "yyyy-MM-dd HH:mm:ss.SSS xxx", { timeZone: "Asia/Ho_Chi_Minh" })).toBe("2026-01-16 00:30:45.123 +07:00");
    expect(formatDate(instant, "yyyy-MM-dd HH:mm xxx", { timeZone: "America/New_York" })).toBe("2026-01-15 12:30 -05:00");
    expect(formatDate(instant, "HH:mm XXX", { timeZone: "UTC" })).toBe("17:30 Z");
    expect(formatDate(instant, "HH:mm xxx OOOO", { timeZone: "Asia/Kolkata" })).toBe("23:00 +05:30 GMT+05:30");
    expect(formatDate(instant, "EEEE, do MMMM", { timeZone: "Pacific/Auckland" })).toBe("Friday, 16th January");
  });

  test("agrees with date-fns after shifting into the zone, across DST", () => {
    const rand = mulberry32(5);
    for (let i = 0; i < 400; i++) {
      const date = randomInstant(rand);
      if (date.getUTCFullYear() < 1950 || date.getUTCFullYear() > 2100) continue;
      for (const timeZone of ["America/New_York", "Europe/London", "Australia/Lord_Howe", "Asia/Kathmandu"]) {
        const text = formatDate(date, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx", { timeZone });
        expect(new Date(text).getTime()).toBe(Math.floor(date.getTime() / 1000) * 1000 + (((date.getTime() % 1000) + 1000) % 1000));
      }
    }
  });

  test("rejects an unknown zone", () => {
    expect(() => formatDate(instant, "yyyy", { timeZone: "Mars/Olympus" })).toThrow(RangeError);
  });
});

describe("parseISO vs date-fns oracle", () => {
  const same = (input: string): void => {
    const expected = oracleParseISO(input).getTime();
    const actual = parseISO(input).getTime();
    if (!Object.is(actual, expected)) throw new Error(`parseISO(${JSON.stringify(input)}): expected ${expected}, received ${actual}`);
  };

  const FIXED = [
    "2026", "2026-10", "2026-10-03", "20261003", "202610", "2026-276", "2026276", "2026-W40", "2026-W40-6", "2026W406", "2026W40",
    "2026-10-03T10", "2026-10-03T10:30", "2026-10-03T10:30:15", "2026-10-03T10:30:15.123", "2026-10-03T10:30:15,5", "2026-10-03T10.5",
    "2026-10-03T10:30.5", "2026-10-03T24:00", "2026-10-03T24:01", "2026-10-03T25:00", "2026-10-03T10:60", "2026-10-03T10:30:60",
    "2026-10-03T10:30Z", "2026-10-03T10:30:15.999+07:00", "2026-10-03T10:30:15-0330", "2026-10-03T10:30+07", "2026-10-03T10:30+0760",
    "2026-10-03 10:30", "2026-10-03 10:30:15Z", "2026-10-03T10:30:15 UTC", "2026-10-03T10:30:15Europe/Paris", "T10:30", "10:30",
    "+002026-10-03", "-000001-01-01", "+0020261003", "20", "2026-13-01", "2026-02-30", "2024-02-29", "2023-02-29", "2026-00-10",
    "2026-10-00", "2026-366", "2024-366", "2026-W00", "2026-W54", "2026-W53-8", "", " ", "garbage", "2026-10-03T", "2026-10-03Tgarbage",
    "2026-10-03T10:30:15+07:00:00", "2026-10-03T10:30:15.", "2026-10-03T10:30:15+", "Z", "2026Z", "2026-10-03Z", "2026-10-03T10:30:15zz",
    "0000-01-01", "0099-12-31", "9999-12-31", "1969-12-31T23:59:59.999Z", "1900-01-01T00:00:00", "2026-03-08T02:30", "2026-11-01T01:30",
  ];

  test.each(FIXED)("%j", (input) => same(input));

  test("random well-formed and mutated strings", () => {
    const rand = mulberry32(777);
    const pick = (n: number) => Math.floor(rand() * n);
    const two = (n: number) => String(n).padStart(2, "0");
    for (let i = 0; i < CASES * 4; i++) {
      const year = String(pick(10000)).padStart(4, "0");
      const date = [
        `${year}-${two(1 + pick(13))}-${two(1 + pick(32))}`,
        `${year}${two(1 + pick(13))}${two(1 + pick(32))}`,
        `${year}-${String(pick(368)).padStart(3, "0")}`,
        `${year}-W${two(pick(55))}-${pick(9)}`,
        `${year}-${two(1 + pick(12))}`,
        year,
      ][pick(6)];
      const time = ["", `T${two(pick(26))}`, `T${two(pick(26))}:${two(pick(62))}`, `T${two(pick(26))}:${two(pick(62))}:${two(pick(62))}`,
        `T${two(pick(25))}:${two(pick(60))}:${two(pick(60))}.${pick(1000)}`, `T${two(pick(25))}.${pick(100)}`][pick(6)];
      const zone = ["", "Z", `+${two(pick(15))}:${two(pick(62))}`, `-${two(pick(15))}${two(pick(62))}`, `+${two(pick(15))}`, " UTC"][pick(6)];
      let text = date + time + zone;
      if (rand() < 0.15) {
        const at = pick(text.length + 1);
        text = text.slice(0, at) + ["", "T", "-", ":", " ", "Z", "5", "x", ".", ","][pick(10)] + text.slice(at + pick(2));
      }
      same(text);
    }
  });
});
