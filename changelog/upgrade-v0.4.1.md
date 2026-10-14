# TASK: Upgrade @fatdevcon/utilities to v0.4.1

## ROLE

Act as a combination of:

1. Principal TypeScript Library Engineer
2. Senior Software Architect
3. Senior JavaScript/TypeScript Runtime Engineer
4. Senior QA Automation Engineer
5. Performance and Bundle Optimization Engineer
6. Open-Source Package Maintainer

You have extensive experience building production-grade npm packages used by thousands of applications.

Your responsibility is to IMPLEMENT, TEST, VERIFY, OPTIMIZE, and DOCUMENT the requested changes.

Do not stop after proposing a plan.

Execute the implementation and verification directly in the repository.

Prioritize:

- Correctness
- Runtime safety
- Backward compatibility
- Type safety
- Small consumer bundle size
- Clean architecture
- Maintainability
- Reliable error handling
- Comprehensive regression testing
- Excellent developer experience

Do not claim that code is safe, optimized, or fully tested without verifying it.

---

# 1. PROJECT CONTEXT

Package: @fatdevcon/utilities
Target version: 0.4.1

Repository:
https://github.com/PhanHoangQuocTu/fatdevcon-utilities

Documentation:
https://phanhoangquoctu.github.io/fatdevcon-utilities/

NPM:
https://www.npmjs.com/package/@fatdevcon/utilities

The package provides reusable JavaScript and TypeScript utilities, including:

- Exact decimal arithmetic
- BigInt operations
- Number formatting
- Currency formatting
- Date and timezone utilities
- Unicode-safe string manipulation
- Arrays and collections
- Object manipulation
- Algorithms
- Validation
- Async utilities
- Runtime detection
- Type conversion

Important project principles:

- Zero runtime dependencies
- Tree-shakeable named exports
- ESM and CommonJS compatibility
- TypeScript declaration support
- Node.js 18+ compatibility
- Browser compatibility
- Bun compatibility
- Stable existing public APIs
- Backward compatibility
- Predictable error handling
- Safe handling of edge cases

The existing implementation, repository configuration, and project documentation are the source of truth.

Do not blindly assume that the project structure or APIs match this description.

Inspect the actual repository first.

---

# 2. MANDATORY SOURCE CODE INSPECTION

Before making ANY changes:

Read and understand:

- package.json
- package-lock.json, if present
- README.md
- CHANGELOG.md, if present
- CLAUDE.md, if present
- AGENTS.md, if present
- .claude/rules/, if present
- tsconfig.json
- Build configuration
- ESLint configuration
- Jest configuration
- src/index.ts
- src/modules/
- src/types/
- Existing test files
- docs/
- GitHub Actions workflows
- Release and publishing scripts

Discover additional relevant files automatically.

Do not assume filenames or directory structures.

## 2.1 Understand existing architecture

Identify:

1. Public export conventions
2. Naming conventions
3. Module organization
4. Existing string utilities
5. Existing conversion utilities
6. Existing validation utilities
7. Existing type guards
8. Existing error-handling conventions
9. Shared helper patterns
10. TypeScript typing conventions
11. Existing tests and fixtures
12. Documentation generation workflow
13. Package build outputs
14. Tree-shaking strategy
15. Browser and SSR compatibility requirements

## 2.2 Audit existing functions

Pay special attention to existing APIs such as:

- toNumber
- toBoolean
- safeJsonParse
- truncateText
- camelCase
- pascalCase
- slugify
- Existing trim utilities
- Existing capitalization utilities
- Existing type conversion helpers

These names are examples.

Verify their actual existence and behavior.

Avoid introducing duplicate functions with overlapping responsibilities.

If a requested function already exists:

- Review its implementation.
- Inspect existing tests.
- Identify any real defects.
- Improve it only when backward compatibility can be preserved.
- Expand tests.
- Update documentation if necessary.

Do not rename or remove existing public functions.

## 2.3 Establish a baseline

Before implementation:

Run the existing validation scripts.

Record:

- Current package version
- Existing test status
- Existing test coverage, if available
- Existing build status
- Existing TypeScript errors
- Existing lint errors
- Current package size
- Current relevant consumer bundle sizes
- Existing public exports

Preserve baseline information for comparison.

Do not attribute pre-existing failures to the new implementation.

If the repository is not currently at v0.4.0, inspect its version history and avoid overwriting unrelated changes.

---

# 3. PRIMARY OBJECTIVE

Upgrade the package to:

@fatdevcon/utilities@0.4.1

The primary feature is a new collection of:

DATA CLEANING AND SAFE TYPE CONVERSION UTILITIES.

The goal is to help developers handle common real-world JavaScript/TypeScript data problems more safely.

Examples:

- Unexpected whitespace
- Incorrect capitalization
- Invalid numeric strings
- null and undefined values
- NaN and Infinity
- Unsafe numeric conversions
- Unexpected input types
- Unicode characters
- Empty strings
- Malformed JSON
- Invalid boolean representations
- Objects that cannot be converted safely
- Invalid dates
- Numeric precision loss
- Unexpected runtime exceptions

