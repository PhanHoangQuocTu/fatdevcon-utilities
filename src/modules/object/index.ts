import { assertArray, assertFunction, assertObject } from "../../utils/validate";

/* Object utilities */
const deepClone = <T>(obj: T): T => {
  // structuredClone preserves Date, Map, Set, undefined, NaN, BigInt and
  // circular references; it throws DataCloneError for functions/symbols.
  return structuredClone(obj);
};

const mergeObjects = <T extends object, U extends object>(
  target: T,
  source: U
): T & U => {
  assertObject(target, "target");
  assertObject(source, "source");
  return { ...target, ...source };
};

// Keys that would let a merge or path write reach Object.prototype
const UNSAFE_KEYS = new Set(["__proto__", "constructor", "prototype"]);

const hasOwn = (obj: object, key: PropertyKey): boolean =>
  Object.prototype.hasOwnProperty.call(obj, key);

/** True for object literals, `Object.create(null)` and `new Object()`; false for arrays, Dates, Maps and class instances. */
const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (typeof value !== "object" || value === null) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
};

/** Copy of `obj` with only the listed own keys. */
const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  assertObject(obj, "obj");
  assertArray(keys, "keys");
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (hasOwn(obj, key)) result[key] = obj[key];
  }
  return result;
};

/** Copy of `obj` without the listed keys. */
const omit = <T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
  assertObject(obj, "obj");
  assertArray(keys, "keys");
  const excluded = new Set<PropertyKey>(keys);
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    if (!excluded.has(key)) result[key] = (obj as Record<string, unknown>)[key];
  }
  return result as Omit<T, K>;
};

/** Same keys, transformed values. */
const mapValues = <T, R>(
  obj: Record<string, T>,
  fn: (value: T, key: string) => R
): Record<string, R> => {
  assertObject(obj, "obj");
  assertFunction(fn, "fn");
  const result: Record<string, R> = {};
  for (const key of Object.keys(obj)) {
    if (!UNSAFE_KEYS.has(key)) result[key] = fn(obj[key], key);
  }
  return result;
};

/**
 * Recursively merges plain objects into a new object; `source` wins and arrays
 * are replaced, not concatenated. Never writes `__proto__`, `constructor` or
 * `prototype` keys.
 */
const deepMerge = <T extends object, U extends object>(target: T, source: U): T & U => {
  assertObject(target, "target");
  assertObject(source, "source");
  const result: Record<string, unknown> = {};
  const assign = (from: Record<string, unknown>) => {
    for (const key of Object.keys(from)) {
      if (UNSAFE_KEYS.has(key)) continue;
      const value = from[key];
      const existing = result[key];
      result[key] = isPlainObject(value)
        ? deepMerge(isPlainObject(existing) ? existing : {}, value)
        : isPlainObject(value) ? {} : value;
    }
  };
  assign(target as Record<string, unknown>);
  assign(source as Record<string, unknown>);
  return result as T & U;
};

const parsePath = (path: string | (string | number)[]): string[] => {
  if (Array.isArray(path)) return path.map(String);
  if (typeof path !== "string") throw new TypeError("path must be a string or an array");
  return path.split(/[.[\]]+/).filter(Boolean);
};

/** Safe deep read: getByPath(user, "address.lines[0]", "n/a"). Only own properties are followed. */
const getByPath = (
  obj: unknown,
  path: string | (string | number)[],
  defaultValue?: unknown
): unknown => {
  let current: unknown = obj;
  for (const key of parsePath(path)) {
    if (current === null || current === undefined) return defaultValue;
    const target = Object(current);
    if (!hasOwn(target, key)) return defaultValue;
    current = target[key];
  }
  return current === undefined ? defaultValue : current;
};

/**
 * Immutable deep write: returns a copy of `obj` with `value` at `path`, sharing everything it did not touch.
 * Missing or primitive intermediates become arrays when the next key is an index, otherwise objects.
 * Throws for `__proto__`, `constructor` and `prototype` keys, and when the path crosses a Map, Date or class instance.
 */
const setByPath = <T extends object>(obj: T, path: string | (string | number)[], value: unknown): T => {
  if (typeof obj !== "object" || obj === null) throw new TypeError("obj must be an object or an array");
  const keys = parsePath(path);
  if (keys.length === 0) throw new RangeError("path must contain at least one key");
  const unsafe = keys.find((key) => UNSAFE_KEYS.has(key));
  if (unsafe !== undefined) throw new TypeError(`path must not contain the unsafe key "${unsafe}"`);
  const write = (node: unknown, depth: number): unknown => {
    const key = keys[depth];
    let copy: Record<string, unknown>;
    if (Array.isArray(node)) copy = [...node] as unknown as Record<string, unknown>;
    else if (isPlainObject(node)) copy = { ...node };
    else if (node === null || typeof node !== "object") copy = (/^(?:0|[1-9]\d*)$/.test(key) ? [] : {}) as Record<string, unknown>;
    else throw new TypeError(`path crosses a non-plain object at "${keys.slice(0, depth).join(".") || "(root)"}"`);
    copy[key] = depth === keys.length - 1 ? value : write(hasOwn(copy, key) ? copy[key] : undefined, depth + 1);
    return copy;
  };
  return write(obj, 0) as T;
};

/**
 * Structural equality using SameValueZero for primitives (NaN equals NaN).
 * Handles arrays, plain objects, Date, RegExp, Map, Set and circular references.
 */
const deepEqual = (a: unknown, b: unknown): boolean => {
  const seen = new WeakMap<object, object>();
  const compare = (x: unknown, y: unknown): boolean => {
    if (x === y || (x !== x && y !== y)) return true;
    if (typeof x !== "object" || typeof y !== "object" || x === null || y === null) return false;
    if (Object.getPrototypeOf(x) !== Object.getPrototypeOf(y)) return false;
    if (seen.get(x) === y) return true;
    seen.set(x, y);
    if (x instanceof Date) return x.getTime() === (y as Date).getTime();
    if (x instanceof RegExp) return String(x) === String(y);
    if (x instanceof Map) {
      const other = y as Map<unknown, unknown>;
      return x.size === other.size && [...x].every(([k, v]) => other.has(k) && compare(v, other.get(k)));
    }
    if (x instanceof Set) {
      const other = y as Set<unknown>;
      return x.size === other.size && [...x].every((v) => other.has(v));
    }
    const keysX = Object.keys(x);
    return (
      keysX.length === Object.keys(y).length &&
      keysX.every((key) => hasOwn(y, key) && compare((x as any)[key], (y as any)[key]))
    );
  };
  return compare(a, b);
};

/** True for null/undefined, "", [], empty Map/Set and plain objects with no keys; false for every other value. */
const isEmpty = (value: unknown): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === "string" || Array.isArray(value)) return value.length === 0;
  if (value instanceof Map || value instanceof Set) return value.size === 0;
  if (isPlainObject(value)) return Object.keys(value).length === 0;
  return false;
};

export {
  deepClone,
  mergeObjects,
  deepMerge,
  deepEqual,
  isPlainObject,
  isEmpty,
  pick,
  omit,
  mapValues,
  getByPath,
  setByPath,
};
