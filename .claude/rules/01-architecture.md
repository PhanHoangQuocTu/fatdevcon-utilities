# Architecture — public, shared and internal utilities

## Real repository layout

- Discover the existing source modules under `src/modules/` and `src/types/`; prefer the current names (`math`, `formatter`, `date`, `timezone`, `array`, `object`, `validator`, `algorithms`, `function`, `helper`) over inventing an alternative project tree.
- Treat `src/index.ts` as an explicit **public API**. Keep module-internal helpers unexported by default.
- Existing `package.json` may expose `./dist/*` in addition to the root export. Treat those existing consumable paths as a **compatibility risk**; never remove or restructure them casually.
- Keep private code near its owner. Introduce a shared primitive only after real reuse; avoid generic `utils.ts` junk drawers and cyclic dependencies.
- Preserve TS/JS consumer expectations when reorganizing files. Avoid unexpected barrel cascades that load unrelated numeric, locale or timezone tables.

## For a new helper

1. Search related implementations, public exports, existing types, existing docs and tests.
2. Decide whether it is a stable public convenience function or a private building block; do not expose solely because it exists.
3. Specify inputs, overloads, return kind, mutation semantics, time/locale/environment assumptions, errors and an example.
4. Implement with one clear responsibility, readable control flow and small cohesive functions. Prefer plain TS functions over extensible registries/factories that nobody needs.
5. Export deliberately from `src/index.ts`, add tests, update docs API metadata/examples and verify built declarations if public.

## Dependency direction

- High-level public functions may use lightweight shared internal primitives; internal code must not import through `src/index.ts` (avoids cycles and coupling).
- Avoid coupling environment-neutral utilities to filesystem, network, runtime configuration, UI frameworks or optional test oracles.
- Algorithm choice should follow documented semantics and realistic input sizes; no speculative caches or imports with substantial initialization work.
- Preserve the project's import alias resolution and build behavior rather than assuming TypeScript path aliases automatically work in published JS.

## Refactors

- Keep a regression baseline before moving public code. Prefer a local patch to a broad restructure unless improvement is measurable and worth compatibility risk.
- If changing an observable public contract, explicitly classify it as breaking and document a migration path. Do not silently replace old names, return types or import paths.
