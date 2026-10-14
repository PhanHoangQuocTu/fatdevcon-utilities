# CODEX MASTER PROMPT — @fatdevcon/utilities v0.4.2

## ROLE & MISSION

You are acting as a multidisciplinary team of world-class engineers:

- **Principal Software Engineer:** TypeScript, JavaScript runtime internals, library architecture and API design.
- **Senior QA / SDET Engineer:** Advanced testing, property-based tests, fuzzing, regression prevention and production reliability.
- **Performance Engineer:** Algorithm optimization, memory efficiency, bundle-size analysis and tree-shaking.
- **Senior UI/UX Designer:** Developer experience, documentation information architecture, typography, responsive design and accessibility.
- **Senior Frontend Engineer:** Semantic HTML5, modern CSS, progressive enhancement and browser compatibility.
- **Technical SEO Specialist:** Search engine crawling, indexing, structured data, content strategy and discoverability.
- **Open-Source Maintainer:** npm publishing standards, licensing, documentation, versioning and release quality.

Your assignment is to **IMPLEMENT AND VERIFY**, not merely analyze or propose solutions.

Work directly in the repository and make the necessary code changes.

The release target is:

**`@fatdevcon/utilities@0.4.2`**

Release focus:

**Stability, Performance, Documentation, Developer Experience, Security, and Search Discoverability.**

The expected result is a professional, thoroughly tested, lightweight, maintainable TypeScript utility library accompanied by a modern, accessible and search-friendly documentation website.

Do not stop after writing an implementation plan.

Do not report successful verification without actually executing the relevant checks.

---

# 1. PROJECT CONTEXT

Project: `@fatdevcon/utilities`

Repository:
https://github.com/PhanHoangQuocTu/fatdevcon-utilities

npm:
https://www.npmjs.com/package/@fatdevcon/utilities

Documentation:
https://phanhoangquoctu.github.io/fatdevcon-utilities/

The repository provides TypeScript and JavaScript utilities for:

- Exact decimal arithmetic and BigInt
- Numeric operations and formatting
- Date and calendar calculations
- Internationalization and timezones
- Unicode-safe string manipulation
- Data cleaning and safe conversions
- Arrays, collections and object utilities
- Algorithms, sorting and searching
- Validation and type guards
- Async operations, retry and error handling
- Runtime and environment detection

Existing core principles:

1. Zero runtime dependencies.
2. Small real-world consumer bundles.
3. Tree-shakeable named exports.
4. ESM and CommonJS support.
5. TypeScript declaration support.
6. Browser, Node.js and Bun compatibility.
7. Stable public APIs.
8. Predictable errors.
9. Safe handling of malformed inputs.
10. Correct numeric precision.
11. Unicode correctness.
12. Reliable dates and timezones.
13. Clean and maintainable source code.

The actual local source is authoritative.

The publicly visible `master` branch previously contained version `0.4.0`. Do not assume this is the version in the current workspace.

Determine whether the v0.4.1 changes are present locally.

If the local repository is still at v0.4.0, do not invent completed v0.4.1 features, silently discard work or misrepresent release history.

Check the local branch, Git history, working tree, existing changelog and implemented features before upgrading to v0.4.2.

Preserve all applicable v0.4.1 changes.

---

# 2. NON-NEGOTIABLE ENGINEERING RULES

The following rules apply throughout the task.

### Correctness

Correctness is more important than shorter code or benchmark speed.

Do not introduce silent data corruption, precision loss or unsupported coercion.

### Backward compatibility

Do not rename, remove or incompatibly change existing public functions.

Preserve:

- Function names
- Parameters and argument order
- TypeScript overloads
- Return types and runtime return kinds
- Existing default values
- Expected exceptions
- Stable error codes
- Input mutation behavior
- ESM/CJS entry points
- Published import paths

If a discovered problem cannot be fixed without breaking public behavior, document it and implement a backward-compatible alternative if reasonable.

Do not introduce breaking changes in v0.4.2.

### Dependency policy

Preserve zero runtime dependencies.

Avoid adding dependencies to solve problems easily handled by standard JavaScript, TypeScript or browser APIs.

Development-only tools are allowed when justified, but existing tooling should be preferred.

### Architecture

Do not over-engineer.

Prefer focused, cohesive changes over unnecessary large-scale refactoring.

Preserve meaningful architectural boundaries.

### Runtime safety

Handle invalid input according to documented contracts.

Use exception handling where recovery or error translation is appropriate.

Never suppress unexpected failures solely to make tests pass.

### Release safety

Do not execute:

- `git commit`
- `git push`
- `git tag`
- `npm publish`
- `npm unpublish`
- GitHub release creation
- Production documentation deployment

These require separate maintainer authorization.

Do not modify unrelated user changes.

---

# 3. PHASE 1 — REPOSITORY DISCOVERY AND BASELINE AUDIT

Before changing anything, inspect the actual repository.

Read:

- `AGENTS.md`
- `CLAUDE.md`
- Task-relevant `.claude/rules/*.md`
- `package.json`
- Lockfile
- `README.md`
- `CHANGELOG.md`
- `LICENSE`
- `SECURITY.md`
- `THIRD_PARTY_NOTICES.md`
- Build and TypeScript configuration
- Test configuration
- Public entry points
- Modules and shared utilities
- Relevant test files
- Documentation HTML/CSS/JavaScript
- Documentation synchronization scripts
- Existing package verification scripts
- GitHub Actions and deployment workflows

Inspect `git status` before editing.

Respect repository-specific instructions.

## 3.1 Understand the entire public API

Generate an accurate inventory of all exported functions and types.

Group them by functional area.

For each public API, identify:

- Name and module
- Public signature
- Return type
- Runtime behavior
- Invalid-input policy
- Existing test coverage
- Known limitations
- Potential performance bottlenecks
- Relevant dependencies between internal modules

