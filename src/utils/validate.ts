import { NumericTypeError } from "./errors";

/** Safe, bounded description of any value for use in error messages. */
export const describeValue = (value: unknown): string => {
  try {
    if (typeof value === "string") {
      const shown = value.length > 40 ? `${value.slice(0, 37)}...` : value;
      return JSON.stringify(shown);
    }
    if (typeof value === "bigint") return `${value}n`;
    if (typeof value === "object" && value !== null) return Array.isArray(value) ? "an array" : "an object";
    return String(value);
  } catch {
    return `a value of type ${typeof value}`;
  }
};

export const assertFiniteNumber = (value: unknown, name: string): void => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new NumericTypeError(
      "ERR_INVALID_NUMBER",
      `${name} must be a finite number, received ${describeValue(value)}`
    );
  }
};

export const assertInteger = (value: unknown, name: string): void => {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new NumericTypeError(
      "ERR_NOT_INTEGER",
      `${name} must be an integer, received ${describeValue(value)}`
    );
  }
};

export const assertArray = (value: unknown, name: string): void => {
  if (!Array.isArray(value)) {
    throw new TypeError(`${name} must be an array, received ${describeValue(value)}`);
  }
};

export const assertFunction = (value: unknown, name: string): void => {
  if (typeof value !== "function") {
    throw new TypeError(`${name} must be a function, received ${describeValue(value)}`);
  }
};

export const assertObject = (value: unknown, name: string): void => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TypeError(`${name} must be an object, received ${describeValue(value)}`);
  }
};
