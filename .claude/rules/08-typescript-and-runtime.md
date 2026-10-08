---
paths:
  - "src/**/*"
  - "tsconfig*.json"
  - "tsup.config.*"
  - "rollup.config.*"
  - "package.json"
---

# TypeScript public declarations and runtime portability

- Respect actual `strict` TypeScript configuration and declared runtime targets. Prefer precise overloads/conditional or discriminated types only when they help real consumer inference.
- Reject public `any`, unsafe double casts, generic types that obscure return kinds and undocumented null coercion. Type assertions must have local proven invariants.
- Keep important overload contracts (notably `NumericInput`) aligned with **runtime type of results**; declaring a type does not make a JS implementation safe.
- `.d.ts` and `.d.mts` must correctly match CJS and ESM package consumption and resolve in independent TS consumer fixtures under NodeNext. Do not rely solely on compiling this repository's source.
- Preserve the intentional tsup/Rollup DTS split; verify output after build. Do not expose private path aliases or unpublished `src/` file imports in public declarations.
- Do not make browser-safe helpers depend on Node's type declarations, `process`, `Buffer`, `fs`, `path` or `require` at import time. No unconditional `window`/`document`/`navigator` references either; detect capabilities inside calls where appropriate.
- Node, Bun, web workers, SSR and edge environments are not interchangeable. Functions such as `isClient`/`isServer`, if present or introduced, need a precise definition; `not window` does not automatically mean server.
- Use `Intl` with awareness that locale data, Unicode segmentation and formatting features vary across supported runtimes; test behavior/feature fallback according to documented requirements.
- Preserve input immutability and valid `readonly` annotations where guaranteed. Do not widen promises by returning a mutable type from an immutable guarantee.
- Ensure JS output matches ES target; don't add a language/API feature that breaks declared Node >=18 or supported browsers without an explicit compatibility plan.
- Type-level regression tests should include valid use cases **and** `@ts-expect-error` negative examples for known constraints, using installed consumer package output when relevant.
