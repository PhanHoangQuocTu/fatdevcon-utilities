// API reference data rendered by index.html. Every example outcome is checked
// against the built package by scripts/verify-docs.mjs.

const NUM = "number | bigint | string";
const LOCALE = "Intl.LocalesArgument";

/** Parameter: name, type, description, default (omit for required). */
const p = (name, type, desc, def) => ({ name, type, desc, def });
/** Error a function can throw: class, machine-readable code, trigger. */
const e = (kind, code, when) => ({ kind, code, when });

const E = {
  invalid: e("TypeError", "ERR_INVALID_NUMBER", "an argument is NaN, Infinity or not a number, bigint or numeric string"),
  notInt: (what) => e("TypeError", "ERR_NOT_INTEGER", what),
  overflow: (what = "the result is too large for the return kind") =>
    e("RangeError", "ERR_OVERFLOW", what),
  underflow: (what = "a non-zero result is too small for a number") =>
    e("RangeError", "ERR_UNDERFLOW", what),
  zero: (what) => e("RangeError", "ERR_DIVISION_BY_ZERO", what),
  range: (what) => e("RangeError", "ERR_OUT_OF_RANGE", what),
};

const USERS = `const users = [
  { id: 1, name: "An", role: "dev" },
  { id: 2, name: "Binh", role: "qa" },
  { id: 3, name: "Chi", role: "dev" },
];
`;

const A = p("a", NUM, "Left operand.");
const B = p("b", NUM, "Right operand.");
const PRECISION = p("options.precision", "number", "Significant digits kept when a quotient does not terminate: an integer from 1 to 10000.", "40");
const VALUE_NUM = p("value", NUM, "The number to format. NaN and Infinity throw.");
const LOCALE_P = (def = '"en-US"') => p("locale", LOCALE, "BCP 47 language tag, an array of tags, or an Intl.Locale.", def);