The new utilities should reduce common runtime failures caused by malformed external data.

However, do not promise that arbitrary JavaScript operations, external callbacks, or all possible runtime environments can never throw.

Use predictable, documented failure behavior.

---

# 4. NEW FEATURE: DATA CLEANING UTILITIES

Implement a cohesive set of reusable string-cleaning utilities.

Prefer extending the existing string module structure.

Do not create unnecessary architecture.

## 4.1 strip()

Provide a Python-inspired strip utility.

Example:

strip("   nguyen van an   ")

Expected:

"nguyen van an"

Requirements:

- Remove leading whitespace.
- Remove trailing whitespace.
- Handle empty strings.
- Handle tabs.
- Handle newlines.
- Handle carriage returns.
- Handle Unicode whitespace.
- Handle mixed whitespace.
- Avoid modifying internal whitespace.
- Avoid unnecessary memory allocations.

Consider supporting an optional character-set argument similar to Python's str.strip(chars).

If implemented, ensure it removes characters from the ends rather than treating the argument as a complete substring.

Document any differences from Python.

## 4.2 lstrip()

Remove whitespace or optionally specified characters from the beginning.

Example:

lstrip("   hello   ")

Expected:

"hello   "

## 4.3 rstrip()

Remove whitespace or optionally specified characters from the end.

Example:

rstrip("   hello   ")

Expected:

"   hello"

## 4.4 title()

Implement title-case conversion.

Example:

title("nguyen van an")

Expected:

"Nguyen Van An"

Combined example:

title(strip("   nguyen van an   "))

Expected:

"Nguyen Van An"

Requirements:

- Handle leading/trailing whitespace.
- Handle multiple spaces.
- Handle mixed uppercase and lowercase.
- Handle Unicode letters.
- Handle Vietnamese characters.
- Handle accented characters.
- Handle punctuation.
- Handle apostrophes.
- Handle hyphenated words.
- Handle empty strings.
- Avoid corrupting emoji.
- Support locale-sensitive behavior only when its semantics are clear and tested.

Examples:

"nGUYEN vAN aN"
"đẶNG vĂN lÂM"
"john DOE"
"hello-world"
"o'connor"
"hello   world"

Important:

Python's str.title() has specific word-boundary behavior that is not always desirable for real personal names.

Choose and document an explicit policy.

Do not claim perfect equivalence with Python unless tests demonstrate it.

## 4.5 capitalize()

Example:

capitalize("hELLO WORLD")

Expected:

"Hello world"

Requirements:

- Capitalize the first character appropriately.
- Lowercase the remaining text according to the documented contract.
- Handle Unicode.
- Handle empty strings.
- Avoid unsafe indexing assumptions.

## 4.6 firstChar()

Return the first user-perceived character.

Examples:

firstChar("Hello") -> "H"
firstChar("") -> ""

Important Unicode cases:

- Emoji
- Surrogate pairs
- Combining characters
- Zero-width joiner sequences
- Family emoji
- Skin-tone modifiers

Prefer grapheme-aware behavior using Intl.Segmenter when available.

If Intl.Segmenter is unavailable:

- Provide a documented fallback.
- Never return a broken UTF-16 surrogate.
- Explicitly test fallback differences.
- Do not silently promise full grapheme correctness.

Do not add a large runtime dependency solely for this feature.

## 4.7 lastChar()

Return the last user-perceived character.

Examples:

lastChar("Hello") -> "o"
lastChar("") -> ""

Apply the same Unicode and compatibility requirements as firstChar().

Do not use naive string.length indexing when it can split Unicode characters.

## 4.8 normalizeWhitespace()

Example:

normalizeWhitespace(" Hello    world \n  TypeScript ")

Expected:

"Hello world TypeScript"

Requirements:

- Handle repeated whitespace.
- Handle tabs and newlines.
- Handle Unicode whitespace.
- Provide predictable trimming semantics.
- Avoid destructive transformations beyond the documented contract.

## 4.9 Additional cleaning utilities

Inspect the existing implementation before choosing additional functions.

Evaluate these candidates:

- removeAccents
- removeExtraSpaces
- cleanString
- normalizeText
- isBlank
- isEmptyString

Implement only functions that have:

1. A clear real-world use case.
2. Well-defined behavior.
3. No unnecessary overlap with existing functions.
4. Minimal runtime overhead.
5. Straightforward TypeScript interfaces.
6. Comprehensive tests.

Do not introduce multiple names that do essentially the same thing without a strong compatibility reason.

Do not remove Vietnamese diacritics by default in generic text-cleaning functions.

Accent removal must be explicit and opt-in.

Unicode normalization should also be clearly documented.

---

# 5. NEW FEATURE: SAFE TYPE CONVERSION

This is a high-priority part of v0.4.1.

JavaScript conversion APIs can produce unexpected results or throw errors.

Examples:

Number("abc")       // NaN
Number("")          // 0
Number("   ")       // 0
Number(undefined)   // NaN
Number(Symbol())    // TypeError

Converting a BigInt to Number can also silently lose integer precision.

Examples:

Number(9007199254740993n)

Some objects may throw during primitive conversion.

