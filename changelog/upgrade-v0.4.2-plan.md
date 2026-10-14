# v0.4.2 release plan

## Objective

Ship v0.4.2 as a compatibility-preserving maintenance release: audit the public API, improve the static documentation experience and its release checks, and retain the package's zero-runtime-dependency contract.

## Baseline

- Current release: `0.4.1`.
- `npm run check` passes: 14 suites, 1,452 tests, typecheck, ESLint, ESM/CJS build and declaration build.
- The documentation site already has stable section IDs, canonical URL, structured data, a theme switch, API filtering and copied package artifact.
- Confirmed issue: the browser playground evaluates editable text with `new Function`. This violates the task's safe-playground requirement.

## Work plan

1. Audit each public export group against implementation and focused tests. Record the API inventory, confirmed findings and intentional limitations. Add regression coverage only for confirmed code defects.
2. Replace the playground evaluator with a bounded parser for explicitly supported synchronous function calls and data literals. It must reject declarations, operators, arbitrary property access and unsupported functions without evaluating source text.
3. Convert documentation data to a normal ESM module so documentation verification does not use `Function` either. Strengthen static-site checks for the safe playground, current version metadata, external-request removal and anchors.
4. Redesign the static documentation presentation while preserving existing section IDs, navigation targets, canonical URL and API data. Use semantic HTML, responsive CSS, system fonts, keyboard-visible controls, theme tokens and reduced-motion behavior.
5. Update release metadata in `package.json`, lockfile, README, changelog and docs to `0.4.2`. Keep all release commands, publication, tags and git history untouched.
6. Run focused checks, the complete publish gate, documentation synchronization, package and tarball verification, bundle measurement, stress benchmark, Bun check, supported Node checks and browser smoke tests where available.

## Acceptance criteria

- No runtime dependency is added and generated JS remains readable/unminified.
- No `eval` or `Function` constructor remains in the shipped documentation or its verification path.
- The playground runs documented supported calls only and treats user input as data.
- Docs are readable and operable at 320, 375, 390, 768, 1024, 1440 and 1920 px, in light and dark themes.
- Package, docs artifact, type declarations, README, changelog and static metadata all agree on `0.4.2`.
- All release gates pass with recorded results.