Use automated inspection when appropriate.

Do not assume the documentation contains every currently exported function.

Compare the public API, README and documentation reference for consistency.

## 3.2 Establish the initial baseline

Run the existing verification commands before modifications.

Measure or record:

- Current local version
- Git branch and working-tree status
- Export count
- Test count
- Test pass/fail status
- Coverage, where available
- TypeScript check status
- ESLint status
- Build status
- Runtime dependency count
- Tarball size
- Built ESM and CJS sizes
- Representative consumer bundle sizes
- Documentation validation status
- Existing accessibility and SEO issues

Record results in a concise audit document or implementation notes.

If a baseline test already fails, record the failure before making changes.

Do not hide or silently delete failing tests.

## 3.3 Prioritize discovered issues

Classify findings as:

- P0 — Security vulnerability, data corruption or critical production issue.
- P1 — Incorrect results, crash, compatibility regression or serious defect.
- P2 — Important performance, reliability, accessibility or documentation issue.
- P3 — Minor maintainability, styling or low-impact improvements.

Prioritize correctness and critical regressions before optional optimization or visual polishing.

For every confirmed bug, retain reproducible evidence and create a regression test.

---

# 4. PHASE 2 — AUDIT EVERY PUBLIC FUNCTION

This release must include a thorough review of the full exported API.

**Do not audit only functions modified in this task.**

Inspect all public function groups and develop a risk-based verification matrix.

A function passing its existing tests is not sufficient evidence that it has no issues.

For each applicable function, evaluate:

1. Correctness
2. Boundary behavior
3. Invalid inputs
4. Unexpected JavaScript types
5. Numeric precision
6. Unicode correctness
7. Mutation safety
8. Runtime exceptions
9. Performance
10. Memory consumption
11. TypeScript inference
12. Cross-runtime compatibility
13. Missing regression cases
14. Documentation accuracy
15. Possible opportunities for simplification

## 4.1 Exact math and BigInt

Verify:

- Addition, subtraction, multiplication and division
- Remainder and modulo
- Power and factorial
- GCD and LCM
- Fibonacci
- Rounding and precision
- Numeric string parsing
- Aggregation helpers
- Mixed input kinds

Test extremely small and extremely large numbers.

Important cases:

- `0`
- `-0`
- `0.1 + 0.2`
- `1.005`
- `Number.MIN_VALUE`
- `Number.MAX_VALUE`
- `Number.MAX_SAFE_INTEGER`
- `Number.MIN_SAFE_INTEGER`
- `NaN`
- `Infinity`
- `-Infinity`
- Integer overflow
- Underflow
- Decimal exponent notation
- Negative powers
- Division by zero
- Very large BigInt
- Numeric strings longer than normal user inputs
- Invalid numeric formats

Verify the package's exact numeric contract instead of assuming ordinary JavaScript behavior is correct.

Compare against the existing development-only numeric oracle where appropriate.

Never introduce silent precision loss.

Preserve error classes and error codes.

## 4.2 Date and timezone utilities

Pay particular attention to:

- Leap years
- Century rules
- Years divisible by 4, 100 and 400
- Years 0–99
- February 28 and 29
- Invalid February 30
- Month-end clamping
- Crossing months and years
- DST transitions
- Timezone offsets
- Local versus UTC semantics
- ISO parsing
- Invalid timestamps
- Ambiguous date strings
- Date formatting tokens
- Week numbering
- Calendar boundaries

Test multiple timezones such as:

- UTC
- Asia/Ho_Chi_Minh
- America/New_York
- Europe/London
- Asia/Tokyo
- Pacific/Auckland

Use correct timezone assumptions for each test.

Do not assume every year has 365 days or every day has exactly 24 elapsed hours.

## 4.3 String, Unicode and data cleaning

Verify:

- Trimming and whitespace normalization
- Title case and capitalization
- First/last character extraction
- Text truncation
- Character masking
- Unicode normalization
- Accent removal
- Slug generation
- Case conversion
- HTML escaping
- Word counting
- Text reversal

Test:

- Empty strings
- Long strings
- Vietnamese accents
- Combining marks
- Unicode normalization forms
- Emoji
- Emoji skin tones
- Flags
- Zero-width joiner sequences
- Surrogate pairs
- Multiple languages
- Turkish casing
- Unexpected whitespace

Verify that grapheme-aware utilities do not split user-perceived characters incorrectly within their documented compatibility guarantees.

Test fallback behavior where modern Intl APIs are unavailable.

## 4.4 Safe type conversion

Review all available conversion functions.

Verify behavior for:

- `null`
- `undefined`
- Empty strings
- Whitespace-only strings
- Numbers
- Numeric strings
- Booleans
- BigInt
- Symbols
- Arrays
- Plain objects
- Objects without prototypes
- Dates
- Invalid Dates
- Circular references
- Objects with throwing conversion methods
- Proxies with throwing traps

Ensure safe conversion helpers honor their documented failure and fallback contracts.

Do not alter legacy conversion behavior without compatibility analysis.

## 4.5 Array and collection utilities

Test:

- Empty arrays
- One-element arrays
- Duplicate values
- Sparse arrays
- Nested arrays
- Large arrays
- Stable sorting
- Original input immutability
- Callback behavior
- Unexpected data types
- Empty aggregation
- Complex grouping keys

Review time and memory complexity.

Check for unnecessarily quadratic operations.

## 4.6 Object utilities

Test:

- Deep cloning
- Deep merging
- Deep equality
- Nested getters and setters
- Path parsing
- Circular references
- Symbols
- Null-prototype objects
- Property descriptors where relevant
- Prototype pollution
- Shared references
- Unusual object prototypes

Explicitly verify protections against:

