import {
  strip, lstrip, rstrip, title, firstChar, lastChar, normalizeWhitespace,
  capitalize, titleCase, removeDiacritics, reverseText, countWords,
} from "../index";

describe("data cleaning contracts", () => {
  test.each(["", " ", "\t\n\r", "\u00a0\u2003\u2028\ufeff", " \t\n "])("whitespace %j", space => {
    expect(strip(space)).toBe("");
    expect(lstrip(space)).toBe("");
    expect(rstrip(space)).toBe("");
    expect(strip(`${space}a  b${space}`)).toBe("a  b");
    expect(lstrip(`${space}a  b${space}`)).toBe(`a  b${space}`);
    expect(rstrip(`${space}a  b${space}`)).toBe(`${space}a  b`);
    expect(normalizeWhitespace(`${space}a  b${space}`)).toBe("a b");
  });

  test("uses a literal code-point set and only strips ends", () => {
    expect(strip("abbahelloab", "ab")).toBe("hello");
    expect(strip(".-[hello]-.", "[].-")).toBe("hello");
    expect(strip("🌍👍🏽hello🌍", "🌍👍🏽")).toBe("hello");
    expect(lstrip("🌍hello🌍", "🌍")).toBe("hello🌍");
    expect(rstrip("🌍hello🌍", "🌍")).toBe("🌍hello");
    expect(strip("aaa", "a")).toBe("");
    expect(rstrip("aaa", "a")).toBe("");
    expect(strip("abca", "a")).toBe("bc");
    for (const fn of [strip, lstrip, rstrip]) {
      expect(fn("  a  ", "")).toBe("  a  ");
      expect(fn("", "a")).toBe("");
      expect(fn("🌍", "\ud83c")).toBe("🌍");
      expect(fn("\ud83chello\ud83c", "\ud83c")).toBe(fn === lstrip ? "hello\ud83c" : fn === rstrip ? "\ud83chello" : "hello");
    }
    // ECMAScript whitespace differs from Python: NEL is preserved, BOM is trimmed.
    expect(strip("\u0085hello\u0085")).toBe("\u0085hello\u0085");
    expect(strip("\u200bhello\u200b")).toBe("\u200bhello\u200b");
  });

  test.each([
    ["", ""], ["nGUYEN vAN aN", "Nguyen Van An"], ["đẶNG vĂN lÂM", "Đặng Văn Lâm"],
    ["TRẦN THỊ BÍCH NGỌC", "Trần Thị Bích Ngọc"], ["john DOE", "John Doe"],
    ["hello-world", "Hello-World"], ["o'CONNOR d’ANGELO", "O'connor D’angelo"],
    ["'HELLO' ‘WORLD’", "'Hello' ‘World’"], [" hello   world\n", " Hello   World\n"],
    ["hello_world hello123world", "Hello_World Hello123World"],
    ["hello🌍 👨‍👩‍👧‍👦family 👍🏽", "Hello🌍 👨‍👩‍👧‍👦Family 👍🏽"],
    ["e\u0301COLE ÉCOLE", "E\u0301cole École"], ["İSTANBUL ıSTANBUL", "I\u0307stanbul Istanbul"],
    ["ΟΣ ΟΣΑ", "Ος Οσα"], ["ßETA", "SSeta"], ["𐐨𐐀", "𐐀𐐨"],
  ])("title(%j)", (input, output) => expect(title(input)).toBe(output));

  test.each(["a", "🌍", "e\u0301", "👨‍👩‍👧‍👦", "👍🏽", "🇻🇳", "\r\n", "✈️"])("grapheme %j", cluster => {
    expect(firstChar(`${cluster}x`)).toBe(cluster);
    expect(lastChar(`x${cluster}`)).toBe(cluster);
    expect(firstChar(cluster)).toBe(cluster);
    expect(lastChar(cluster)).toBe(cluster);
  });

  test("empty and malformed UTF-16 input is preserved without inventing content", () => {
    expect(firstChar("")).toBe("");
    expect(lastChar("")).toBe("");
    expect(firstChar("\ud800x")).toBe("\ud800");
    expect(lastChar("x\udfff")).toBe("\udfff");
  });

  test("rejects non-string text and character sets without coercion", () => {
    const hostile = new Proxy({}, { get() { throw new Error("must not read"); } });
    for (const value of [null, undefined, 1, true, 1n, Symbol(), [], hostile]) {
      for (const fn of [strip, lstrip, rstrip, title, firstChar, lastChar]) {
        expect(() => fn(value as string)).toThrow(TypeError);
      }
      if (value !== undefined) {
        for (const fn of [strip, lstrip, rstrip]) expect(() => fn("", value as string)).toThrow(TypeError);
      }
    }
  });

  test("retains legacy capitalization, titleCase and opt-in accent removal", () => {
    expect(capitalize("hELLO WORLD")).toBe("HELLO WORLD");
    expect(capitalize("hELLO WORLD".toLowerCase())).toBe("Hello world");
    expect(capitalize("istanbul", "tr")).toBe("İstanbul");
    expect(capitalize("e\u0301COLE")).toBe("E\u0301COLE");
    expect(titleCase("helloWorld-o'connor")).toBe("Hello World O Connor");
    expect(title("helloWorld-o'connor")).toBe("Helloworld-O'connor");
    expect(removeDiacritics("Đặng Văn Lâm")).toBe("Dang Van Lam");
    expect(reverseText("a👨‍👩‍👧‍👦b")).toBe("b👨‍👩‍👧‍👦a");
    expect(countWords("Hello, world!")).toBe(2);
  });

  test("loads the root without Segmenter and documents code-point fallback differences", () => {
    const descriptor = Object.getOwnPropertyDescriptor(Intl, "Segmenter")!;
    Object.defineProperty(Intl, "Segmenter", { configurable: true, value: undefined });
    try {
      jest.isolateModules(() => {
        const api = jest.requireActual<typeof import("../index")>("../index");
        expect(api.firstChar("🌍hello")).toBe("🌍");
        expect(api.lastChar("hello🌍")).toBe("🌍");
        expect(api.firstChar("👨‍👩‍👧‍👦")).toBe("👨");
        expect(api.lastChar("👨‍👩‍👧‍👦")).toBe("👦");
        expect(api.firstChar("e\u0301")).toBe("e");
        expect(api.lastChar("e\u0301")).toBe("\u0301");
        expect(api.lastChar("👍🏽")).toBe("🏽");
        expect(api.firstChar("🇻🇳")).toBe("🇻");
        expect(api.lastChar("🇻🇳")).toBe("🇳");
        expect(api.firstChar("a")).toBe("a");
        expect(api.lastChar("x\udfff")).toBe("\udfff");
        expect(api.firstChar("")).toBe("");
        expect(api.lastChar("")).toBe("");
        expect(api.strip(" x ")).toBe("x");
      });
    } finally {
      Object.defineProperty(Intl, "Segmenter", descriptor);
    }
  });

  test("new endpoints work even when Intl is absent", () => {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, "Intl")!;
    Object.defineProperty(globalThis, "Intl", { configurable: true, value: undefined });
    try {
      expect(firstChar("👍🏽")).toBe("👍");
      expect(lastChar("x🌍")).toBe("🌍");
    } finally {
      Object.defineProperty(globalThis, "Intl", descriptor);
    }
  });

  test("seeded cleaning properties preserve Unicode and are idempotent", () => {
    let seed = 0x041c1ea;
    const tokens = ["a", "Đ", "e\u0301", "👨‍👩‍👧‍👦", "👍🏽", "🇻🇳", " ", "\t", "\u00a0", "-", "'"];
    for (let i = 0; i < 500; i++) {
      let input = "";
      for (let j = 0; j < 40; j++) {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        input += tokens[seed % tokens.length];
      }
      expect(strip(strip(input))).toBe(strip(input));
      expect(strip(input)).toBe(input.trim());
      expect(strip(strip(input, "aĐ -"), "aĐ -")).toBe(strip(input, "aĐ -"));
      expect(normalizeWhitespace(normalizeWhitespace(input))).toBe(normalizeWhitespace(input));
      expect(input.startsWith(firstChar(input))).toBe(true);
      expect(input.endsWith(lastChar(input))).toBe(true);
      expect(Array.from(title(input)).some(char => /^[\ud800-\udfff]$/.test(char))).toBe(false);
    }
  });
});
