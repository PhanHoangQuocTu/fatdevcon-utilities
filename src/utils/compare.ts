import { NumericTypeError } from "./errors";

/**
 * Ascending order for numbers, bigints, strings and dates. NaN has no position in
 * a total order, so it is rejected instead of silently producing an unsorted result.
 */
export const defaultCompare = <T>(a: T, b: T): number => {
  if (a < b) return -1;
  if (a > b) return 1;
  if ((typeof a === "number" && Number.isNaN(a)) || (typeof b === "number" && Number.isNaN(b))) {
    throw new NumericTypeError(
      "ERR_INVALID_NUMBER",
      "Cannot order NaN; remove it from the array or pass a compareFn"
    );
  }
  return 0;
};