- `__proto__`
- `prototype`
- `constructor`

Do not silently introduce caller-visible mutation.

## 4.7 Async and function helpers

Verify:

- Debounce
- Throttle
- Retry
- Timeout
- Cancellation
- AbortController
- Memoization
- Rejected promises
- Synchronous exceptions
- Timer cleanup
- Race conditions
- Concurrent calls
- Unhandled promise rejections

Use fake timers and deterministic tests where practical.

## 4.8 Validators, algorithms and runtime utilities

Review:

- False positives and false negatives
- Empty inputs
- Boundary values
- Sorting stability
- Search invariants
- Malformed data
- Big input handling
- SSR-safe imports
- Node/browser/worker environment detection
- Behavior when globals are absent

Do not assume browser globals exist at module initialization time.

---

# 5. PHASE 3 — FIX CONFIRMED ISSUES

After auditing, implement fixes for confirmed defects.

For each fix:

1. Document the root cause.
2. Create or identify a failing regression test.
3. Apply the smallest correct change.
4. Run targeted tests.
5. Verify related functions.
6. Check backward compatibility.
7. Measure performance when relevant.
8. Update documentation if public behavior is clarified.

Do not refactor unrelated code simply to satisfy subjective style preferences.

Avoid introducing new public helpers unless required to resolve a meaningful issue without breaking existing APIs.

For public APIs, preserve existing documented error behavior.

If behavior is genuinely ambiguous, document the chosen policy and verify that it does not invalidate established consumers.

---

# 6. PHASE 4 — PERFORMANCE AND BUNDLE OPTIMIZATION

Audit the library for opportunities to improve:

- Time complexity
- Memory complexity
- Allocation frequency
- String processing
- Array iteration
- Recursion depth
- Regex performance
- BigInt computation
- Decimal arithmetic
- Date processing
- Object cloning
- Shared internal helpers
- Module dependency structure

Do not assume shorter code is faster.

Only make performance changes when they maintain correctness.

## 6.1 Algorithm optimization

Identify and improve confirmed bottlenecks such as:

- Repeated traversal
- Unnecessary cloning
- Redundant sorting
- Quadratic loops
- Avoidable conversions
- Excessive intermediate arrays
- Duplicate computations
- Expensive regular expressions
- Repeated object allocations

Benchmark before and after relevant changes.

Use representative distributions of inputs, not just one synthetic best-case benchmark.

## 6.2 Consumer bundle optimization

Preserve:

- Zero runtime dependencies
- `sideEffects: false` where valid
- ESM/CJS compatibility
- Tree-shaking
- Public exports
- Existing build philosophy

The project intentionally publishes readable, non-minified JavaScript.

**Do not turn on distribution minification simply to make `dist` appear smaller.**

Measure real consumer bundle sizes using representative imports.

Example fixtures:

- One small string helper
- One safe conversion helper
- One exact math helper
- One date helper
- One formatting helper
- Several unrelated utilities together
- A full-root import

Measure consistently:

- Raw output size
- Minified output size
- Gzipped output size
- Packed tarball size
- Consumer bundle size

Use equivalent tooling and settings for baseline and final measurements.

Ensure that importing a small function does not pull unrelated large modules into a consumer application.

Avoid adding frameworks, large polyfills or unnecessary runtime helpers.

## 6.3 Performance acceptance

Aim for measurable improvements without introducing regressions.

If a function becomes faster but loses correctness, revert the optimization.

If a function becomes slightly slower due to necessary validation or correctness guarantees, document the tradeoff.

Do not fabricate benchmark improvements.

---

# 7. PHASE 5 — EXTENSIVE AUTOMATED TESTING

Act as a senior QA engineer responsible for preventing production regressions.

Expand the existing test suite intelligently.

Use:

- Unit testing
- Boundary testing
- Negative testing
- Regression testing
- Differential testing
- Property-based testing
- Deterministic fuzz testing
- TypeScript type tests
- Integration testing
- Package consumer testing
- Stress testing
- Performance testing

Prefer the existing Jest infrastructure.

Do not add redundant tests merely to increase test count.

Every test should verify a meaningful requirement, boundary or invariant.

## 7.1 Input-size matrix

Include representative sizes:

| Level | Example size |
|---|---|
| Empty | 0 items |
| Minimal | 1 item |
| Small | 10 items |
| Medium | 1,000 items |
| Large | 10,000 items |
| Very large | 100,000 items |
| Stress | 1,000,000 items where feasible |

Apply sizes appropriate to each algorithm.

Do not run million-element or extremely deep test cases indiscriminately across every function.

Separate expensive stress tests from normal CI where necessary.

## 7.2 Input diversity

Include:

- Valid data
- Invalid data
- Partially valid data
- Mixed data types
- Nested data
- Sparse data
- Duplicate data
- Repeated values
- Ordered data
- Reverse-ordered data
- Randomized data
- Malformed Unicode
- Boundary numbers
- Extreme dates
- Throwing objects
- Concurrent async operations

## 7.3 Property-based tests

Use meaningful invariants where applicable.

Examples:

- Normalizing already normalized whitespace remains unchanged.
- Immutable functions do not modify their inputs.
- Sorting produces ordered output and preserves the element multiset.
- Safe numeric conversion does not return NaN under a finite-result contract.
- Date transformations satisfy their explicitly documented calendar rules.
- Exact arithmetic agrees with an independent oracle for supported cases.

Use deterministic random seeds.

Make failing cases reproducible.

Do not test mathematical properties that are false for the actual API contracts.

## 7.4 Test quality

Add readable test descriptions.

Use data-driven tests for repetitive cases.

Avoid excessive test duplication.

Cover both behavior and TypeScript declarations.

Do not reduce coverage thresholds to hide problems.

