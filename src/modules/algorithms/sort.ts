import { Comparator } from "@/types";
import { assertArray, describeValue } from "../../utils/validate";
import { invalidNumber, outOfRange } from "../../utils/numeric";
import { defaultCompare } from "../../utils/compare";
import { heapify, merge } from "./helpers";

// Widest value range (max - min) counting sort will allocate counters for
const MAX_COUNTING_SORT_RANGE = 10_000_000;

const assertSafeIntegers = (arr: unknown[]): void => {
  assertArray(arr, "arr");
  for (let i = 0; i < arr.length; i++) {
    const num = arr[i];
    if (typeof num !== "number" || !Number.isFinite(num)) throw invalidNumber(`arr[${i}]`, num);
    if (!Number.isSafeInteger(num)) {
      throw outOfRange(`Only safe integers are supported, received ${describeValue(num)} at index ${i}`);
    }
  }
};

// O(n log n) average, O(n²) worst case - Quick sort
const quickSort = <T>(
  arr: T[],
  compareFn: Comparator<T> = defaultCompare
): T[] => {
  assertArray(arr, "arr");
  if (arr.length <= 1) return [...arr];

  // Middle pivot + three-way partition: avoids O(n²) on sorted input and
  // on arrays with many duplicates
  const pivot = arr[Math.floor(arr.length / 2)];
  const left: T[] = [];
  const equal: T[] = [];
  const right: T[] = [];

  for (const item of arr) {
    const cmp = compareFn(item, pivot);
    if (cmp < 0) left.push(item);
    else if (cmp > 0) right.push(item);
    else equal.push(item);
  }

  return [
    ...quickSort(left, compareFn),
    ...equal,
    ...quickSort(right, compareFn),
  ];
};

// O(n log n) - Merge sort
const mergeSort = <T>(
  arr: T[],
  compareFn: Comparator<T> = defaultCompare
): T[] => {
  assertArray(arr, "arr");
  if (arr.length <= 1) return [...arr];

  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid), compareFn);
  const right = mergeSort(arr.slice(mid), compareFn);

  return merge(left, right, compareFn);
};

// O(n²) - Insertion sort (efficient for small arrays)
// Best case O(n) when array is nearly sorted
export const insertionSort = <T>(
  arr: T[],
  compareFn: Comparator<T> = defaultCompare
): T[] => {
  assertArray(arr, "arr");
  const result = [...arr];
  for (let i = 1; i < result.length; i++) {
    const current = result[i];
    let j = i - 1;
    while (j >= 0 && compareFn(result[j], current) > 0) {
      result[j + 1] = result[j];
      j--;
    }
    result[j + 1] = current;
  }
  return result;
};

// O(n²) - Selection sort (minimal swaps)
// Always performs O(n²) comparisons (no early exit)
export const selectionSort = <T>(
  arr: T[],
  compareFn: Comparator<T> = defaultCompare
): T[] => {
  assertArray(arr, "arr");
  const result = [...arr];
  for (let i = 0; i < result.length - 1; i++) {
    let minIndex = i;
    for (let j = i + 1; j < result.length; j++) {
      if (compareFn(result[j], result[minIndex]) < 0) {
        minIndex = j;
      }
    }
    if (minIndex !== i) {
      [result[i], result[minIndex]] = [result[minIndex], result[i]];
    }
  }
  return result;
};

// O(n²) - Optimized bubble sort with early exit
// Best case O(n) when array is already sorted
export const bubbleSort = <T>(
  arr: T[],
  compareFn: Comparator<T> = defaultCompare
): T[] => {
  assertArray(arr, "arr");
  const result = [...arr];
  let swapped: boolean;

  for (let i = 0; i < result.length - 1; i++) {
    swapped = false;
    for (let j = 0; j < result.length - i - 1; j++) {
      if (compareFn(result[j], result[j + 1]) > 0) {
        [result[j], result[j + 1]] = [result[j + 1], result[j]];
        swapped = true;
      }
    }
    if (!swapped) break; // Early exit if no swaps
  }

  return result;
};

// O(n log n) - Heap sort (in-place, not stable)
export const heapSort = <T>(
  arr: T[],
  compareFn: Comparator<T> = defaultCompare
): T[] => {
  assertArray(arr, "arr");
  const result = [...arr];
  const n = result.length;

  // Build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(result, n, i, compareFn);
  }

  // Extract elements from heap one by one
  for (let i = n - 1; i > 0; i--) {
    [result[0], result[i]] = [result[i], result[0]];
    heapify(result, i, 0, compareFn);
  }

  return result;
};

