const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@.]{2,}$/u;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-([1-8])[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export { isNil, isDefined, isString, isNumber, isBoolean, isFunction, isPromiseLike } from "./guards";

/**
 * Pragmatic syntax check (local@domain.tld, max 254 chars), not full RFC 5322.
 * It cannot tell whether a mailbox exists; confirm by sending a message.
 */
export function isEmail(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 254) return false;
  if (!EMAIL_PATTERN.test(value)) return false;
  const [local, domain] = value.split("@");
  return (
    local.length <= 64 &&
    !local.startsWith(".") && !local.endsWith(".") && !local.includes("..") &&
    !domain.startsWith(".") && !domain.startsWith("-") && !domain.includes("..")
  );
}

export interface IsUrlOptions {
  /** Accepted protocols including the colon. Default: ["http:", "https:"]. */
  protocols?: string[];
}

/** True when `value` parses as an absolute URL with an allowed protocol. */
export function isUrl(value: unknown, options: IsUrlOptions = {}): value is string {
  if (typeof value !== "string" || value.trim() !== value || value === "") return false;
  const { protocols = ["http:", "https:"] } = options;
  try {
    const url = new URL(value);
    return protocols.includes(url.protocol) && (url.hostname !== "" || url.protocol === "file:");
  } catch {
    return false;
  }
}

/** True for an RFC 4122/9562 UUID string (versions 1-8), case-insensitive. */
export function isUuid(value: unknown, version?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8): value is string {
  if (typeof value !== "string") return false;
  const match = UUID_PATTERN.exec(value);
  return match !== null && (version === undefined || Number(match[1]) === version);
}
