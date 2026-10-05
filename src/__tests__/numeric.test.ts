import {
  NumericTypeError, NumericRangeError,
  summary, subtract, multiply, divide, modulo, power, abs, percentage, round, clamp,
  compareNumbers, isNumeric, toDecimalString,
  factorial, fibonacci, gcd, lcm, isPrime,
  sumValueInArray, averageValueInArray, sumBig, averageBig, median, medianBig,
  randomInt, range, countingSort, radixSort, quickSort, findMin, findMax,
  formatNumber, formatCompactNumber, formatPercent, formatCurrency, formatUnit, formatBytes,
  formatDuration, formatRelativeTime,
} from "../index";

/** Run `fn`, return the thrown error (or fail the test). */
const thrown = (fn: () => unknown): any => {
  try {
    fn();
  } catch (error) {
    return error;
  }
  throw new Error("expected the function to throw");
};
const expectCode = (fn: () => unknown, Type: typeof TypeError | typeof RangeError, code: string) => {
  const error = thrown(fn);
  expect(error).toBeInstanceOf(Type);
  expect(error.code).toBe(code);
};

/** Small deterministic generator so failures are reproducible. */
const lcg = (seed: number) => () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;

const HUGE = "123456789012345678901234567890123456789012345678901234567890";

describe("numeric errors", () => {
  test("carry a stable code and extend the standard errors", () => {
    const type = thrown(() => summary(NaN, 1));
    expect(type).toBeInstanceOf(NumericTypeError);
    expect(type).toBeInstanceOf(TypeError);
    expect(type.name).toBe("NumericTypeError");
    expect(type.code).toBe("ERR_INVALID_NUMBER");
    const range = thrown(() => divide(1, 0));
    expect(range).toBeInstanceOf(NumericRangeError);
    expect(range).toBeInstanceOf(RangeError);
    expect(range.name).toBe("NumericRangeError");
    expect(range.code).toBe("ERR_DIVISION_BY_ZERO");
  });

  test.each([
    [() => summary(NaN, 1), "ERR_INVALID_NUMBER"],
    [() => summary(1, Infinity), "ERR_INVALID_NUMBER"],
    [() => summary("12abc", "1"), "ERR_INVALID_NUMBER"],
    [() => summary("", "1"), "ERR_INVALID_NUMBER"],
    [() => summary(" 1", "1"), "ERR_INVALID_NUMBER"],
    [() => summary("0x10", "1"), "ERR_INVALID_NUMBER"],
    [() => summary("Infinity", "1"), "ERR_INVALID_NUMBER"],
    [() => summary("NaN", "1"), "ERR_INVALID_NUMBER"],
    [() => summary("1,000", "1"), "ERR_INVALID_NUMBER"],
    [() => summary("1_000", "1"), "ERR_INVALID_NUMBER"],
    [() => summary(null as any, 1), "ERR_INVALID_NUMBER"],
    [() => summary(undefined as any, 1), "ERR_INVALID_NUMBER"],
    [() => summary({} as any, 1), "ERR_INVALID_NUMBER"],
    [() => summary([1] as any, 1), "ERR_INVALID_NUMBER"],
    [() => summary(true as any, 1), "ERR_INVALID_NUMBER"],
    [() => summary(Symbol("x") as any, 1), "ERR_INVALID_NUMBER"],
    [() => factorial(1.5), "ERR_NOT_INTEGER"],
    [() => factorial("1.5"), "ERR_NOT_INTEGER"],
    [() => round(1, 1.5), "ERR_NOT_INTEGER"],
    [() => power(2, 0.5), "ERR_NOT_INTEGER"],
  ])("TypeError codes #%#", (fn, code) => expectCode(fn, TypeError, code));

  test.each([
    [() => divide(1, 0), "ERR_DIVISION_BY_ZERO"],
    [() => divide("1", "0.000"), "ERR_DIVISION_BY_ZERO"],
    [() => modulo(1, 0), "ERR_DIVISION_BY_ZERO"],
    [() => modulo(1n, 0n), "ERR_DIVISION_BY_ZERO"],
    [() => power(0, -1), "ERR_DIVISION_BY_ZERO"],
    [() => multiply(1e200, 1e200), "ERR_OVERFLOW"],
    [() => summary(Number.MAX_VALUE, Number.MAX_VALUE), "ERR_OVERFLOW"],
    [() => multiply("1e299999", "1e299999"), "ERR_OVERFLOW"],
    [() => summary("1e300001", "1"), "ERR_OVERFLOW"],
    [() => summary(10n ** 300_001n, 1n), "ERR_OVERFLOW"],
    [() => multiply(10n ** 299_999n, 10n ** 299_999n), "ERR_OVERFLOW"],
    [() => power(10n, 300_001n), "ERR_OVERFLOW"],
    [() => lcm(10n ** 299_999n + 1n, 10n ** 299_999n + 3n), "ERR_OVERFLOW"],
    [() => sumBig([10n ** 299_999n, 10n ** 299_999n * 9n, 10n ** 299_999n * 9n]), "ERR_OVERFLOW"],
    [() => multiply(1e-200, 1e-200), "ERR_UNDERFLOW"],
    [() => divide(1e-300, 1e300), "ERR_UNDERFLOW"],
    [() => multiply("1e-299999", "1e-299999"), "ERR_UNDERFLOW"],
    [() => summary("1e-300001", "1"), "ERR_UNDERFLOW"],
    [() => round(1, -1), "ERR_OUT_OF_RANGE"],
    [() => round(1, 2, "bogus" as any), "ERR_OUT_OF_RANGE"],
    [() => divide(1, 3, { precision: 0 }), "ERR_OUT_OF_RANGE"],
    [() => divide(1, 3, { precision: 10_001 }), "ERR_OUT_OF_RANGE"],
    [() => clamp(1, 5, 0), "ERR_OUT_OF_RANGE"],
    [() => factorial(-1), "ERR_OUT_OF_RANGE"],
    [() => factorial(171), "ERR_OUT_OF_RANGE"],
    [() => factorial(65_001n), "ERR_OUT_OF_RANGE"],
    [() => fibonacci(1477), "ERR_OUT_OF_RANGE"],
    [() => fibonacci(1_000_001n), "ERR_OUT_OF_RANGE"],
    [() => isPrime(2n ** 2048n + 1n), "ERR_OUT_OF_RANGE"],
    [() => power(2n, -1n), "ERR_OUT_OF_RANGE"],
    [() => power(10, 2_000_000), "ERR_OVERFLOW"],
    [() => power("10", "-2000000"), "ERR_UNDERFLOW"],
  ])("RangeError codes #%#", (fn, code) => expectCode(fn, RangeError, code));

  test("messages name the argument and the offending value", () => {
    expect(thrown(() => summary(NaN, 1)).message).toBe("a must be a finite number, bigint or numeric string, received NaN");
    expect(thrown(() => summary(1, "abc")).message).toContain('b must be a finite number, bigint or numeric string, received "abc"');
    expect(thrown(() => sumBig([1, "x"])).message).toContain("values[1]");
    expect(thrown(() => sumValueInArray([1, NaN])).message).toContain("arr[1]");
    expect(thrown(() => summary("x".repeat(100), 1)).message.length).toBeLessThan(200);
  });

  test("overflow and underflow messages point at the exact alternative", () => {
    expect(thrown(() => multiply(1e200, 1e200)).message).toContain("bigint or numeric-string");
    expect(thrown(() => factorial(171)).message).toContain("factorial(171n)");
  });
});