For instance, their valueOf() or toString() methods may throw.

The new utilities must provide explicitly documented safer alternatives.

## 5.1 safeToNumber()

Design and implement a safe conversion utility.

Proposed API name:

safeToNumber

First check whether an equivalent API already exists.

Recommended contract:

safeToNumber(value: unknown): number | null

Invalid conversions should return null by default.

If a different fallback convention already exists in the repository, preserve consistency and justify the final design.

Example behavior:

safeToNumber("123")         -> 123
safeToNumber("12.5")        -> 12.5
safeToNumber("-10")         -> -10
safeToNumber(0)             -> 0
safeToNumber(null)          -> null
safeToNumber(undefined)     -> null
safeToNumber("")            -> null
safeToNumber("   ")         -> null
safeToNumber("abc")         -> null
safeToNumber("12abc")       -> null
safeToNumber(NaN)           -> null
safeToNumber(Infinity)      -> null
safeToNumber(-Infinity)     -> null
safeToNumber(Symbol())      -> null

Support safe numeric formats only when clearly defined.

Avoid accidentally accepting malformed numeric strings.

Do not silently interpret locale-specific separators.

For example:

"1,234.56"
"1.234,56"
"12px"

These should not be accepted without an explicit documented parsing policy.

### Numeric precision

Never silently lose integer precision when converting BigInt or integer strings.

Evaluate:

- Number.isFinite
- Number.isSafeInteger
- BigInt precision
- Decimal representations
- Exponential notation
- Negative zero
- Signed values
- Very large numbers
- Very small numbers
- Numeric underflow/overflow

Use a clear, tested policy for unsafe integers.

Do not reject every ordinary fractional Number merely because binary floating-point cannot represent it exactly.

The package already has exact decimal arithmetic utilities.

Reuse the existing architecture where appropriate rather than creating a second decimal engine.

### Fallback option

Consider:

safeToNumber(value, { fallback: 0 })

Only introduce this interface if it is clean, type-safe, and useful.

Ensure no ambiguity exists between an invalid value and a valid numeric zero.

### Boolean coercion

Do not automatically convert all truthy/falsy values to numbers unless explicitly requested.

Any optional coercion mode must be predictable and documented.

---

# 6. ADDITIONAL SAFE CONVERSION UTILITIES

Audit existing conversion helpers before adding new ones.

Recommended candidates:

## 6.1 safeToInteger()

Safely convert integer-like values.

Handle:

- Integer numbers
- Signed integer strings
- Fractional values
- BigInt
- Negative zero
- Unsafe integers
- NaN
- Infinity
- null
- undefined
- Invalid strings

Do not silently truncate fractional values unless the API explicitly supports and documents that behavior.

## 6.2 safeToBigInt()

Handle:

- bigint values
- Valid integer strings
- Safe integer numbers
- Zero
- Negative integers
- Extremely large integer strings

Reject invalid decimal strings and unsafe floating-point Number inputs.

Avoid reconstructing already-lost precision.

## 6.3 safeToBoolean()

Safely handle predictable boolean representations.

Suggested behavior:

true       -> true
false      -> false
"true"     -> true
"false"    -> false
"1"        -> true
"0"        -> false
1          -> true
0          -> false
null       -> null
undefined  -> null

Additional representations such as:

- yes / no
- on / off

May be supported only through an explicit, documented policy.

Avoid JavaScript's surprising behavior:

Boolean("false") -> true

The safe conversion should not inherit this ambiguity unintentionally.

## 6.4 safeToString()

Provide predictable conversion for common values.

Handle:

- Strings
- Numbers
- Booleans
- BigInt
- null
- undefined
- Symbols
- Arrays
- Objects
- Dates
- Objects with throwing conversion methods
- Circular structures when JSON conversion is involved

Do not assume String(value), template literals, and JSON.stringify(value) have identical semantics.

Define a clear contract.

Avoid accidentally exposing "[object Object]" as meaningful application data unless explicitly intended.

## 6.5 safe JSON parsing

Inspect existing safeJsonParse first.

If it already exists:

- Preserve the public API.
- Extend regression tests.
- Improve genuine defects without breaking behavior.

Test:

- Valid JSON
- Invalid JSON
- Empty strings
- Primitive JSON
- Nested objects
- Arrays
- Large JSON documents
- Extremely deep structures
- null
- Prototype-sensitive keys

Do not duplicate an existing helper under a new name unnecessarily.

## 6.6 Safe date conversion

Inspect existing date parsing APIs.

If genuinely necessary, design a safe date conversion function.

Handle:

- Valid Date objects
- Invalid Date objects
- ISO date strings
- Unsupported formats
- Leap years
- Month boundaries
- Timezone ambiguity
- Year 0-99 handling
- DST transitions
- Invalid timestamps
- NaN and Infinity

Do not duplicate current date functionality.

Do not silently reinterpret ambiguous dates.

Do not expand the scope of this patch release unnecessarily.

---

# 7. RUNTIME SAFETY AND ERROR HANDLING

The new safe APIs should accept unknown inputs when appropriate.

Avoid unsafe assumptions such as:

value.trim()
value.toString()
value.length