Do not update expected snapshots simply because an implementation changed.

Investigate all failing assertions.

---

# 8. PHASE 6 — PACKAGE INTEGRITY AND SECURITY AUDIT

Verify that the npm package is suitable for professional open-source distribution.

## 8.1 Package metadata

Audit:

- `name`
- `version`
- `description`
- `keywords`
- `license`
- `author`
- `repository`
- `homepage`
- `bugs`
- `engines`
- `exports`
- `main`
- `module`
- `types`
- `files`
- `sideEffects`
- `publishConfig`

Preserve existing valid configuration.

Verify generated artifact paths and declarations.

Check ESM, CommonJS and TypeScript consumers.

Verify the package does not accidentally publish:

- Secrets
- Environment files
- Private credentials
- Test output
- Coverage artifacts
- Temporary benchmark data
- Unnecessary large files
- Internal documentation working files
- Unwanted build caches

Use actual package packing checks.

## 8.2 Licensing

The repository already contains an MIT LICENSE.

Inspect its contents before editing.

Verify:

- MIT license text is correct.
- Copyright attribution is appropriate.
- `package.json` uses the correct SPDX identifier.
- npm tarball includes LICENSE.
- README license information is accurate.
- THIRD_PARTY_NOTICES contains necessary attribution for distributed third-party material.
- Third-party data or assets introduced into docs are compatible with their licenses.

Do not replace the MIT license with a different license.

Do not create multiple contradictory LICENSE files.

## 8.3 Professional open-source documentation

Audit whether the repository would benefit from:

- CONTRIBUTING.md
- CODE_OF_CONDUCT.md
- SUPPORT.md
- SECURITY.md
- THIRD_PARTY_NOTICES.md
- Issue templates
- Pull request template
- GitHub repository description
- Release instructions
- Development setup instructions

Implement useful missing files or improvements only when they are genuinely needed.

Keep documentation concise and practical.

Do not invent non-existent support channels, organizational contacts or response guarantees.

Existing SECURITY.md and THIRD_PARTY_NOTICES.md should be improved rather than duplicated.

## 8.4 Terms and privacy

Review whether the documentation website needs:

- Terms of Use
- Privacy Policy
- Cookie Policy
- Third-party attribution
- External service disclosures

Decide based on the site's actual behavior.

If the site is purely static and collects no personal information itself, do not invent cookie banners or elaborate privacy policies unnecessarily.

If third-party fonts, analytics, forms, embedded services or other data-collecting resources exist, document their actual behavior and identify relevant privacy considerations.

Do not introduce analytics or tracking without authorization.

Do not claim that legal compliance is guaranteed merely by creating templates.

Clearly identify optional or jurisdiction-dependent legal questions for maintainer review.

Preserve MIT licensing independently of any website terms.

## 8.5 Security checks

Review:

- Prototype pollution
- Unsafe parsing
- Unexpected object coercion
- Regular-expression denial of service
- Unbounded recursion
- Resource exhaustion
- Dependency and supply-chain risks
- Unsafe DOM insertion in docs
- XSS in the playground
- Unsafe use of `innerHTML`
- External link security
- Browser storage handling
- Third-party script loading

Add regression tests for confirmed vulnerabilities.

Use trusted DOM APIs and safe text rendering where practical.

---

# 9. PHASE 7 — COMPLETE DOCUMENTATION UI/UX REDESIGN

This is a major deliverable.

Redesign and improve the existing documentation website so it feels like a modern, high-quality developer documentation platform.

The website should be inspired by the usability and clarity of professional developer documentation ecosystems such as:

- MDN Web Docs
- TypeScript Documentation
- Vite Documentation
- Tailwind CSS Documentation
- React Documentation
- Stripe API Documentation

Use these only as quality and interaction references.

Do not copy proprietary layouts, assets or branding.

Create a distinctive visual identity for `@fatdevcon/utilities`.

## 9.1 Design philosophy

The website must be:

- Professional
- Modern
- Minimal
- Elegant
- Technically credible
- Highly readable
- Easy to navigate
- Easy to search
- Mobile-friendly
- Accessible
- Fast-loading
- Consistent
- Maintainable

Prioritize usability over decorative effects.

Avoid excessive animations, gradients, oversized hero sections or visual clutter.

This is a technical documentation website, not a marketing landing page alone.

## 9.2 Design system

Establish consistent design tokens for:

- Colors
- Typography
- Font sizes
- Spacing
- Borders
- Border radius
- Shadows
- Container widths
- Breakpoints
- Code blocks
- Buttons
- Navigation
- Feedback states

Use a restrained professional palette.

Support light and dark themes.

Use accessible contrast ratios.

Prefer CSS variables for reusable design tokens.

Use modern CSS without unnecessary complexity.

Keep the website lightweight.

## 9.3 Documentation information architecture

Design a clear documentation hierarchy.

Suggested organization:

### Getting Started
- Introduction
- Installation
- Quick Start
- Why This Package?
- Supported Runtimes

### Core Concepts
- Exact Numeric Arithmetic
- BigInt and Precision
- TypeScript Support
- Errors and Validation
- Data Safety
- Tree-Shaking

### Guides
- Currency Formatting
- Date and Timezones
- Unicode and Strings
- Safe Type Conversion
- Collections and Objects
- Async Workflows

### API Reference
- Searchable function directory
- Function categories
- Signatures
- Parameters
- Return types
- Examples
- Edge cases
- Error contracts

### Resources
- Live Playground
- FAQ
- Changelog
- Migration Notes, where applicable
- GitHub
- npm
- Contributing
- Security
- License

Adjust navigation to the actual existing features.

Do not expose empty pages or features that have not been implemented.

## 9.4 Desktop navigation

Consider a professional three-column documentation layout where appropriate:

