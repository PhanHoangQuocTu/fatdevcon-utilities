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

/**
 * Convert primitive numbers, BigInts and trimmed ASCII decimal/scientific strings.
 * Invalid data, unsafe integer results, overflow and nonzero underflow return null.
 * Fractional values use ordinary binary floating-point rounding; use exact math for
 * decimal precision. Objects and booleans are never coerced. Preserves negative zero.
 */
export function safeToNumber(value: unknown): number | null {
  if (typeof value === "bigint") {
    return value <= BigInt(Number.MAX_SAFE_INTEGER) && value >= BigInt(Number.MIN_SAFE_INTEGER) ? Number(value) : null;
  }
  if (typeof value === "string") {
    const text = value.trim();
    if (!DECIMAL_TEXT.test(text)) return null;
    const result = Number(text);
    if (result === 0) {
      const exponent = text.search(/[eE]/);
      if (/[1-9]/.test(exponent < 0 ? text : text.slice(0, exponent))) return null;
    }
    return Number.isFinite(result) && (!Number.isInteger(result) || Number.isSafeInteger(result)) ? result : null;
  }
  return typeof value === "number" && Number.isFinite(value)
    && (!Number.isInteger(value) || Number.isSafeInteger(value)) ? value : null;
}

const INTEGER_TEXT = /^[+-]?\d+$/;

/** Safe integer or null. Trimmed string input must be signed decimal digits (no dot/exponent); never truncates. */
export function safeToInteger(value: unknown): number | null {
  if (typeof value === "string") {
    const text = value.trim();
    if (!INTEGER_TEXT.test(text)) return null;
    const result = Number(text);
    return Number.isSafeInteger(result) ? result : null;
  }
  const result = safeToNumber(value);
  return result !== null && Number.isSafeInteger(result) ? result : null;
}

/** BigInt or null from BigInts, safe integer numbers or trimmed signed decimal digits. No dot, exponent or radix prefix. */
export function safeToBigInt(value: unknown): bigint | null {
  if (typeof value === "bigint") return value;
  if (typeof value === "number") return Number.isSafeInteger(value) ? BigInt(value) : null;
  if (typeof value !== "string") return null;
  const text = value.trim();
  return INTEGER_TEXT.test(text) ? BigInt(text) : null;
}

/** Booleans, numeric 0/1, or trimmed case-insensitive "true"/"false"/"1"/"0"; all other values return null. */
export function safeToBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") value = value.trim().toLowerCase();
  if (value === 1 || value === "1" || value === "true") return true;
  if (value === 0 || value === "0" || value === "false") return false;
  return null;
}

/**
 * Display primitives, valid Dates, arrays and plain objects using toString's policy.
 * Nullish/nonfinite values, invalid Dates, unsupported types and synchronous
 * conversion failures return null. Arrays/objects use JSON (including getters and
 * toJSON); this is not lossless serialization or a sandbox for user callbacks.
 */
export function safeToString(value: unknown): string | null {
  if (value === null || value === undefined || (typeof value === "number" && !Number.isFinite(value))) return null;
  try {
    if (value instanceof Date && !Number.isFinite(value.getTime())) return null;
    const result = toString(value);
    return typeof result === "string" ? result : null;
  } catch {
    return null;
  }
}
