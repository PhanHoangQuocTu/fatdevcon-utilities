import { describeValue } from "./validate";
import { outOfRange } from "./numeric";

/** Call a user-supplied random source and insist on a value in [0, 1); anything else would index out of range. */
export const draw = (random: () => number): number => {
  const value = random();
  if (typeof value !== "number" || !(value >= 0 && value < 1)) {
    throw outOfRange(`random() must return a number from 0 up to, but not including, 1; received ${describeValue(value)}`);
  }
  return value;
};

export const assertRandom = (random: unknown): void => {
  if (typeof random !== "function") {
    throw new TypeError(`random must be a function, received ${describeValue(random)}`);
  }
};
