import {
  formatCompactNumber, formatPercent, formatCurrency, formatUnit, formatBytes,
  getCountryCurrencies, getCurrencySymbol, getCurrencyName,
  truncateText, shortenString, normalizeWhitespace, removeDiacritics,
  slugify, capitalize, maskString, formatNumber,
} from "../index";

describe("number formatting", () => {
  test("compact magnitudes and locale options", () => {
    expect(formatCompactNumber(1200)).toBe("1.2K");
    expect(formatCompactNumber(-1250000)).toBe("-1.3M");
    expect(formatCompactNumber(0)).toBe("0");
    expect(formatCompactNumber(1200, "en-US", { compactDisplay: "long" })).toBe("1.2 thousand");
    expect(formatCompactNumber(1234, "de-DE")).toBe(new Intl.NumberFormat("de-DE", { notation: "compact", maximumFractionDigits: 1 }).format(1234));
    expect(formatCompactNumber(1234, "en-US", { maximumFractionDigits: 2 })).toBe("1.23K");
  });
  test("percent uses ratios and honors precision", () => {
    expect(formatPercent(0.125)).toBe("12.5%");
    expect(formatPercent(-1.5)).toBe("-150%");
    expect(formatPercent(0)).toBe("0%");
    expect(formatPercent(0.12345, "en-US", { maximumFractionDigits: 1 })).toBe("12.3%");
  });
  test("currency minor units, accounting and lowercase codes", () => {
    expect(formatCurrency(1234.5, "usd")).toBe("$1,234.50");
    expect(formatCurrency(1234.5, "JPY")).toBe("¥1,235");
    expect(formatCurrency(1.234, "KWD")).toBe("KWD\u00a01.234");
    expect(formatCurrency(-12, "USD", "en-US", { currencySign: "accounting" })).toBe("($12.00)");
    expect(formatCurrency(1234, "VND", "vi-VN")).toBe(new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(1234));
    expect(() => formatCurrency(1, "US")).toThrow(RangeError);
    expect(() => formatCurrency(1, null as unknown as string)).toThrow(TypeError);
  });
  test("units and invalid options", () => {
    expect(formatUnit(12, "kilometer-per-hour")).toBe("12 km/h");
    expect(() => formatUnit(1, "not-a-unit")).toThrow(RangeError);
    expect(() => formatCompactNumber(1, "invalid_locale")).toThrow(RangeError);
    expect(() => formatPercent(1, "en", { maximumFractionDigits: -1 })).toThrow(RangeError);
  });
  test.each([NaN, Infinity, -Infinity, "123", null])("new numeric APIs reject %p", value => {
    for (const fn of [
      () => formatCompactNumber(value as number), () => formatPercent(value as number),
      () => formatCurrency(value as number, "USD"), () => formatUnit(value as number, "meter"),
      () => formatBytes(value as number),
    ]) expect(fn).toThrow(TypeError);
  });
  test("existing formatNumber behavior stays compatible", () => {
    expect(formatNumber(Infinity, "en-US")).toBe("∞");
    expect(formatNumber(1234.56, "vi-VN")).toBe("1.234,56");
  });
  test("bytes: SI, IEC, rounding boundaries, zero, sub-byte and maximum", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(0.5)).toBe("0.5 B");
    expect(formatBytes(1500)).toBe("1.5 kB");
    expect(formatBytes(1024, { base: 1024 })).toBe("1 KiB");
    expect(formatBytes(999999)).toBe("1 MB");
    expect(formatBytes(1024 ** 2 - 1, { base: 1024 })).toBe("1 MiB");
    expect(formatBytes(1500, { locale: "de-DE" })).toBe("1,5 kB");
    expect(formatBytes(Number.MAX_VALUE)).toContain(" EB");
    expect(() => formatBytes(-1)).toThrow(RangeError);
    expect(() => formatBytes(1, { base: 2 as 1000 })).toThrow(RangeError);
    expect(() => formatBytes(1, { decimals: 1.5 })).toThrow(TypeError);
    expect(() => formatBytes(1, { decimals: 21 })).toThrow(RangeError);
    expect(() => formatBytes(1, { decimals: -1 })).toThrow(RangeError);
  });
});

