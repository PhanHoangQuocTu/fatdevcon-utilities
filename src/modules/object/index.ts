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
  return { ...target, ...source };
};

export { deepClone, mergeObjects };
