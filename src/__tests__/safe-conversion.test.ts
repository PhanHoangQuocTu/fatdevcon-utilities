import {
  safeToNumber, safeToInteger, safeToBigInt, safeToBoolean, safeToString,
  safeJsonParse, safeJsonStringify, toNumber, toBoolean, toString,
} from "../index";
import Decimal from "decimal.js";

describe("safe numeric conversion", () => {
  test.each([
    ["123", 123], ["12.5", 12.5], ["-10", -10], [" 123 \n", 123], ["001", 1],
    ["+1", 1], [".5", 0.5], ["1.", 1], ["1e3", 1000], ["-.5E+2", -50],
    ["1e-3", 0.001], ["5e-324", Number.MIN_VALUE], ["-5e-324", -Number.MIN_VALUE],
    ["-0", -0], ["-0.000e-999", -0], ["0e999", 0], [0, 0], [-0, -0],
    [0.1, 0.1], [1.5, 1.5], [Number.MIN_VALUE, Number.MIN_VALUE],
    [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER], [Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER],
    [9007199254740991n, Number.MAX_SAFE_INTEGER], ["9007199254740991.0", Number.MAX_SAFE_INTEGER],
    ["90071992547409910e-1", Number.MAX_SAFE_INTEGER], ["0.10000000000000001", 0.1],
  ])("safeToNumber(%p)", (value, expected) => expect(safeToNumber(value)).toBe(expected));

  test.each([
    "", " ", "abc", "12abc", "0xFF", "0b10", "0o10", "1,234.56", "1.234,56", "12px", "١٢٣",
    "NaN", "Infinity", "1e999", "1e-999", "-1e-999", "1e-324", "1e", ".", "+", "1_000",
    "9007199254740993", "-9007199254740993", "9007199254740993.0", "9.007199254740993e15",
    NaN, Infinity, -Infinity, Number.MAX_VALUE, Number.MAX_SAFE_INTEGER + 1, 9007199254740992n,
    -9007199254740992n, null, undefined, true, false, Symbol(), [], [1], {}, new Number(1),
  ])("invalid number %p returns null", value => expect(safeToNumber(value)).toBeNull());

  test.each([0, -0, 1, -1, "0", "-0", "001", " +123 ", 0n, -1n, Number.MAX_SAFE_INTEGER])("safe integer %p", value => {
    expect(safeToInteger(value)).toBe(Number(value));
    expect(safeToBigInt(value)).toBe(BigInt(value));
  });

  test.each([1.5, -1.5, "1.0", "1e3", "1.00000000000000001", "0xFF", "-0.0", NaN, Infinity, "", null, true])("does not truncate or reinterpret %p", value => {
    expect(safeToInteger(value)).toBeNull();
    expect(safeToBigInt(value)).toBeNull();
  });

  test("BigInt keeps arbitrary integer text exact while integer conversion refuses it", () => {
    const text = "9".repeat(10000);
    expect(safeToBigInt(` -${text} `)?.toString()).toBe(`-${text}`);
    expect(safeToBigInt(10n ** 1000n)).toBe(10n ** 1000n);
    expect(safeToInteger(text)).toBeNull();
    expect(safeToInteger(9007199254740992n)).toBeNull();
    expect(safeToBigInt(9007199254740992)).toBeNull();
    expect(safeToBigInt(Number.MIN_VALUE)).toBeNull();
    expect(safeToBigInt(Symbol())).toBeNull();
  });

  test("seeded decimal/scientific inputs agree with a decimal.js range oracle", () => {
    let seed = 0x041dec;
    for (let i = 0; i < 1500; i++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const text = `${seed % 2 ? "-" : ""}${seed}.${seed % 997}e${(seed % 700) - 350}`;
      const decimal = new Decimal(text);
      const rounded = decimal.toNumber();
      const valid = Number.isFinite(rounded) && !(rounded === 0 && !decimal.isZero())
        && (!Number.isInteger(rounded) || Number.isSafeInteger(rounded));
      expect(safeToNumber(text)).toBe(valid ? rounded : null);
      const integer = BigInt(seed) * 10000000n;
      expect(safeToInteger(String(integer))).toBe(integer <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(integer) : null);
      expect(safeToBigInt(String(integer))).toBe(integer);
      expect(safeToNumber(`${text}x`)).toBeNull();
    }
  });
});

