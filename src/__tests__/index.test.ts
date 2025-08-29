import {
  summary,
  subtract,
  multiply,
  divide,
  formatNumber,
  formatDate,
  percentage,
  round,
  deepClone,
  mergeObjects,
  sumValueInArray,
  averageValueInArray,
  binarySearch,
  quickSort,
  mergeSort,
  findMin,
  findMax,
  groupBy,
  unique,
  filterBy,
  sortBy,
  chunk,
  flatten,
  findIndexes,
  linearSearch,
  insertionSort,
  selectionSort,
  bubbleSort,
  heapSort,
  countingSort,
  radixSort,
} from "../index";

describe("Calculation Utilities", () => {
  describe("summary", () => {
    test("adds numbers correctly", () => {
      expect(summary(1, 2)).toBe(3);
      expect(summary(-1, 1)).toBe(0);
    });

    test("handles decimal numbers", () => {
      expect(summary(0.1, 0.2)).toBeCloseTo(0.3);
      expect(summary(1.2345, 5.6789)).toBeCloseTo(6.9134);
    });

    test("handles large numbers", () => {
      expect(summary(Number.MAX_SAFE_INTEGER, 1)).toBe(9007199254740992);
      expect(summary(1e20, 2e20)).toBe(3e20);
    });
  });

  describe("subtract", () => {
    test("subtracts numbers correctly", () => {
      expect(subtract(5, 3)).toBe(2);
      expect(subtract(0, 5)).toBe(-5);
    });

    test("handles decimal numbers", () => {
      expect(subtract(0.3, 0.1)).toBeCloseTo(0.2);
      expect(subtract(1.2345, 0.0001)).toBeCloseTo(1.2344);
    });

    test("handles large numbers", () => {
      expect(subtract(Number.MIN_SAFE_INTEGER, 1)).toBe(-9007199254740992);
      expect(subtract(1e20, 1e19)).toBe(9e19);
    });
  });

  describe("multiply", () => {
    test("multiplies numbers correctly", () => {
      expect(multiply(2, 3)).toBe(6);
      expect(multiply(-2, 3)).toBe(-6);
    });

    test("handles decimal numbers", () => {
      expect(multiply(0.1, 0.2)).toBeCloseTo(0.02);
      expect(multiply(1.5, 2.5)).toBeCloseTo(3.75);
    });

    test("handles large numbers", () => {
      expect(multiply(1e100, 1e100)).toBe(1e200);
      expect(multiply(Number.MAX_SAFE_INTEGER, 1)).toBe(
        Number.MAX_SAFE_INTEGER
      );
    });
  });

  describe("divide", () => {
    test("divides numbers correctly", () => {
      expect(divide(6, 3)).toBe(2);
      expect(divide(5, 2)).toBe(2.5);
    });

    test("handles decimal numbers", () => {
      expect(divide(1, 3)).toBeCloseTo(0.33333);
      expect(divide(0.1, 0.2)).toBe(0.5);
    });

    test("handles large and small numbers", () => {
      expect(divide(1e100, 1e99)).toBe(10);
      expect(divide(1e-100, 1e-50)).toBe(1e-50);
    });

    test("throws error when dividing by zero", () => {
      expect(() => divide(1, 0)).toThrow("Division by zero");
      expect(() => divide(0, 0)).toThrow("Division by zero");
    });
  });
});

describe("Formatting Utilities", () => {
  test("formats currency correctly", () => {
    const result1 = formatNumber(1000000, "vi-VN", {
      style: "currency",
      currency: "VND",
    });
    expect(result1).toMatch(/1[.,]?000[.,]?000/);
    expect(result1).toContain("₫");

    const result2 = formatNumber(1234.56);
    expect(result2).toMatch(/1[.,]?234[.,]?56/);
  });

  test("handles very large and small currency values", () => {
    const large = formatNumber(1e15);
    expect(large).toMatch(/1[.,]?000[.,]?000[.,]?000[.,]?000/);

    const small = formatNumber(0.00000001);
    expect(small).toContain("0");
  });

  test("formats date correctly", () => {
    const date = new Date("2023-01-12T04:07:00");
    const result = formatDate(date, "dd/MM/yyyy HH:mm");
    expect(result).toContain("2023");
    expect(result).toContain("01");
    expect(result).toContain("12");
    expect(result).toContain("04");
    expect(result).toContain("07");
  });
});

