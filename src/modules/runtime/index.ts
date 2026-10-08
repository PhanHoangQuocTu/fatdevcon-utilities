/**
 * Runtime capability predicates. They intentionally inspect globals when called,
 * rather than at import time, so SSR tests and polyfills can change an environment.
 */

const globalObject = (): Record<string, unknown> => globalThis as unknown as Record<string, unknown>;

/** True in a browser main-thread context (a `window` with a document). */
export function isBrowser(): boolean {
  const windowLike = globalObject().window as { document?: unknown } | undefined;
  return typeof windowLike === "object" && windowLike !== null && typeof windowLike.document === "object";
}

/** True when DOM creation is available. This is narrower than `isBrowser()` for capability checks. */
export function hasDOM(): boolean {
  const documentLike = globalObject().document as { createElement?: unknown } | undefined;
  return typeof documentLike === "object" && documentLike !== null && typeof documentLike.createElement === "function";
}

/** True in a browser worker. It is false in a browser main thread and in Node worker_threads. */
export function isWebWorker(): boolean {
  const workerGlobalScope = globalObject().WorkerGlobalScope;
  const selfLike = globalObject().self;
  return typeof workerGlobalScope === "function" && typeof selfLike === "object" && selfLike !== null && selfLike instanceof (workerGlobalScope as { new (): object });
}

/** True in Node.js (including Node SSR), without importing a Node-only module. */
export function isNode(): boolean {
  const processLike = globalObject().process as { versions?: { node?: unknown } } | undefined;
  return typeof processLike?.versions?.node === "string";
}

const isBun = (): boolean => typeof globalObject().Bun === "object" && globalObject().Bun !== null;

/**
 * True in a client-side web execution context: a browser main thread or browser worker.
 * Edge runtimes without DOM/WorkerGlobalScope are deliberately not classified as client or server.
 */
export function isClient(): boolean {
  return isBrowser() || isWebWorker();
}

/**
 * True for Node.js or Bun server runtimes. It deliberately does not mean merely "no window":
 * workers and edge runtimes without a DOM are not misclassified as servers.
 */
export function isServer(): boolean {
  return isNode() || isBun();
}
