import { Comparator } from "@/types";
import { divide, summary } from "../math";
import { assertArray } from "../../utils/validate";

/* Array utilities */
const sumValueInArray = (arr: number[]): number => {
  assertArray(arr, "arr");
  return arr.reduce((a, b) => summary(a, b), 0);
};

const averageValueInArray = (arr: number[]): number => {
  assertArray(arr, "arr");
  if (arr.length === 0) return 0;
  return divide(sumValueInArray(arr), arr.length);
};

// O(n) - Find minimum value in array
const findMin = <T>(
  arr: T[],
  compareFn: Comparator<T> = (a, b) => (a < b ? -1 : a > b ? 1 : 0)
): T | undefined => {
  assertArray(arr, "arr");
  if (arr.length === 0) return undefined;

  return arr.reduce((min, current) =>
    compareFn(current, min) < 0 ? current : min
  );
};

// O(n) - Find maximum value in array
const findMax = <T>(
  arr: T[],
  compareFn: Comparator<T> = (a, b) => (a < b ? -1 : a > b ? 1 : 0)
): T | undefined => {
  assertArray(arr, "arr");
  if (arr.length === 0) return undefined;

  return arr.reduce((max, current) =>
    compareFn(current, max) > 0 ? current : max
  );
};

export { sumValueInArray, averageValueInArray, findMin, findMax };