**Left:** persistent documentation sidebar.

**Center:** main article or API content.

**Right:** contextual table of contents.

Requirements:

- Clear active navigation item
- Logical grouping
- Sticky navigation where useful
- Consistent spacing
- Easy movement between sections
- Meaningful headings
- Anchored section URLs
- Visible current page or section

Avoid excessive nesting.

## 9.5 Mobile experience

Implement responsive behavior.

Verify at:

- 320px
- 375px
- 390px
- 768px
- 1024px
- 1440px
- 1920px

The layout must not have unintended horizontal overflow.

Navigation should remain easy to use on small screens.

Code blocks may scroll horizontally within their own containers.

Tables should remain readable.

Touch targets must be usable.

Avoid fixed overlays that block essential content.

## 9.6 Documentation search

Improve the ability to find functions and topics.

Evaluate a lightweight, client-side search suitable for the actual site architecture.

Potential features:

- Search by function name
- Search by category
- Search by description
- Search by relevant keywords
- Highlight matching results
- Keyboard shortcut such as Ctrl/Cmd + K
- Escape to close
- Arrow-key navigation
- Enter to open
- Helpful empty state

Use a lightweight implementation.

Do not introduce a large search framework unless justified.

Avoid performing costly searches on every unnecessary event.

Ensure search works without network APIs.

## 9.7 Code examples

Improve code block design.

Provide:

- Clear syntax presentation
- Copy button
- Visible copy feedback
- Good contrast
- Proper overflow handling
- Consistent spacing
- Accessible controls

Where useful, provide installation tabs for:

- npm
- pnpm
- yarn
- Bun

Ensure copying commands works correctly.

Do not introduce misleading output examples.

Every API example must match an actual function signature.

## 9.8 API documentation design

A user should quickly understand:

1. What the function does.
2. When to use it.
3. Required parameters.
4. Optional parameters.
5. Return type.
6. Runtime behavior.
7. Important edge cases.
8. Common usage examples.
9. Related functions.

Display these consistently.

Examples should be simple before introducing advanced usage.

For complex numeric or date utilities, include meaningful caveats.

Avoid walls of text without visual hierarchy.

## 9.9 Playground

Preserve and improve the existing interactive playground.

Verify:

- Function selection
- Input handling
- Execution
- Error display
- Output formatting
- Copy functionality
- Keyboard access
- Responsive design
- Loading and unavailable states

The playground must execute the correct synchronized production build.

Do not use unsafe arbitrary JavaScript evaluation.

Do not use `eval` or the Function constructor to execute user-entered code.

If an existing interaction presents security or reliability problems, replace it with a safe supported-operation model.

Clearly distinguish validation errors from internal failures.

## 9.10 Accessibility

Target WCAG 2.2 AA where practical and verifiable.

Use:

- Semantic HTML5
- Correct heading hierarchy
- Landmarks
- Meaningful labels
- Keyboard-accessible controls
- Visible focus indicators
- Appropriate ARIA
- Accessible dialogs and menus
- Good contrast
- Reduced-motion support
- Helpful error announcements

Avoid unnecessary ARIA where native HTML semantics already provide the required behavior.

Test keyboard-only navigation.

Test screen-reader-relevant semantics using appropriate automated tools where available.

## 9.11 Preserve the existing website architecture

Inspect the existing static HTML, CSS and JavaScript structure.

Do not automatically migrate to React, Next.js, Vue or another framework.

Prefer improving the existing static documentation architecture.

A framework migration is acceptable only if there is a compelling, measured benefit and it does not violate the zero-dependency philosophy or significantly increase maintenance complexity.

Do not add a heavy runtime framework merely for visual improvements.

---

# 10. PHASE 8 — HTML5, SEO AND GOOGLE INDEXING

One of the main goals is to increase the discoverability of `@fatdevcon/utilities` on Google and other search engines.

Treat search discoverability as a combination of:

- Technical SEO
- Crawlability
- Indexability
- Content quality
- Information architecture
- Metadata
- Internal linking
- Performance
- External documentation consistency

Do not assume metadata alone will solve discoverability.

Do not promise Google indexing, ranking or autocomplete suggestions.

## 10.1 Investigate the current problem

Determine whether the user's problem is:

1. The website is not indexed.
2. The npm page is difficult to find.
3. The GitHub repository is difficult to find.
4. The project ranks poorly for relevant search terms.
5. The user expects Google autocomplete suggestions.
6. Search results are outdated or inconsistent.

These are different problems.

Do not treat them as identical.

Perform available public checks and document limitations.

If Google Search Console access is unavailable, do not claim to know its actual indexing status.

## 10.2 Technical SEO audit

Review:

- HTML document structure
- `lang` attribute
- Page titles
- Meta descriptions
- Canonical URLs
- Robots directives
- Sitemap
- Indexable HTML content
- Heading hierarchy
- Internal linking
- Broken links
- HTTP errors
- Redirects
- Missing resources
- Mobile rendering
- Duplicate content
- Structured data
- Open Graph
- Social preview metadata
- Page loading performance

Fix confirmed technical issues.

Do not add duplicate canonical tags or conflicting robots directives.

## 10.3 GitHub Pages configuration

The documentation is hosted under:

https://phanhoangquoctu.github.io/fatdevcon-utilities/

This is a project site, not a root-domain website.

Carefully handle the `/fatdevcon-utilities/` base path.

Verify:

- Canonical URLs
- Asset paths
- Sitemap URLs
- robots.txt placement and discoverability
- Internal links
- Page refresh behavior
- Deep links
- Deployment output

Do not assume that placing `robots.txt` inside a GitHub Pages project subdirectory makes it the root-level robots policy for `phanhoangquoctu.github.io`.

Respect how robots.txt works at the hostname root.

