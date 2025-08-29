/* Search utilities */

import { Comparator } from "@/types";

// O(log n) - Binary search on sorted array
const binarySearch = <T>(
  arr: T[],
  target: T,
  compareFn: Comparator<T> = (a, b) => (a < b ? -1 : a > b ? 1 : 0)
): number => {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const comparison = compareFn(arr[mid], target);

    if (comparison === 0) {
      return mid;
    } else if (comparison < 0) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return -1;
};

// O(n) - Linear search through array
// Returns the first index of target element, or -1 if not found
const linearSearch = <T>(
  arr: T[],
  target: T,
  compareFn: Comparator<T> = (a, b) => (a < b ? -1 : a > b ? 1 : 0)
): number => {
  for (let i = 0; i < arr.length; i++) {
    if (compareFn(arr[i], target) === 0) {
      return i;
    }
  }
  return -1;
};

export { binarySearch, linearSearch };
