import { assertFiniteNumber, assertFunction } from "../../utils/validate";

type AnyFunction = (...args: any[]) => any;
type Timer = ReturnType<typeof setTimeout>;

/** An Error with a specific `name` property. */
export type ErrorType<Name extends string = "Error"> = Error & { name: Name };

/** The error used when an operation is aborted. */
export type AbortErrorType = ErrorType<"AbortError">;

/** Returns an AbortError, preserving an explicit reason from the signal when available. */
export function getAbortError(signal?: AbortSignal | undefined): AbortErrorType {
  if (signal?.reason) return signal.reason as AbortErrorType;
  if (typeof DOMException === "function") {
    return new DOMException("This operation was aborted", "AbortError") as AbortErrorType;
  }
  const error = new Error("This operation was aborted") as AbortErrorType;
  error.name = "AbortError";
  return error;
}

/** True when `error` is an error produced by an aborted operation. */
export function isAbortError(error: unknown): error is AbortErrorType {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    error.name === "AbortError"
  );
}

/** Resolves after `time` ms, or rejects with an AbortError when `signal` is aborted. */
export async function wait(
  time: number,
  { signal }: { signal?: AbortSignal | undefined } = {},
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(getAbortError(signal));
      return;
    }

    const cleanup = () => signal?.removeEventListener("abort", onAbort);
    const timeout = setTimeout(() => {
      cleanup();
      resolve();
    }, time);
    const onAbort = () => {
      clearTimeout(timeout);
      cleanup();
      reject(getAbortError(signal));
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

export type WithRetryParameters = {
  /** The delay (in ms) between retries. */
  delay?: ((config: { count: number; error: Error }) => number) | number | undefined;
  /** The maximum number of times to retry. */
  retryCount?: number | undefined;
  /** Whether to retry when an error is thrown. */
  shouldRetry?: ((config: { count: number; error: Error }) => Promise<boolean> | boolean) | undefined;
  /** AbortSignal to cancel retries. */
  signal?: AbortSignal | undefined;
};

export type WithRetryErrorType = ErrorType;

/** Calls an async operation again after failures, with optional delays and cancellation. */
export function withRetry<Data>(
  fn: () => Promise<Data>,
  {
    delay: delay_ = 100,
    retryCount = 2,
    shouldRetry = () => true,
    signal,
  }: WithRetryParameters = {},
): Promise<Data> {
  return new Promise<Data>((resolve, reject) => {
    const attemptRetry = async ({ count = 0 } = {}): Promise<void> => {
      if (signal?.aborted) {
        reject(getAbortError(signal));
        return;
      }

      const retry = async ({ error }: { error: Error }): Promise<void> => {
        const delay = typeof delay_ === "function" ? delay_({ count, error }) : delay_;
        if (delay) {
          try {
            await wait(delay, { signal });
          } catch (error) {
            reject(error);
            return;
          }
        }
        return attemptRetry({ count: count + 1 });
      };

      try {
        const data = await fn();
        resolve(data);
      } catch (error) {
        if (signal?.aborted) {
          reject(getAbortError(signal));
          return;
        }
        if (isAbortError(error)) {
          reject(error);
          return;
        }
        if (count < retryCount && (await shouldRetry({ count, error: error as Error }))) {
          return retry({ error: error as Error });
        }
        reject(error);
      }
    };
    void attemptRetry().catch(reject);
  });
}

const assertWait = (value: number, name: string): void => {
  assertFiniteNumber(value, name);
  if (value < 0) throw new RangeError(`${name} must be non-negative`);
};

export interface DebounceOptions {
  /** Call immediately on the first invocation of a burst. Default: false. */
  leading?: boolean;
  /** Call after the burst ends. Default: true. */
  trailing?: boolean;
}

export interface Debounced<F extends AnyFunction> {
  (...args: Parameters<F>): ReturnType<F> | undefined;
  /** Drop the pending call. */
  cancel(): void;
  /** Run the pending call now and return its result. */
  flush(): ReturnType<F> | undefined;
}

/** Delays `fn` until `wait` ms have passed without another call. */
export function debounce<F extends AnyFunction>(
  fn: F,
  wait: number,
  options: DebounceOptions = {}
): Debounced<F> {
  assertFunction(fn, "fn");
  assertWait(wait, "wait");
  const { leading = false, trailing = true } = options;
  let timer: Timer | undefined;
  let pending: (() => ReturnType<F>) | undefined; // latest call, bound to its `this` and arguments
  let result: ReturnType<F> | undefined;

  const invoke = () => {
    const run = pending as () => ReturnType<F>;
    pending = undefined;
    result = run();
  };

  const debounced = function (this: unknown, ...args: Parameters<F>) {
    const startsBurst = timer === undefined;
    pending = () => fn.apply(this, args);
    if (timer !== undefined) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = undefined;
      if (trailing && pending) invoke();
      pending = undefined;
    }, wait);
    if (leading && startsBurst) invoke();
    return result;
  } as Debounced<F>;

  debounced.cancel = () => {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
    pending = undefined;
  };
  debounced.flush = () => {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
      if (pending) invoke();
    }
    return result;
  };
  return debounced;
}

export interface ThrottleOptions {
  /** Call on the first invocation. Default: true. */
  leading?: boolean;
  /** Call once more with the latest arguments after the wait. Default: true. */
  trailing?: boolean;
}