If root-level control is unavailable, document the limitation and use appropriate alternatives.

Do not modify unrelated GitHub Pages sites under the same hostname.

## 10.4 Sitemap

Inspect the current sitemap.

If missing or incorrect, create or fix it.

Use valid XML.

Include only actual, canonical, publicly accessible pages.

Do not invent hundreds of sitemap entries pointing to nonexistent routes.

If the documentation uses one HTML page with hash-based sections, understand that hash fragments are not independently indexable pages in the same way as separate URLs.

Consider dedicated static guide pages only when this improves content quality, navigability and maintenance.

Ensure the documentation deployment workflow includes the sitemap correctly.

Do not invent `lastmod` dates.

## 10.5 Search metadata

Write accurate, natural-language titles and descriptions.

Prioritize actual search intent.

Relevant topics may include:

- TypeScript utility library
- JavaScript utility functions
- Exact decimal arithmetic
- JavaScript floating-point precision
- BigInt calculations
- Safe number conversion
- TypeScript string helpers
- Date and timezone utilities
- Currency formatting
- Unicode string utilities
- Zero-dependency npm utilities

Use keywords naturally in meaningful content.

Do not keyword-stuff.

Do not assume the obsolete meta-keywords tag improves Google ranking.

## 10.6 Structured data

Inspect existing JSON-LD.

Validate the suitability and accuracy of schema types such as:

- SoftwareSourceCode
- BreadcrumbList, where relevant
- SoftwareApplication, only if semantically appropriate

Do not invent ratings, reviews, downloads or endorsements.

Use the actual version number and repository URL.

Ensure structured data matches visible content.

Do not assume adding schema guarantees a Google rich result.

Evaluate any existing FAQPage markup against current Google Search support rather than relying on outdated SEO advice.

## 10.7 Search-friendly documentation content

Improve the documentation's usefulness for real search queries.

Create or improve practical developer guides for relevant scenarios.

Examples:

### Fixing JavaScript floating-point precision

Explain why:

`0.1 + 0.2 !== 0.3`

Show an accurate example using the library's actual math API.

### Formatting currency in TypeScript

Explain supported locales, currency codes and examples.

### Using BigInt safely

Explain precision limitations, supported types and conversion behavior.

### Safely parsing numbers

Show the actual safe conversion APIs that exist in the current repository.

### Handling timezones in JavaScript

Explain local time, UTC and IANA timezone behavior accurately.

### Cleaning and normalizing strings

Document Unicode, trimming and casing behavior.

Only document capabilities actually present in the package.

Avoid generic keyword-driven articles that provide no meaningful value.

Content should help developers solve real problems.

## 10.8 Internal and external links

Ensure the following sources point consistently to the correct destinations:

- npm package homepage
- GitHub repository homepage
- GitHub README
- Documentation site
- Changelog
- Issues
- API reference
- Playground

Identify broken or outdated links.

Improve relevant cross-linking between docs guides and API entries.

Do not automatically post backlinks, spam forums or create artificial link networks.

## 10.9 Search Console readiness

Prepare the documentation for Google Search Console.

Verify the feasibility of:

- Site/property verification
- Sitemap submission
- URL Inspection
- Index coverage monitoring
- Search performance monitoring

If Search Console access is not connected, provide exact manual instructions and expected URLs.

Do not fabricate indexing data.

Do not claim a sitemap has been submitted if it has only been generated locally.

Do not claim Google has indexed a page unless verified.

## 10.10 SEO measurement

Define measurable success criteria such as:

- Crawlable canonical documentation URL
- Valid HTML title and metadata
- Accessible sitemap URL
- No accidental `noindex`
- Correct internal links
- Valid structured data
- Useful static/indexable content
- Search Console readiness

For longer-term measurement, recommend tracking:

- Indexed pages
- Search impressions
- Search clicks
- Organic CTR
- Relevant query visibility

Do not promise specific rankings or search traffic growth.

---

# 11. PHASE 9 — DOCUMENTATION PERFORMANCE

Optimize documentation performance.

Audit:

- CSS delivery
- JavaScript payload
- Unused CSS
- Unused JavaScript
- Font loading
- Layout shift
- Rendering cost
- Large DOM trees
- Search performance
- Playground initialization
- Long tasks
- Third-party requests

Use progressive enhancement where practical.

Do not block core readable documentation content on JavaScript initialization.

Aim for strong Core Web Vitals:

- LCP around or below 2.5 seconds
- INP around or below 200 milliseconds
- CLS around or below 0.1

These are performance targets, not guaranteed results.

Distinguish local Lighthouse measurements from real-user field data.

Measure when tools are available.

Avoid claiming production Core Web Vitals based only on local synthetic tests.

Preserve accessibility and visual quality during optimization.

---

# 12. PHASE 10 — DOCUMENTATION BROWSER TESTING

Do not consider the UI redesign complete merely because HTML, CSS and JavaScript compile.

Use an available browser automation tool, preferably Playwright, to test the documentation.

Do not assume Playwright is already installed.

Inspect available tooling and use the lightest reliable verification approach.

Where a browser is available, perform:

### Visual tests

- Desktop
- Tablet
- Mobile
- Light mode
- Dark mode
- Long documentation pages
- Short pages
- API reference
- Playground
- Navigation menus
- Search results
- Code examples

### Interaction tests

- Navigation
- Anchors
- Sidebar collapse/expand
- Search
- Keyboard shortcuts
- Theme switching
- Copy buttons
- Package manager tabs
- Playground execution
- Error messages
- Mobile navigation

### Accessibility tests

- Keyboard-only navigation
- Focus order
- Accessible names
- Heading structure
- Color contrast
- Dialog focus handling
- Reduced-motion behavior

### Regression tests

Ensure existing functionality still works after the redesign.

Capture screenshots where tooling supports it.

