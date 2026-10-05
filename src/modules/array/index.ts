import { Comparator } from "@/types";
import { assertArray } from "../../utils/validate";
import { defaultCompare } from "../../utils/compare";

export { sumValueInArray, averageValueInArray } from "../math/aggregate";

// O(n) - Find minimum value in array
const findMin = <T>(
  arr: T[],
  compareFn: Comparator<T> = defaultCompare
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
  compareFn: Comparator<T> = defaultCompare
): T | undefined => {
  assertArray(arr, "arr");
  if (arr.length === 0) return undefined;

  return arr.reduce((max, current) =>
    compareFn(current, max) > 0 ? current : max
  );
};

export { findMin, findMax };
