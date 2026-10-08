/** True for null or undefined. */
export function isNil(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

/** True for every value except null and undefined. */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/** True for primitive strings (not boxed String objects). */
export function isString(value: unknown): value is string {
  return typeof value === "string";
}

/** True for finite primitive numbers. NaN and both infinities are false. */
export function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/** True for primitive booleans (not boxed Boolean objects). */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

/** True for callable values. */
export function isFunction(value: unknown): value is (...args: never[]) => unknown {
  return typeof value === "function";
}

/** True for an object or function with a callable `then`; getters that throw produce false. */
export function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  if ((typeof value !== "object" && typeof value !== "function") || value === null) return false;
  try {
    return typeof (value as { then?: unknown }).then === "function";
  } catch {
    return false;
  }
}