Inspect for:

- Overflow
- Overlapping elements
- Broken layout
- Hidden content
- Unreadable text
- Low contrast
- Misaligned components
- Nonfunctional controls

Fix observed issues before finalizing.

If browser tools are unavailable, perform available static and integration checks and report visual verification as NOT RUN.

---

# 13. PHASE 11 — README AND DOCUMENTATION SYNCHRONIZATION

Update all relevant files.

Potential targets include:

- `README.md`
- `CHANGELOG.md`
- `package.json`
- `package-lock.json`
- `docs/index.html`
- `docs/assets/`
- `docs/api-data.js`
- Documentation stylesheets
- Documentation JavaScript
- Sitemap
- Release metadata
- Verification scripts

Discover actual paths before editing.

## 13.1 README

Improve readability and developer onboarding.

Include accurate:

- Project description
- Key features
- Installation instructions
- Quick Start
- Representative code examples
- API categories
- Documentation links
- Runtime compatibility
- Tree-shaking information
- Performance information, if measured
- Contribution guidance
- Security reporting
- License

Avoid making README unnecessarily long or repetitive.

Move detailed API descriptions to documentation where appropriate.

Keep useful summary tables and links.

## 13.2 Package description

Review the current description.

Make it accurate, descriptive and discoverable.

It should clearly communicate the library's real strengths.

Potential topics:

- TypeScript utilities
- Exact decimal math
- BigInt
- Safe conversions
- Dates
- Timezones
- Unicode strings
- Formatting
- Collections
- Zero dependencies

Do not claim features the package does not implement.

## 13.3 Keywords

Audit existing keywords rather than continually appending new ones.

Remove redundant, misleading or low-value entries where appropriate.

Preserve useful discoverability terms.

Keep metadata targeted and professionally maintained.

## 13.4 Changelog

Add an accurate entry for:

`0.4.2`

Organize actual changes under:

- Fixed
- Improved
- Performance
- Security
- Tests
- Documentation
- SEO
- Maintenance

Do not list improvements that were merely suggested but not implemented.

Do not alter historical release notes without a valid reason.

## 13.5 Documentation synchronization

Inspect the actual docs synchronization mechanism.

Ensure the playground uses the correct generated ESM build.

Update version labels and structured-data version claims.

Prevent stale 0.4.0 or 0.4.1 labels from being presented as the current version.

Historical version references should remain intact.

Avoid unnecessary regeneration of unrelated artifacts.

---

# 14. PHASE 12 — VERSION 0.4.2 UPGRADE

Set the intended release version to:

**0.4.2**

Synchronize:

- `package.json`
- `package-lock.json`
- Changelog
- Documentation version labels
- Structured data
- Release metadata
- Version-dependent verification scripts

Follow the repository's documented single-version-bump convention.

Do not create a Git tag.

Do not publish to npm.

Check for hardcoded version assertions in existing verification scripts.

Prefer reliable checks that compare the package's authoritative version against actual generated and documented artifacts.

Do not replace useful assertions with tautological checks.

If the local repository is already newer than 0.4.2, do not downgrade silently.

Report the conflict and preserve existing work.

---

# 15. PHASE 13 — FULL PACKAGE VERIFICATION

Discover and execute the actual repository scripts.

The public repository previously provided commands such as:

```bash
npm run check
npm run test:coverage
npm run docs:sync
npm run test:package
npm run test:docs
npm run test:site
npm run test:tarball
```

Verify these scripts still exist before executing them.

Use the correct order according to their dependencies.

Also validate:

- TypeScript declarations
- ESM imports
- CommonJS imports
- Node.js 18+ compatibility
- Browser bundling
- Bun compatibility where available
- Runtime dependency count
- Package exports
- Tarball contents
- Documentation assets
- Tree-shaking
- License inclusion

Inspect `npm pack --dry-run --json` output where applicable.

Do not use publishing commands.

## 15.1 Consumer testing

Create or reuse representative consumer fixtures.

Verify actual installation/import behavior.

Test:

- ESM import
- CommonJS require
- TypeScript .mts
- TypeScript .cts
- Browser bundling
- Named import tree-shaking
- Multiple imported utilities

Ensure all existing public imports remain compatible.

## 15.2 Coverage analysis

Measure coverage by meaningful modules.

Identify uncovered public branches and important edge cases.

Add tests to cover high-risk gaps.

Do not chase 100% coverage by testing implementation details unnecessarily.

Maintain high-value regression coverage.

## 15.3 Final diff review

Inspect the complete diff.

Look for:

- Breaking changes
- Unnecessary abstractions
- Dead code
- Duplicate logic
- Missing exports
- Wrong documentation
- Incorrect version labels
- Dependency changes
- Unwanted generated files
- Security regressions
- Unintended formatting churn
- Broken links
- Unmeasured bundle regressions

Fix all confirmed release-blocking issues.

---

# 16. DOCUMENTATION AND SEO ACCEPTANCE CRITERIA

The documentation work must satisfy the following requirements:

- Modern, professional design.
- Clear documentation navigation.
- Responsive desktop/tablet/mobile layouts.
- Accessible interactive components.
- Reliable light and dark themes.
- Searchable API functions.
- Readable code examples.
- Functional copy buttons.
- Working existing playground.
- Accurate version information.
- Proper semantic HTML5.
- Valid canonical URLs.
- Appropriate title and description metadata.
- Crawlable documentation content.
- Correct sitemap configuration.
- No accidental indexing blockers.
- Valid, truthful structured data.
- Accurate Open Graph metadata.
- Working internal and external links.
- No critical accessibility problems detected.
- No critical console errors in tested browser environments.
- No unintended horizontal overflow.
- Appropriate loading performance.
- Correct GitHub Pages base paths.
- No added unnecessary frontend framework.

