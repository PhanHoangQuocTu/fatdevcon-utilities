import { Comparator, KeySelector } from "@/types";

// O(n) - Get unique values in array
const unique = <T>(arr: T[], keySelector?: KeySelector<T>): T[] => {
  if (!keySelector) {
    return [...new Set(arr)];
  }

  const seen = new Set();
  return arr.filter((item) => {
    const key = keySelector(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

// O(n) - Filter array by predicate
const filterBy = <T>(
  arr: T[],
  predicate: (item: T, index: number, array: T[]) => boolean
): T[] => {
  return arr.filter(predicate);
};

// O(n log n) - Sort array by key
const sortBy = <T>(
  arr: T[],
  keySelector: KeySelector<T>,
  order: "asc" | "desc" = "asc"
): T[] => {
  const compareFn: Comparator<T> = (a, b) => {
    const valA = keySelector(a);
    const valB = keySelector(b);

    if (valA < valB) return order === "asc" ? -1 : 1;
    if (valA > valB) return order === "asc" ? 1 : -1;
    return 0;
  };

  return [...arr].sort(compareFn);
};

// O(n) - Chunk array into smaller arrays
const chunk = <T>(arr: T[], size: number): T[][] => {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
};

// O(n) - Flatten array of arrays
const flatten = <T>(arr: T[][]): T[] => {
  return arr.reduce((flat, next) => flat.concat(next), []);
};

// O(n) - Find indexes of matching elements
const findIndexes = <T>(
  arr: T[],
  predicate: (item: T, index: number, array: T[]) => boolean
): number[] => {
  return arr.reduce((indexes, item, index) => {
    if (predicate(item, index, arr)) {
      indexes.push(index);
    }
    return indexes;
  }, [] as number[]);
};

// O(n) - Group array by key
const groupBy = <T>(
  arr: T[],
  keySelector: KeySelector<T>
): Record<string, T[]> => {
  return arr.reduce((result, item) => {
    const key = String(keySelector(item));
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
    return result;
  }, {} as Record<string, T[]>);
};

export { unique, filterBy, sortBy, chunk, flatten, findIndexes, groupBy };