describe("input parsing", () => {
  test.each(["0", "-0", "+5", "5.", ".5", "-.5e3", "1e5", "1E+5", "1e-5", "007", "0.000", "123456789012345678901234567890"])(
    "accepts %p", (text) => {
      expect(isNumeric(text)).toBe(true);
      expect(() => summary(text, "1")).not.toThrow();
    }
  );
  test.each(["", " ", "1 ", "1e", "e5", "1.2.3", "--1", "+-1", "0b1", "0o7", "1n", "١٢٣", "1e5.5", "∞"])(
    "rejects %p", (text) => {
      expect(isNumeric(text)).toBe(false);
      expectCode(() => summary(text, "1"), TypeError, "ERR_INVALID_NUMBER");
    }
  );
  test("isNumeric never throws", () => {
    expect(isNumeric(1)).toBe(true);
    expect(isNumeric(10n ** 50n)).toBe(true);
    expect(isNumeric(NaN)).toBe(false);
    expect(isNumeric(-Infinity)).toBe(false);
    expect(isNumeric(null)).toBe(false);
    expect(isNumeric(Symbol("s"))).toBe(false);
    expect(isNumeric("1e300001")).toBe(false);
    expect(isNumeric(10n ** 300_001n)).toBe(false);
  });
  test("toDecimalString normalizes to plain notation", () => {
    expect(toDecimalString("1e3")).toBe("1000");
    expect(toDecimalString("+0.50")).toBe("0.5");
    expect(toDecimalString("-0.000")).toBe("0");
    expect(toDecimalString(-0)).toBe("0");
    expect(toDecimalString(1e21)).toBe("1000000000000000000000");
    expect(toDecimalString(1e-7)).toBe("0.0000001");
    expect(toDecimalString(5e-324)).toBe("0." + "0".repeat(323) + "5");
    expect(toDecimalString(Number.MAX_VALUE)).toHaveLength(309);
    expect(toDecimalString(2n ** 100n)).toBe("1267650600228229401496703205376");
    expect(toDecimalString("1e-30")).toBe("0." + "0".repeat(29) + "1");
    expect(toDecimalString(".5")).toBe("0.5");
    expect(toDecimalString("5.")).toBe("5");
  });
});

describe("arithmetic", () => {
  test("number in, number out, free of floating-point drift", () => {
    expect(summary(0.1, 0.2)).toBe(0.3);
    expect(subtract(0.3, 0.1)).toBe(0.2);
    expect(multiply(0.1, 3)).toBe(0.3);
    expect(divide(10, 4)).toBe(2.5);
    expect(divide(1, 3)).toBe(0.3333333333333333);
    expect(summary(9007199254740991, 1)).toBe(9007199254740992);
    expect(multiply(123456789, 987654321)).toBe(123456789 * 987654321); // 121932631112635269 rounds to the nearest double
    expect(summary(Number.MAX_VALUE, -Number.MAX_VALUE)).toBe(0);
    expect(summary(5e-324, 5e-324)).toBe(1e-323);
    expect(Object.is(summary(-0, -0), 0)).toBe(true);
    expect(Object.is(multiply(-1, 0), 0)).toBe(true);
    expect(Object.is(divide(0, -5), 0)).toBe(true);
  });

  test("handles the extremes of the double range", () => {
    expect(summary(Number.MAX_VALUE, 1)).toBe(Number.MAX_VALUE);
    expect(multiply(Number.MAX_VALUE, 0.5)).toBe(Number.MAX_VALUE / 2);
    expect(multiply(Number.MIN_VALUE, 2)).toBe(1e-323);
    expect(divide(Number.MAX_VALUE, Number.MAX_VALUE)).toBe(1);
    expect(divide(Number.MIN_VALUE, Number.MIN_VALUE)).toBe(1);
    expect(subtract(1e308, 1e308)).toBe(0);
    expect(multiply(1e154, 1e154)).toBe(1e308);
    expect(multiply(1e-154, 1e-154)).toBe(1e-308);
  });

  test("bigint in, bigint out", () => {
    expect(summary(2n ** 100n, 1n)).toBe(2n ** 100n + 1n);
    expect(subtract(0n, 2n ** 100n)).toBe(-(2n ** 100n));
    expect(multiply(10n ** 30n, 10n ** 30n)).toBe(10n ** 60n);
    expect(modulo(10n ** 30n, 7n)).toBe(10n ** 30n % 7n);
    expect(modulo(-7n, 3n)).toBe(-1n);
    expect(abs(-(10n ** 40n))).toBe(10n ** 40n);
    expect(typeof summary(1n, 1n)).toBe("bigint");
  });

  test("strings and mixed kinds give exact strings", () => {
    expect(summary("100000000000000000000000000000", "1")).toBe("100000000000000000000000000001");
    expect(summary("0.1", "0.2")).toBe("0.3");
    expect(summary(1, 2n)).toBe("3");
    expect(summary(0.5, "0.25")).toBe("0.75");
    expect(subtract("1e30", "1")).toBe("999999999999999999999999999999");
    expect(multiply("1e-400", "1e-400")).toBe("0." + "0".repeat(799) + "1");
    expect(multiply(HUGE, HUGE)).toBe((BigInt(HUGE) ** 2n).toString());
    expect(summary("-0", "0")).toBe("0");
    expect(summary("1e5", "1e-5")).toBe("100000.00001");
    expect(multiply(2n, "0.5")).toBe("1");
  });

  test("strings survive digits a double cannot hold", () => {
    expect(summary("9007199254740993", "0")).toBe("9007199254740993");
    expect(summary("0.1000000000000000055511151231257827", "0")).toBe("0.1000000000000000055511151231257827");
    expect(subtract("1.00000000000000000000000000001", "1")).toBe("0.00000000000000000000000000001");
  });

  test("runs at the supported limits", () => {
    expect(multiply("1e299999", "10")).toHaveLength(300_001);
    expect(summary("1e-299999", "0").length).toBe(300_001);
    expect(toDecimalString("1e-300000")).toHaveLength(300_002);
    expect(summary(10n ** 299_000n, 1n)).toBe(10n ** 299_000n + 1n);
    expect(multiply(10n ** 149_000n, 10n ** 149_000n)).toBe(10n ** 298_000n);
  }, 30_000);

  test("matches native bigint arithmetic on random operands", () => {
    const next = lcg(42);
    for (let i = 0; i < 300; i++) {
      const a = BigInt(Math.floor(next() * 1e15)) * BigInt(Math.floor(next() * 1e15)) * (next() < 0.5 ? -1n : 1n);
      const b = BigInt(Math.floor(next() * 1e15)) * (next() < 0.5 ? -1n : 1n);
      expect(summary(a.toString(), b.toString())).toBe((a + b).toString());
      expect(subtract(a.toString(), b.toString())).toBe((a - b).toString());
      expect(multiply(a.toString(), b.toString())).toBe((a * b).toString());
      if (b !== 0n) expect(modulo(a.toString(), b.toString())).toBe((a % b).toString());
      expect(summary(a, b)).toBe(a + b);
    }
  });

  test("number results equal the exact decimal result, rounded once", () => {
    const next = lcg(7);
    for (let i = 0; i < 200; i++) {
      const a = Math.round(next() * 1e6) / 1e3;
      const b = Math.round(next() * 1e6) / 1e3;
      expect(summary(a, b)).toBe(Number(summary(String(a), String(b))));
      expect(multiply(a, b)).toBe(Number(multiply(String(a), String(b))));
    }
  });
});

