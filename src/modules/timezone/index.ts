import { toValidDate } from "../../utils/date";
import type { DateInput } from "../../utils/date";
import { getOffsetFormatter, getOffsetSeconds } from "../../utils/zone";

export type TimeZoneNameStyle =
  | "short"
  | "long"
  | "shortOffset"
  | "longOffset"
  | "shortGeneric"
  | "longGeneric";

export type TimeZoneOffsetUnit = "seconds" | "minutes" | "hours";
export type TimeZoneOffsetDirection = "utc" | "native";

export interface TimeZoneOffsetOptions {
  /** Unit of the returned offset. Default: "minutes". */
  unit?: TimeZoneOffsetUnit;
  /** "utc" is positive east of UTC; "native" matches Date#getTimezoneOffset(). Default: "utc". */
  direction?: TimeZoneOffsetDirection;
}

/** True when value is a time zone recognized by the runtime's Intl data. */
export function isTimeZone(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    new Intl.DateTimeFormat(undefined, { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

/**
 * Offset at date in the requested unit. The default UTC convention is positive east
 * of UTC (`Asia/Ho_Chi_Minh` is +420 minutes / +7 hours). Set direction to "native"
 * for the opposite sign used by Date#getTimezoneOffset(). Defaults to the local zone.
 */
export function getTimeZoneOffset(
  date: DateInput = new Date(),
  timeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone,
  options: TimeZoneOffsetOptions = {},
): number {
  const { unit = "minutes", direction = "utc" } = options;
  if (unit !== "seconds" && unit !== "minutes" && unit !== "hours") {
    throw new RangeError(`Unsupported time zone offset unit: ${String(unit)}`);
  }
  if (direction !== "utc" && direction !== "native") {
    throw new RangeError(`Unsupported time zone offset direction: ${String(direction)}`);
  }
  const seconds = getOffsetSeconds(date, timeZone);
  const signedSeconds = direction === "native" ? -seconds : seconds;
  const divisor = unit === "seconds" ? 1 : unit === "minutes" ? 60 : 3600;
  const offset = signedSeconds / divisor;
  return offset === 0 ? 0 : offset;
}

/** Returns the localized name or offset label of a time zone at date. */
export function getTimeZoneName(
  date: DateInput,
  timeZone: string,
  locale: Intl.LocalesArgument = "en-US",
  style: TimeZoneNameStyle = "short",
): string {
  getOffsetFormatter(timeZone);
  const parts = new Intl.DateTimeFormat(locale, { timeZone, timeZoneName: style }).formatToParts(toValidDate(date));
  return parts.find(({ type }) => type === "timeZoneName")?.value ?? "";
}

/** Formats an instant in an IANA time zone using Intl.DateTimeFormat. */
export function formatInTimeZone(
  date: DateInput,
  timeZone: string,
  locale: Intl.LocalesArgument = "en-US",
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium", timeStyle: "medium" },
): string {
  getOffsetFormatter(timeZone);
  return new Intl.DateTimeFormat(locale, { ...options, timeZone }).format(toValidDate(date));
}
