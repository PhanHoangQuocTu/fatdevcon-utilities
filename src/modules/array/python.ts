import type { Comparator } from "../../types";
import { defaultCompare } from "../../utils/compare";
import { assertFunction, assertInteger } from "../../utils/validate";
import { summary } from "../math/arithmetic";
import type { NumericInput } from "../../utils/numeric";

function assertReadonlyArray(value: unknown, name: string): asserts value is readonly unknown[] {
  if (!Array.isArray(value)) throw new TypeError(`${name} must be an array`);
}

const assertCount = (count: number, name: string): void => {
  assertInteger(count, name);
  if (count < 0) throw new RangeError(`${name} must be a non-negative integer`);
};

/** Returns an immutable ascending sort. The default order supports numbers, strings, bigints and Dates. */
export function sort<T>(array: readonly T[], compareFn: Comparator<T> = defaultCompare): T[] {
  assertReadonlyArray(array, "array");
  assertFunction(compareFn, "compareFn");
  return [...array].sort(compareFn);
}

/** Pairs every item with its zero-based index, or the given integer `startIndex`. */
export function enumerate<T>(array: readonly T[], startIndex = 0): [number, T][] {
  assertReadonlyArray(array, "array");
  assertInteger(startIndex, "startIndex");
  return array.map((item, index) => [startIndex + index, item]);
}

/** The first `count` items in a new array. Counts beyond the length return every item. */
export function take<T>(array: readonly T[], count: number): T[] {
  assertReadonlyArray(array, "array");
  assertCount(count, "count");
  return array.slice(0, count);
}

/** All but the first `count` items in a new array. Counts beyond the length return an empty array. */
export function drop<T>(array: readonly T[], count: number): T[] {
  assertReadonlyArray(array, "array");
  assertCount(count, "count");
  return array.slice(count);
}

/** The first item, or `undefined` for an empty array. */
export function first<T>(array: readonly T[]): T | undefined {
  assertReadonlyArray(array, "array");
  return array[0];
}

/** The last item, or `undefined` for an empty array. */
export function last<T>(array: readonly T[]): T | undefined {
  assertReadonlyArray(array, "array");
  return array[array.length - 1];
}

/** The item with the lowest selected value, retaining the first item on ties. */
export function minBy<T, R>(array: readonly T[], selector: (item: T, index: number) => R, compareFn: Comparator<R> = defaultCompare): T | undefined {
  assertReadonlyArray(array, "array");
  assertFunction(selector, "selector");
  assertFunction(compareFn, "compareFn");
  let selected: T | undefined;
  let selectedValue: R | undefined;
  array.forEach((item, index) => {
    const value = selector(item, index);
    if (selected === undefined || compareFn(value, selectedValue as R) < 0) {
      selected = item;
      selectedValue = value;
    }
  });
  return selected;
}

/** The item with the highest selected value, retaining the first item on ties. */
export function maxBy<T, R>(array: readonly T[], selector: (item: T, index: number) => R, compareFn: Comparator<R> = defaultCompare): T | undefined {
  assertReadonlyArray(array, "array");
  assertFunction(selector, "selector");
  assertFunction(compareFn, "compareFn");
  let selected: T | undefined;
  let selectedValue: R | undefined;
  array.forEach((item, index) => {
    const value = selector(item, index);
    if (selected === undefined || compareFn(value, selectedValue as R) > 0) {
      selected = item;
      selectedValue = value;
    }
  });
  return selected;
}

/**
 * Exact sum of selected numeric values. Its runtime result follows the established arithmetic rule:
 * all numbers return a number, all bigints return a bigint, and mixed/string inputs return a decimal string.
 * An empty array returns `0`.
 */
export function sumBy<T>(array: readonly T[], selector: (item: T, index: number) => NumericInput): NumericInput {
  assertReadonlyArray(array, "array");
  assertFunction(selector, "selector");
  let total: NumericInput = 0;
  let hasValue = false;
  array.forEach((item, index) => {
    const value = selector(item, index);
    total = hasValue ? summary(total, value) : value;
    hasValue = true;
  });
  return total;
}
