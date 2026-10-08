/** A non-throwing JSON operation result. `ok: false` preserves the original failure. */
export type SafeJsonResult<T> = { ok: true; value: T } | { ok: false; error: unknown };

/** Parses JSON into an unknown value without pretending that a TypeScript generic validates it at runtime. */
export function safeJsonParse(text: string): SafeJsonResult<unknown> {
  if (typeof text !== "string") throw new TypeError("text must be a string");
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (error) {
    return { ok: false, error };
  }
}

/** Stringifies JSON without swallowing cycles, BigInt values or custom serialization failures. */
export function safeJsonStringify(value: unknown): SafeJsonResult<string | undefined> {
  try {
    return { ok: true, value: JSON.stringify(value) };
  } catch (error) {
    return { ok: false, error };
  }
}

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (typeof value !== "object" || value === null) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

const DECIMAL_TEXT = /^[+-]?(?:(?:\d+(?:\.\d*)?)|(?:\.\d+))(?:[eE][+-]?\d+)?$/;

/**
 * Deterministic display conversion for primitives, valid Dates, arrays and plain objects.
 * Arrays and plain objects use JSON and therefore reject cycles and nested BigInts instead of losing information.
 */
export function toString(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean" || typeof value === "bigint" || typeof value === "symbol") {
    return String(value);
  }
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? "Invalid Date" : value.toISOString();
  if (Array.isArray(value) || isPlainObject(value)) {
    try {
      return JSON.stringify(value);
    } catch (error) {
      const detail = error instanceof Error ? `: ${error.message}` : "";
      throw new TypeError(`value cannot be represented as deterministic JSON${detail}`);
    }
  }
  throw new TypeError("value must be a primitive, Date, array or plain object");
}

/** Strict number conversion. It rejects blank text, non-finite values and unsafe integer text/BigInts. */
export function toNumber(value: number | bigint | string): number {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError("value must be a finite number");
    return value;
  }
  if (typeof value === "bigint") {
    if (value > BigInt(Number.MAX_SAFE_INTEGER) || value < BigInt(Number.MIN_SAFE_INTEGER)) {
      throw new RangeError("value is outside the safe integer range for number conversion");
    }
    return Number(value);
  }
  if (typeof value !== "string" || value.trim() !== value || !DECIMAL_TEXT.test(value)) throw new TypeError("value must be a non-empty decimal numeric string");
  const result = Number(value);
  if (!Number.isFinite(result)) throw new RangeError("value must be finite and within the JavaScript number range");
  if (Number.isInteger(result) && !Number.isSafeInteger(result)) {
    throw new RangeError("integer text is outside the safe integer range for number conversion");
  }
  return result;
}

/** Strict boolean conversion: accepts booleans, 0/1 and the lower-case strings "true" / "false" only. */
export function toBoolean(value: boolean | number | string): boolean {
  if (typeof value === "boolean") return value;
  if (value === 0 || value === "false") return false;
  if (value === 1 || value === "true") return true;
  throw new TypeError("value must be a boolean, 0, 1, \"true\" or \"false\"");
}

/** Returns a shallow copy for arrays, an empty array for nullish input, otherwise a one-item array. */
export function toArray<T>(value: T | readonly T[] | null | undefined): T[] {
  if (value === null || value === undefined) return [];
  return Array.isArray(value) ? [...value] as T[] : [value as T];
}