describe("divide", () => {
  test("precision controls non-terminating quotients", () => {
    expect(divide("1", "3")).toBe("0." + "3".repeat(40));
    expect(divide("1", "3", { precision: 5 })).toBe("0.33333");
    expect(divide("2", "3", { precision: 5 })).toBe("0.66667");
    expect(divide("1", "7", { precision: 1 })).toBe("0.1");
    expect(divide(10n ** 30n, 3n)).toBe("333333333333333333333333333333." + "3".repeat(10));
    expect(divide("1", "8")).toBe("0.125");
    expect(divide("1e30", "1e-30", { precision: 3 })).toBe("1" + "0".repeat(60));
  });
  test("exact when the quotient terminates", () => {
    expect(divide("1000000000000000000000000000000", "1000")).toBe("1000000000000000000000000000");
    expect(divide(6, 3)).toBe(2);
    expect(divide(-6, 3)).toBe(-2);
    expect(divide("-0.3", "0.1")).toBe("-3");
  });
  test("zero numerator, signs and tiny quotients", () => {
    expect(divide("0", "5")).toBe("0");
    expect(divide("-1", "3", { precision: 3 })).toBe("-0.333");
    expect(divide("1e-300", "1e300")).toBe("0." + "0".repeat(599) + "1");
    expect(thrown(() => divide(1, 0)).message).toBe("Division by zero");
    expect(thrown(() => divide(0, 0)).message).toBe("Division by zero");
  });
  test("validates options", () => {
    expectCode(() => divide(1, 3, { precision: 1.5 }), TypeError, "ERR_NOT_INTEGER");
    expectCode(() => divide(1, 3, { precision: "5" as any }), TypeError, "ERR_NOT_INTEGER");
    expect(divide("1", "3", { precision: 10_000 })).toHaveLength(10_002);
  });
});

describe("modulo and power", () => {
  test("modulo follows the sign of the dividend, exactly", () => {
    expect(modulo(7, 3)).toBe(1);
    expect(modulo(-7, 3)).toBe(-1);
    expect(modulo(7, -3)).toBe(1);
    expect(modulo(5.5, 2)).toBe(1.5);
    expect(modulo(0.3, 0.1)).toBe(0); // 0.3 % 0.1 is 0.09999999999999998 in floating point
    expect(modulo("1000000000000000000000000000000", "7")).toBe("1");
    expect(modulo("1e300", "7")).toBe((10n ** 300n % 7n).toString());
    expect(modulo("5.5", "-2")).toBe("1.5");
  });
  test("power is exact for integer bases and non-negative exponents", () => {
    expect(power(2, 10)).toBe(1024);
    expect(power(2n, 100n)).toBe(2n ** 100n);
    expect(power("2", 2000)).toBe((2n ** 2000n).toString());
    expect(power(-2, 3)).toBe(-8);
    expect(power(-2, 4)).toBe(16);
    expect(power(7, 0)).toBe(1);
    expect(power(0, 0)).toBe(1);
    expect(power(0, 5)).toBe(0);
    expect(power(1, 1_000_000_000)).toBe(1);
    expect(power(-1, 1_000_000_001)).toBe(-1);
    expect(power(-1, 1_000_000_000)).toBe(1);
    expect(power(10, 22)).toBe(1e22);
    expect(power("10", "300000")).toHaveLength(300_001);
    expect(power(10n, 299_999n)).toBe(10n ** 299_999n);
  });
  test("negative and fractional bases use bounded precision", () => {
    expect(power(2, -2)).toBe(0.25);
    expect(power(10, -3)).toBe(0.001);
    expect(power("2", "-10")).toBe("0.0009765625");
    expect(power(0.1, 3)).toBe(0.001);
    expect(power(1.0000000001, 1e9)).toBeCloseTo(Math.E ** 0.1, 6);
    expect(power("1.5", 3, { precision: 5 })).toBe("3.375");
    expect(power("3", "-1", { precision: 6 })).toBe("0.333333");
  });
  test("number results beyond the double range name the escape hatch", () => {
    expectCode(() => power(2, 2000), RangeError, "ERR_OVERFLOW");
    expectCode(() => power(2, -2000), RangeError, "ERR_UNDERFLOW");
    expect(power(2n, 2000n)).toBe(2n ** 2000n);
  });
  test("rejects exponents it cannot honour", () => {
    expectCode(() => power(2, 1.5), TypeError, "ERR_NOT_INTEGER");
    expectCode(() => power(2, "1e30"), RangeError, "ERR_OVERFLOW");
    expectCode(() => power(2n, -1n), RangeError, "ERR_OUT_OF_RANGE");
  });
});

