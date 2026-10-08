---
paths:
  - "src/**/*"
  - "scripts/**/*"
  - "src/__tests__/**/*"
---

# Reliability, errors and security

## Public JavaScript boundary

- TypeScript types do not validate runtime inputs. For every public function, preserve existing failure semantics: thrown typed errors, explicit invalid values, or a documented sentinel (e.g., `parseISO` may return Invalid Date rather than throw).
- For numeric utilities, keep the exact existing `.code` on errors (e.g., `ERR_INVALID_NUMBER`, `ERR_OVERFLOW`, `ERR_UNDERFLOW`) and error class compatibility. Never turn an exception into `NaN`, `Infinity`, `0`, empty string or silent truncation.
- Validate only meaningful invariants; do not add repeated expensive checks deep inside hot loops when a trusted boundary already verifies them.
- Catch errors only to meaningfully recover, add context, translate to the documented contract or clean up. Use `finally` for acquired resources, listeners and timers; preserve original causes when appropriate.
- Errors must not leak credentials, raw secrets or private data. Do not add global console logging, telemetry or hidden network operations to generic helpers.

## Defensive generic data handling

- Protect `setByPath`, `deepMerge` and related object helpers against prototype pollution (`__proto__`, `constructor`, `prototype`) and accidental getter execution when the contract does not allow it.
- Handle circular structures, unusually deep recursion, special objects and inherited/symbol properties according to their documented contracts. Do not promise safe cloning of all JS values unless tested.
- Avoid ReDoS-prone regex construction and arbitrary `eval`/`Function` behavior. For large inputs, avoid unbounded memory/CPU where practical; return/throw deterministically.
- Do not mutate caller-owned values on success or failure unless this is an explicit public contract. Avoid serialization-based clones that lose BigInt, cycles, `undefined`, types or descriptors.

## Async correctness

- `wait`, `withRetry`, `debounce`, `throttle`, `memoize` and similar helpers need tests for rejection propagation, cleanup, cancellation, leading/trailing behavior and races when applicable.
- Respect existing `AbortSignal` and abort error semantics. Remove event listeners/timers on settle, abort and cleanup. Do not leave promises hanging.
- Retrying does not make side effects idempotent. Preserve existing retry-count/delay contract; require caller responsibility for retry-safety.

## Must-test failures

- Null/undefined where meaningful, malformed input, out-of-range input, large values, Unicode, date invalidity, overflow/underflow, permission-independent operation, abort/failure propagation.
- Where unsafe input is accepted, assert no pollution of `Object.prototype`, no leaked timers/listeners and no caller mutation after failure.