describe("country and currency metadata", () => {
  test("covers regions and excludes historical/non-tender codes", () => {
    expect(getCountryCurrencies("vn")).toEqual(["VND"]);
    expect(getCountryCurrencies("US")).toEqual(["USD"]);
    expect(getCountryCurrencies("JP")).toEqual(["JPY"]);
    expect(getCountryCurrencies("BG")).toEqual(["EUR"]);
    expect(getCountryCurrencies("DE")).toEqual(["EUR"]);
    expect(getCountryCurrencies("PA")).toEqual(expect.arrayContaining(["PAB", "USD"]));
    expect(getCountryCurrencies("AQ")).toEqual([]);
    expect(getCountryCurrencies("ZZ")).toEqual([]);
    expect(() => getCountryCurrencies("USA")).toThrow(RangeError);
    expect(() => getCountryCurrencies(null as unknown as string)).toThrow(TypeError);
  });
  test("does not expose mutable internal data", () => {
    getCountryCurrencies("VN").push("USD");
    expect(getCountryCurrencies("VN")).toEqual(["VND"]);
  });
  test("localized symbols and names", () => {
    expect(getCurrencySymbol("usd")).toBe("$");
    expect(getCurrencySymbol("USD", "en-CA", "narrowSymbol")).toBe(
      new Intl.NumberFormat("en-CA", { style: "currency", currency: "USD", currencyDisplay: "narrowSymbol" })
        .formatToParts(0).find(part => part.type === "currency")?.value
    );
    expect(getCurrencyName("usd")).toBe("US Dollar");
    expect(getCurrencyName("VND", "vi")).toBe(new Intl.DisplayNames("vi", { type: "currency" }).of("VND"));
    expect(getCurrencyName("ZZZ")).toBe("ZZZ");
    expect(() => getCurrencySymbol("US")).toThrow(RangeError);
  });
});

describe("Unicode text formatting", () => {
  test("truncate includes the marker in the maximum", () => {
    expect(truncateText("Hello world", 8)).toBe("Hello...");
    expect(truncateText("hello", 5)).toBe("hello");
    expect(truncateText("hello", 0)).toBe("");
    expect(truncateText("hello", 2)).toBe("..");
    expect(truncateText("hello", 3, { ellipsis: "" })).toBe("hel");
    expect(truncateText("", 0)).toBe("");
    expect(truncateText("Hello beautiful world", 12, { preserveWords: true })).toBe("Hello...");
    expect(truncateText("Hello world", 8, { preserveWords: true })).toBe("Hello...");
  });
  test("keeps emoji sequences, combining marks and flags intact", () => {
    expect(truncateText("👨‍👩‍👧‍👦🇻🇳e\u0301XYZ", 4, { ellipsis: "…" })).toBe("👨‍👩‍👧‍👦🇻🇳e\u0301…");
    expect(shortenString("👨‍👩‍👧‍👦abcdefgh🇻🇳", { startLength: 1, endLength: 1 })).toBe("👨‍👩‍👧‍👦...🇻🇳");
    expect(maskString("👨‍👩‍👧‍👦🇻🇳ab", { visibleEnd: 1 })).toBe("***b");
  });
  test("shorten both ends with safe zero lengths", () => {
    expect(shortenString("abcdefghijklxyzc")).toBe("abcd...xyzc");
    expect(shortenString("short")).toBe("short");
    expect(shortenString("abcdef", { startLength: 1, endLength: 0 })).toBe("a...");
    expect(shortenString("abcdef", { startLength: 0, endLength: 0 })).toBe("...");
    expect(shortenString("abcdef", { startLength: 1, endLength: 1, separator: "" })).toBe("af");
  });
  test("normalization, Vietnamese, non-Latin slugs and capitalization", () => {
    expect(normalizeWhitespace("  hello\n\t world\u00a0 ")).toBe("hello world");
    expect(removeDiacritics("Đặng Thị Tú")).toBe("Dang Thi Tu");
    expect(slugify("  Đặng Thị Tú & 東京! ")).toBe("dang-thi-tu-東京");
    expect(slugify("!")).toBe("");
    expect(capitalize("hello WORLD")).toBe("Hello WORLD");
    expect(capitalize("istanbul", "tr")).toBe("İstanbul");
    expect(capitalize("")).toBe("");
  });
  test("masking options, short text and invalid masks", () => {
    expect(maskString("1234567890")).toBe("******7890");
    expect(maskString("123")).toBe("123");
    expect(maskString("abcdef", { visibleStart: 1, visibleEnd: 1, mask: "#" })).toBe("a####f");
    expect(maskString("abc", { visibleEnd: 0 })).toBe("***");
    expect(maskString("")).toBe("");
    expect(() => maskString("abc", { mask: "" })).toThrow(RangeError);
    expect(() => maskString("abc", { mask: "**" })).toThrow(RangeError);
  });
  test("validates text types and lengths", () => {
    expect(() => truncateText("abc", -1)).toThrow(RangeError);
    expect(() => truncateText("abc", 1.5)).toThrow(TypeError);
    expect(() => shortenString("abc", { endLength: Infinity })).toThrow(TypeError);
    expect(() => maskString("abc", { visibleStart: -1 })).toThrow(RangeError);
    for (const fn of [normalizeWhitespace, removeDiacritics, slugify, capitalize, maskString, shortenString]) {
      expect(() => fn(null as unknown as string)).toThrow(TypeError);
    }
    expect(() => truncateText("abc", 2, { ellipsis: null as unknown as string })).toThrow(TypeError);
  });
});