describe("abs, percentage, clamp, compareNumbers", () => {
  test("abs keeps the kind", () => {
    expect(abs(-5)).toBe(5);
    expect(abs(-0)).toBe(0);
    expect(abs("-1.50")).toBe("1.5");
    expect(abs(-(10n ** 40n))).toBe(10n ** 40n);
    expect(() => abs(NaN)).toThrow(TypeError);
  });
  test("percentage divides last, so nothing is rounded early", () => {
    expect(percentage(1, 3)).toBe(33.333333333333336);
    expect(percentage(25, 200)).toBe(12.5);
    expect(percentage(1, 0)).toBe(0);
    expect(percentage("1", "0")).toBe("0");
    expect(percentage("1", "3", { precision: 10 })).toBe("33.33333333");
    expect(percentage("1e30", "4e30")).toBe("25");
    expect(percentage(50, 50)).toBe(100);
    expect(percentage(-1, 4)).toBe(-25);
    expect(percentage(1n, 8n)).toBe("12.5");
  });
  test("clamp keeps the kind and compares exactly", () => {
    expect(clamp(15, 0, 10)).toBe(10);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(10n ** 30n, 0n, 100n)).toBe(100n);
    expect(clamp("15.5", "0", "10.25")).toBe("10.25");
    expect(clamp("0.1", 0, "0.30000000000000004")).toBe("0.1");
    expect(clamp(1, 1, 1)).toBe(1);
    expect(clamp("1e30", "-1e30", "2e30")).toBe("1000000000000000000000000000000");
    expect(() => clamp(NaN, 0, 1)).toThrow(TypeError);
  });
  test("compareNumbers is exact across kinds", () => {
    expect(compareNumbers(1, 2)).toBe(-1);
    expect(compareNumbers("10", "9")).toBe(1);
    expect(compareNumbers(10n ** 30n, "1e30")).toBe(0);
    expect(compareNumbers(0.1 + 0.2, 0.3)).toBe(1);
    expect(compareNumbers("0.30000000000000004", 0.1 + 0.2)).toBe(0);
    expect(compareNumbers(9007199254740993n, 9007199254740992)).toBe(1);
    expect(compareNumbers(-0, 0)).toBe(0);
    expect(() => compareNumbers(NaN, 1)).toThrow(TypeError);
    expect(quickSort(["10", "9", "100", "1.5", "-3", "1e1"], compareNumbers)).toEqual(["-3", "1.5", "9", "10", "1e1", "100"]);
    expect(findMax(["10", "9", "100"], compareNumbers)).toBe("100");
    expect(findMin([10n ** 30n, 5n, 7n], compareNumbers)).toBe(5n);
  });
});

describe("round", () => {
  test("modes", () => {
    const table: [number, string, number][] = [
      [2.5, "half-up", 3], [-2.5, "half-up", -3], [2.5, "half-down", 2], [-2.5, "half-down", -2],
      [2.5, "half-even", 2], [3.5, "half-even", 4], [-2.5, "half-even", -2],
      [2.1, "up", 3], [-2.1, "up", -3], [2.9, "down", 2], [-2.9, "down", -2],
      [2.1, "ceil", 3], [-2.9, "ceil", -2], [2.9, "floor", 2], [-2.1, "floor", -3],
    ];
    for (const [value, mode, expected] of table) expect(round(value, 0, mode as any)).toBe(expected);
  });
  test("works on decimal values, not binary approximations", () => {
    expect(round(1.005, 2)).toBe(1.01);
    expect(round(1.255, 2)).toBe(1.26);
    expect(round(8.345, 2)).toBe(8.35);
    expect(round(1.45, 1, "half-even")).toBe(1.4);
    expect(round(3.14159)).toBe(3.14);
    expect(round(2.5, 0)).toBe(3);
  });
  test("keeps every digit of strings and handles tiny and huge values", () => {
    expect(round("123456789012345678901234567890.125", 2)).toBe("123456789012345678901234567890.13");
    expect(round("123456789012345678901234567890.125", 2, "half-even")).toBe("123456789012345678901234567890.12");
    expect(round("0.000000000000000000000000000125", 30)).toBe("0.000000000000000000000000000125");
    expect(round("0.000000000000000000000000000125", 29)).toBe("0.00000000000000000000000000013");
    expect(round("1e-400", 2)).toBe("0");
    expect(round(1e-10, 2)).toBe(0);
    expect(round(-1e-10, 2)).toBe(0);
    expect(Object.is(round(-0.001, 2), 0)).toBe(true);
    expect(round(1e300, 2)).toBe(1e300);
    expect(round("9.999", 2)).toBe("10");
    expect(round(5n, 2)).toBe(5n);
    expect(round("1", 300_000)).toBe("1");
  });
  test("validates decimals and mode", () => {
    expect(() => round(1, -1)).toThrow(RangeError);
    expect(() => round(1, 1.5)).toThrow(TypeError);
    expect(() => round(1, 300_001)).toThrow(RangeError);
    expect(() => round(1, 2, "toString" as any)).toThrow(RangeError);
    expect(() => round(1, 2, "__proto__" as any)).toThrow(RangeError);
    expect(() => round(NaN)).toThrow(TypeError);
  });
});