describe("Math Utilities", () => {
  describe("percentage", () => {
    test("calculates percentage correctly", () => {
      expect(percentage(25, 100)).toBe(25);
      expect(percentage(0, 100)).toBe(0);
      expect(percentage(100, 0)).toBe(0);
    });

    test("handles decimal percentages", () => {
      expect(percentage(1.5, 3)).toBe(50);
      expect(percentage(0.1, 1)).toBe(10);
    });

    test("handles very large and small values", () => {
      expect(percentage(1e20, 1e22)).toBe(1);
      expect(percentage(1e-20, 1e-18)).toBe(1);
    });
  });

  describe("round", () => {
    test("rounds numbers correctly", () => {
      expect(round(1.2345, 2)).toBe(1.23);
      expect(round(1.235, 2)).toBe(1.24);
      expect(round(1.2, 3)).toBe(1.2);
    });

    test("handles different decimal places", () => {
      expect(round(1.23456789, 4)).toBe(1.2346);
      expect(round(1.0000001, 6)).toBe(1.0);
    });

    test("handles very small numbers", () => {
      expect(round(0.00000012345, 8)).toBe(0.00000012);
      expect(round(1.2345e-10, 12)).toBe(1.23e-10);
    });
  });
});

describe("Array Utilities", () => {
  describe("sumValueInArray", () => {
    test("calculates sum of array", () => {
      expect(sumValueInArray([1, 2, 3, 4])).toBe(10);
      expect(sumValueInArray([])).toBe(0);
    });

    test("handles decimal numbers", () => {
      expect(sumValueInArray([0.1, 0.2, 0.3])).toBeCloseTo(0.6);
      expect(sumValueInArray([1.1, 2.2, 3.3])).toBeCloseTo(6.6);
    });

    test("handles large arrays", () => {
      const largeArray = Array(1000).fill(0.1);
      expect(sumValueInArray(largeArray)).toBeCloseTo(100);
    });
  });

  describe("averageValueInArray", () => {
    test("calculates average of array", () => {
      expect(averageValueInArray([1, 2, 3, 4, 5])).toBe(3);
      expect(averageValueInArray([])).toBe(0);
    });

    test("handles decimal numbers", () => {
      expect(averageValueInArray([0.1, 0.2, 0.3])).toBeCloseTo(0.2);
      expect(averageValueInArray([1.1, 2.2, 3.3])).toBeCloseTo(2.2);
    });

    test("handles very large and small numbers", () => {
      expect(averageValueInArray([1e20, 2e20, 3e20])).toBe(2e20);
      expect(averageValueInArray([1e-20, 2e-20, 3e-20])).toBe(2e-20);
    });
  });
});

describe("Object Utilities", () => {
  test("creates deep clone of object", () => {
    const obj = { a: 1, b: { c: 2 } };
    const cloned = deepClone(obj);
    expect(cloned).toEqual(obj);
    expect(cloned).not.toBe(obj);
  });

  test("handles complex objects with various types", () => {
    const complexObj = {
      num: 123.456,
      str: "test",
      arr: [1, 2, { a: 1 }],
      nested: { b: { c: [3, 4, 5] } },
    };
    const cloned = deepClone(complexObj);
    expect(cloned).toEqual(complexObj);
    expect(cloned).not.toBe(complexObj);
    expect(cloned.arr).not.toBe(complexObj.arr);
    expect(cloned.nested).not.toBe(complexObj.nested);
  });

  test("merges objects correctly", () => {
    const target = { a: 1, b: 2 };
    const source = { b: 3, c: 4 };
    const merged = mergeObjects(target, source);
    expect(merged).toEqual({ a: 1, b: 3, c: 4 });
  });

  test("handles merging with nested objects and arrays", () => {
    const target = { a: { b: 1 }, c: [1, 2] };
    const source = { a: { d: 2 }, c: [3, 4] };
    const merged = mergeObjects(target, source);
    expect(merged).toEqual({ a: { d: 2 }, c: [3, 4] });
  });
});