describe("safe boolean and display conversion", () => {
  test.each([true, 1, "true", "TRUE", " True ", "1"])("true %p", value => expect(safeToBoolean(value)).toBe(true));
  test.each([false, 0, -0, "false", "FALSE", " false\n", "0"])("false %p", value => expect(safeToBoolean(value)).toBe(false));
  test.each(["", "yes", "no", "on", "off", "00", "1.0", 2, NaN, 1n, null, undefined, [], Symbol()])("invalid boolean %p", value => expect(safeToBoolean(value)).toBeNull());

  test("display conversion has explicit primitive and JSON semantics", () => {
    expect(safeToString("")).toBe("");
    expect(safeToString(-0)).toBe("0");
    expect(safeToString(1.5)).toBe("1.5");
    expect(safeToString(false)).toBe("false");
    expect(safeToString(123n)).toBe("123");
    expect(safeToString(Symbol("key"))).toBe("Symbol(key)");
    expect(safeToString(new Date("2026-01-01Z"))).toBe("2026-01-01T00:00:00.000Z");
    expect(safeToString(Object.create(null))).toBe("{}");
    expect(safeToString([1, true, null])).toBe("[1,true,null]");
    expect(safeToString({ a: 1, missing: undefined })).toBe('{"a":1}');
    expect(safeToString([undefined, NaN])).toBe("[null,null]");
    expect(safeToString({ toJSON: () => "custom" })).toBe('"custom"');
    expect(safeToString({ toJSON: () => undefined })).toBeNull();
  });

  test.each([null, undefined, NaN, Infinity, -Infinity, new Date(NaN), new Map(), new Set(), () => 1, [1n], { a: 1n }])("invalid string conversion %p", value => expect(safeToString(value)).toBeNull());

  test("rejects hostile objects without coercing them, catches JSON callback failures", () => {
    const fail = jest.fn(() => { throw new Error("conversion failed"); });
    const revoked = Proxy.revocable({}, {});
    revoked.revoke();
    const values = [
      { valueOf: fail, toString: fail, [Symbol.toPrimitive]: fail },
      { get value() { return fail(); } }, { toJSON: fail },
      new Proxy({}, { get: fail, getPrototypeOf: fail }), revoked.proxy,
    ];
    for (const value of values) {
      for (const fn of [safeToNumber, safeToInteger, safeToBigInt, safeToBoolean]) expect(fn(value)).toBeNull();
    }
    expect(fail).not.toHaveBeenCalled();
    expect(safeToString(values[0])).toBe("{}"); // JSON ignores methods; does not invoke primitive coercion.
    for (const value of values.slice(1)) expect(safeToString(value)).toBeNull();
    const circular: { self?: unknown } = {};
    circular.self = circular;
    expect(safeToString(circular)).toBeNull();
    expect(circular.self).toBe(circular);
  });
});

describe("legacy conversion and JSON regressions", () => {
  test("keeps strict APIs' existing exceptions and coercion policies", () => {
    expect(() => toNumber(" 1 ")).toThrow(TypeError);
    expect(() => toNumber("9007199254740993")).toThrow(RangeError);
    expect(toNumber(Number.MAX_SAFE_INTEGER + 1)).toBe(Number.MAX_SAFE_INTEGER + 1);
    expect(toNumber("1e-999")).toBe(0); // Existing policy retained; safeToNumber rejects underflow.
    expect(() => toBoolean("1")).toThrow(TypeError);
    expect(() => toBoolean("TRUE")).toThrow(TypeError);
    expect(toString(null)).toBe("null");
    expect(toString(new Date(NaN))).toBe("Invalid Date");
    expect(() => safeJsonParse(null as unknown as string)).toThrow(TypeError);
    expect(() => safeJsonParse(undefined as unknown as string)).toThrow(TypeError);
  });

  test.each(["null", "true", "0", '"hello"', "[]", '{"a":[1,{"b":2}]}'])("JSON %j", text => {
    expect(safeJsonParse(text)).toEqual({ ok: true, value: JSON.parse(text) });
  });
  test.each(["", " ", "undefined", "{", "[1,]"])("invalid JSON %j", text => expect(safeJsonParse(text).ok).toBe(false));

  test("prototype-sensitive keys are data, never assignments to global prototypes", () => {
    const text = '{"__proto__":{"polluted":true},"constructor":{"prototype":{"polluted":true}}}';
    const result = safeJsonParse(text);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected valid JSON");
    expect(Object.prototype.hasOwnProperty.call(result.value, "__proto__")).toBe(true);
    expect(Object.getPrototypeOf(result.value)).toBe(Object.prototype);
    expect(Object.prototype).not.toHaveProperty("polluted");
    expect(safeToString(result.value)).toBe(text);
    const failure = new Error("serialization failed");
    expect(safeJsonStringify({ toJSON() { throw failure; } })).toEqual({ ok: false, error: failure });
  });
});
