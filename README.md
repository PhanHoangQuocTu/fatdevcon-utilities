# @fatdevcon/utilities

[![npm version](https://img.shields.io/npm/v/@fatdevcon/utilities.svg?style=flat-square)](https://www.npmjs.com/package/@fatdevcon/utilities)

A comprehensive TypeScript utility library for common calculations, formatting operations, and data manipulation.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [Basic Calculations](#basic-calculations)
  - [Formatting](#formatting)
  - [Array and Object Utilities](#array-and-object-utilities)
- [API Reference](#api-reference)
- [Development](#development)
- [Testing](#testing)
- [Contributing](#contributing)
- [Code of Conduct](#code-of-conduct)
- [Versioning](#versioning)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Features

- 🧮 **Math Operations**: Basic arithmetic, percentage calculations, and rounding
- 💰 **Currency Handling**: Formatting and conversion utilities
- 📅 **Date & Time**: Comprehensive date manipulation and formatting
- 🔢 **Array Utilities**: Common array operations and transformations
- 📦 **Object Utilities**: Deep cloning, merging, and manipulation
- � **Type Safety**: Full TypeScript support with strict typing
- 🚀 **Lightweight**: Zero dependencies, minimal bundle size
- ✅ **Well-tested**: Comprehensive test coverage

## Installation

```bash
# Using npm
npm install @fatdevcon/utilities

# Using yarn
yarn add @fatdevcon/utilities

# Using pnpm
pnpm add @fatdevcon/utilities
```

## Usage

### Basic Calculations

```typescript
import {
  summary,
  subtract,
  multiply,
  divide,
  percentage,
  factorial,
  gcd,
  lcm,
  isPrime,
  fibonacci,
} from "@fatdevcon/utilities";

// Basic arithmetic
console.log(summary(1, 2)); // 3
console.log(subtract(5, 2)); // 3
console.log(multiply(3, 4)); // 12
console.log(divide(10, 2)); // 5

// Advanced calculations
console.log(percentage(25, 100)); // 25

// Math utilities
console.log(factorial(5)); // 120
console.log(gcd(12, 18)); // 6
console.log(lcm(12, 18)); // 36
console.log(isPrime(17)); // true
console.log(fibonacci(10)); // 55
```

### Formatting

```typescript
import { formatNumber, formatDate } from "@fatdevcon/utilities";

// Format numbers
console.log(formatNumber(1234567.89, "vi-VN")); // "1.234.567,89"

// Format dates (using date-fns format strings)
console.log(formatDate(new Date(), "dd MMMM yyyy HH:mm")); // Formatted date string
```

### Array Manipulation

```typescript
import {
  unique,
  filterBy,
  sortBy,
  chunk,
  flatten,
  findIndexes,
  groupBy,
} from "@fatdevcon/utilities";

const arr = [1, 2, 2, 3, 4, 4, 5];
console.log(unique(arr)); // [1, 2, 3, 4, 5]

const objects = [
  { id: 1, name: "A" },
  { id: 2, name: "B" },
  { id: 1, name: "A" },
];
console.log(unique(objects, (o) => o.id)); // [{id: 1, ...}, {id: 2, ...}]

console.log(filterBy(arr, x => x > 2)); // [3, 4, 4, 5]
console.log(sortBy(objects, o => o.name, "desc")); // Sorted by name descending
console.log(chunk(arr, 2)); // [[1,2],[2,3],[4,4],[5]]
console.log(flatten([[1,2],[3,4]])); // [1,2,3,4]
console.log(findIndexes(arr, x => x === 2)); // [1,2]
console.log(groupBy(objects, o => o.id)); // {"1": [...], "2": [...]}
```

### Sorting Algorithms

```typescript
import {
  quickSort,
  mergeSort,
  insertionSort,
  selectionSort,
  bubbleSort,
  heapSort,
  countingSort,
  radixSort,
} from "@fatdevcon/utilities";

const unsorted = [5, 2, 9, 1, 5, 6];
console.log(quickSort(unsorted)); // [1,2,5,5,6,9]
console.log(mergeSort(unsorted));
console.log(insertionSort(unsorted));
console.log(selectionSort(unsorted));
console.log(bubbleSort(unsorted));
console.log(heapSort(unsorted));
console.log(countingSort(unsorted));
console.log(radixSort(unsorted));
```

### Search Algorithms

```typescript
import { binarySearch, linearSearch } from "@fatdevcon/utilities";

const sortedArr = [1, 2, 3, 4, 5];
console.log(binarySearch(sortedArr, 3)); // 2
console.log(linearSearch(sortedArr, 4)); // 3
```

### Array and Object Utilities

```typescript
import {
  sumValueInArray,
  averageValueInArray,
  findMin,
  findMax,
  deepClone,
  mergeObjects,
} from "@fatdevcon/utilities";

const numbers = [1, 2, 3, 4, 5];
console.log(sumValueInArray(numbers)); // 15
console.log(averageValueInArray(numbers)); // 3
console.log(findMin(numbers)); // 1
console.log(findMax(numbers)); // 5

const obj = { a: 1, b: { c: 2 } };
const clone = deepClone(obj);
console.log(clone); // { a: 1, b: { c: 2 } }

const merged = mergeObjects({ a: 1 }, { b: 2 });
console.log(merged); // { a: 1, b: 2 }
```

## API Reference

### Calculation Functions

- `summary(a: number, b: number): number` - Add two numbers
- `subtract(a: number, b: number): number` - Subtract b from a
- `multiply(a: number, b: number): number` - Multiply two numbers
- `divide(a: number, b: number): number` - Divide a by b (throws `RangeError` on division by zero)
- `percentage(value: number, total: number): number` - Calculate percentage
- `round(value: number, decimals: number = 2): number` - Round number to specified decimals (`decimals` must be a non-negative integer)
- `factorial(n: number): number` - Calculate factorial of a non-negative integer (n ≤ 170)
- `gcd(a: number, b: number): number` - Calculate greatest common divisor of two numbers
- `lcm(a: number, b: number): number` - Calculate least common multiple of two numbers
- `isPrime(n: number): boolean` - Check if a number is prime (`false` for non-integers and `NaN`)
- `fibonacci(n: number): number` - Calculate fibonacci number at position n (non-negative integer, n ≤ 1476)

### Formatting Functions

- `formatNumber(value: number, locale?: string, options?: Intl.NumberFormatOptions): string` - Format number with locale-specific separators
- `formatDate(date: Date | string | number, formatStr: string, options?: FormatOptions): string` - Format date using date-fns format strings

### Array Manipulation

- `unique<T>(arr: T[], keySelector?: KeySelector<T>): T[]` - Get unique values in array (optionally by key)
- `filterBy<T>(arr: T[], predicate: (item: T, index: number, array: T[]) => boolean): T[]` - Filter array by predicate
- `sortBy<T>(arr: T[], keySelector: KeySelector<T>, order?: "asc" | "desc"): T[]` - Sort array by key
- `chunk<T>(arr: T[], size: number): T[][]` - Chunk array into smaller arrays (`size` must be a positive integer)
- `flatten<T>(arr: T[][]): T[]` - Flatten array of arrays
- `findIndexes<T>(arr: T[], predicate: (item: T, index: number, array: T[]) => boolean): number[]` - Find indexes of matching elements
- `groupBy<T>(arr: T[], keySelector: KeySelector<T>): Record<string, T[]>` - Group array by key

### Sorting Algorithms

- `quickSort<T>(arr: T[], compareFn?: Comparator<T>): T[]` - Quick sort
- `mergeSort<T>(arr: T[], compareFn?: Comparator<T>): T[]` - Merge sort
- `insertionSort<T>(arr: T[], compareFn?: Comparator<T>): T[]` - Insertion sort
- `selectionSort<T>(arr: T[], compareFn?: Comparator<T>): T[]` - Selection sort
- `bubbleSort<T>(arr: T[], compareFn?: Comparator<T>): T[]` - Bubble sort
- `heapSort<T>(arr: T[], compareFn?: Comparator<T>): T[]` - Heap sort
- `countingSort(arr: number[]): number[]` - Counting sort for non-negative integers (max value ≤ 10,000,000)
- `radixSort(arr: number[]): number[]` - Radix sort for non-negative integers

### Search Algorithms

- `binarySearch<T>(arr: T[], target: T, compareFn?: Comparator<T>): number` - Binary search on sorted array
- `linearSearch<T>(arr: T[], target: T, compareFn?: Comparator<T>): number` - Linear search

### Array Utilities

- `sumValueInArray(arr: number[]): number` - Sum of array elements
- `averageValueInArray(arr: number[]): number` - Average of array elements
- `findMin<T>(arr: T[], compareFn?: Comparator<T>): T | undefined` - Find minimum value in array
- `findMax<T>(arr: T[], compareFn?: Comparator<T>): T | undefined` - Find maximum value in array

### Object Utilities

- `deepClone<T>(obj: T): T` - Create a deep clone using `structuredClone` (supports `Date`, `Map`, `Set`, circular references)
- `mergeObjects<T, U>(target: T, source: U): T & U` - Shallow merge two objects

### Error Handling

Functions validate their input and throw standard errors:

- `TypeError` - argument is not a finite number / integer / array (e.g. `NaN`, `Infinity`, `null`)
- `RangeError` - value is out of the supported range (division by zero, negative factorial, `chunk` size < 1, `countingSort` with negative numbers, ...)

```typescript
try {
  factorial(Infinity);
} catch (error) {
  if (error instanceof TypeError) {
    // invalid input type
  }
}
```

### Types

- `Comparator<T>` - Type for comparison function `(a: T, b: T) => number`
- `KeySelector<T>` - Type for key selector function `(item: T) => any`

## Development

1. Clone the repository

   ```bash
   git clone https://github.com/fatdevcon/utilities.git
   cd utilities
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Make your changes

4. Run tests

   ```bash
   npm test
   ```

5. Build the project
   ```bash
   npm run build
   ```

## Testing

Run the test suite:

```bash
npm test

# With coverage report
npm run test:coverage
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/fatdevcon/utilities/tags).

## Changelog

### 0.2.0

- Added input validation (`TypeError` / `RangeError`) across math, array, search and sort functions
- Fixed infinite loops in `factorial` / `fibonacci` with `Infinity`; added upper bounds (n ≤ 170 / n ≤ 1476)
- Fixed `isPrime` for `NaN` and non-integers
- Fixed `countingSort` / `radixSort` with negative or non-integer numbers, and stack overflow on large arrays
- Fixed `groupBy` with `__proto__` keys; `chunk` with invalid sizes
- `quickSort` no longer degrades to O(n²) on sorted or duplicate-heavy input
- `deepClone` now uses `structuredClone`
- `formatDate` throws a clear `RangeError` for invalid dates
- Removed unused `install` and `npm` dependencies

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to all contributors who have helped improve this project
- Inspired by various utility libraries in the JavaScript ecosystem
- Built with ❤️ by the FatDevCon team