describe("integer functions", () => {
  test("factorial: number, bigint, string", () => {
    expect(factorial(0)).toBe(1);
    expect(factorial(1)).toBe(1);
    expect(factorial(5)).toBe(120);
    expect(factorial(20)).toBe(2432902008176640000);
    expect(factorial(170)).toBe(Number(factorial(170n))); // correctly rounded, unlike a running float product
    expect(factorial(170)).toBe(7.257415615307999e306);
    expect(factorial(25n)).toBe(15511210043330985984000000n);
    expect(factorial("30")).toBe("265252859812191058636308480000000");
    expect(factorial(0n)).toBe(1n);
    expect(factorial(171n).toString()).toHaveLength(310);
    expect(factorial("1e1")).toBe("3628800");
  });
  test("factorial satisfies n! = n * (n-1)! and is fast at the limit", () => {
    for (const n of [2n, 17n, 100n, 999n, 5000n]) expect(factorial(n)).toBe(n * factorial(n - 1n));
    const big = factorial(65_000n);
    expect(big.toString().length).toBeGreaterThan(280_000);
    expect(big.toString().length).toBeLessThan(300_000);
    expect(factorial("65000")).toHaveLength(big.toString().length);
  }, 30_000);
  test("fibonacci: number, bigint, string", () => {
    expect(fibonacci(0)).toBe(0);
    expect(fibonacci(1)).toBe(1);
    expect(fibonacci(10)).toBe(55);
    expect(fibonacci(78)).toBe(8944394323791464);
    expect(fibonacci(1476)).toBe(Number(fibonacci(1476n)));
    expect(fibonacci(1476)).toBe(1.3069892237633993e308);
    expect(fibonacci(100n)).toBe(354224848179261915075n);
    expect(fibonacci("200")).toBe("280571172992510140037611932413038677189525");
    expect(fibonacci(1000n)).toBe(
      43466557686937456435688527675040625802564660517371780402481729089536555417949051890403879840079255169295922593080322634775209689623239873322471161642996440906533187938298969649928516003704476137795166849228875n
    );
  });
  test("fibonacci satisfies the recurrence and is fast at the limit", () => {
    for (const n of [2n, 50n, 500n, 12345n, 99999n]) expect(fibonacci(n)).toBe(fibonacci(n - 1n) + fibonacci(n - 2n));
    expect(fibonacci(1_000_000n).toString()).toHaveLength(208_988);
  }, 30_000);
  test("fibonacci and factorial tables agree with exact values", () => {
    for (const n of [0, 1, 2, 30, 100, 170]) expect(factorial(n)).toBe(Number(factorial(BigInt(n))));
    for (const n of [0, 1, 2, 30, 100, 1476]) expect(fibonacci(n)).toBe(Number(fibonacci(BigInt(n))));
  });
  test("gcd", () => {
    expect(gcd(12, 18)).toBe(6);
    expect(gcd(-12, 18)).toBe(6);
    expect(gcd(0, 5)).toBe(5);
    expect(gcd(0, 0)).toBe(0);
    expect(gcd(0.5, 0.25)).toBe(0.25);
    expect(gcd(0.1, 0.25)).toBe(0.05);
    expect(gcd(Number.MAX_SAFE_INTEGER, 3)).toBe(1);
    expect(gcd(2n ** 100n, 6n ** 50n)).toBe(2n ** 50n);
    expect(gcd(-(2n ** 100n), 0n)).toBe(2n ** 100n);
    expect(gcd("0.000000000000000000000000012", "0.000000000000000000000000018")).toBe("0.000000000000000000000000006");
    expect(gcd(HUGE, "3")).toBe("3");
    expect(gcd(1e300, 1e299)).toBe(1e299);
    expectCode(() => gcd("1e-1001", "1"), RangeError, "ERR_OUT_OF_RANGE");
    expect(() => gcd(NaN, 1)).toThrow(TypeError);
  });
  test("lcm", () => {
    expect(lcm(4, 6)).toBe(12);
    expect(lcm(0, 5)).toBe(0);
    expect(lcm(-4, 6)).toBe(12);
    expect(lcm(0.5, 0.75)).toBe(1.5);
    expect(lcm(10n ** 20n, 15n)).toBe(3n * 10n ** 20n);
    expect(lcm(0n, 7n)).toBe(0n);
    expect(lcm("0.04", "0.06")).toBe("0.12");
    expect(lcm(HUGE, "0")).toBe("0");
    expectCode(() => lcm(Number.MAX_VALUE, Number.MAX_VALUE / 3 + 1e290), RangeError, "ERR_OVERFLOW");
    expect(lcm(2n ** 400n, 3n ** 300n)).toBe(2n ** 400n * 3n ** 300n);
  });
  test("gcd * lcm = |a * b| on random operands", () => {
    const next = lcg(99);
    for (let i = 0; i < 200; i++) {
      const a = BigInt(Math.floor(next() * 1e12)) * 7n;
      const b = BigInt(Math.floor(next() * 1e12)) * 21n;
      expect(gcd(a, b) * lcm(a, b)).toBe(a * b);
    }
  });
  test("isPrime for numbers never throws", () => {
    for (const v of [NaN, Infinity, -Infinity, 0, 1, -7, 2.5, 4, 9, 1e300, 2 ** 53, -(2 ** 53)]) expect(isPrime(v)).toBe(false);
    for (const v of [2, 3, 5, 97, 7919, 1_000_003, 2_147_483_647, 9007199254740881]) expect(isPrime(v)).toBe(true);
  });
  test("isPrime agrees with a sieve", () => {
    const limit = 20_000;
    const composite = new Uint8Array(limit + 1);
    for (let i = 2; i * i <= limit; i++) if (!composite[i]) for (let j = i * i; j <= limit; j += i) composite[j] = 1;
    for (let n = 0; n <= limit; n++) {
      const expected = n >= 2 && !composite[n];
      expect(isPrime(n)).toBe(expected);
      expect(isPrime(BigInt(n))).toBe(expected);
    }
  });
  test("isPrime rejects strong pseudoprimes and Carmichael numbers", () => {
    for (const n of [561n, 41041n, 825265n, 321197185n, 3215031751n, 3825123056546413051n, 318665857834031151167461n, 3317044064679887385961981n]) {
      expect(isPrime(n)).toBe(false);
    }
  });
  test("isPrime on big primes and composites", () => {
    for (const exponent of [61n, 89n, 107n, 127n, 521n, 607n, 1279n]) expect(isPrime(2n ** exponent - 1n)).toBe(true);
    expect(isPrime(2n ** 128n + 1n)).toBe(false);
    expect(isPrime(2n ** 127n + 1n)).toBe(false);
    expect(isPrime((2n ** 61n - 1n) * (2n ** 89n - 1n))).toBe(false);
    expect(isPrime("170141183460469231731687303715884105727")).toBe(true);
    expect(isPrime("170141183460469231731687303715884105728")).toBe(false);
    expect(isPrime(-(2n ** 61n - 1n))).toBe(false);
    expect(isPrime("1e2")).toBe(false);
    expect(isPrime("7.5")).toBe(false);
    expect(isPrime("7.0")).toBe(true);
    expect(isPrime(2n ** 2047n + 1n)).toBe(false);
  }, 30_000);
  test("isPrime validates text and size", () => {
    expectCode(() => isPrime("abc"), TypeError, "ERR_INVALID_NUMBER");
    expectCode(() => isPrime(""), TypeError, "ERR_INVALID_NUMBER");
    expectCode(() => isPrime(2n ** 2048n), RangeError, "ERR_OUT_OF_RANGE");
  });
});

describe("aggregates", () => {
  test("sumValueInArray is exact and never overflows midway", () => {
    expect(sumValueInArray([])).toBe(0);
    expect(sumValueInArray([0.1, 0.2, 0.3])).toBe(0.6);
    expect(sumValueInArray([1e308, 1e308, -1e308])).toBe(1e308);
    expect(sumValueInArray([9007199254740991, 1])).toBe(9007199254740992);
    expect(sumValueInArray([1, 2, 3, 0.5])).toBe(6.5);
    expect(sumValueInArray([1e21, 1, -1e21])).toBe(1);
    expect(sumValueInArray(new Array(10).fill(0.1))).toBe(1);
    expect(Object.is(sumValueInArray([-0, -0]), 0)).toBe(true);
    expectCode(() => sumValueInArray([1e308, 1e308]), RangeError, "ERR_OVERFLOW");
    expectCode(() => sumValueInArray([1, NaN]), TypeError, "ERR_INVALID_NUMBER");
    expectCode(() => sumValueInArray([1, "2" as any]), TypeError, "ERR_INVALID_NUMBER");
    expect(() => sumValueInArray(null as any)).toThrow(TypeError);
  });
  test("sumValueInArray equals the decimal sum on random data", () => {
    const next = lcg(5);
    const values = Array.from({ length: 2000 }, () => Math.round((next() - 0.5) * 1e7) / 1e3);
    expect(sumValueInArray(values)).toBe(Number(sumBig(values.map(String))));
  });
  test("averageValueInArray", () => {
    expect(averageValueInArray([])).toBe(0);
    expect(averageValueInArray([1, 2, 3, 4])).toBe(2.5);
    expect(averageValueInArray([1, 2])).toBe(1.5);
    expect(averageValueInArray([4, 4, 4])).toBe(4);
    expect(averageValueInArray([0.1, 0.2])).toBe(0.15);
    expect(averageValueInArray([1e308, 1e308])).toBe(1e308);
    expect(averageValueInArray([1, 2], { precision: 3 })).toBe(1.5);
    expectCode(() => averageValueInArray([1], { precision: 0 }), RangeError, "ERR_OUT_OF_RANGE");
  });
  test("sumBig and averageBig take any numeric kind", () => {
    expect(sumBig([])).toBe("0");
    expect(sumBig(["0.1", "0.2", 10n ** 30n])).toBe("1000000000000000000000000000000.3");
    expect(sumBig([1n, 2n, 3n])).toBe("6");
    expect(sumBig(["1e30", "-1e30"])).toBe("0");
    expect(sumBig([0.1, 0.2])).toBe("0.3");
    expect(averageBig([])).toBe("0");
    expect(averageBig(["1", "2", "4"], { precision: 6 })).toBe("2.33333");
    expect(averageBig([10n ** 30n, 10n ** 30n])).toBe("1000000000000000000000000000000");
    expect(() => sumBig([1, "x"])).toThrow(TypeError);
    expect(() => sumBig("1" as any)).toThrow(TypeError);
  });
  test("median", () => {
    expect(median([])).toBe(0);
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 3, 2])).toBe(2.5);
    expect(median([0.1, 0.2])).toBe(0.15);
    expect(median([5])).toBe(5);
    expect(median([-5, -1])).toBe(-3);
    expect(median([1e308, 1e308])).toBe(1e308);
    const input = [3, 1, 2];
    median(input);
    expect(input).toEqual([3, 1, 2]);
    expect(() => median([1, NaN])).toThrow(TypeError);
    expect(medianBig([])).toBe("0");
    expect(medianBig(["1e30", 3, 5n, "0.5"])).toBe("4");
    expect(medianBig([10n ** 30n, 1n, 2n])).toBe("2");
    expect(medianBig(["1", "2"])).toBe("1.5");
  });
});