export interface Throttled<F extends AnyFunction> {
  (...args: Parameters<F>): ReturnType<F> | undefined;
  cancel(): void;
}

/** Calls `fn` at most once every `wait` ms. */
export function throttle<F extends AnyFunction>(
  fn: F,
  wait: number,
  options: ThrottleOptions = {}
): Throttled<F> {
  assertFunction(fn, "fn");
  assertWait(wait, "wait");
  const { leading = true, trailing = true } = options;
  let timer: Timer | undefined;
  let lastCall = 0;
  let pending: (() => ReturnType<F>) | undefined;
  let result: ReturnType<F> | undefined;

  const throttled = function (this: unknown, ...args: Parameters<F>) {
    const now = Date.now();
    if (!lastCall && !leading) lastCall = now;
    const remaining = wait - (now - lastCall);
    pending = () => fn.apply(this, args);
    if (remaining <= 0 || remaining > wait) {
      if (timer !== undefined) clearTimeout(timer);
      timer = undefined;
      lastCall = now;
      pending = undefined;
      result = fn.apply(this, args);
    } else if (timer === undefined && trailing) {
      timer = setTimeout(() => {
        timer = undefined;
        lastCall = leading ? Date.now() : 0;
        if (pending) {
          const run = pending;
          pending = undefined;
          result = run();
        }
      }, remaining);
    }
    return result;
  } as Throttled<F>;

  throttled.cancel = () => {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
    lastCall = 0;
    pending = undefined;
  };
  return throttled;
}

export interface MemoizeOptions<F extends AnyFunction> {
  /** Cache key from the arguments. Default: the first argument. */
  resolver?: (...args: Parameters<F>) => unknown;
  /** Evict the oldest entry once the cache grows past this size. Default: unbounded. */
  maxSize?: number;
}

export type Memoized<F extends AnyFunction> = F & { cache: Map<unknown, ReturnType<F>>; clear(): void };

/** Caches results by key. Without a `resolver` only the first argument is used as the key. */
export function memoize<F extends AnyFunction>(fn: F, options: MemoizeOptions<F> = {}): Memoized<F> {
  assertFunction(fn, "fn");
  const { resolver, maxSize = Infinity } = options;
  if (resolver !== undefined) assertFunction(resolver, "resolver");
  if (maxSize !== Infinity && (!Number.isInteger(maxSize) || maxSize < 1)) {
    throw new RangeError("maxSize must be a positive integer");
  }
  const cache = new Map<unknown, ReturnType<F>>();
  const memoized = function (this: unknown, ...args: Parameters<F>) {
    const key = resolver ? resolver(...args) : args[0];
    if (cache.has(key)) return cache.get(key);
    const value = fn.apply(this, args);
    cache.set(key, value);
    if (cache.size > maxSize) cache.delete(cache.keys().next().value);
    return value;
  } as Memoized<F>;
  memoized.cache = cache;
  memoized.clear = () => cache.clear();
  return memoized;
}

/** Runs `fn` on the first call only and returns that result on every later call. */
export function once<F extends AnyFunction>(fn: F): (...args: Parameters<F>) => ReturnType<F> {
  assertFunction(fn, "fn");
  let called = false;
  let result: ReturnType<F>;
  return function (this: unknown, ...args: Parameters<F>) {
    if (!called) {
      called = true;
      result = fn.apply(this, args);
    }
    return result;
  };
}

/** Resolves after `ms` milliseconds. */
export function sleep(ms: number): Promise<void> {
  assertWait(ms, "ms");
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface RetryOptions {
  /** Retries after the first attempt. Default: 3. */
  retries?: number;
  /** Delay before the first retry in ms. Default: 0. */
  delayMs?: number;
  /** Multiplies the delay after every retry (2 = exponential backoff). Default: 1. */
  factor?: number;
  /** Return false to stop retrying and rethrow immediately. */
  shouldRetry?: (error: unknown, attempt: number) => boolean;
}

/** Calls `fn` until it resolves, retrying on rejection; rethrows the last error. */
export async function retry<T>(fn: () => T | Promise<T>, options: RetryOptions = {}): Promise<T> {
  assertFunction(fn, "fn");
  const { retries = 3, delayMs = 0, factor = 1, shouldRetry } = options;
  if (!Number.isInteger(retries) || retries < 0) {
    throw new RangeError("retries must be a non-negative integer");
  }
  assertWait(delayMs, "delayMs");
  assertFiniteNumber(factor, "factor");
  if (factor < 1) throw new RangeError("factor must be at least 1");
  let delay = delayMs;
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= retries || (shouldRetry && !shouldRetry(error, attempt + 1))) throw error;
      if (delay > 0) await sleep(delay);
      delay *= factor;
    }
  }
}

/** Rejects with an Error named "TimeoutError" if `promise` is not settled within `ms`. */
export function withTimeout<T>(promise: PromiseLike<T>, ms: number, message?: string): Promise<T> {
  assertWait(ms, "ms");
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      const error = new Error(message ?? `Timed out after ${ms}ms`);
      error.name = "TimeoutError";
      reject(error);
    }, ms);
    Promise.resolve(promise).then(
      (value) => { clearTimeout(timer); resolve(value); },
      (error) => { clearTimeout(timer); reject(error); }
    );
  });
}
