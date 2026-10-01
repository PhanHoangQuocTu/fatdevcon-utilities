import {
  summary,
  divide,
  percentage,
  round,
  factorial,
  fibonacci,
  gcd,
  lcm,
  isPrime,
  chunk,
  flatten,
  groupBy,
  findMin,
  deepClone,
  formatDate,
  countingSort,
  radixSort,
  quickSort,
  binarySearch,
} from "../index";

describe("Edge cases and error handling", () => {
  test("math rejects non-finite input", () => {
    expect(() => summary(NaN, 1)).toThrow(TypeError);
    expect(() => divide(1, Infinity)).toThrow(TypeError);
    expect(() => percentage(NaN, 1)).toThrow(TypeError);
    expect(() => gcd(1, NaN)).toThrow(TypeError);
    expect(() => lcm(Infinity, 2)).toThrow(TypeError);
    expect(() => divide(1, 0)).toThrow(RangeError);
  });

  test("round validates decimals", () => {
    expect(() => round(1.234, -1)).toThrow(RangeError);
    expect(() => round(1.234, 1.5)).toThrow(TypeError);
    expect(round(1.236, 2)).toBe(1.24);
  });

  test("factorial validates input and range", () => {
    expect(() => factorial(Infinity)).toThrow(TypeError);
    expect(() => factorial(NaN)).toThrow(TypeError);
    expect(() => factorial(1.5)).toThrow(TypeError);
    expect(() => factorial(171)).toThrow(RangeError);
    expect(Number.isFinite(factorial(170))).toBe(true);
  });

  test("fibonacci validates input and range", () => {
    expect(() => fibonacci(Infinity)).toThrow(TypeError);
    expect(() => fibonacci(1.5)).toThrow(TypeError);
    expect(() => fibonacci(1477)).toThrow(RangeError);
    expect(Number.isFinite(fibonacci(1476))).toBe(true);
  });

  test("isPrime rejects NaN and non-integers", () => {
    expect(isPrime(NaN)).toBe(false);
    expect(isPrime(2.5)).toBe(false);
    expect(isPrime(Infinity)).toBe(false);
  });

  test("chunk validates size", () => {
    expect(() => chunk([1, 2, 3], 0)).toThrow(RangeError);
    expect(() => chunk([1, 2, 3], -1)).toThrow(RangeError);
    expect(() => chunk([1, 2, 3], 1.5)).toThrow(TypeError);
    expect(chunk([1, 2, 3], 2)).toEqual([[1, 2], [3]]);
  });

  test("array helpers reject non-arrays", () => {
    expect(() => findMin(null as unknown as number[])).toThrow(TypeError);
    expect(() => binarySearch(undefined as unknown as number[], 1)).toThrow(
      TypeError
    );
    expect(() => flatten(null as unknown as number[][])).toThrow(TypeError);
  });

  test("flatten handles large inputs", () => {
    const big = Array.from({ length: 50000 }, () => [1, 2]);
    expect(flatten(big)).toHaveLength(100000);
  });

  test("groupBy is safe with __proto__ keys", () => {
    const result = groupBy([{ k: "__proto__" }, { k: "a" }], (x) => x.k);
    expect(result["__proto__"]).toEqual([{ k: "__proto__" }]);
    expect(result["a"]).toEqual([{ k: "a" }]);
  });

  test("countingSort / radixSort validate input", () => {
    expect(() => countingSort([3, -1, 2])).toThrow(RangeError);
    expect(() => countingSort([1, 1.5])).toThrow(RangeError);
    expect(() => countingSort([1, 1e10])).toThrow(RangeError);
    expect(() => radixSort([3, -1, 2])).toThrow(RangeError);
    expect(() => radixSort([1.5, 2])).toThrow(RangeError);
    expect(countingSort([3, 1, 2])).toEqual([1, 2, 3]);
    expect(radixSort([170, 45, 75, 2])).toEqual([2, 45, 75, 170]);
  });

  test("sorts handle large arrays without stack overflow", () => {
    const big = Array.from({ length: 200000 }, (_, i) => i % 1000);
    expect(countingSort(big)).toHaveLength(200000);
    expect(radixSort(big)).toHaveLength(200000);
  });

  test("quickSort handles sorted and duplicate-heavy input", () => {
    const sorted = Array.from({ length: 20000 }, (_, i) => i);
    expect(quickSort(sorted)).toEqual(sorted);
    expect(quickSort(new Array(20000).fill(7))).toHaveLength(20000);
    expect(quickSort([3, 1, 2, 3, 1])).toEqual([1, 1, 2, 3, 3]);
  });

  test("deepClone preserves rich types and circular refs", () => {
    const circular: Record<string, unknown> = { d: new Date(0), u: undefined };
    circular.self = circular;
    const copy = deepClone(circular);
    expect(copy).not.toBe(circular);
    expect(copy.d).toEqual(new Date(0));
    expect("u" in copy).toBe(true);
    expect(copy.self).toBe(copy);
    expect(deepClone(new Map([[1, 2]])).get(1)).toBe(2);
  });

  test("formatDate throws a clear error for invalid dates", () => {
    expect(() => formatDate("abc", "yyyy")).toThrow("Invalid date: abc");
  });
});