Before validating the input.

Handle malformed values gracefully.

Consider:

- null
- undefined
- number
- string
- boolean
- bigint
- symbol
- object
- array
- function
- Date
- Map
- Set
- Object.create(null)
- Objects with throwing valueOf()
- Objects with throwing toString()
- Proxies with throwing traps
- Circular references
- Getters that throw

Use try/catch at appropriate failure boundaries.

Never use blanket try/catch everywhere merely to hide programming errors.

Important requirements:

1. Expected invalid data must be handled predictably.
2. Conversion failures must not leak unexpected exceptions from documented safe APIs.
3. Existing APIs must preserve their documented error behavior.
4. Do not silently swallow programmer errors in existing strict APIs.
5. Do not silently coerce unrelated types.
6. Do not mutate input data.
7. Do not introduce unsafe prototype operations.
8. Do not introduce prototype pollution vulnerabilities.
9. Do not use eval or Function constructors.
10. Do not execute arbitrary user-supplied strings.

For objects with arbitrary user-defined behavior, catch synchronous conversion exceptions where feasible.

Document limitations that cannot reasonably be prevented, such as process termination, resource exhaustion, or arbitrary user callbacks.

Never claim absolute crash prevention.

---

# 8. BACKWARD COMPATIBILITY

THIS IS A CRITICAL REQUIREMENT.

Version 0.4.1 is a patch release.

Existing users must not experience breaking changes.

Do not:

- Rename existing functions.
- Remove existing exports.
- Change existing argument order.
- Change existing return types incompatibly.
- Change existing error codes.
- Change existing exception behavior incompatibly.
- Change default behavior without justification.
- Introduce incompatible TypeScript declarations.
- Change import paths unexpectedly.
- Introduce new required dependencies.

Examples:

import { formatNumber } from "@fatdevcon/utilities";

import { toNumber } from "@fatdevcon/utilities";

These imports must continue working if they currently exist.

Any existing documented function signature must remain valid.

When improving existing implementations:

1. Identify the bug.
2. Add a regression test.
3. Verify the fix.
4. Verify existing behavior.
5. Confirm TypeScript compatibility.
6. Confirm downstream consumer compatibility.

Do not change behavior merely for stylistic consistency.

If a requested change requires a breaking API modification:

Do not implement that breaking modification in v0.4.1.

Use a new additive API or record it as a recommendation for a future major release.

---

# 9. TYPESCRIPT DESIGN REQUIREMENTS

All new functions must have excellent TypeScript support.

Requirements:

- Strict typing
- No unnecessary any
- Prefer unknown for external input
- Clear return types
- Useful generic types where necessary
- Correct nullable types
- Type-safe fallback options
- Correct declaration generation
- IDE IntelliSense support
- Helpful JSDoc
- No unnecessary type assertions

Avoid over-engineered generic abstractions.

Example:

const result = safeToNumber(input);

TypeScript must correctly infer its documented return type.

Test both runtime behavior and compile-time type behavior.

Consider TypeScript test cases using:

- @ts-expect-error
- Type assertions
- Declaration consumption tests
- Existing repository type-test infrastructure

Choose the most maintainable solution.

---

# 10. CLEAN ARCHITECTURE

Maintain the existing repository structure unless there is a compelling reason to improve it.

If modules already contain:

src/modules/string/
src/modules/number/
src/modules/validation/

Extend them appropriately.

These paths are illustrative.

Use the actual existing layout.

Architecture principles:

- Single responsibility
- High cohesion
- Low coupling
- Minimal dependencies
- Small reusable helpers
- No unnecessary class hierarchies
- No unnecessary configuration layers
- No circular imports
- No duplicated logic
- No unnecessary abstractions
- Pure functions where possible
- Explicit function contracts
- Consistent naming
- Consistent error handling

Do not refactor unrelated modules simply to make them look different.

Only make structural improvements that measurably improve maintainability or fix an identified problem.

---

# 11. BUNDLE SIZE OPTIMIZATION

Bundle size is a major requirement.

Optimize BOTH:

1. Published package artifacts.
2. Actual downstream consumer bundle sizes.

Do not optimize only the final dist directory size.

Requirements:

- Zero runtime dependencies
- Preserve tree-shaking
- Preserve named exports
- Avoid importing large modules unnecessarily
- Avoid unnecessary polyfills
- Avoid unnecessary external libraries
- Avoid module-level side effects
- Avoid duplicated conversion logic
- Avoid duplicated Unicode processing code
- Avoid large lookup tables unless justified
- Avoid expensive module initialization
- Use built-in platform APIs where appropriate

Examples:

- String.prototype.trim()
- String.prototype.normalize()
- Number.isFinite()
- Number.isSafeInteger()
- Intl.Segmenter when supported

Any fallback must be tested and documented.

Preserve the repository's current publishing strategy.

If published JavaScript is intentionally unminified, do not change that policy simply to reduce dist size.

Measure:

- Package tarball size
- Raw built output size
- Gzipped output size
- Individual function import bundle size
- Representative multi-function consumer bundle size

Compare against the baseline.

Use the existing build/test tools when possible.