describe("randomInt, range and sorting", () => {
  test("randomInt for numbers and bigints", () => {
    expect(randomInt(1, 6, () => 0)).toBe(1);
    expect(randomInt(1, 6, () => 0.999999)).toBe(6);
    expect(randomInt(5, 5)).toBe(5);
    expect(randomInt(-3, -3)).toBe(-3);
    expect(randomInt(1n, 6n, () => 0)).toBe(1n);
    expect(randomInt(1n, 6n, () => 0.999999999)).toBe(6n);
    expect(randomInt(0n, 10n ** 40n, () => 0)).toBe(0n);
    expect(randomInt(-(10n ** 30n), 10n ** 30n, () => 0)).toBe(-(10n ** 30n));
    expect(randomInt(7n, 7n)).toBe(7n);
    expect(randomInt(0, 2 ** 53 - 1)).toBeGreaterThanOrEqual(0);
    // degenerate generator must still terminate within range
    const stuck = randomInt(0n, 10n ** 40n, () => 0.9999999999);
    expect(stuck >= 0n && stuck <= 10n ** 40n).toBe(true);
    for (let i = 0; i < 100; i++) {
      const v = randomInt(-5n, 5n);
      expect(v >= -5n && v <= 5n).toBe(true);
    }
    expect(() => randomInt(2, 1)).toThrow(RangeError);
    expect(() => randomInt(2n, 1n)).toThrow(RangeError);
    expect(() => randomInt(1.5, 3)).toThrow(TypeError);
    expectCode(() => randomInt(1, 2n as any), TypeError, "ERR_INVALID_NUMBER");
    expectCode(() => randomInt(-(2 ** 53), 2 ** 53), RangeError, "ERR_OUT_OF_RANGE");
    expect(() => randomInt(1, 2, "x" as any)).toThrow(TypeError);
  });
  test("randomInt bigint covers the whole span roughly uniformly", () => {
    const next = lcg(11);
    const seen = new Map<bigint, number>();
    for (let i = 0; i < 6000; i++) {
      const v = randomInt(0n, 5n, next);
      seen.set(v, (seen.get(v) ?? 0) + 1);
    }
    expect([...seen.keys()].sort()).toEqual([0n, 1n, 2n, 3n, 4n, 5n]);
    for (const count of seen.values()) expect(count).toBeGreaterThan(800);
  });
  test("range is exact for fractional steps and bounded", () => {
    expect(range(0, 1, 0.1)).toEqual([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]);
    expect(range(0, 1.1, 0.1)).toHaveLength(11);
    expect(range(0.1, 0.5, 0.1)).toEqual([0.1, 0.2, 0.3, 0.4]);
    expect(range(0.1, 0.4, 0.1)).toEqual([0.1, 0.2, 0.3]); // naive ceil((end - start) / step) gives 4 items
    for (let a = 0; a < 10; a++) for (let b = a + 1; b <= 12; b++) expect(range(a / 10, b / 10, 0.1)).toHaveLength(b - a);
    expect(range(1, 0, -0.25)).toEqual([1, 0.75, 0.5, 0.25]);
    expect(range(5, 5)).toEqual([]);
    expect(range(0, 5, -1)).toEqual([]);
    expect(range(Number.MAX_SAFE_INTEGER - 2, Number.MAX_SAFE_INTEGER)).toEqual([9007199254740989, 9007199254740990]);
    expect(range(0, 10_000_000)).toHaveLength(10_000_000);
    expectCode(() => range(0, 10_000_001), RangeError, "ERR_OUT_OF_RANGE");
    expectCode(() => range(0, 1e9), RangeError, "ERR_OUT_OF_RANGE");
    expectCode(() => range(0, 1, 1e-9), RangeError, "ERR_OUT_OF_RANGE");
    expectCode(() => range(0, 1e16), RangeError, "ERR_OUT_OF_RANGE");
    expectCode(() => range(0, 5, 0), RangeError, "ERR_OUT_OF_RANGE");
    expect(() => range(NaN)).toThrow(TypeError);
  }, 30_000);
  test("countingSort and radixSort handle negatives and match Array#sort", () => {
    const next = lcg(3);
    for (const spread of [10, 1000, 1e6]) {
      const data = Array.from({ length: 500 }, () => Math.round((next() - 0.5) * spread));
      const expected = [...data].sort((a, b) => a - b);
      expect(countingSort(data)).toEqual(expected);
      expect(radixSort(data)).toEqual(expected);
    }
    expect(countingSort([3, -1, 2, -5, 0])).toEqual([-5, -1, 0, 2, 3]);
    expect(countingSort([-3])).toEqual([-3]);
    expect(countingSort([])).toEqual([]);
    expect(radixSort([170, -45, 75, -2, 0, -Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER])).toEqual([
      -Number.MAX_SAFE_INTEGER, -45, -2, 0, 75, 170, Number.MAX_SAFE_INTEGER,
    ]);
    expect(radixSort([])).toEqual([]);
    expect(radixSort([5, 5, 5])).toEqual([5, 5, 5]);
    const input = [3, 1, 2];
    countingSort(input);
    radixSort(input);
    expect(input).toEqual([3, 1, 2]);
  });
  test("radixSort sorts bigints", () => {
    expect(radixSort([10n ** 30n, -5n, 3n, -(10n ** 25n), 0n, 3n])).toEqual([-(10n ** 25n), -5n, 0n, 3n, 3n, 10n ** 30n]);
    const next = lcg(8);
    const data = Array.from({ length: 300 }, () => BigInt(Math.floor((next() - 0.5) * 1e15)) * BigInt(Math.floor(next() * 1e9)));
    expect(radixSort(data)).toEqual([...data].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)));
    expect(radixSort<bigint>([] as bigint[])).toEqual([]);
  });
  test("sort input validation", () => {
    expectCode(() => countingSort([1, NaN]), TypeError, "ERR_INVALID_NUMBER");
    expectCode(() => countingSort([1, "2" as any]), TypeError, "ERR_INVALID_NUMBER");
    expectCode(() => countingSort([1, 1.5]), RangeError, "ERR_OUT_OF_RANGE");
    expectCode(() => countingSort([1, 2 ** 60]), RangeError, "ERR_OUT_OF_RANGE");
    expectCode(() => countingSort([0, 10_000_001]), RangeError, "ERR_OUT_OF_RANGE");
    expectCode(() => countingSort([-5_000_001, 5_000_000]), RangeError, "ERR_OUT_OF_RANGE");
    expect(countingSort([0, 10_000_000])).toHaveLength(2);
    expectCode(() => radixSort([1n, 2] as any), TypeError, "ERR_INVALID_NUMBER");
    expectCode(() => radixSort([1, 2n] as any), TypeError, "ERR_INVALID_NUMBER");
    expectCode(() => radixSort([Infinity]), TypeError, "ERR_INVALID_NUMBER");
    expect(() => radixSort(null as any)).toThrow(TypeError);
  });
  test("default comparison refuses NaN instead of returning a wrong order", () => {
    expectCode(() => findMin([3, NaN, 1]), TypeError, "ERR_INVALID_NUMBER");
    expectCode(() => findMax([NaN, 3, 1]), TypeError, "ERR_INVALID_NUMBER");
    expectCode(() => quickSort([2, NaN, 1]), TypeError, "ERR_INVALID_NUMBER");
    expect(findMin([3, NaN, 1], (a, b) => (Number.isNaN(a) ? 1 : Number.isNaN(b) ? -1 : a - b))).toBe(1);
    expect(findMin([5n, 1n, 3n])).toBe(1n);
    expect(findMax([new Date(1), new Date(5)])?.getTime()).toBe(5);
  });
});

