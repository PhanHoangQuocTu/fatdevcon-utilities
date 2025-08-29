import { Comparator } from "@/types";
import { countingSortByDigit, heapify, merge } from "../helper";

// O(n log n) average, O(n²) worst case - Quick sort
const quickSort = <T>(
  arr: T[],
  compareFn: Comparator<T> = (a, b) => (a < b ? -1 : a > b ? 1 : 0)
): T[] => {
  if (arr.length <= 1) return [...arr];

  const pivot = arr[0];
  const left: T[] = [];
  const right: T[] = [];

  for (let i = 1; i < arr.length; i++) {
    if (compareFn(arr[i], pivot) <= 0) {
      left.push(arr[i]);
    } else {
      right.push(arr[i]);
    }
  }

  return [...quickSort(left, compareFn), pivot, ...quickSort(right, compareFn)];
};

// O(n log n) - Merge sort
const mergeSort = <T>(
  arr: T[],
  compareFn: Comparator<T> = (a, b) => (a < b ? -1 : a > b ? 1 : 0)
): T[] => {
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
  compareFn: Comparator<T> = (a, b) => (a < b ? -1 : a > b ? 1 : 0)
): T[] => {
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
  compareFn: Comparator<T> = (a, b) => (a < b ? -1 : a > b ? 1 : 0)
): T[] => {
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
  compareFn: Comparator<T> = (a, b) => (a < b ? -1 : a > b ? 1 : 0)
): T[] => {
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
  compareFn: Comparator<T> = (a, b) => (a < b ? -1 : a > b ? 1 : 0)
): T[] => {
  const result = [...arr];
  let n = result.length;

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

// O(n + k) - Counting sort for non-negative integers
// where k is the range of input
export const countingSort = (arr: number[]): number[] => {
  if (arr.length <= 1) return [...arr];

  const max = Math.max(...arr);
  const count = new Array(max + 1).fill(0);
  const result = new Array(arr.length);

  // Count occurrences
  for (const num of arr) {
    count[num]++;
  }

  // Calculate cumulative count
  for (let i = 1; i <= max; i++) {
    count[i] += count[i - 1];
  }

  // Place elements in sorted order
  for (let i = arr.length - 1; i >= 0; i--) {
    result[count[arr[i]] - 1] = arr[i];
    count[arr[i]]--;
  }

  return result;
};

// O(nk) - Radix sort for non-negative integers
// where k is the number of digits in the maximum number
export const radixSort = (arr: number[]): number[] => {
  if (arr.length <= 1) return [...arr];

  const max = Math.max(...arr);
  let result = [...arr];

  // Do counting sort for every digit
  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    result = countingSortByDigit(result, exp);
  }

  return result;
};

export { quickSort, mergeSort };