Do not introduce runtime dependencies for simple utilities.

Avoid large increases in bundle size without a demonstrated benefit.

A small increase in package size is acceptable when justified by useful new functionality.

Correctness takes priority over superficial byte savings.

---

# 12. PERFORMANCE OPTIMIZATION

Optimize functions for common usage and large datasets.

Consider:

- Time complexity
- Space complexity
- Temporary allocations
- Regex efficiency
- Unicode processing overhead
- Repeated conversions
- Unnecessary object creation
- Large string processing
- Very large numeric strings

Avoid catastrophic regex backtracking.

Avoid quadratic string concatenation patterns when possible.

Do not introduce caching unless benchmarks justify it.

Avoid shared mutable state.

Create reproducible benchmarks for relevant operations.

Compare implementations where meaningful.

Do not sacrifice correctness for minor performance improvements.

Do not make unsupported claims such as "fastest possible".

---

# 13. COMPREHENSIVE TESTING REQUIREMENTS

Act as an experienced QA engineer.

The testing strategy must cover both new and existing APIs.

Do not only test happy paths.

Do not merely add a few simple unit tests.

Implement a meaningful combination of:

- Unit tests
- Edge-case tests
- Boundary tests
- Regression tests
- Type tests
- Property-based tests
- Deterministic fuzz tests
- Integration tests
- Packaging tests
- Consumer compatibility tests
- Performance tests where appropriate

Prefer parameterized tests for broad data matrices.

Do not introduce thousands of redundant tests that provide no additional coverage.

Prioritize meaningful behavioral coverage.

---

# 14. TEST MATRIX: STRING CLEANING

Test inputs such as:

""
" "
"     "
"\t"
"\n"
"\r\n"
" hello "
"   hello   world   "
"NGUYEN VAN AN"
"nguyen van an"
"nGUYEN vAN aN"
"đẶNG vĂN lÂM"
"TRẦN THỊ BÍCH NGỌC"
"john-doe"
"o'connor"
"hello_world"
"hello123world"
"hello🌍"
"👨‍👩‍👧‍👦family"
"👍🏽"
"🇻🇳"
"e\u0301"
"\u00E9"

Also test:

- Mixed Unicode normalization forms
- Combining marks
- Emoji sequences
- Astral-plane characters
- Non-breaking spaces
- Zero-width characters
- Special punctuation
- Multiple word separators
- Locale-sensitive casing
- Very long strings

Include inputs of approximately:

- 0 characters
- 1 character
- 10 characters
- 100 characters
- 1,000 characters
- 10,000 characters
- 100,000 characters
- 1,000,000 characters

Put expensive stress tests in an appropriate test category or suite.

Use bounded inputs and reasonable timeouts.

Ensure results are deterministic.

Verify:

- Correct output
- No input mutation
- No unhandled exception for supported inputs
- Reasonable runtime
- No accidental Unicode corruption

---

# 15. TEST MATRIX: SAFE CONVERSION

Test all supported JavaScript types.

## Number cases

0
-0
1
-1
0.1
-0.1
1.5
-1.5
Number.MIN_VALUE
Number.MAX_VALUE
Number.MAX_SAFE_INTEGER
Number.MIN_SAFE_INTEGER
Number.MAX_SAFE_INTEGER + 1
NaN
Infinity
-Infinity

## String cases

"0"
"-0"
"1"
"-1"
"1.5"
"-1.5"
"001"
" 123 "
""
" "
"\t"
"\n"
"abc"
"123abc"
"0xFF"
"1e3"
"1e999"
"1e-999"
"Infinity"
"NaN"
"1,000"
"1.000,50"

Decide which numeric syntaxes are supported.

Document and test the decision.

Pay particular attention to exponent overflow and underflow.

## BigInt cases

0n
1n
-1n
BigInt(Number.MAX_SAFE_INTEGER)
BigInt(Number.MAX_SAFE_INTEGER) + 1n

Also test very large BigInt values.

## Other input types

null
undefined
true
false
Symbol()
[]
[1]
[1, 2]
{}
Object.create(null)
new Date()
new Date("invalid")
() => {}
new Map()
new Set()

Add throwing conversion objects:

const throwingValueOf = {
  valueOf() {
    throw new Error("Conversion failed");
  }
};

const throwingToString = {
  toString() {
    throw new Error("Conversion failed");
  }
};

Include Proxies with throwing traps where appropriate.

The safe APIs must honor their documented failure contract.

## Additional cases

- Decimal precision
- Very large integer strings
- Leading zeros
- Negative values
- Whitespace
- Scientific notation
- Unexpected object coercion
- Unicode digits
- Malformed boolean strings
- Circular structures
- Prototype-sensitive object keys
- Invalid JSON
- Invalid dates
- Date timezone boundaries

Do not create expectations based on assumptions.

Derive expected behavior from the explicit API contract.

---

# 16. TEST MATRIX: EXISTING FUNCTIONS

Audit existing public functions.

Focus on high-risk modules:

1. Exact decimal math
2. BigInt
3. Currency formatting
4. Number formatting
5. Date calculations
6. Timezone handling
7. Unicode strings
8. Arrays and collections
9. Object manipulation
10. Async utilities
11. Validation
12. Existing type conversions