// O(n + k) - Counting sort for integers (negatives included),
// where k is the range max - min
export const countingSort = (arr: number[]): number[] => {
  assertSafeIntegers(arr);
  if (arr.length <= 1) return [...arr];

  let min = arr[0];
  let max = arr[0];
  for (const num of arr) {
    if (num < min) min = num;
    if (num > max) max = num;
  }
  const range = max - min;
  if (range > MAX_COUNTING_SORT_RANGE) {
    throw outOfRange(
      `Value range ${range} exceeds counting sort limit of ${MAX_COUNTING_SORT_RANGE}; use radixSort or mergeSort`
    );
  }

  const count = new Uint32Array(range + 1);
  for (const num of arr) count[num - min]++;
  for (let i = 1; i <= range; i++) count[i] += count[i - 1];

  // Walk backwards so equal values keep their relative order
  const result = new Array<number>(arr.length);
  for (let i = arr.length - 1; i >= 0; i--) {
    result[--count[arr[i] - min]] = arr[i];
  }
  return result;
};

// LSD radix sort on non-negative safe integers, one byte per pass
const radixSortMagnitudes = (values: Float64Array): Float64Array => {
  let max = 0;
  for (const v of values) if (v > max) max = v;
  let source: Float64Array = values;
  let target: Float64Array = new Float64Array(values.length);
  const count = new Uint32Array(256);
  for (let divisor = 1; divisor <= max; divisor *= 256) {
    count.fill(0);
    for (let i = 0; i < source.length; i++) count[Math.floor(source[i] / divisor) % 256]++;
    for (let i = 1; i < 256; i++) count[i] += count[i - 1];
    for (let i = source.length - 1; i >= 0; i--) {
      target[--count[Math.floor(source[i] / divisor) % 256]] = source[i];
    }
    [source, target] = [target, source];
  }
  return source;
};

// LSD radix sort on non-negative bigints, 16 bits per pass
const radixSortBigMagnitudes = (values: bigint[]): bigint[] => {
  let max = 0n;
  for (const v of values) if (v > max) max = v;
  let source = values;
  let target = new Array<bigint>(values.length);
  const count = new Uint32Array(65536);
  for (let shift = 0n; max >> shift > 0n; shift += 16n) {
    count.fill(0);
    for (const v of source) count[Number((v >> shift) & 0xffffn)]++;
    for (let i = 1; i < 65536; i++) count[i] += count[i - 1];
    for (let i = source.length - 1; i >= 0; i--) {
      target[--count[Number((source[i] >> shift) & 0xffffn)]] = source[i];
    }
    [source, target] = [target, source];
  }
  return source;
};

// O(d * n) - Radix sort for integers (negatives included), where d is the
// number of digits of the largest magnitude. Accepts safe integers or bigints.
export function radixSort(arr: number[]): number[];
export function radixSort(arr: bigint[]): bigint[];
export function radixSort(arr: (number | bigint)[]): (number | bigint)[] {
  assertArray(arr, "arr");
  if (arr.length > 0 && typeof arr[0] === "bigint") {
    for (let i = 0; i < arr.length; i++) {
      if (typeof arr[i] !== "bigint") throw invalidNumber(`arr[${i}]`, arr[i]);
    }
    const items = arr as bigint[];
    const negatives = radixSortBigMagnitudes(items.filter((v) => v < 0n).map((v) => -v)).reverse().map((v) => -v);
    return negatives.concat(radixSortBigMagnitudes(items.filter((v) => v >= 0n)));
  }
  assertSafeIntegers(arr);
  if (arr.length <= 1) return [...arr];
  const numbers = arr as number[];
  const negatives: number[] = [];
  const positives: number[] = [];
  for (const v of numbers) (v < 0 ? negatives : positives).push(v < 0 ? -v : v);
  const sortedNegatives = Array.from(radixSortMagnitudes(Float64Array.from(negatives)), (v) => -v).reverse();
  return sortedNegatives.concat(Array.from(radixSortMagnitudes(Float64Array.from(positives))));
}

export { quickSort, mergeSort };