const GROUPS = [
  /* ------------------------------------------------------------------ */
  {
    id: "arithmetic", title: "Arithmetic",
    note: "Pass numbers and you get a number, exactly like before. Pass a bigint or a numeric string and the result keeps every digit. Two numbers give a number, two bigints give a bigint (where the result is a whole number), anything else gives a string in plain decimal notation. See Big numbers above for the rules, limits and error codes.",
    fns: [
      { name: "summary", sig: "summary(a: number, b: number): number\nsummary(a: bigint, b: bigint): bigint\nsummary(a: NumericInput, b: NumericInput): string",
        desc: "Adds two numbers exactly. Decimal arithmetic removes binary floating-point drift, so 0.1 + 0.2 is 0.3.",
        params: [A, B], returns: "number for two numbers, bigint for two bigints, otherwise a string.",
        throws: [E.invalid, E.overflow("the result does not fit the return kind: a number above 1.797e308, or a magnitude above about 1e300000")],
        ex: `summary(0.1, 0.2);                       // 0.3
summary(9007199254740991, 1);            // 9007199254740992
summary("100000000000000000000000000000", "1"); // "100000000000000000000000000001"
summary(2n ** 100n, 1n);                 // 1267650600228229401496703205377n
summary("0.1", 2n);                      // "2.1"` },
      { name: "subtract", sig: "subtract(a: number, b: number): number\nsubtract(a: bigint, b: bigint): bigint\nsubtract(a: NumericInput, b: NumericInput): string",
        desc: "Subtracts b from a exactly.",
        params: [A, B], returns: "number for two numbers, bigint for two bigints, otherwise a string.",
        throws: [E.invalid, E.overflow()],
        ex: `subtract(0.3, 0.1);          // 0.2
subtract("1e30", "1");       // "999999999999999999999999999999"
subtract(0n, 2n ** 70n);     // -1180591620717411303424n` },
      { name: "multiply", sig: "multiply(a: number, b: number): number\nmultiply(a: bigint, b: bigint): bigint\nmultiply(a: NumericInput, b: NumericInput): string",
        desc: "Multiplies two numbers exactly. A product so small that a number would round it to 0 throws instead of returning 0.",
        params: [A, B], returns: "number for two numbers, bigint for two bigints, otherwise a string.",
        throws: [E.invalid, E.overflow(), E.underflow("a non-zero product is below 5e-324 for numbers, or below about 1e-300000 for strings")],
        ex: `multiply(0.1, 3);                // 0.3
multiply(10n ** 30n, 10n ** 30n); // 1000000000000000000000000000000000000000000000000000000000000n
multiply("1e-400", "1e-400");    // "0.000…1" (800 digits, impossible as a number)
multiply(1e-200, 1e-200);        // throws ERR_UNDERFLOW` },
      { name: "divide", sig: "divide(a: number, b: number, options?: DivideOptions): number\ndivide(a: NumericInput, b: NumericInput, options?: DivideOptions): string",
        desc: "Divides a by b. A quotient that terminates is exact; one that does not (1/3) keeps options.precision significant digits. Two bigints return a string because the quotient may be fractional.",
        params: [p("a", NUM, "Dividend."), p("b", NUM, "Divisor. Must not be 0."), PRECISION],
        returns: "number for two numbers, otherwise a string.",
        throws: [E.invalid, E.zero("b is 0"), E.range("options.precision is outside 1 to 10000"), E.notInt("options.precision is not an integer"), E.overflow(), E.underflow()],
        ex: `divide(10, 4);                            // 2.5
divide(1, 3);                             // 0.3333333333333333
divide("1", "3");                         // "0.3333333333333333333333333333333333333333"
divide("1", "3", { precision: 5 });       // "0.33333"
divide(10n ** 30n, 3n, { precision: 40 }); // "333333333333333333333333333333.3333333333"
divide(1, 0);                             // throws ERR_DIVISION_BY_ZERO` },
      { name: "modulo", sig: "modulo(a: number, b: number): number\nmodulo(a: bigint, b: bigint): bigint\nmodulo(a: NumericInput, b: NumericInput): string",
        desc: "Remainder of a divided by b, with the sign of a like the % operator. Exact for decimals: 0.3 % 0.1 is 0 here, but 0.09999999999999998 with native %.",
        params: [p("a", NUM, "Dividend."), p("b", NUM, "Divisor. Must not be 0.")],
        returns: "number for two numbers, bigint for two bigints, otherwise a string.",
        throws: [E.invalid, E.zero("b is 0")],
        ex: `modulo(7, 3);        // 1
modulo(-7, 3);       // -1
modulo(0.3, 0.1);    // 0
modulo(10n ** 30n, 7n); // 1n
modulo("5.5", "2");  // "1.5"` },
      { name: "power", sig: "power(base: number, exponent: number, options?: DivideOptions): number\npower(base: bigint, exponent: bigint): bigint\npower(base: NumericInput, exponent: NumericInput, options?: DivideOptions): string",
        desc: "base raised to an integer exponent. An integer base with a non-negative exponent is computed exactly; any other base (a fraction, or a negative exponent) keeps options.precision significant digits. Results beyond about 1e300000 are rejected before any work is done.",
        params: [p("base", NUM, "The base."), p("exponent", NUM, "Whole number. With two bigints it must also be non-negative."), PRECISION],
        returns: "number for two numbers, bigint for two bigints, otherwise a string.",
        throws: [E.invalid, E.notInt("exponent is not a whole number"), E.zero("base is 0 and exponent is negative"), E.range("both arguments are bigint and exponent is negative"), E.overflow("the result needs more than about 1e300000"), E.underflow()],
        ex: `power(2, 10);              // 1024
power(2n, 100n);           // 1267650600228229401496703205376n
power("2", 2000).length;   // 603
power(2, -2);              // 0.25
power("2", "-10");         // "0.0009765625"
power(2, 2000);            // throws ERR_OVERFLOW (use power(2n, 2000n))` },
      { name: "abs", sig: "abs(value: number): number\nabs(value: bigint): bigint\nabs(value: NumericInput): string",
        desc: "Absolute value. Never returns -0.",
        params: [p("value", NUM, "The number.")], returns: "The same kind as the input (a string for strings).",
        throws: [E.invalid],
        ex: `abs(-5);          // 5
abs(-0);          // 0
abs("-1.50");     // "1.5"
abs(-(10n ** 40n)); // 10000000000000000000000000000000000000000n` },
      { name: "percentage", sig: "percentage(value: number, total: number, options?: DivideOptions): number\npercentage(value: NumericInput, total: NumericInput, options?: DivideOptions): string",
        desc: "value as a percentage of total, computed as value × 100 ÷ total with no intermediate rounding. Returns 0 when total is 0.",
        params: [p("value", NUM, "The part."), p("total", NUM, "The whole. 0 returns 0."), PRECISION],
        returns: "number for two numbers, otherwise a string.",
        throws: [E.invalid, E.range("options.precision is outside 1 to 10000")],
        ex: `percentage(25, 200);                       // 12.5
percentage(1, 3);                          // 33.333333333333336
percentage("1", "3", { precision: 10 });   // "33.33333333"
percentage(1, 0);                          // 0` },
      { name: "round", sig: "round(value: number, decimals?: number, mode?: RoundingMode): number\nround(value: bigint, decimals?: number, mode?: RoundingMode): bigint\nround(value: string, decimals?: number, mode?: RoundingMode): string",
        desc: "Rounds to a number of decimal places. It works on the decimal value, so round(1.005, 2) is 1.01 (Math.round-based helpers give 1). A bigint is already whole and is returned unchanged. Rounded-away values may become 0, never -0.",
        params: [p("value", NUM, "The number to round."), p("decimals", "number", "Places to keep: an integer from 0 to 300,000.", "2"), p("mode", "RoundingMode", 'How dropped digits are resolved: "half-up", "half-down", "half-even", "up", "down", "ceil" or "floor". See the table below.', '"half-up"')],
        returns: "The same kind as the input.",
        throws: [E.invalid, E.notInt("decimals is not an integer"), E.range("decimals is outside 0 to 300,000, or mode is not one of the listed names")],
        table: { head: ["mode", "2.5", "-2.5", "1.45 to 1 place", "meaning"], rows: [
          ['"half-up"', "3", "-3", "1.5", "ties away from zero (default)"],
          ['"half-down"', "2", "-2", "1.4", "ties toward zero"],
          ['"half-even"', "2", "-2", "1.4", 'ties to the even digit, "banker\'s rounding"'],
          ['"up"', "3", "-3", "1.5", "always away from zero"],
          ['"down"', "2", "-2", "1.4", "always toward zero (truncate)"],
          ['"ceil"', "3", "-2", "1.5", "toward +Infinity"],
          ['"floor"', "2", "-3", "1.4", "toward -Infinity"],
        ] },
        ex: `round(3.14159);                 // 3.14
round(1.005, 2);                // 1.01
round(2.5, 0, "half-even");     // 2
round(-2.5, 0, "floor");        // -3
round("123456789012345678901234567890.125", 2); // "123456789012345678901234567890.13"
round(1, -1);                   // throws ERR_OUT_OF_RANGE` },
      { name: "clamp", sig: "clamp(value: number, min: number, max: number): number\nclamp(value: bigint, min: bigint, max: bigint): bigint\nclamp(value: NumericInput, min: NumericInput, max: NumericInput): string",
        desc: "Limits value to the inclusive range [min, max]. Comparison is exact, so 0.1 + 0.2 as a string is compared as it is written.",
        params: [p("value", NUM, "The number to limit."), p("min", NUM, "Lower bound."), p("max", NUM, "Upper bound. Must not be below min.")],
        returns: "number for three numbers, bigint for three bigints, otherwise a string.",
        throws: [E.invalid, E.range("min is greater than max")],
        ex: `clamp(15, 0, 10);                  // 10
clamp(-5, 0, 10);                  // 0
clamp(10n ** 30n, 0n, 100n);       // 100n
clamp("15.5", "0", "10.25");       // "10.25"` },
      { name: "compareNumbers", sig: "compareNumbers(a: NumericInput, b: NumericInput): -1 | 0 | 1",
        desc: "Exact comparison of any two numeric inputs, across kinds: a bigint can be compared with a string or a double without losing a digit. Usable as a compareFn for the sort and search functions.",
        params: [p("a", NUM, "First value."), p("b", NUM, "Second value.")],
        returns: "-1 when a < b, 0 when equal, 1 when a > b.", throws: [E.invalid],
        ex: `compareNumbers("10", "9");               // 1
compareNumbers(10n ** 30n, "1e30");      // 0
compareNumbers(9007199254740993n, 9007199254740992); // 1
quickSort(["10", "9", "100"], compareNumbers); // ["9", "10", "100"]
findMax(["10", "9", "100"], compareNumbers);   // "100"` },
      { name: "isNumeric", sig: "isNumeric(value: unknown): value is NumericInput",
        desc: "True for a finite number, a bigint, or a string in decimal notation within the supported magnitude. Never throws, so it is a safe guard before calling the functions above.",
        params: [p("value", "unknown", "Anything.")], returns: "boolean.",
        ex: `isNumeric("1e5");     // true
isNumeric(10n ** 50n); // true
isNumeric(NaN);       // false
isNumeric("0x10");    // false
isNumeric(" 1");      // false` },
      { name: "toDecimalString", sig: "toDecimalString(value: NumericInput): string",
        desc: "Canonical plain-notation string: no exponent, no sign on zero, no leading plus or trailing zeros. Useful for storing or comparing numbers as text.",
        params: [p("value", NUM, "The number to normalize.")], returns: "string.",
        throws: [E.invalid, E.overflow("the magnitude is above about 1e300000"), E.underflow("the magnitude is below about 1e-300000")],
        ex: `toDecimalString("1e3");     // "1000"
toDecimalString("+0.50");   // "0.5"
toDecimalString("-0.000");  // "0"
toDecimalString(1e21);      // "1000000000000000000000"` },
    ],
  },
  /* ------------------------------------------------------------------ */
  {
    id: "number-theory", title: "Integer math",
    note: "A number argument returns a number and keeps its safe limits. A bigint or numeric string argument returns the exact value and raises those limits.",
    fns: [
      { name: "factorial", sig: "factorial(n: number): number\nfactorial(n: bigint): bigint\nfactorial(n: string): string",
        desc: "n! for a whole number. A number is limited to 170, where the result still fits a double. A bigint or string is exact up to 65,000 (about 285,000 digits), computed with balanced multiplication, well under 0.2 s at the limit.",
        params: [p("n", NUM, "Whole number from 0. At most 170 for a number, at most 65000 for a bigint or string.")],
        returns: "number, bigint or string, matching the input.",
        throws: [E.invalid, E.notInt("n is not a whole number"), E.range("n is negative or above the limit; the message suggests the bigint call")],
        ex: `factorial(5);            // 120
factorial(170);          // 7.257415615307999e+306
factorial(25n);          // 15511210043330985984000000n
factorial("30");         // "265252859812191058636308480000000"
factorial(171);          // throws: pass a bigint (factorial(171n))` },
      { name: "fibonacci", sig: "fibonacci(n: number): number\nfibonacci(n: bigint): bigint\nfibonacci(n: string): string",
        desc: "The n-th Fibonacci number, with fibonacci(0) = 0. A number is limited to 1476. A bigint or string is exact up to 1,000,000 (208,988 digits) by fast doubling, well under 0.2 s at the limit.",
        params: [p("n", NUM, "Whole number from 0. At most 1476 for a number, at most 1000000 for a bigint or string.")],
        returns: "number, bigint or string, matching the input.",
        throws: [E.invalid, E.notInt("n is not a whole number"), E.range("n is negative or above the limit")],
        ex: `fibonacci(10);           // 55
fibonacci(100n);         // 354224848179261915075n
fibonacci("200");        // "280571172992510140037611932413038677189525"
fibonacci(1477);         // throws: pass a bigint (fibonacci(1477n))` },
      { name: "gcd", sig: "gcd(a: number, b: number): number\ngcd(a: bigint, b: bigint): bigint\ngcd(a: NumericInput, b: NumericInput): string",
        desc: "Greatest common divisor. The sign of the arguments is ignored and decimals are supported by scaling both to whole numbers (at most 1000 decimal places).",
        params: [A, B], returns: "number for two numbers, bigint for two bigints, otherwise a string.",
        throws: [E.invalid, E.range("an argument has more than 1000 decimal places")],
        ex: `gcd(12, 18);                  // 6
gcd(-12, 18);                 // 6
gcd(0.5, 0.25);               // 0.25
gcd(2n ** 100n, 6n ** 50n);   // 1125899906842624n
gcd("0.000000000000000000000000012", "0.000000000000000000000000018"); // "0.000000000000000000000000006"` },
      { name: "lcm", sig: "lcm(a: number, b: number): number\nlcm(a: bigint, b: bigint): bigint\nlcm(a: NumericInput, b: NumericInput): string",
        desc: "Least common multiple. Returns 0 when either argument is 0, and is never negative. Divides before multiplying, so intermediate values stay small.",
        params: [A, B], returns: "number for two numbers, bigint for two bigints, otherwise a string.",
        throws: [E.invalid, E.overflow("the result does not fit the return kind"), E.range("an argument has more than 1000 decimal places")],
        ex: `lcm(4, 6);                // 12
lcm(0.5, 0.75);           // 1.5
lcm(10n ** 20n, 15n);     // 300000000000000000000n
lcm("0.04", "0.06");      // "0.12"` },
      { name: "isPrime", sig: "isPrime(n: NumericInput): boolean",
        desc: "Whether n is prime. A number never throws: NaN, Infinity, non-integers and anything below 2 are false. A bigint or numeric string is validated (malformed text throws) and may have up to 2048 bits. Below about 3.3 × 10²⁴ the answer is a proof (Miller-Rabin with 13 fixed bases); above that it is a strong probable-prime test over 20 bases, which a deliberately constructed composite can pass.",
        params: [p("n", NUM, "The candidate. A string with a fraction (\"7.5\") is not prime.")],
        returns: "boolean.",
        throws: [e("TypeError", "ERR_INVALID_NUMBER", "n is a string or bigint input that is not numeric (never for a number)"), E.range("n has more than 2048 bits")],
        ex: `isPrime(97);                          // true
isPrime(9007199254740881);            // true
isPrime(NaN);                         // false
isPrime(2n ** 127n - 1n);             // true
isPrime(2n ** 128n + 1n);             // false
isPrime("170141183460469231731687303715884105727"); // true
isPrime("abc");                       // throws ERR_INVALID_NUMBER` },
    ],
  },
  /* ------------------------------------------------------------------ */
  {
    id: "statistics", title: "Statistics and random",
    note: "The number-array aggregates (sumValueInArray, averageValueInArray, median) return numbers. The Big variants accept numbers, bigints and numeric strings and always return an exact string, so the return type never depends on the contents of an empty array.",
    fns: [
      { name: "median", sig: "median(values: number[]): number",
        desc: "Median of the numbers. Averages the two middle values when the count is even, exactly: median([0.1, 0.2]) is 0.15. Returns 0 for an empty array and never reorders the input.",
        params: [p("values", "number[]", "Finite numbers.")], returns: "number.",
        throws: [E.invalid, e("TypeError", "", "values is not an array")],
        ex: `median([3, 1, 2]);      // 2
median([4, 1, 3, 2]);   // 2.5
median([0.1, 0.2]);     // 0.15
median([]);             // 0` },
      { name: "medianBig", sig: "medianBig(values: readonly NumericInput[]): string",
        desc: "Exact median of numbers, bigints and numeric strings.",
        params: [p("values", "(number | bigint | string)[]", "Numeric values. Each is validated; the error names the index.")],
        returns: 'string, "0" for an empty array.', throws: [E.invalid],
        ex: `medianBig(["1e30", 3, 5n, "0.5"]); // "4"
medianBig(["1", "2"]);             // "1.5"` },
      { name: "sumBig", sig: "sumBig(values: readonly NumericInput[]): string",
        desc: "Exact sum of numbers, bigints and numeric strings. Intermediate totals never overflow. All-bigint input is added natively.",
        params: [p("values", "(number | bigint | string)[]", "Numeric values.")],
        returns: 'string, "0" for an empty array.', throws: [E.invalid, E.overflow("the total is above about 1e300000")],
        ex: `sumBig(["0.1", "0.2", 10n ** 30n]); // "1000000000000000000000000000000.3"
sumBig(["1e30", "-1e30"]);           // "0"` },
      { name: "averageBig", sig: "averageBig(values: readonly NumericInput[], options?: DivideOptions): string",
        desc: "Exact mean of numbers, bigints and numeric strings. The sum is exact and the division keeps options.precision significant digits.",
        params: [p("values", "(number | bigint | string)[]", "Numeric values."), PRECISION],
        returns: 'string, "0" for an empty array.', throws: [E.invalid, E.range("options.precision is outside 1 to 10000")],
        ex: `averageBig(["1", "2", "4"], { precision: 6 }); // "2.33333"
averageBig([10n ** 30n, 10n ** 30n]);          // "1000000000000000000000000000000"` },
      { name: "randomInt", sig: "randomInt(min: number, max: number, random?: () => number): number\nrandomInt(min: bigint, max: bigint, random?: () => number): bigint",
        desc: "Random integer in the inclusive range [min, max]. Number bounds can span up to 2^53 values. Bigint bounds can be any size: spans up to 2^32 take one draw, larger spans combine 32-bit chunks by rejection sampling, so every value is equally likely. random defaults to Math.random, which is not cryptographically secure; inject a secure source when that matters.",
        params: [p("min", "number | bigint", "Smallest value that can be returned."), p("max", "number | bigint", "Largest value that can be returned. Must be the same kind as min."), p("random", "() => number", "Source of values in [0, 1). Pass a fixed function in tests.", "Math.random")],
        returns: "number for number bounds, bigint for bigint bounds.",
        throws: [E.notInt("a number bound is not an integer, or the bounds mix number and bigint"), E.range("min is greater than max, or a number range is wider than 2^53")],
        ex: `randomInt(1, 6);                  // 1, 2, 3, 4, 5 or 6
randomInt(1, 6, () => 0.999);     // 6
randomInt(0n, 10n ** 40n);        // a uniform 41-digit bigint
randomInt(-(2 ** 53), 2 ** 53);   // throws: pass bigint bounds` },
    ],
  },
  /* ------------------------------------------------------------------ */
  {
    id: "number-formatting", title: "Number formatting",
    note: "Every formatter accepts a number, a bigint or a numeric string, and bigints and strings keep every digit (Intl.NumberFormat v3: Node 20+ and current browsers; older runtimes accept a string only when it survives conversion to a double unchanged, otherwise ERR_PRECISION_LOSS). Output comes from the runtime's Intl data, so spacing, symbols and abbreviations can differ slightly between runtimes. Formatter instances are cached, so repeated calls with the same locale and options are fast.",
    fns: [
      { name: "formatNumber", sig: "formatNumber(value: NumericInput, locale?: Intl.LocalesArgument, options?: Intl.NumberFormatOptions): string",
        desc: "Plain Intl.NumberFormat wrapper. A number is passed through untouched, so formatNumber(NaN) is \"NaN\" and formatNumber(Infinity) is \"∞\". Bigints and strings are validated.",
        params: [p("value", NUM, "The number. Strings use plain or exponent notation."), p("locale", LOCALE, "Language tag(s) or Intl.Locale. Omit for the runtime default.", "runtime default"), p("options", "Intl.NumberFormatOptions", "Any Intl.NumberFormat option, e.g. maximumFractionDigits.", "{}")],
        returns: "string.", throws: [e("TypeError", "ERR_INVALID_NUMBER", "a string or bigint input is malformed"), E.overflow("a string has an exponent beyond about 1e300000"), e("RangeError", "", "Intl rejects the locale or an option")],
        ex: `formatNumber(1234567.891, "en-US");          // "1,234,567.891"
formatNumber(1234567.89, "vi-VN");           // "1.234.567,89"
formatNumber(10n ** 30n);                    // "1,000,000,000,000,000,000,000,000,000,000"
formatNumber("123456789012345678901234567890.123456", "en-US", { maximumFractionDigits: 6 });
// "123,456,789,012,345,678,901,234,567,890.123456"` },
      { name: "formatCompactNumber", sig: "formatCompactNumber(value: NumericInput, locale?: Intl.LocalesArgument, options?: CompactNumberOptions): string",
        desc: "Compact notation with at most 1 decimal by default. Accepts every Intl.NumberFormat option except notation. English compacts up to trillions, so larger values read as thousands of T.",
        params: [VALUE_NUM, LOCALE_P(), p("options", "CompactNumberOptions", "Intl.NumberFormat options except notation. maximumFractionDigits defaults to 1.", "{ maximumFractionDigits: 1 }")],
        returns: "string.", throws: [E.invalid],
        ex: `formatCompactNumber(12500);                       // "12.5K"
formatCompactNumber(1200000, "en-US", { compactDisplay: "long" }); // "1.2 million"
formatCompactNumber("1234567890123");             // "1.2T"` },
      { name: "formatPercent", sig: "formatPercent(value: NumericInput, locale?: Intl.LocalesArgument, options?: PercentFormatOptions): string",
        desc: "Formats a ratio as a percentage, with at most 2 decimals by default. To compute a percentage from two numbers, use percentage.",
        params: [p("value", NUM, "A ratio: 0.5 means 50%."), LOCALE_P(), p("options", "PercentFormatOptions", "Intl.NumberFormat options except style.", "{ maximumFractionDigits: 2 }")],
        returns: "string.", throws: [E.invalid],
        ex: `formatPercent(0.125);   // "12.5%"
formatPercent(1n);      // "100%"
formatPercent("0.123456789012345678901234567890", "en-US", { maximumFractionDigits: 20 });
// "12.34567890123456789012%"` },
      { name: "formatCurrency", sig: "formatCurrency(value: NumericInput, currency: string, locale?: Intl.LocalesArgument, options?: CurrencyFormatOptions): string",
        desc: "Formats money for a three-letter ISO 4217 code, using the currency's standard number of decimals. Pass the amount as a string to keep cents exact beyond 2^53.",
        params: [VALUE_NUM, p("currency", "string", "Three-letter ISO 4217 code, case-insensitive."), LOCALE_P(), p("options", "CurrencyFormatOptions", "Intl.NumberFormat options except style and currency, e.g. currencySign.", "{}")],
        returns: "string.", throws: [E.invalid, e("TypeError", "", "currency is not a string"), e("RangeError", "", "currency is not a three-letter code")],
        ex: `formatCurrency(1234.5, "USD");                       // "$1,234.50"
formatCurrency(1500, "JPY");                         // "¥1,500"
formatCurrency("12345678901234567890.129", "USD");   // "$12,345,678,901,234,567,890.13"
formatCurrency(-12, "USD", "en-US", { currencySign: "accounting" }); // "($12.00)"` },
      { name: "formatUnit", sig: "formatUnit(value: NumericInput, unit: string, locale?: Intl.LocalesArgument, options?: UnitFormatOptions): string",
        desc: "Formats a number with an Intl unit identifier such as \"kilometer-per-hour\" or \"celsius\".",
        params: [VALUE_NUM, p("unit", "string", "A sanctioned Intl unit, or a ratio of two with -per-."), LOCALE_P(), p("options", "UnitFormatOptions", "Intl.NumberFormat options except style and unit, e.g. unitDisplay.", "{}")],
        returns: "string.", throws: [E.invalid, e("RangeError", "", "Intl does not know the unit")],
        ex: `formatUnit(12, "kilometer-per-hour");   // "12 km/h"
formatUnit(25, "celsius");              // "25°C"
formatUnit("12345678901234567890", "meter"); // "12,345,678,901,234,567,890 m"` },
      { name: "formatBytes", sig: "formatBytes(value: NumericInput, options?: BytesFormatOptions): string",
        desc: "Human-readable size, from B up to QB (SI) or YiB (IEC). The value is scaled exactly, so a 30-digit byte count prints correctly, and a value that rounds up to the next unit is promoted (999999 is \"1 MB\").",
        params: [p("value", NUM, "Byte count, 0 or more. Fractions are allowed."), p("options.base", "1000 | 1024", "1000 gives kB, MB… (SI). 1024 gives KiB, MiB… (IEC).", "1000"), p("options.decimals", "number", "Fraction digits to keep: an integer from 0 to 20. Trailing zeroes are dropped.", "2"), p("options.locale", LOCALE, "Language tag(s) or Intl.Locale.", '"en-US"')],
        returns: "string such as \"1.5 kB\". SI units: B kB MB GB TB PB EB ZB YB RB QB. IEC units: B KiB MiB GiB TiB PiB EiB ZiB YiB.",
        throws: [E.invalid, E.range("value is negative, base is not 1000 or 1024, or decimals is outside 0 to 20"), E.notInt("decimals is not an integer")],
        ex: `formatBytes(1500);                              // "1.5 kB"
formatBytes(1536, { base: 1024 });              // "1.5 KiB"
formatBytes(999999);                            // "1 MB"
formatBytes("1500000000000000000000000000000"); // "1.5 QB"
formatBytes(2n ** 80n, { base: 1024 });         // "1 YiB"` },
    ],
  },
  {
    id: "currency-metadata", title: "Currency metadata",
    note: "Country data is a bundled snapshot of Unicode CLDR 48.2.0; names and symbols come from the runtime's Intl data. This package does not fetch exchange rates or convert between currencies.",
    fns: [
      { name: "getCountryCurrencies", sig: "getCountryCurrencies(countryCode: string): string[]",
        desc: "Active legal-tender currency codes for a region. Returns [] for an unknown region and a fresh array each call. When there are several currencies, the order does not imply a preferred one.",
        params: [p("countryCode", "string", "Two-letter region code, case-insensitive.")], returns: "string[] of ISO 4217 codes.",
        throws: [e("TypeError", "", "countryCode is not a string"), e("RangeError", "", "countryCode is not two letters")],
        ex: `getCountryCurrencies("VN"); // ["VND"]
getCountryCurrencies("PA"); // ["PAB", "USD"]` },
      { name: "getCurrencySymbol", sig: 'getCurrencySymbol(currency: string, locale?: Intl.LocalesArgument, display?: "symbol" | "narrowSymbol"): string',
        desc: "Localized currency symbol. Symbols are not unique, so use the currency code to identify a currency.",
        params: [p("currency", "string", "Three-letter ISO 4217 code."), LOCALE_P(), p("display", '"symbol" | "narrowSymbol"', "narrowSymbol drops the country disambiguation: US$ becomes $.", '"symbol"')],
        returns: "string. Falls back to the code when the runtime has no symbol.",
        throws: [e("TypeError", "", "currency is not a string"), e("RangeError", "", "currency is not a three-letter code")],
        ex: `getCurrencySymbol("VND");                          // "₫"
getCurrencySymbol("USD", "en-CA");                 // "US$"
getCurrencySymbol("USD", "en-CA", "narrowSymbol"); // "$"` },
      { name: "getCurrencyName", sig: "getCurrencyName(currency: string, locale?: Intl.LocalesArgument): string",
        desc: "Localized currency name.",
        params: [p("currency", "string", "Three-letter ISO 4217 code."), LOCALE_P()], returns: "string. Falls back to the code.",
        throws: [e("TypeError", "", "currency is not a string"), e("RangeError", "", "currency is not a three-letter code")],
        ex: `getCurrencyName("USD");       // "US Dollar"
getCurrencyName("VND", "vi"); // "Đồng Việt Nam"` },
    ],
  },
  /* ------------------------------------------------------------------ */
  {
    id: "text", title: "Text",
    note: "Lengths count Unicode grapheme clusters (user-perceived characters), so emoji, flags and combining accents stay intact. Inputs must be strings; lengths must be non-negative integers. Violations throw TypeError or RangeError.",
    fns: [
      { name: "truncateText", sig: "truncateText(text: string, maxLength: number, options?: TruncateTextOptions): string",
        desc: "Cuts text to maxLength characters including the ellipsis. Text that already fits is returned unchanged.",
        params: [p("text", "string", "The text."), p("maxLength", "number", "Longest result in characters, ellipsis included. A non-negative safe integer."), p("options.ellipsis", "string", "Marker appended when text is cut.", '"..."'), p("options.preserveWords", "boolean", "Avoid cutting the last word in half where possible.", "false")],
        returns: "string.", throws: [e("TypeError", "", "text is not a string or maxLength is not a safe integer"), e("RangeError", "", "maxLength is negative")],
        ex: `truncateText("Hello world", 8);                  // "Hello..."
truncateText("Hello world", 8, { ellipsis: "…" }); // "Hello w…"
truncateText("Hello beautiful world", 12, { preserveWords: true }); // "Hello..."` },
      { name: "shortenString", sig: "shortenString(text: string, options?: ShortenStringOptions): string",
        desc: "Keeps both ends of a long identifier such as a wallet address. Text that is already short enough is returned unchanged.",
        params: [p("text", "string", "The text."), p("options.startLength", "number", "Characters kept at the start.", "4"), p("options.endLength", "number", "Characters kept at the end.", "4"), p("options.separator", "string", "Placed between the two ends.", '"..."')],
        returns: "string.", throws: [e("TypeError", "", "an argument has the wrong type"), e("RangeError", "", "a length is negative")],
        ex: `shortenString("abcdefghijklxyzc"); // "abcd...xyzc"
shortenString("0x71C7656EC7ab88b098defB751B7401B5f6d8976F", { startLength: 6 }); // "0x71C7...976F"` },
      { name: "maskString", sig: "maskString(text: string, options?: MaskStringOptions): string",
        desc: "Hides characters for display. This is not encryption or secure redaction.",
        params: [p("text", "string", "The text."), p("options.visibleStart", "number", "Characters left visible at the start.", "0"), p("options.visibleEnd", "number", "Characters left visible at the end.", "4"), p("options.mask", "string", "Replacement, exactly one character.", '"*"')],
        returns: "string of the same length in characters.", throws: [e("TypeError", "", "an argument has the wrong type"), e("RangeError", "", "a length is negative or mask is not exactly one character")],
        ex: `maskString("1234567890");  // "******7890"
maskString("user@example.com", { visibleStart: 2, visibleEnd: 4 }); // "us**********.com"
maskString("4111111111111111", { mask: "•" }); // "••••••••••••1111"` },
      { name: "normalizeWhitespace", sig: "normalizeWhitespace(text: string): string",
        desc: "Trims the text and collapses every run of whitespace, including tabs, newlines and non-breaking spaces, into a single space.",
        params: [p("text", "string", "The text.")], returns: "string.", throws: [e("TypeError", "", "text is not a string")],
        ex: `normalizeWhitespace("  hello   world \\n"); // "hello world"` },
      { name: "removeDiacritics", sig: "removeDiacritics(text: string): string",
        desc: "Strips Latin, Greek and Cyrillic accents and transliterates letters that do not decompose: đ, ð, ø, ł, ħ, ı, ß, æ, œ and þ. Marks from other scripts (Devanagari, Thai, Arabic…) are vowel signs, not accents, so those scripts are left intact.",
        params: [p("text", "string", "The text.")], returns: "string.", throws: [e("TypeError", "", "text is not a string")],
        ex: `removeDiacritics("Đặng Thị Tứ");   // "Dang Thi Tu"
removeDiacritics("Straße Ørsted");  // "Strasse Orsted"
removeDiacritics("हिन्दी");          // "हिन्दी"` },
      { name: "slugify", sig: "slugify(text: string): string",
        desc: "Lowercase slug without accents, joined by hyphens. Letters, marks and numbers from non-Latin scripts are kept. Does not guarantee uniqueness.",
        params: [p("text", "string", "The text.")], returns: "string, empty when nothing alphanumeric remains.", throws: [e("TypeError", "", "text is not a string")],
        ex: `slugify("Đặng Thị Tứ");      // "dang-thi-tu"
slugify("  Hello, World! "); // "hello-world"
slugify("Straße Ørsted");    // "strasse-orsted"` },
      { name: "capitalize", sig: "capitalize(text: string, locale?: Intl.LocalesArgument): string",
        desc: "Uppercases the first character and leaves the rest unchanged.",
        params: [p("text", "string", "The text."), p("locale", LOCALE, "Language tag(s) for case mapping. Omit for the runtime locale.", "runtime default")],
        returns: "string.", throws: [e("TypeError", "", "text is not a string")],
        ex: `capitalize("hello world");    // "Hello world"
capitalize("istanbul", "tr"); // "İstanbul"` },
      { name: "camelCase", sig: "camelCase(text: string): string",
        desc: "Splits on separators and on camelCase and acronym boundaries, then joins as camelCase. Unicode letters are kept.",
        params: [p("text", "string", "The text.")], returns: "string.", throws: [e("TypeError", "", "text is not a string")],
        ex: `camelCase("hello world");     // "helloWorld"
camelCase("Hello-World_foo"); // "helloWorldFoo"` },
      { name: "pascalCase", sig: "pascalCase(text: string): string",
        desc: "Same word splitting as camelCase, joined as PascalCase.",
        params: [p("text", "string", "The text.")], returns: "string.", throws: [e("TypeError", "", "text is not a string")],
        ex: `pascalCase("hello world"); // "HelloWorld"` },
      { name: "kebabCase", sig: "kebabCase(text: string): string",
        desc: "Lowercase words joined with hyphens. Unlike slugify it keeps accents.",
        params: [p("text", "string", "The text.")], returns: "string.", throws: [e("TypeError", "", "text is not a string")],
        ex: `kebabCase("helloWorld");      // "hello-world"
kebabCase("XMLHttpRequest");  // "xml-http-request"` },
      { name: "snakeCase", sig: "snakeCase(text: string): string",
        desc: "Lowercase words joined with underscores.",
        params: [p("text", "string", "The text.")], returns: "string.", throws: [e("TypeError", "", "text is not a string")],
        ex: `snakeCase("Hello World"); // "hello_world"` },
      { name: "titleCase", sig: "titleCase(text: string): string",
        desc: "Capitalizes every word and lowercases the rest, joined with single spaces.",
        params: [p("text", "string", "The text.")], returns: "string.", throws: [e("TypeError", "", "text is not a string")],
        ex: `titleCase("hello-world FOO"); // "Hello World Foo"` },
      { name: "escapeHtml", sig: "escapeHtml(text: string): string",
        desc: "Escapes & < > \" ' so text can be placed in HTML content or attributes.",
        params: [p("text", "string", "The text.")], returns: "string.", throws: [e("TypeError", "", "text is not a string")],
        ex: `escapeHtml('<a href="x">Tom & Jerry</a>');
// "&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&lt;/a&gt;"` },
      { name: "unescapeHtml", sig: "unescapeHtml(text: string): string",
        desc: "Reverses escapeHtml in a single pass, so \"&amp;lt;\" becomes \"&lt;\", never \"<\".",
        params: [p("text", "string", "The text.")], returns: "string.", throws: [e("TypeError", "", "text is not a string")],
        ex: `unescapeHtml("&lt;b&gt; &amp;amp;"); // "<b> &amp;"` },
      { name: "countWords", sig: "countWords(text: string): number",
        desc: "Counts words using Unicode word boundaries, so punctuation and emoji are ignored.",
        params: [p("text", "string", "The text.")], returns: "number.", throws: [e("TypeError", "", "text is not a string")],
        ex: `countWords("Hello, world!"); // 2
countWords("  ");            // 0` },
      { name: "reverseText", sig: "reverseText(text: string): string",
        desc: "Reverses by user-perceived character, so emoji and combining accents stay intact.",
        params: [p("text", "string", "The text.")], returns: "string.", throws: [e("TypeError", "", "text is not a string")],
        ex: `reverseText("abc"); // "cba"` },
    ],
  },
  /* ------------------------------------------------------------------ */
  {
    id: "dates", title: "Dates",
    fns: [
      { name: "formatDate", sig: "formatDate(date: Date | string | number, formatStr: string, options?: FormatOptions): string",
        desc: 'Formats a date using date-fns format tokens, in the local timezone. Date-only strings such as "2026-01-15" are read as local dates, so the day never shifts with the timezone.',
        params: [p("date", "Date | string | number", "A Date, a millisecond timestamp or a date string."), p("formatStr", "string", "date-fns format tokens, e.g. \"yyyy-MM-dd\"."), p("options", "FormatOptions", "date-fns options such as locale.", "undefined")],
        returns: "string.", throws: [e("TypeError", "", "date is not a Date, string or number"), e("RangeError", "", "the date is invalid")],
        ex: `formatDate(new Date(2026, 0, 15, 9, 30), "dd/MM/yyyy HH:mm"); // "15/01/2026 09:30"
formatDate("2026-01-15", "MMM d, yyyy");                      // "Jan 15, 2026"` },
      { name: "formatRelativeTime", sig: "formatRelativeTime(date: Date | string | number, options?: RelativeTimeOptions): string",
        desc: 'Relative time such as "3 hours ago" or "in 2 days" through Intl.RelativeTimeFormat. Units are truncated, so 59.6 minutes reads as 59 minutes.',
        params: [p("date", "Date | string | number", "The moment to describe."), p("options.locale", LOCALE, "Language tag(s).", '"en-US"'), p("options.now", "Date | string | number", "Reference moment.", "the current time"), p("options.numeric", '"auto" | "always"', '"auto" gives "yesterday"; "always" gives "1 day ago".', '"auto"')],
        returns: "string.", throws: [e("TypeError", "", "date or now has the wrong type"), e("RangeError", "", "date or now is invalid")],
        ex: `const now = new Date(2026, 9, 5, 12, 0);
formatRelativeTime(new Date(2026, 9, 5, 9, 0), { now }); // "3 hours ago"
formatRelativeTime(new Date(2026, 9, 7, 12, 0), { now }); // "in 2 days"
formatRelativeTime(new Date(2026, 9, 4, 12, 0), { now }); // "yesterday"` },
      { name: "formatDuration", sig: "formatDuration(milliseconds: NumericInput, options?: DurationOptions): string",
        desc: "Compact duration in days, hours, minutes and seconds; under one second it shows milliseconds. Fractions of a millisecond are dropped. Accepts bigints and strings, so a duration of any length is exact: days are never rolled into years.",
        params: [p("milliseconds", NUM, "Duration, 0 or more."), p("options.maxUnits", "number", "Keep only the N largest non-zero units: a positive integer.", "all")],
        returns: "string such as \"1h 2m 3s\".", throws: [E.invalid, E.range("milliseconds is negative or maxUnits is not a positive integer")],
        ex: `formatDuration(3723000);                    // "1h 2m 3s"
formatDuration(90061000, { maxUnits: 2 });  // "1d 1h"
formatDuration(450);                        // "450ms"
formatDuration(10n ** 20n);                 // "1157407407407d 9h 46m 40s"` },
      { name: "isValidDate", sig: "isValidDate(value: unknown): value is Date",
        desc: "True for a Date instance that holds a real moment. Strings and numbers are false, and so is new Date(\"nope\").",
        params: [p("value", "unknown", "Anything.")], returns: "boolean.",
        ex: `isValidDate(new Date());       // true
isValidDate(new Date("nope")); // false` },
    ],
  },
  /* ------------------------------------------------------------------ */
  {
    id: "arrays", title: "Arrays",
    note: "Every function returns a new value and throws a TypeError when the first argument is not an array or a callback is not a function.",
    fns: [
      { name: "unique", sig: "unique<T>(arr: T[], keySelector?: KeySelector<T>): T[]",
        desc: "Removes duplicates, keeping the first item of each. Compares with SameValueZero, so NaN equals NaN.",
        params: [p("arr", "T[]", "The array."), p("keySelector", "(item: T) => any", "Compare items by this key instead of by value.", "undefined")], returns: "T[].", throws: [e("TypeError", "", "arr is not an array or keySelector is not a function")],
        ex: USERS + `
unique([1, 2, 2, 3]);         // [1, 2, 3]
unique(users, (u) => u.role).map((u) => u.name); // ["An", "Binh"]` },
      { name: "filterBy", sig: "filterBy<T>(arr: T[], predicate: (item: T, index: number, array: T[]) => boolean): T[]",
        desc: "Keeps the items for which the predicate returns true.",
        params: [p("arr", "T[]", "The array."), p("predicate", "(item, index, array) => boolean", "Return true to keep the item.")], returns: "T[].", throws: [e("TypeError", "", "arr is not an array or predicate is not a function")],
        ex: `filterBy([1, 2, 3, 4], (x) => x > 2); // [3, 4]` },
      { name: "sortBy", sig: 'sortBy<T>(arr: T[], keySelector: KeySelector<T>, order?: "asc" | "desc"): T[]',
        desc: "Stable sort by the selected key. Does not reorder the input.",
        params: [p("arr", "T[]", "The array."), p("keySelector", "(item: T) => any", "Returns the value to sort by."), p("order", '"asc" | "desc"', "Sort direction.", '"asc"')], returns: "T[].", throws: [e("TypeError", "", "arr is not an array or keySelector is not a function"), e("RangeError", "", 'order is not "asc" or "desc"')],
        ex: USERS + `
sortBy(users, (u) => u.name, "desc").map((u) => u.name); // ["Chi", "Binh", "An"]` },
      { name: "groupBy", sig: "groupBy<T>(arr: T[], keySelector: KeySelector<T>): Record<string, T[]>",
        desc: "Groups items into an object keyed by the selected value. Keys are converted to strings; the result has no prototype, so a key like \"__proto__\" is safe.",
        params: [p("arr", "T[]", "The array."), p("keySelector", "(item: T) => any", "Returns the group key.")], returns: "Record<string, T[]>.", throws: [e("TypeError", "", "arr is not an array or keySelector is not a function")],
        ex: USERS + `
Object.keys(groupBy(users, (u) => u.role)); // ["dev", "qa"]` },
      { name: "chunk", sig: "chunk<T>(arr: T[], size: number): T[][]",
        desc: "Splits an array into chunks of at most size items.",
        params: [p("arr", "T[]", "The array."), p("size", "number", "Items per chunk: a positive integer.")], returns: "T[][].", throws: [E.notInt("size is not an integer"), E.range("size is below 1")],
        ex: `chunk([1, 2, 3, 4, 5], 2); // [[1, 2], [3, 4], [5]]` },
      { name: "flatten", sig: "flatten<T>(arr: T[][]): T[]", desc: "Flattens an array of arrays by one level.",
        params: [p("arr", "T[][]", "The array of arrays.")], returns: "T[].", throws: [e("TypeError", "", "arr is not an array")],
        ex: `flatten([[1, 2], [3]]); // [1, 2, 3]` },
      { name: "findIndexes", sig: "findIndexes<T>(arr: T[], predicate: (item: T, index: number, array: T[]) => boolean): number[]",
        desc: "Returns the index of every item that matches the predicate.",
        params: [p("arr", "T[]", "The array."), p("predicate", "(item, index, array) => boolean", "Return true for a match.")], returns: "number[].", throws: [e("TypeError", "", "arr is not an array or predicate is not a function")],
        ex: `findIndexes([1, 2, 2, 3], (x) => x === 2); // [1, 2]` },
      { name: "sumValueInArray", sig: "sumValueInArray(arr: number[]): number",
        desc: "Sum of the numbers, exact and free of floating-point drift. Whole numbers are added natively and the rest in decimal arithmetic, so intermediate totals never overflow: [1e308, 1e308, -1e308] is 1e308. For bigint or string items use sumBig.",
        params: [p("arr", "number[]", "Finite numbers.")], returns: "number. 0 for an empty array.", throws: [E.invalid, E.overflow("the total is above 1.797e308; use sumBig")],
        ex: `sumValueInArray([0.1, 0.2, 0.3]);       // 0.6
sumValueInArray([1e308, 1e308, -1e308]); // 1e+308
sumValueInArray([1e308, 1e308]);         // throws ERR_OVERFLOW` },
      { name: "averageValueInArray", sig: "averageValueInArray(arr: number[], options?: DivideOptions): number",
        desc: "Mean of the numbers. The sum is exact and the division keeps options.precision significant digits before converting to a number. For bigint or string items use averageBig.",
        params: [p("arr", "number[]", "Finite numbers."), PRECISION], returns: "number. 0 for an empty array.", throws: [E.invalid, E.range("options.precision is outside 1 to 10000")],
        ex: `averageValueInArray([1, 2, 3, 4]); // 2.5
averageValueInArray([0.1, 0.2]);   // 0.15` },
      { name: "findMin", sig: "findMin<T>(arr: T[], compareFn?: Comparator<T>): T | undefined",
        desc: "Returns the smallest item, or undefined for an empty array. The default comparison orders numbers, bigints, strings and dates; it refuses NaN instead of returning an arbitrary answer.",
        params: [p("arr", "T[]", "The array."), p("compareFn", "(a: T, b: T) => number", "Negative, zero or positive, like Array#sort. Needed for objects and numeric strings.", "ascending")], returns: "T | undefined.", throws: [e("TypeError", "ERR_INVALID_NUMBER", "the default comparison meets NaN")],
        ex: `findMin([3, 1, 2]);                       // 1
findMin([10n ** 30n, 5n]);                // 5n
findMin(["10", "9"], compareNumbers);     // "9"
findMin([3, NaN, 1]);                     // throws ERR_INVALID_NUMBER` },
      { name: "findMax", sig: "findMax<T>(arr: T[], compareFn?: Comparator<T>): T | undefined",
        desc: "Returns the largest item, or undefined for an empty array. Same comparison rules as findMin.",
        params: [p("arr", "T[]", "The array."), p("compareFn", "(a: T, b: T) => number", "Negative, zero or positive, like Array#sort.", "ascending")], returns: "T | undefined.", throws: [e("TypeError", "ERR_INVALID_NUMBER", "the default comparison meets NaN")],
        ex: USERS + `
findMax([3, 1, 2]);                      // 3
findMax(users, (a, b) => a.id - b.id).name; // "Chi"` },
      { name: "compact", sig: "compact<T>(arr: T[]): Exclude<T, Falsy>[]",
        desc: "Drops false, null, undefined, 0, \"\", NaN and 0n.",
        params: [p("arr", "T[]", "The array.")], returns: "T[] without falsy items.", throws: [e("TypeError", "", "arr is not an array")],
        ex: `compact([0, 1, false, 2, "", 3, null, NaN]); // [1, 2, 3]` },
      { name: "difference", sig: "difference<T>(arr: T[], values: T[]): T[]",
        desc: "Items of arr that are not in values.",
        params: [p("arr", "T[]", "Items to keep from."), p("values", "T[]", "Items to remove.")], returns: "T[].", throws: [e("TypeError", "", "an argument is not an array")],
        ex: `difference([1, 2, 3, 4], [2, 4]); // [1, 3]` },
      { name: "intersection", sig: "intersection<T>(arr: T[], values: T[]): T[]",
        desc: "Unique items present in both arrays, in the order of arr.",
        params: [p("arr", "T[]", "First array."), p("values", "T[]", "Second array.")], returns: "T[].", throws: [e("TypeError", "", "an argument is not an array")],
        ex: `intersection([1, 2, 2, 3], [2, 3, 4]); // [2, 3]` },
      { name: "union", sig: "union<T>(...arrays: T[][]): T[]",
        desc: "Unique items across all arrays, in order of first appearance.",
        params: [p("...arrays", "T[][]", "Any number of arrays.")], returns: "T[].", throws: [e("TypeError", "", "an argument is not an array")],
        ex: `union([1, 2], [2, 3], [3, 4]); // [1, 2, 3, 4]` },
      { name: "partition", sig: "partition<T>(arr: T[], predicate: (item: T, index: number) => boolean): [T[], T[]]",
        desc: "Splits an array into [matching, non-matching] in a single pass.",
        params: [p("arr", "T[]", "The array."), p("predicate", "(item, index) => boolean", "Return true for the first group.")], returns: "[T[], T[]].", throws: [e("TypeError", "", "arr is not an array or predicate is not a function")],
        ex: `partition([1, 2, 3, 4], (x) => x % 2 === 0); // [[2, 4], [1, 3]]` },
      { name: "countBy", sig: "countBy<T>(arr: T[], keySelector: KeySelector<T>): Record<string, number>",
        desc: "Counts items per key. Keys are converted to strings.",
        params: [p("arr", "T[]", "The array."), p("keySelector", "(item: T) => any", "Returns the key to count.")], returns: "Record<string, number>.", throws: [e("TypeError", "", "arr is not an array or keySelector is not a function")],
        ex: `countBy(["a", "b", "a"], (x) => x); // { a: 2, b: 1 }` },
      { name: "keyBy", sig: "keyBy<T>(arr: T[], keySelector: KeySelector<T>): Record<string, T>",
        desc: "Indexes items by key. When keys collide the later item wins.",
        params: [p("arr", "T[]", "The array."), p("keySelector", "(item: T) => any", "Returns the key.")], returns: "Record<string, T>.", throws: [e("TypeError", "", "arr is not an array or keySelector is not a function")],
        ex: USERS + `
keyBy(users, (u) => u.id)[2].name; // "Binh"` },
      { name: "zip", sig: "zip<A, B>(a: A[], b: B[]): [A, B][]",
        desc: "Pairs items by index. The result is as long as the shorter array.",
        params: [p("a", "A[]", "First array."), p("b", "B[]", "Second array.")], returns: "[A, B][].", throws: [e("TypeError", "", "an argument is not an array")],
        ex: `zip([1, 2, 3], ["a", "b"]); // [[1, "a"], [2, "b"]]` },
      { name: "range", sig: "range(start: number, end?: number, step?: number): number[]",
        desc: "Numbers from start up to, but not including, end. With one argument it counts from 0. Fractional steps are computed exactly (range(0, 1, 0.1) ends at 0.9, never 0.30000000000000004). Builds at most 10,000,000 items.",
        params: [p("start", "number", "First value, or the exclusive end when end is omitted."), p("end", "number", "Exclusive end.", "start, counting from 0"), p("step", "number", "Increment. Not 0.", "1, or -1 when end < start")],
        returns: "number[].", throws: [E.invalid, E.range("step is 0, a bound exceeds 2^53 - 1, or the range would exceed 10,000,000 items")],
        ex: `range(3);              // [0, 1, 2]
range(1, 4);           // [1, 2, 3]
range(3, 0);           // [3, 2, 1]
range(0, 1, 0.25);     // [0, 0.25, 0.5, 0.75]
range(0, 1, 0.1)[3];   // 0.3
range(0, 1e9);         // throws ERR_OUT_OF_RANGE` },
      { name: "shuffle", sig: "shuffle<T>(arr: T[], random?: () => number): T[]",
        desc: "Fisher-Yates shuffle into a new array.",
        params: [p("arr", "T[]", "The array."), p("random", "() => number", "Source of values in [0, 1). Pass a fixed function in tests.", "Math.random")], returns: "T[].", throws: [e("TypeError", "", "arr is not an array")],
        ex: `shuffle([1, 2, 3], () => 0); // [2, 3, 1]` },
      { name: "sample", sig: "sample<T>(arr: T[], random?: () => number): T | undefined",
        desc: "A random item, or undefined for an empty array.",
        params: [p("arr", "T[]", "The array."), p("random", "() => number", "Source of values in [0, 1).", "Math.random")], returns: "T | undefined.", throws: [e("TypeError", "", "arr is not an array")],
        ex: `sample(["a", "b", "c"], () => 0.99); // "c"` },
      { name: "flattenDeep", sig: "flattenDeep(arr: unknown[], depth?: number): unknown[]",
        desc: "Flattens any depth of nesting, or up to depth levels when given.",
        params: [p("arr", "unknown[]", "The array."), p("depth", "number", "Levels to flatten: an integer.", "Infinity")], returns: "unknown[].", throws: [e("TypeError", "", "arr is not an array or depth is not an integer")],
        ex: `flattenDeep([1, [2, [3, [4]]]]);  // [1, 2, 3, 4]
flattenDeep([1, [2, [3]]], 1);    // [1, 2, [3]]` },
    ],
  },
  /* ------------------------------------------------------------------ */
  {
    id: "sorting", title: "Sorting",
    note: "Every sort returns a new array and leaves the input untouched. Comparison sorts take an optional compareFn and default to ascending order for numbers, bigints, strings and dates; the default refuses NaN. For numeric strings pass compareNumbers.",
    fns: [
      { name: "quickSort", sig: "quickSort<T>(arr: T[], compareFn?: Comparator<T>): T[]",
        desc: "Quick sort with a middle pivot and three-way partition, so it stays fast on sorted or duplicate-heavy input.",
        params: [p("arr", "T[]", "The array."), p("compareFn", "(a: T, b: T) => number", "Negative, zero or positive.", "ascending")], returns: "T[].", tags: ["O(n log n) average"], throws: [e("TypeError", "", "arr is not an array, or the default comparison meets NaN")],
        ex: `quickSort([5, 2, 9, 1]);                  // [1, 2, 5, 9]
quickSort([5, 2, 9, 1], (a, b) => b - a); // [9, 5, 2, 1]
quickSort(["10", "9", "100"], compareNumbers); // ["9", "10", "100"]` },
      { name: "mergeSort", sig: "mergeSort<T>(arr: T[], compareFn?: Comparator<T>): T[]", desc: "Merge sort. Keeps equal items in their original order.",
        params: [p("arr", "T[]", "The array."), p("compareFn", "(a: T, b: T) => number", "Negative, zero or positive.", "ascending")], returns: "T[].", tags: ["O(n log n)", "stable"], throws: [e("TypeError", "", "arr is not an array, or the default comparison meets NaN")],
        ex: `mergeSort([5, 2, 9, 1]); // [1, 2, 5, 9]` },
      { name: "heapSort", sig: "heapSort<T>(arr: T[], compareFn?: Comparator<T>): T[]", desc: "Heap sort.",
        params: [p("arr", "T[]", "The array."), p("compareFn", "(a: T, b: T) => number", "Negative, zero or positive.", "ascending")], returns: "T[].", tags: ["O(n log n)"], throws: [e("TypeError", "", "arr is not an array, or the default comparison meets NaN")],
        ex: `heapSort([5, 2, 9, 1]); // [1, 2, 5, 9]` },
      { name: "insertionSort", sig: "insertionSort<T>(arr: T[], compareFn?: Comparator<T>): T[]", desc: "Insertion sort. A good fit for small or nearly sorted arrays.",
        params: [p("arr", "T[]", "The array."), p("compareFn", "(a: T, b: T) => number", "Negative, zero or positive.", "ascending")], returns: "T[].", tags: ["O(n²)"], throws: [e("TypeError", "", "arr is not an array, or the default comparison meets NaN")],
        ex: `insertionSort([5, 2, 9, 1]); // [1, 2, 5, 9]` },
      { name: "selectionSort", sig: "selectionSort<T>(arr: T[], compareFn?: Comparator<T>): T[]", desc: "Selection sort.",
        params: [p("arr", "T[]", "The array."), p("compareFn", "(a: T, b: T) => number", "Negative, zero or positive.", "ascending")], returns: "T[].", tags: ["O(n²)"], throws: [e("TypeError", "", "arr is not an array, or the default comparison meets NaN")],
        ex: `selectionSort([5, 2, 9, 1]); // [1, 2, 5, 9]` },
      { name: "bubbleSort", sig: "bubbleSort<T>(arr: T[], compareFn?: Comparator<T>): T[]", desc: "Bubble sort with an early exit when no swap happens.",
        params: [p("arr", "T[]", "The array."), p("compareFn", "(a: T, b: T) => number", "Negative, zero or positive.", "ascending")], returns: "T[].", tags: ["O(n²)"], throws: [e("TypeError", "", "arr is not an array, or the default comparison meets NaN")],
        ex: `bubbleSort([5, 2, 9, 1]); // [1, 2, 5, 9]` },
      { name: "countingSort", sig: "countingSort(arr: number[]): number[]",
        desc: "Counting sort for safe integers, negatives included. Allocates one counter per value in the range, so the difference between the largest and smallest value is limited to 10,000,000; use radixSort beyond that.",
        params: [p("arr", "number[]", "Safe integers (|n| ≤ 2^53 - 1).")], returns: "number[].", tags: ["O(n + k)", "k = max - min ≤ 10,000,000"],
        throws: [E.invalid, E.range("an item is not a safe integer, or max - min exceeds 10,000,000")],
        ex: `countingSort([5, 2, 9, 1]);        // [1, 2, 5, 9]
countingSort([3, -1, 2, -5, 0]);   // [-5, -1, 0, 2, 3]
countingSort([0, 100000000]);      // throws ERR_OUT_OF_RANGE` },
      { name: "radixSort", sig: "radixSort(arr: number[]): number[]\nradixSort(arr: bigint[]): bigint[]",
        desc: "Radix sort for integers, negatives included. Numbers are sorted a byte at a time and bigints 16 bits at a time, so there is no range limit. The array must contain only numbers or only bigints.",
        params: [p("arr", "number[] | bigint[]", "Safe integers, or bigints of any size.")], returns: "number[] or bigint[], matching the input.", tags: ["O(d · n)"],
        throws: [E.invalid, E.range("a number is not a safe integer")],
        ex: `radixSort([170, -45, 75, -2]);                 // [-45, -2, 75, 170]
radixSort([10n ** 30n, -5n, 3n, 0n]);          // [-5n, 0n, 3n, 1000000000000000000000000000000n]` },
    ],
  },
  {
    id: "searching", title: "Searching",
    note: "Both functions return the index of the match, or -1 when the target is not found.",
    fns: [
      { name: "binarySearch", sig: "binarySearch<T>(arr: T[], target: T, compareFn?: Comparator<T>): number",
        desc: "Binary search. The array must already be sorted in the order compareFn describes; with several equal items, any matching index may be returned.",
        params: [p("arr", "T[]", "Sorted array."), p("target", "T", "Value to find."), p("compareFn", "(a: T, b: T) => number", "Must match the order of arr.", "ascending")], returns: "index, or -1.", tags: ["O(log n)", "sorted input"],
        throws: [e("TypeError", "", "arr is not an array, or the default comparison meets NaN")],
        ex: `binarySearch([1, 3, 5, 7], 5); // 2
binarySearch([1, 3, 5, 7], 4); // -1` },
      { name: "linearSearch", sig: "linearSearch<T>(arr: T[], target: T, compareFn?: Comparator<T>): number",
        desc: "Linear search. Returns the first matching index and works on unsorted arrays.",
        params: [p("arr", "T[]", "The array."), p("target", "T", "Value to find."), p("compareFn", "(a: T, b: T) => number", "Equal when it returns 0.", "ascending")], returns: "index, or -1.", tags: ["O(n)"],
        throws: [e("TypeError", "", "arr is not an array, or the default comparison meets NaN")],
        ex: `linearSearch(["a", "b"], "b"); // 1` },
    ],
  },
  /* ------------------------------------------------------------------ */
  {
    id: "objects", title: "Objects",
    note: "Objects are never mutated. Merges and path reads ignore __proto__, constructor and prototype keys.",
    fns: [
      { name: "deepClone", sig: "deepClone<T>(obj: T): T",
        desc: "Deep copy built on structuredClone. Preserves Date, Map, Set, BigInt and circular references.",
        params: [p("obj", "T", "Any structured-cloneable value.")], returns: "T, a deep copy.", throws: [e("DOMException", "DataCloneError", "the value contains a function or symbol")],
        ex: `const original = { when: new Date(), nested: { list: [1] } };
const copy = deepClone(original);
copy.nested !== original.nested; // true
copy.when instanceof Date;       // true` },
      { name: "mergeObjects", sig: "mergeObjects<T extends object, U extends object>(target: T, source: U): T & U",
        desc: "Shallow merge into a new object. Properties from source win on conflicts; nested objects are not merged.",
        params: [p("target", "object", "Base object."), p("source", "object", "Wins on conflicts.")], returns: "T & U.", throws: [e("TypeError", "", "an argument is null, not an object, or an array")],
        ex: `mergeObjects({ a: 1, b: 1 }, { b: 2, c: 3 }); // { a: 1, b: 2, c: 3 }` },
      { name: "deepMerge", sig: "deepMerge<T extends object, U extends object>(target: T, source: U): T & U",
        desc: "Recursively merges plain objects into a new object. source wins and arrays are replaced, not concatenated. The keys __proto__, constructor and prototype are never copied, so untrusted JSON cannot pollute Object.prototype.",
        params: [p("target", "object", "Base object."), p("source", "object", "Wins on conflicts.")], returns: "T & U.", throws: [e("TypeError", "", "an argument is null, not an object, or an array")],
        ex: `deepMerge({ x: { y: 1, z: 1 } }, { x: { z: 2 } }); // { x: { y: 1, z: 2 } }` },
      { name: "deepEqual", sig: "deepEqual(a: unknown, b: unknown): boolean",
        desc: "Structural equality. Primitives compare with SameValueZero, so NaN equals NaN. Handles arrays, plain objects, Date, RegExp, Map, Set and circular references.",
        params: [p("a", "unknown", "First value."), p("b", "unknown", "Second value.")], returns: "boolean.",
        ex: `deepEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] }); // true
deepEqual(NaN, NaN);                                   // true
deepEqual([1, 2], { 0: 1, 1: 2 });                     // false` },
      { name: "pick", sig: "pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>",
        desc: "Copy of obj with only the listed own keys.",
        params: [p("obj", "T", "Source object."), p("keys", "K[]", "Keys to keep.")], returns: "Pick<T, K>.", throws: [e("TypeError", "", "obj is not an object or keys is not an array")],
        ex: `pick({ id: 1, name: "An", role: "dev" }, ["id", "name"]); // { id: 1, name: "An" }` },
      { name: "omit", sig: "omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K>",
        desc: "Copy of obj without the listed keys.",
        params: [p("obj", "T", "Source object."), p("keys", "K[]", "Keys to drop.")], returns: "Omit<T, K>.", throws: [e("TypeError", "", "obj is not an object or keys is not an array")],
        ex: `omit({ id: 1, name: "An", role: "dev" }, ["role"]); // { id: 1, name: "An" }` },
      { name: "mapValues", sig: "mapValues<T, R>(obj: Record<string, T>, fn: (value: T, key: string) => R): Record<string, R>",
        desc: "Same keys, transformed values.",
        params: [p("obj", "Record<string, T>", "Source object."), p("fn", "(value, key) => R", "Returns the new value.")], returns: "Record<string, R>.", throws: [e("TypeError", "", "obj is not an object or fn is not a function")],
        ex: `mapValues({ a: 1, b: 2 }, (v) => v * 2); // { a: 2, b: 4 }` },
      { name: "getByPath", sig: "getByPath(obj: unknown, path: string | (string | number)[], defaultValue?: unknown): unknown",
        desc: "Safe deep read with dot and bracket paths. Only own properties are followed, and defaultValue is returned for a missing or undefined result.",
        params: [p("obj", "unknown", "Object to read from."), p("path", "string | (string | number)[]", 'Path such as "a.b[0].c" or ["a", "b", 0, "c"].'), p("defaultValue", "unknown", "Returned when the path does not exist.", "undefined")], returns: "unknown.", throws: [e("TypeError", "", "path is not a string or array")],
        ex: `const data = { a: { b: [{ c: 5 }] } };
getByPath(data, "a.b[0].c");       // 5
getByPath(data, "a.x.y", "none");  // "none"` },
      { name: "isPlainObject", sig: "isPlainObject(value: unknown): value is Record<string, unknown>",
        desc: "True for object literals, Object.create(null) and new Object(). False for arrays, Dates, Maps and class instances.",
        params: [p("value", "unknown", "Anything.")], returns: "boolean.",
        ex: `isPlainObject({});         // true
isPlainObject([]);         // false
isPlainObject(new Date()); // false` },
      { name: "isEmpty", sig: "isEmpty(value: unknown): boolean",
        desc: 'True for null, undefined, "", [], an empty Map or Set, and a plain object with no keys. Every other value, including 0, false and Date objects, is not empty.',
        params: [p("value", "unknown", "Anything.")], returns: "boolean.",
        ex: `isEmpty([]);       // true
isEmpty({});       // true
isEmpty({ a: 1 }); // false
isEmpty(0);        // false` },
    ],
  },
  /* ------------------------------------------------------------------ */
  {
    id: "functions", title: "Functions",
    note: "Helpers for timing, caching and resilience. Time arguments are in milliseconds and must be non-negative finite numbers; callbacks must be functions.",
    fns: [
      { name: "debounce", run: false, sig: "debounce<F>(fn: F, wait: number, options?: DebounceOptions): Debounced<F>",
        desc: "Delays fn until wait ms have passed without another call. The latest this and arguments are used. The returned function has cancel() to drop the pending call and flush() to run it now.",
        params: [p("fn", "Function", "The function to delay."), p("wait", "number", "Quiet period in milliseconds."), p("options.leading", "boolean", "Call immediately on the first call of a burst.", "false"), p("options.trailing", "boolean", "Call after the burst ends.", "true")],
        returns: "Debounced<F>: a function with cancel() and flush().", throws: [e("TypeError", "", "fn is not a function or wait is not a finite number"), e("RangeError", "", "wait is negative")],
        ex: `const save = debounce(saveDraft, 300);
save(1); save(2); save(3); // saveDraft(3) runs once, 300 ms later
save.cancel();             // or drop it` },
      { name: "throttle", run: false, sig: "throttle<F>(fn: F, wait: number, options?: ThrottleOptions): Throttled<F>",
        desc: "Calls fn at most once every wait ms. cancel() drops the pending call.",
        params: [p("fn", "Function", "The function to limit."), p("wait", "number", "Minimum gap between calls in milliseconds."), p("options.leading", "boolean", "Run on the first call.", "true"), p("options.trailing", "boolean", "Run once more with the latest arguments after the wait.", "true")],
        returns: "Throttled<F>: a function with cancel().", throws: [e("TypeError", "", "fn is not a function or wait is not a finite number"), e("RangeError", "", "wait is negative")],
        ex: `const onScroll = throttle(updatePosition, 100);
window.addEventListener("scroll", onScroll);` },
      { name: "memoize", run: false, sig: "memoize<F>(fn: F, options?: MemoizeOptions<F>): Memoized<F>",
        desc: "Caches results. Without a resolver only the first argument is the cache key, so pass resolver for functions with several arguments. Exposes cache and clear().",
        params: [p("fn", "Function", "The function to cache."), p("options.resolver", "(...args) => unknown", "Computes the cache key from the arguments.", "the first argument"), p("options.maxSize", "number", "Evict the oldest entry past this size: a positive integer.", "unbounded")],
        returns: "Memoized<F>: fn plus cache and clear().", throws: [e("TypeError", "", "fn or resolver is not a function"), e("RangeError", "", "maxSize is not a positive integer")],
        ex: "const slowSquare = memoize((n: number) => n * n);\nslowSquare(9); slowSquare(9); // computed once\n\nconst add = memoize((a: number, b: number) => a + b, {\n  resolver: (a, b) => `${a}:${b}`,\n});" },
      { name: "once", run: false, sig: "once<F>(fn: F): (...args: Parameters<F>) => ReturnType<F>",
        desc: "Runs fn on the first call only and returns that same result on every later call.",
        params: [p("fn", "Function", "The function to run once.")], returns: "A function returning the first result.", throws: [e("TypeError", "", "fn is not a function")],
        ex: `const init = once(() => connect());
init(); init(); // connect() runs once` },
      { name: "getAbortError", run: false, sig: "getAbortError(signal?: AbortSignal): AbortErrorType",
        desc: "Returns signal.reason when it is present; otherwise creates an Error named AbortError with the standard abort message.",
        params: [p("signal", "AbortSignal", "An optional signal whose abort reason is preserved.", "undefined")], returns: "AbortErrorType.",
        ex: `const controller = new AbortController();
controller.abort();
getAbortError(controller.signal).name; // "AbortError"` },
      { name: "isAbortError", run: false, sig: "isAbortError(error: unknown): error is AbortErrorType",
        desc: "Type guard for errors whose name is AbortError.",
        params: [p("error", "unknown", "The caught value to inspect.")], returns: "boolean; narrows to AbortErrorType when true.",
        ex: `try {
  await fetch(url, { signal });
} catch (error) {
  if (isAbortError(error)) { /* cancellation is expected */ }
}` },
      { name: "wait", run: false, sig: "wait(time: number, options?: { signal?: AbortSignal }): Promise<void>",
        desc: "Resolves after time milliseconds. If the signal aborts before then, clears its timer and rejects with the signal reason or an AbortError.",
        params: [p("time", "number", "Delay in milliseconds."), p("options.signal", "AbortSignal", "Cancels the pending wait.", "undefined")], returns: "Promise<void>.",
        ex: `const controller = new AbortController();
const pending = wait(1000, { signal: controller.signal });
controller.abort(); // pending rejects with AbortError` },
      { name: "sleep", run: false, sig: "sleep(ms: number): Promise<void>", desc: "Resolves after ms milliseconds.",
        params: [p("ms", "number", "Delay in milliseconds, 0 or more.")], returns: "Promise<void>.", throws: [e("TypeError", "", "ms is not a finite number"), e("RangeError", "", "ms is negative")],
        ex: `await sleep(500);` },
      { name: "retry", run: false, sig: "retry<T>(fn: () => T | Promise<T>, options?: RetryOptions): Promise<T>",
        desc: "Calls fn until it succeeds and rethrows the last error when the attempts run out.",
        params: [p("fn", "() => T | Promise<T>", "The operation to attempt."), p("options.retries", "number", "Retries after the first attempt: an integer, 0 or more.", "3"), p("options.delayMs", "number", "Delay before the first retry.", "0"), p("options.factor", "number", "Multiplies the delay after every retry; 2 gives exponential backoff. At least 1.", "1"), p("options.shouldRetry", "(error, attempt) => boolean", "Return false to stop and rethrow immediately.", "always retry")],
        returns: "Promise<T>, the first successful result.", throws: [e("TypeError", "", "fn is not a function"), e("RangeError", "", "retries, delayMs or factor is out of range")],
        ex: `const data = await retry(() => fetchJson(url), {
  retries: 4,
  delayMs: 200,
  factor: 2, // waits 200, 400, 800, 1600 ms
  shouldRetry: (error) => !(error instanceof AuthError),
});` },
      { name: "withRetry", run: false, sig: "withRetry<T>(fn: () => Promise<T>, options?: WithRetryParameters): Promise<T>",
        desc: "Retries a rejected async operation. It waits 100 ms and retries twice by default; an aborted signal or an AbortError stops immediately.",
        params: [p("fn", "() => Promise<T>", "The async operation to attempt."), p("options.delay", "number | ({ count, error }) => number", "Delay before each retry, or a callback that chooses it.", "100"), p("options.retryCount", "number", "Maximum retries after the first attempt.", "2"), p("options.shouldRetry", "({ count, error }) => boolean | Promise<boolean>", "Return false to stop and reject with the current error.", "always retry"), p("options.signal", "AbortSignal", "Cancels a pending retry or prevents the next attempt.", "undefined")], returns: "Promise<T>, the first successful result.",
        ex: `const data = await withRetry(() => fetchJson(url), {
  delay: ({ count }) => 200 * 2 ** count,
  retryCount: 4,
  signal: controller.signal,
});` },
      { name: "withTimeout", run: false, sig: "withTimeout<T>(promise: PromiseLike<T>, ms: number, message?: string): Promise<T>",
        desc: 'Rejects with an Error named "TimeoutError" when the promise is not settled within ms. It does not cancel the underlying work.',
        params: [p("promise", "PromiseLike<T>", "The operation to wait for."), p("ms", "number", "Time limit in milliseconds, 0 or more."), p("message", "string", "Error message.", '"Timed out after {ms}ms"')],
        returns: "Promise<T>.", throws: [e("TypeError", "", "ms is not a finite number"), e("RangeError", "", "ms is negative")],
        ex: `try {
  await withTimeout(fetch(url), 5000);
} catch (error) {
  if (error.name === "TimeoutError") { /* too slow */ }
}` },
    ],
  },
  {
    id: "validators", title: "Validators",
    note: "Type guards that return a boolean and never throw. They check syntax only: they cannot tell whether a mailbox or a URL actually exists.",
    fns: [
      { name: "isEmail", sig: "isEmail(value: unknown): value is string",
        desc: "Pragmatic syntax check for local@domain.tld, with a 254-character limit and a 64-character local part. It is not full RFC 5322; confirm an address by sending a message.",
        params: [p("value", "unknown", "Anything.")], returns: "boolean.",
        ex: `isEmail("user@example.com"); // true
isEmail("a@b");              // false
isEmail("a..b@c.com");       // false` },
      { name: "isUrl", sig: "isUrl(value: unknown, options?: IsUrlOptions): value is string",
        desc: "True when the value parses as an absolute URL with an allowed protocol, which by default rejects javascript: and data: URLs.",
        params: [p("value", "unknown", "Anything."), p("options.protocols", "string[]", 'Accepted protocols, with the colon.', '["http:", "https:"]')], returns: "boolean.",
        ex: `isUrl("https://example.com/path?q=1");        // true
isUrl("javascript:alert(1)");                 // false
isUrl("ftp://host", { protocols: ["ftp:"] }); // true` },
      { name: "isUuid", sig: "isUuid(value: unknown, version?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8): value is string",
        desc: "True for a UUID string (versions 1 to 8, case-insensitive).",
        params: [p("value", "unknown", "Anything."), p("version", "1 | 2 | … | 8", "Require a specific version.", "any")], returns: "boolean.",
        ex: `isUuid("123e4567-e89b-12d3-a456-426614174000");    // true
isUuid("123e4567-e89b-12d3-a456-426614174000", 4); // false` },
    ],
  },
];

if (typeof module !== "undefined") module.exports = { GROUPS };