For each module:

- Check existing test coverage.
- Identify important missing cases.
- Add regression tests.
- Detect edge-case defects.
- Fix confirmed defects safely.
- Preserve public behavior.

Special attention:

## Dates

Test:

- Leap years
- Non-leap years
- February 28
- February 29
- February 30 invalid handling
- Years divisible by 4
- Years divisible by 100
- Years divisible by 400
- Years 0-99
- Month boundaries
- Year boundaries
- DST transitions
- UTC offsets
- Invalid dates
- Very large and small supported years

## Numeric math

Test:

- Decimal drift
- Negative values
- Zero
- Negative zero
- Very large integers
- Very small decimals
- Division by zero
- Rounding modes
- Number/string/BigInt combinations
- Precision boundaries
- Stable error codes

Use established mathematical references or existing development-only test oracles where appropriate.

Do not add runtime dependencies.

## Arrays and objects

Test:

- Empty arrays
- Singleton arrays
- Large arrays
- Nested objects
- Deep nesting
- Sparse arrays
- Duplicate keys
- Circular references
- Prototype pollution
- Object immutability
- Stable ordering

Avoid introducing huge synchronous stress suites into normal CI.

Balance coverage, runtime and resource consumption.

---

# 17. DETERMINISTIC FUZZ TESTING

Introduce deterministic fuzz or property-based tests where appropriate.

Requirements:

- Fixed random seeds
- Reproducible failures
- Defined input generators
- Clearly documented invariants
- Shrinking support when tooling allows
- Reasonable execution limits

Potential properties:

- strip() is idempotent.
- normalizeWhitespace() is idempotent.
- Safe conversion never returns NaN under a finite-number contract.
- Safe integer conversion never returns unsafe integers.
- Invalid conversion inputs produce documented fallbacks.
- Existing immutable utilities do not mutate inputs.
- Unicode utilities never produce unpaired surrogate characters for supported operations.

Be careful:

Do not invent mathematical properties that are untrue for floating-point or locale-sensitive operations.

Verify that each property follows from the actual contract.

Use existing test infrastructure.

A development-only testing dependency may be added only when justified and compatible with repository conventions.

Zero runtime dependencies must remain unchanged.

---

# 18. SECURITY AND ROBUSTNESS

Inspect code for:

- Prototype pollution
- Unsafe key assignment
- Untrusted object conversion
- Unexpected getter invocation
- Throwing coercion methods
- ReDoS-prone regular expressions
- Unbounded recursion
- Excessive memory allocation
- Unsafe numeric precision loss
- Unintentional data modification
- Dangerous assumptions about runtime globals

For each confirmed security or robustness issue:

1. Create a regression test.
2. Apply a minimal safe fix.
3. Verify backward compatibility.
4. Confirm no new dependency is introduced.

Avoid claiming protection against malicious code execution from arbitrary user-provided callbacks.

---

# 19. DOCUMENTATION UPDATE

Update all relevant documentation.

Discover the actual documentation source files.

Potential files include:

- README.md
- CHANGELOG.md
- docs/index.html
- docs/api-data.js
- docs assets
- API reference
- Package metadata
- Usage examples
- Release documentation

Do not assume all these files exist.

## README

Add a clear section for:

Data Cleaning Utilities

Include examples:

import {
  strip,
  title,
  firstChar,
  lastChar
} from "@fatdevcon/utilities";

const name = title(strip("   nguyen van an   "));

console.log(name);
// "Nguyen Van An"

const first = firstChar("Hello");
// "H"

const last = lastChar("Hello");
// "o"

Also document safe conversion APIs using their actual implemented names and signatures.

Explain:

- Input behavior
- Output behavior
- Invalid input handling
- Fallback options
- Unicode behavior
- Precision limitations
- TypeScript types

## Documentation website

Update relevant API reference entries.

Every new exported function must have:

- Function name
- Description
- Parameters
- Return type
- Usage example
- Edge-case notes when necessary

If an interactive playground exists:

Add examples for the new utilities.

Ensure the playground imports the new package build correctly.

Use the existing docs synchronization workflow.

## Changelog

Create an accurate v0.4.1 entry.

Group changes under:

- Added
- Improved
- Fixed
- Tests
- Documentation

Only document changes actually implemented.

Do not claim unverified performance or security improvements.

---

# 20. PACKAGE METADATA AND VERSIONING

Update package version to:

0.4.1

Update all relevant synchronized version references.

Potential files:

- package.json
- package-lock.json
- Documentation version labels
- Changelog
- README badges
- Playground metadata
- Any generated package information

Update package description if necessary to reflect the new features.

The description should accurately communicate the package's purpose.

Potential topics:

- TypeScript utilities
- JavaScript utilities
- Data cleaning
- Safe type conversion
- Exact decimal math
- BigInt
- Date and timezone
- Unicode strings
- Validation
- Zero runtime dependencies

Review existing npm keywords.

Improve discoverability through accurate keywords such as:

- javascript
- typescript
- utilities
- utils
- data-cleaning
- string-utils
- type-conversion
- safe-conversion
- number-utils
- bigint
- decimal
- date-utils
- validation
- unicode
- tree-shaking

Do not blindly replace all current keywords.

Preserve valuable existing metadata.

Respect npm metadata constraints.

Avoid keyword stuffing and misleading SEO claims.

Preserve:

- License
- Repository URL
- Homepage
- Bugs URL
- Supported engines
- Export mappings
- Files list
- Module compatibility
- Type declaration paths
- Side effect configuration

Do not accidentally change publishing configuration.

---

# 21. PUBLIC API EXPORT VERIFICATION

Ensure all new functions are exported correctly.

Check:

- Module index files
- Root index.ts
- Generated declarations
- ESM exports
- CommonJS exports
- Package export maps

Verify consumer usage.

Example:

import {
  strip,
  title,
  firstChar,
  lastChar,
  safeToNumber
} from "@fatdevcon/utilities";

Also verify CommonJS imports when supported.

Every new function must be accessible through the intended public entry point.

No internal implementation details should be unintentionally exposed.

---

# 22. CONSUMER INTEGRATION TESTS

Do not stop after unit tests.

Verify the built package as a real npm consumer would use it.

Create temporary consumer projects or use existing package verification scripts.

Test:

1. Node.js ESM
2. Node.js CommonJS
3. TypeScript imports
4. Browser-compatible bundling
5. Bun, when available
6. Tree-shaken named imports
7. Generated type declarations
8. Package tarball installation

Check that:

- Imports resolve.
- Functions execute correctly.
- Types resolve.
- No runtime dependency is missing.
- No unexpected side effects occur.
- No Node-only global breaks browser imports.
- No browser-only global breaks SSR imports.
- Existing APIs still work.

Do not modify the public package API solely to satisfy a flawed test harness.

Fix actual packaging defects when confirmed.

---

# 23. BUILD AND QUALITY VERIFICATION

Use existing package scripts.

Inspect package.json before running commands.

Where available, execute:

npm run check
npm run docs:sync
npm run test:package
npm run test:docs
npm run test:site

Also run relevant scripts for:

- Type checking
- Linting
- Unit tests
- Coverage
- Build
- ESM verification
- CommonJS verification
- Type declaration verification
- Tarball verification
- Bundle size verification
- Documentation verification

Use npm pack --dry-run when appropriate.

Ensure the published files match package.json configuration.

Do not report a test as passed unless it actually ran and passed.

If any command cannot run:

- State the reason.
- Record the limitation.
- Continue other available checks.
- Do not invent a successful result.

---

# 24. REVIEW AND IMPROVE EXISTING FUNCTIONS

This task also includes targeted quality improvements to existing functions.

Do not refactor everything indiscriminately.

Prioritize confirmed issues involving:

- Invalid inputs
- Runtime crashes
- Unsafe coercion
- Numeric precision
- Memory usage
- Poor asymptotic complexity
- Unicode corruption
- Date correctness
- Duplicated code
- Missing type safety
- Inconsistent validation

For every modification to an existing function:

- Explain the problem.
- Preserve the public API.
- Add a regression test.
- Verify behavior.
- Measure performance if relevant.
- Avoid hidden breaking changes.

If a proposed improvement changes documented behavior, defer it unless a compatible fix is possible.

---

# 25. IMPLEMENTATION WORKFLOW

Execute the work in these phases.

## Phase 1: Discovery

- Inspect source and project conventions.
- Audit existing related APIs.
- Establish tests/build/size baseline.
- Identify compatibility constraints.
- Determine the minimal feature set.

## Phase 2: API Design

- Define new function names.
- Define signatures.
- Define return types.
- Define invalid-input behavior.
- Define Unicode behavior.
- Define conversion policies.
- Identify existing helpers to reuse.

Resolve API collisions before implementation.

## Phase 3: Implementation

- Implement data cleaning utilities.
- Implement safe conversion utilities.
- Update public exports.
- Improve confirmed legacy defects.
- Keep code clean and modular.

## Phase 4: Unit and Type Testing

- Add normal cases.
- Add invalid cases.
- Add boundary cases.
- Add Unicode cases.
- Add precision cases.
- Add TypeScript tests.
- Add regression tests.

## Phase 5: Stress and Fuzz Testing

- Test large inputs.
- Test complex inputs.
- Test throwing conversion objects.
- Test numeric boundaries.
- Test representative performance workloads.

## Phase 6: Compatibility Verification

- Verify old public exports.
- Verify old behavior.
- Verify ESM.
- Verify CommonJS.
- Verify declarations.
- Verify Node/browser/Bun where available.
- Verify downstream package imports.

## Phase 7: Documentation

- Update README.
- Update API reference.
- Update playground.
- Update changelog.
- Update metadata.
- Synchronize documentation artifacts.

## Phase 8: Version Upgrade

- Update version to 0.4.1.
- Synchronize all version references.
- Verify package metadata.
- Verify package tarball.

## Phase 9: Final Quality Gate

Perform a complete independent review of all changes.

Look for:

