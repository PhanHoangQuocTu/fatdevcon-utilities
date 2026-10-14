# v0.4.2 public API audit

## Method

The public barrel (`src/index.ts`), implementation modules, focused Jest coverage and generated documentation inventory were reviewed together. `scripts/verify-docs.mjs` verifies that every exported public function is documented and executes every runnable example against the built CJS package.

## Inventory

| Public group | Functions reviewed |
| --- | ---: |
| Data cleaning | 6 |
| Safe type conversion | 5 |
| Arithmetic | 13 |
| Integer math | 5 |
| Statistics and random | 5 |
| Number formatting | 7 |
| Currency metadata | 3 |
| Text | 17 |
| Dates | 11 |
| Time zones | 4 |
| Arrays | 23 |
| Sorting | 8 |
| Searching | 2 |
| Objects | 11 |
| Functions | 11 |
| Validators | 3 |
| Calendar helpers | 31 |
| Runtime detection | 6 |
| Collection and safe conversion | 17 |
| Type guards | 7 |
| **Total** | **195** |

## Findings

- No confirmed compatibility or correctness defect was found in the published library API during this release audit.
- A documentation-only security defect was confirmed: the editable browser playground compiled user text dynamically. It is replaced in v0.4.2 with a length-bounded parser that accepts only supported synchronous calls and literal values.
- The documentation verification harness no longer compiles the API-data file dynamically. API reference data is now a normal ESM export.

## Preserved contracts

- Public names, root import paths, overloads, error codes, strict input validation and caller-data immutability are unchanged.
- Exact decimal and bigint behavior, zero runtime dependencies, readable unminified ESM/CJS artifacts and supported Node/Bun/browser targets are unchanged.
- Existing documentation section IDs, canonical URL, API function anchors and release commands are retained.