describe("number formatting with large and exact values", () => {
  test("formatNumber keeps every digit of bigint and string input", () => {
    expect(formatNumber(10n ** 30n)).toBe("1,000,000,000,000,000,000,000,000,000,000");
    expect(formatNumber(-(2n ** 100n))).toBe("-1,267,650,600,228,229,401,496,703,205,376");
    expect(formatNumber("123456789012345678901234567890.123456")).toBe("123,456,789,012,345,678,901,234,567,890.123");
    expect(formatNumber("123456789012345678901234567890.123456", "en-US", { maximumFractionDigits: 6 })).toBe("123,456,789,012,345,678,901,234,567,890.123456");
    expect(formatNumber("0.000000000000000000000000000123", "en-US", { maximumFractionDigits: 40 })).toBe("0.000000000000000000000000000123");
    expect(formatNumber("1e21", "en-US")).toBe("1,000,000,000,000,000,000,000");
    expect(formatNumber("1234567.5", "de-DE")).toBe("1.234.567,5");
    expect(formatNumber(10n ** 20n, "vi-VN")).toBe("100.000.000.000.000.000.000");
    expect(formatNumber("-0")).toBe("-0");
  });
  test("formatNumber keeps native behaviour for numbers and validates the rest", () => {
    expect(formatNumber(NaN)).toBe("NaN");
    expect(formatNumber(Infinity)).toBe("∞");
    expect(formatNumber(1234.5)).toBe("1,234.5");
    expectCode(() => formatNumber("12abc"), TypeError, "ERR_INVALID_NUMBER");
    expectCode(() => formatNumber("NaN"), TypeError, "ERR_INVALID_NUMBER");
    expectCode(() => formatNumber("1e300001"), RangeError, "ERR_OVERFLOW");
  });
  test("other formatters accept exact input and still reject NaN / Infinity", () => {
    expect(formatCurrency("12345678901234567890.129", "USD")).toBe("$12,345,678,901,234,567,890.13");
    expect(formatCurrency(10n ** 25n, "EUR", "en-US")).toBe("€10,000,000,000,000,000,000,000,000.00");
    expect(formatCurrency("0.005", "USD")).toBe("$0.01");
    expect(formatCurrency("-0.004", "USD")).toBe("-$0.00");
    expect(formatPercent("0.123456789012345678901234567890", "en-US", { maximumFractionDigits: 20 })).toBe("12.34567890123456789012%");
    expect(formatPercent(1n)).toBe("100%");
    expect(formatCompactNumber("1234567890123")).toBe("1.2T");
    expect(formatCompactNumber(10n ** 30n)).toBe("1,000,000,000,000,000,000T");
    expect(formatCompactNumber("1500", "en-US", { compactDisplay: "long" })).toBe("1.5 thousand");
    expect(formatUnit("12345678901234567890", "meter")).toBe("12,345,678,901,234,567,890 m");
    for (const bad of [NaN, Infinity, "NaN", "1e", null, undefined]) {
      expectCode(() => formatCompactNumber(bad as any), TypeError, "ERR_INVALID_NUMBER");
      expectCode(() => formatPercent(bad as any), TypeError, "ERR_INVALID_NUMBER");
      expectCode(() => formatCurrency(bad as any, "USD"), TypeError, "ERR_INVALID_NUMBER");
      expectCode(() => formatUnit(bad as any, "meter"), TypeError, "ERR_INVALID_NUMBER");
      expectCode(() => formatBytes(bad as any), TypeError, "ERR_INVALID_NUMBER");
    }
  });
  test("repeated formatting with changing options stays correct (instance cache)", () => {
    for (let i = 0; i < 200; i++) {
      expect(formatNumber(1234.5, "en-US", { maximumFractionDigits: i % 4 })).toBe(
        new Intl.NumberFormat("en-US", { maximumFractionDigits: i % 4 }).format(1234.5)
      );
      expect(formatNumber(1234.5, i % 2 ? "de-DE" : "en-US")).toBe(new Intl.NumberFormat(i % 2 ? "de-DE" : "en-US").format(1234.5));
    }
    const locale = new Intl.Locale("de-DE");
    expect(formatNumber(1234.5, locale)).toBe("1.234,5");
    expect(formatNumber(1234.5, ["de-DE", "en-US"])).toBe("1.234,5");
    expect(formatNumber(1234.5)).toBe(new Intl.NumberFormat().format(1234.5));
  });
  test("formatBytes scales exactly up to QB / YiB", () => {
    expect(formatBytes("1500000000000000000000000000000")).toBe("1.5 QB");
    expect(formatBytes(10n ** 27n)).toBe("1 RB");
    expect(formatBytes(10n ** 24n)).toBe("1 YB");
    expect(formatBytes(10n ** 21n)).toBe("1 ZB");
    expect(formatBytes(10n ** 40n)).toBe("10,000,000,000 QB");
    expect(formatBytes(2n ** 80n, { base: 1024 })).toBe("1 YiB");
    expect(formatBytes(2n ** 90n, { base: 1024 })).toBe("1,024 YiB");
    expect(formatBytes(2n ** 70n, { base: 1024 })).toBe("1 ZiB");
    expect(formatBytes(1e30)).toBe("1 QB");
    expect(formatBytes(Number.MAX_VALUE)).toContain(" QB");
    expect(formatBytes("999999999999999999999999999999999")).toBe("1,000 QB");
    expect(formatBytes("999.999")).toBe("1 kB");
    expect(formatBytes("0.999999999999999999999999999999")).toBe("1 B");
    expect(formatBytes("1e-30")).toBe("0 B");
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(-0)).toBe("0 B");
    expect(formatBytes("-0")).toBe("0 B");
    expect(formatBytes(1536, { base: 1024 })).toBe("1.5 KiB");
    expect(formatBytes("1e300", { decimals: 3 })).toMatch(/^1(,000){99}[.,]?0* QB$|^[\d,]+ QB$/);
    expect(formatBytes(1500, { locale: "de-DE" })).toBe("1,5 kB");
    expectCode(() => formatBytes("-1"), RangeError, "ERR_OUT_OF_RANGE");
    expectCode(() => formatBytes(1, { base: 2 as 1000 }), RangeError, "ERR_OUT_OF_RANGE");
    expectCode(() => formatBytes(1, { decimals: 21 }), RangeError, "ERR_OUT_OF_RANGE");
    expectCode(() => formatBytes(1, { decimals: 1.5 }), TypeError, "ERR_NOT_INTEGER");
  });
});