- Unhandled edge cases
- Hidden behavior changes
- Unsafe coercion
- Unicode bugs
- Numeric precision loss
- Redundant APIs
- Dead code
- Unused imports
- Unnecessary dependencies
- Unnecessary allocations
- Documentation mismatches
- Missing exports
- Incorrect types
- Failing tests
- Bundle regressions

Fix issues before declaring completion.

---

# 26. ACCEPTANCE CRITERIA

The task is complete only when:

[ ] New data cleaning functions are implemented.
[ ] New safe conversion functions are implemented.
[ ] No unnecessary duplicate APIs are introduced.
[ ] Existing public function names remain unchanged.
[ ] Existing compatible signatures remain supported.
[ ] Existing documented behavior remains compatible.
[ ] Invalid inputs follow documented failure contracts.
[ ] Safe conversions do not silently lose integer precision.
[ ] Unicode edge cases are tested.
[ ] Every new function has meaningful tests.
[ ] High-risk existing functions have regression coverage.
[ ] TypeScript declarations are verified.
[ ] ESM imports work.
[ ] CommonJS imports work.
[ ] Package consumer tests pass.
[ ] Build passes.
[ ] Lint passes.
[ ] Type check passes.
[ ] Unit tests pass.
[ ] Documentation validation passes.
[ ] Tree-shaking is preserved.
[ ] Zero runtime dependencies are preserved.
[ ] Bundle size changes are measured.
[ ] README is updated.
[ ] Documentation website is updated.
[ ] API reference is updated.
[ ] Playground is updated if applicable.
[ ] Changelog is updated.
[ ] Package metadata is updated.
[ ] Version is synchronized to 0.4.1.
[ ] npm package contents are verified.

Treat unchecked items as incomplete.

If any item cannot be completed, report it explicitly.

---

# 27. FINAL DELIVERY REPORT

After implementation, provide a structured report.

## A. Implementation Summary

Explain:

- What was added
- What was improved
- What was fixed
- What was intentionally not changed

## B. New Function Inventory

Provide a table:

| Function | Description | Return Type | Test Status |
|----------|-------------|-------------|-------------|

Include every new public function.

## C. Existing Function Changes

Provide:

| Function | Issue | Change | Compatibility |
|----------|-------|--------|---------------|

## D. Testing Report

Include actual results:

- Unit tests passed
- Unit tests failed
- Total test count
- Test coverage, if measured
- Regression test status
- Type test status
- Fuzz test status
- Stress test status
- Consumer integration status

Do not fabricate counts.

## E. Bundle Size Report

Provide baseline vs v0.4.1 measurements.

Include:

- Tarball size
- Relevant raw output sizes
- Relevant gzipped output sizes
- Representative per-function consumer bundles

Explain increases and decreases.

Do not claim an optimization without measurements.

## F. Compatibility Report

Report:

- Node.js
- ESM
- CommonJS
- Browser
- Bun
- TypeScript declarations
- Tree-shaking

Mark each as:

- PASS
- FAIL
- NOT VERIFIED

## G. Documentation Report

List updated documentation files.

## H. Risk Assessment

Identify:

- Remaining limitations
- Unverified environments
- Potential compatibility concerns
- Performance tradeoffs
- Suggested follow-up improvements

## I. Final Status

Choose one:

PASS
PARTIAL
FAIL

Only report PASS when all mandatory checks succeed.

---

# 28. STRICT EXECUTION RULES

1. Read repository instructions before editing.
2. Inspect existing APIs before introducing new ones.
3. Implement the code, not just a proposal.
4. Do not ask for confirmation on routine engineering decisions.
5. Do not invent test results.
6. Do not introduce runtime dependencies.
7. Do not change existing function names.
8. Do not introduce breaking changes.
9. Do not silently change return contracts.
10. Do not modify unrelated code unnecessarily.
11. Do not over-engineer architecture.
12. Do not reduce test quality for smaller bundle size.
13. Do not hide exceptions without justification.
14. Do not claim universal crash prevention.
15. Do not use destructive data transformations by default.
16. Do not sacrifice correctness for performance.
17. Do not optimize only dist size while ignoring consumer bundles.
18. Keep documentation synchronized with code.
19. Keep all new APIs properly exported.
20. Verify actual package artifacts.
21. Do not commit unless explicitly authorized.
22. Do not push changes.
23. Do not create Git tags.
24. Do not publish to npm.
25. Do not create a release automatically.

The deliverable is a fully implemented and verified local
v0.4.1 upgrade, ready for maintainer review.

Commit, tagging, release, and publishing will be handled
in a separate task.

---

# FINAL INSTRUCTION

Start by inspecting the actual repository and its existing
rules, architecture, APIs, tests, and build pipeline.

Then implement the best compatible set of data cleaning
and safe conversion utilities for version 0.4.1.

Act as a senior engineer who must maintain this package
for years and as a QA engineer responsible for preventing
real-world production regressions.

Make conservative compatibility decisions and rigorous
correctness decisions.

Do not stop at implementation.

Complete the tests, integration checks, documentation,
package verification, and final engineering review.

The goal is a high-quality, stable, lightweight and
production-ready @fatdevcon/utilities@0.4.1 release.