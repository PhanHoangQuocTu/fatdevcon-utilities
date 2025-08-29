/* Object utilities */
const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

const mergeObjects = <T extends object, U extends object>(
  target: T,
  source: U
): T & U => {
  return { ...target, ...source };
};

export { deepClone, mergeObjects };
