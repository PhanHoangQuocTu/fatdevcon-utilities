export type QueryValue = string | number | boolean | null | undefined | readonly (string | number | boolean)[];
export type ParsedQuery = Record<string, string | string[]>;

const UNSAFE_KEYS = new Set(["__proto__", "constructor", "prototype"]);

const isPlainObject = (value: object): boolean => {
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

/** Builds a query string without a leading question mark. Nullish values are omitted and arrays repeat their key. */
export function buildQueryString(values: Record<string, QueryValue>): string {
  if (typeof values !== "object" || values === null || Array.isArray(values) || !isPlainObject(values)) {
    throw new TypeError("values must be a plain object");
  }
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (UNSAFE_KEYS.has(key)) throw new TypeError(`values must not contain the unsafe key "${key}"`);
    if (value === null || value === undefined) continue;
    if (Array.isArray(value)) value.forEach((item) => params.append(key, String(item)));
    else params.append(key, String(value));
  }
  return params.toString();
}

/** Parses a query string into a null-prototype object. Repeated keys become arrays and unsafe keys are rejected. */
export function parseQueryString(query: string): ParsedQuery {
  if (typeof query !== "string") throw new TypeError("query must be a string");
  const result = Object.create(null) as ParsedQuery;
  const params = new URLSearchParams(query.startsWith("?") ? query.slice(1) : query);
  for (const [key, value] of params) {
    if (UNSAFE_KEYS.has(key)) throw new TypeError(`query must not contain the unsafe key "${key}"`);
    const previous = result[key];
    if (previous === undefined) result[key] = value;
    else result[key] = Array.isArray(previous) ? [...previous, value] : [previous, value];
  }
  return result;
}
