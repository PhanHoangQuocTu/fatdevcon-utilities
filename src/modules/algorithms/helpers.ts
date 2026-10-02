import { Comparator } from "@/types";

// O(n) - Merge helper function for merge sort
const merge = <T>(left: T[], right: T[], compareFn: Comparator<T>): T[] => {
  const result: T[] = [];
  let leftIndex = 0;
  let rightIndex = 0;

  while (leftIndex < left.length && rightIndex < right.length) {
    if (compareFn(left[leftIndex], right[rightIndex]) <= 0) {
      result.push(left[leftIndex]);
      leftIndex++;
    } else {
      result.push(right[rightIndex]);
      rightIndex++;
    }
  }

  return [...result, ...left.slice(leftIndex), ...right.slice(rightIndex)];
};

// Helper function for radix sort
const countingSortByDigit = (arr: number[], exp: number): number[] => {
  const count = new Array(10).fill(0);
  const result = new Array(arr.length);

  // Count occurrences of each digit
  for (const num of arr) {
    const digit = Math.floor(num / exp) % 10;
    count[digit]++;
  }

  // Calculate cumulative count
  for (let i = 1; i < 10; i++) {
    count[i] += count[i - 1];
  }

  // Build the result array
  for (let i = arr.length - 1; i >= 0; i--) {
    const digit = Math.floor(arr[i] / exp) % 10;
    result[count[digit] - 1] = arr[i];
    count[digit]--;
  }

  return result;
};

// Helper function for heap sort
const heapify = <T>(
  arr: T[],
  n: number,
  i: number,
  compareFn: Comparator<T>
): void => {
  let largest = i;
  const left = 2 * i + 1;
  const right = 2 * i + 2;

  if (left < n && compareFn(arr[left], arr[largest]) > 0) {
    largest = left;
  }

  if (right < n && compareFn(arr[right], arr[largest]) > 0) {
    largest = right;
  }

  if (largest !== i) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    heapify(arr, n, largest, compareFn);
  }
};

export { merge, countingSortByDigit, heapify };