describe("Search and Sort Utilities", () => {
  const testArray = [5, 2, 8, 3, 1, 6, 4, 7];
  const objectsArray = [
    { id: 1, name: "Alice", age: 25 },
    { id: 2, name: "Bob", age: 30 },
    { id: 3, name: "Charlie", age: 20 },
    { id: 4, name: "David", age: 30 },
  ];

  describe("binarySearch", () => {
    const sortedArray = [1, 2, 3, 4, 5, 6, 7, 8];

    test("finds existing elements", () => {
      expect(binarySearch(sortedArray, 4)).toBe(3);
      expect(binarySearch(sortedArray, 1)).toBe(0);
      expect(binarySearch(sortedArray, 8)).toBe(7);
    });

    test("returns -1 for non-existing elements", () => {
      expect(binarySearch(sortedArray, 9)).toBe(-1);
      expect(binarySearch(sortedArray, 0)).toBe(-1);
    });
  });

  describe("quickSort", () => {
    test("sorts numbers in ascending order by default", () => {
      expect(quickSort([...testArray])).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    });

    test("sorts with custom comparator", () => {
      const descComparator = (a: number, b: number) => b - a;
      expect(quickSort([...testArray], descComparator)).toEqual([
        8, 7, 6, 5, 4, 3, 2, 1,
      ]);
    });
  });

  describe("mergeSort", () => {
    test("sorts numbers in ascending order by default", () => {
      expect(mergeSort([...testArray])).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    });

    test("sorts with custom comparator", () => {
      const descComparator = (a: number, b: number) => b - a;
      expect(mergeSort([...testArray], descComparator)).toEqual([
        8, 7, 6, 5, 4, 3, 2, 1,
      ]);
    });
  });

  describe("findMin and findMax", () => {
    test("finds minimum value", () => {
      expect(findMin(testArray)).toBe(1);
      expect(findMin(objectsArray, (a, b) => a.age - b.age)?.name).toBe(
        "Charlie"
      );
    });

    test("finds maximum value", () => {
      expect(findMax(testArray)).toBe(8);
      expect(findMax(objectsArray, (a, b) => a.age - b.age)?.name).toBe("Bob");
    });

    test("returns undefined for empty array", () => {
      expect(findMin([])).toBeUndefined();
      expect(findMax([])).toBeUndefined();
    });
  });

  describe("groupBy", () => {
    test("groups array by key", () => {
      const grouped = groupBy(objectsArray, (item) => item.age);
      expect(grouped["30"]).toHaveLength(2);
      expect(grouped["20"]).toHaveLength(1);
      expect(grouped["25"]).toHaveLength(1);
    });
  });

  describe("unique", () => {
    test("returns unique values", () => {
      const withDuplicates = [1, 2, 2, 3, 4, 4, 4];
      expect(unique(withDuplicates)).toEqual([1, 2, 3, 4]);
    });

    test("uses key selector when provided", () => {
      const withDuplicateAges = [
        ...objectsArray,
        { id: 5, name: "Eve", age: 25 },
      ];
      const uniqueByAge = unique(withDuplicateAges, (item) => item.age);
      expect(uniqueByAge).toHaveLength(3);
    });
  });

  describe("filterBy", () => {
    test("filters array based on predicate", () => {
      const evenNumbers = filterBy(testArray, (n) => n % 2 === 0);
      expect(evenNumbers).toEqual([2, 8, 6, 4]);

      const adults = filterBy(objectsArray, (person) => person.age >= 25);
      expect(adults).toHaveLength(3);
    });
  });

  describe("sortBy", () => {
    test("sorts by key in ascending order", () => {
      const sorted = sortBy(objectsArray, (item) => item.age);
      expect(sorted[0].name).toBe("Charlie");
      expect(sorted[3].name).toBe("David");
    });

    test("sorts by key in descending order", () => {
      const sorted = sortBy(objectsArray, (item) => item.age, "desc");
      expect(sorted[0].name).toBe("Bob");
      expect(sorted[3].name).toBe("Charlie");
    });
  });

  describe("chunk", () => {
    test("splits array into chunks", () => {
      const chunks = chunk(testArray, 3);
      expect(chunks).toHaveLength(3);
      expect(chunks[0]).toEqual([5, 2, 8]);
      expect(chunks[2]).toEqual([4, 7]);
    });
  });

  describe("flatten", () => {
    test("flattens array of arrays", () => {
      const nested = [[1, 2], [3, 4], [5]];
      expect(flatten(nested)).toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe("findIndexes", () => {
    test("finds all matching indexes", () => {
      const numbers = [1, 2, 3, 2, 4, 2];
      const indexes = findIndexes(numbers, (n) => n === 2);
      expect(indexes).toEqual([1, 3, 5]);
    });

    test("returns empty array when no matches", () => {
      const indexes = findIndexes(testArray, (n) => n > 10);
      expect(indexes).toEqual([]);
    });
  });
});

describe("Additional Search and Sort Algorithms", () => {
  const testArray = [64, 34, 25, 12, 22, 11, 90];
  const sortedArray = [11, 12, 22, 25, 34, 64, 90];
  const objectsArray = [
    { id: 3, name: "Charlie", age: 20 },
    { id: 1, name: "Alice", age: 25 },
    { id: 2, name: "Bob", age: 39 },
    { id: 4, name: "David", age: 30 },
  ];

  describe("linearSearch", () => {
    test("finds existing elements", () => {
      expect(linearSearch(testArray, 25)).toBe(2);
      expect(linearSearch(testArray, 90)).toBe(6);
    });

    test("returns -1 for non-existing elements", () => {
      expect(linearSearch(testArray, 100)).toBe(-1);
    });
  });

  describe("insertionSort", () => {
    test("sorts numbers in ascending order", () => {
      expect(insertionSort(testArray)).toEqual(sortedArray);
    });

    test("sorts objects by key", () => {
      const sorted = insertionSort([...objectsArray], (a, b) => a.age - b.age);
      expect(sorted[0].name).toBe("Charlie");
      expect(sorted[3].name).toBe("Bob");
    });
  });

  describe("selectionSort", () => {
    test("sorts numbers in ascending order", () => {
      expect(selectionSort(testArray)).toEqual(sortedArray);
    });

    test("sorts strings alphabetically", () => {
      const strings = ["banana", "apple", "cherry"];
      expect(selectionSort(strings)).toEqual(["apple", "banana", "cherry"]);
    });
  });

  describe("bubbleSort", () => {
    test("sorts numbers in ascending order", () => {
      expect(bubbleSort(testArray)).toEqual(sortedArray);
    });

    test("handles already sorted array efficiently", () => {
      const sorted = [...sortedArray];
      expect(bubbleSort(sorted)).toEqual(sorted);
    });
  });

  describe("heapSort", () => {
    test("sorts numbers in ascending order", () => {
      const sorted = [...sortedArray];
      expect(heapSort(testArray)).toEqual(sorted);
    });

    test("sorts large arrays efficiently", () => {
      const largeArray = Array.from({ length: 1000 }, () =>
        Math.floor(Math.random() * 1000)
      );

      const sortedLargeArray = [...largeArray].sort((a, b) => a - b);
      const sorted = heapSort(largeArray);
      expect(sorted).toEqual(sortedLargeArray);
    });
  });

  describe("countingSort", () => {
    test("sorts non-negative integers", () => {
      const numbers = [4, 2, 2, 8, 3, 3, 1];
      expect(countingSort(numbers)).toEqual([1, 2, 2, 3, 3, 4, 8]);
    });

    test("handles empty array", () => {
      expect(countingSort([])).toEqual([]);
    });
  });

  describe("radixSort", () => {
    test("sorts non-negative integers", () => {
      const numbers = [170, 45, 75, 90, 802, 24, 2, 66];
      expect(radixSort(numbers)).toEqual([2, 24, 45, 66, 75, 90, 170, 802]);
    });

    test("handles numbers with varying digit lengths", () => {
      const numbers = [1000, 5, 25, 100, 10];
      expect(radixSort(numbers)).toEqual([5, 10, 25, 100, 1000]);
    });
  });

  describe("Algorithm Comparison", () => {
    const smallRandomArray = Array.from({ length: 50 }, () =>
      Math.floor(Math.random() * 1000)
    );
    const largeRandomArray = Array.from({ length: 5000 }, () =>
      Math.floor(Math.random() * 10000)
    );

    test("all sort algorithms produce same result", () => {
      const sorted = [...smallRandomArray].sort((a, b) => a - b);

      expect(quickSort([...smallRandomArray])).toEqual(sorted);
      expect(mergeSort([...smallRandomArray])).toEqual(sorted);
      expect(heapSort([...smallRandomArray])).toEqual(sorted);
      expect(insertionSort([...smallRandomArray])).toEqual(sorted);
      expect(selectionSort([...smallRandomArray])).toEqual(sorted);
      expect(bubbleSort([...smallRandomArray])).toEqual(sorted);
    });

    test("performance comparison on large array", () => {
      // This test is just for demonstration and will be skipped in CI
      if (process.env.CI) return;

      const sorters = [
        { name: "quickSort", fn: quickSort },
        { name: "mergeSort", fn: mergeSort },
        { name: "heapSort", fn: heapSort },
        {
          name: "nativeSort",
          fn: (arr: number[]) => [...arr].sort((a, b) => a - b),
        },
      ];

      sorters.forEach(({ name, fn }) => {
        const start = performance.now();
        const result = fn([...largeRandomArray]);
        const time = performance.now() - start;
        console.log(`${name} took ${time.toFixed(2)}ms`);
        expect(result);
      });
    });
  });
});

// Helper matcher for sorted arrays
expect.extend({
  toBeSorted(received) {
    const pass = received.every(
      (val: any, i: number, arr: any[]) => i === 0 || val >= arr[i - 1]
    );

    return {
      message: () => `expected ${received} ${pass ? "not " : ""}to be sorted`,
      pass,
    };
  },
});