describe("formatDuration with large values", () => {
  test("accepts bigint and strings", () => {
    expect(formatDuration(10n ** 20n)).toBe("1157407407407d 9h 46m 40s");
    expect(formatDuration("3723000")).toBe("1h 2m 3s");
    expect(formatDuration("3723000.9")).toBe("1h 2m 3s");
    expect(formatDuration(999.9)).toBe("999ms");
    expect(formatDuration(1e300).endsWith("s")).toBe(true);
    expect(formatDuration(Number.MAX_SAFE_INTEGER)).toBe("104249991d 8h 59m");
    expect(formatDuration(0n)).toBe("0ms");
    expect(formatDuration(-0)).toBe("0ms");
    expect(() => formatDuration(-1n)).toThrow(RangeError);
    expect(() => formatDuration("-0.5")).toThrow(RangeError);
    expect(() => formatDuration(NaN)).toThrow(TypeError);
    expect(formatDuration(90061000n, { maxUnits: 2 })).toBe("1d 1h");
  });
});

// Bun has no per-test module isolation, which this simulation needs to reset cached Intl state.
const describeIsolated = (globalThis as { Bun?: unknown }).Bun ? describe.skip : describe;

describeIsolated("runtimes without Intl.NumberFormat v3 (Node 18)", () => {
  /** A NumberFormat whose format() converts strings to doubles, like engines before v3. */
  const withLegacyIntl = (run: (api: typeof import("../index")) => void) => {
    const Real = Intl.NumberFormat;
    const Legacy = function (this: unknown, locale?: Intl.LocalesArgument, options?: Intl.NumberFormatOptions) {
      const real = new Real(locale, options);
      return { format: (value: unknown) => real.format(typeof value === "string" ? Number(value) : (value as number)) };
    } as unknown as typeof Intl.NumberFormat;
    (Intl as any).NumberFormat = Legacy;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      jest.isolateModules(() => run(require("../index")));
    } finally {
      (Intl as any).NumberFormat = Real;
    }
  };

  test("accepts strings that survive conversion to a double unchanged", () => {
    withLegacyIntl((api) => {
      expect(api.formatNumber("12.5")).toBe("12.5");
      expect(api.formatNumber("1e21")).toBe("1,000,000,000,000,000,000,000");
      expect(api.formatCurrency("1234.5", "USD")).toBe("$1,234.50");
      expect(api.formatNumber(10n ** 30n)).toBe("1,000,000,000,000,000,000,000,000,000,000");
      expect(api.formatBytes("1500000000000000000000000000000")).toBe("1.5 QB");
    });
  });

  test("refuses, instead of silently rounding, strings a double cannot hold", () => {
    withLegacyIntl((api) => {
      for (const text of ["12345678901234567890.5", "0.1000000000000000055511151231257827", "1e400", "9007199254740993"]) {
        expectCode(() => api.formatNumber(text), RangeError, "ERR_PRECISION_LOSS");
      }
      expectCode(() => api.formatCurrency("12345678901234567890.129", "USD"), RangeError, "ERR_PRECISION_LOSS");
      expect(thrown(() => api.formatNumber("12345678901234567890.5")).message).toContain("Node 20+");
    });
  });
});

describe("exhaustive tables and truncation", () => {
  test("every number-kind factorial (0..170) and Fibonacci (0..1476) equals the exact value rounded once", () => {
    let fact = 1n;
    for (let n = 0; n <= 170; n++) {
      if (n > 0) fact *= BigInt(n);
      expect(factorial(n)).toBe(Number(fact));
    }
    let a = 0n;
    let b = 1n;
    for (let n = 0; n <= 1476; n++) {
      expect(fibonacci(n)).toBe(Number(a));
      [a, b] = [b, a + b];
    }
  });

  test("formatRelativeTime truncates toward zero instead of rounding", () => {
    const now = new Date(2026, 9, 5, 12, 0, 0, 0).getTime();
    const at = (offsetMs: number, numeric: "auto" | "always" = "always") =>
      formatRelativeTime(now + offsetMs, { now, numeric });
    expect(at(-59.6 * 60_000)).toBe("59 minutes ago");
    expect(at(119_000)).toBe("in 1 minute");
    expect(at(59_999)).toBe("in 59 seconds");
    expect(at(-59_999)).toBe("59 seconds ago");
    expect(at(-1.9 * 86_400_000)).toBe("1 day ago");
    expect(at(1.99 * 3_600_000)).toBe("in 1 hour");
    expect(at(2 * 3_600_000 - 1)).toBe("in 1 hour");
    expect(at(2 * 3_600_000)).toBe("in 2 hours");
    expect(at(999)).toBe("in 0 seconds");
    expect(at(-999)).toBe("0 seconds ago"); // the direction survives truncation to zero
    expect(at(-999, "auto")).toBe("now");
    expect(at(0, "auto")).toBe("now");
  });
});