SEO requirements must be evaluated based on technical correctness, not unverified ranking claims.

---

# 17. PACKAGE QUALITY ACCEPTANCE CRITERIA

The package work must satisfy:

- All public exports audited.
- Confirmed critical issues fixed.
- Regression tests added for fixes.
- Existing function names preserved.
- Existing compatible signatures preserved.
- Numeric precision contracts preserved.
- Unicode behavior verified.
- Date boundary behavior verified.
- Async cancellation and cleanup verified.
- No unintended caller-data mutation.
- No introduced prototype pollution.
- Zero runtime dependencies preserved.
- Tree-shaking verified.
- ESM and CommonJS verified.
- TypeScript declarations verified.
- Package contents inspected.
- Appropriate stress tests completed.
- Meaningful test coverage maintained or improved.
- Bundle-size changes measured.
- README updated.
- Changelog updated.
- Package metadata synchronized.
- License and security documentation audited.
- Documentation fully synchronized with the actual API.
- Version correctly set to 0.4.2.

If any mandatory requirement cannot be verified, report it as incomplete.

Never report a partially verified release as fully verified.

---

# 18. FINAL REPORT FORMAT

After completing the actual implementation, generate a detailed engineering report.

## A. Executive Summary

Summarize:

- Initial repository state
- Initial version
- Final version
- Work completed
- Overall verification result

## B. Complete API Audit

Provide:

| Module | Functions Audited | Issues Found | Issues Fixed | Remaining Risks |
|---|---:|---:|---:|---|

Use actual counts.

## C. Fixed Issues

Provide:

| ID | Severity | Function/File | Root Cause | Fix | Regression Test |
|---|---|---|---|---|---|

Only list confirmed issues.

## D. Performance and Bundle Report

Provide:

| Metric | Before | After | Difference |
|---|---:|---:|---:|
| Package tarball | | | |
| ESM output | | | |
| CommonJS output | | | |
| Minified consumer bundle | | | |
| Gzip consumer bundle | | | |
| Selected small imports | | | |

Include relevant benchmark comparisons separately.

Explain measured tradeoffs.

If a metric was not measured, clearly mark it NOT MEASURED.

## E. Testing Report

Include:

- Total tests executed
- Passed tests
- Failed tests
- Skipped tests
- Coverage statistics
- Regression testing
- Property-based testing
- Fuzz testing
- Stress testing
- Runtime integration testing
- Package tarball testing

Distinguish PASS, FAIL and NOT RUN.

## F. UI/UX Improvements

Summarize:

- Design system changes
- Navigation improvements
- Search improvements
- API layout improvements
- Responsive changes
- Accessibility improvements
- Playground changes
- Browser test results

Include before/after screenshots if available.

## G. SEO Improvements

Provide:

| SEO Area | Previous State | Implemented Change | Verification |
|---|---|---|---|
| Title/meta | | | |
| Canonical | | | |
| Sitemap | | | |
| Robots | | | |
| Indexable content | | | |
| Structured data | | | |
| Internal links | | | |
| Mobile | | | |
| Performance | | | |

Explicitly separate local verification from checks requiring deployed site access or Google Search Console.

## H. Open-Source Compliance

Report status of:

- LICENSE
- MIT attribution
- THIRD_PARTY_NOTICES
- SECURITY
- CONTRIBUTING
- CODE_OF_CONDUCT
- SUPPORT
- Privacy/terms applicability
- npm package metadata

Do not classify every optional community policy as legally mandatory.

## I. Updated Files

List the important changed files with concise explanations.

## J. Remaining Risks

Identify:

- Known limitations
- Deferred breaking changes
- Unverified environments
- Any remaining performance bottlenecks
- Tests that could not execute
- Legal questions requiring maintainer review
- SEO steps requiring production deployment
- Search Console actions requiring ownership access

## K. Final Release Readiness

Use one of:

**PASS — Locally verified and ready for maintainer review**

**PARTIAL — Implementation completed but verification remains**

**FAIL — Release-blocking issues remain**

State the evidence supporting the status.

Do not claim that the package is published or the documentation deployed.

---

# 19. FINAL EXECUTION DIRECTIVES

Follow this workflow:

**STEP 1 — Inspect.**

Understand source, rules, API contracts, build configuration, documentation and release process.

**STEP 2 — Establish baselines.**

Measure test, bundle and documentation states before modifications.

**STEP 3 — Audit.**

Review every exported function and identify genuine issues.

**STEP 4 — Fix.**

Implement compatible fixes, add regression tests and optimize measurable bottlenecks.

**STEP 5 — Redesign.**

Upgrade the documentation website using professional developer documentation UI/UX principles.

**STEP 6 — Improve discoverability.**

Implement evidence-based technical SEO, better information architecture and helpful search-oriented documentation.

**STEP 7 — Audit compliance.**

Verify licensing, notices, security reporting, community documentation and package metadata.

**STEP 8 — Upgrade to 0.4.2.**

Synchronize source metadata, lockfile, docs and changelog.

**STEP 9 — Verify everything.**

Run appropriate unit tests, regression tests, package tests, browser tests, build checks, SEO validations and performance comparisons.

**STEP 10 — Review and report.**

Inspect the final diff, fix release-blocking problems and produce the full engineering report.

Do not stop at analysis.

Do not ask for routine implementation confirmations.

Do not hide test failures.

Do not invent benchmark data.

Do not introduce breaking API changes.

Do not introduce runtime dependencies.

Do not publish, push, tag or deploy.

Execute this task like a principal engineer responsible for maintaining this package over many years.

**FINAL GOAL: Produce a stable, verified, optimized and maintainable `@fatdevcon/utilities@0.4.2`, with a professional documentation experience and strong technical foundations for organic search discoverability.**