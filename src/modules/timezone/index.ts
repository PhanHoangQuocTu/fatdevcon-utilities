import { toValidDate } from "../../utils/date";
import type { DateInput } from "../../utils/date";

export type TimeZoneNameStyle =
  | "short"
  | "long"
  | "shortOffset"
  | "longOffset"
  | "shortGeneric"
  | "longGeneric";

const offsetFormatters = new Map<string, Intl.DateTimeFormat>();

const assertTimeZone: (timeZone: unknown) => asserts timeZone is string = (timeZone) => {
  if (typeof timeZone !== "string") throw new TypeError("timeZone must be a string");
};

const getOffsetFormatter = (timeZone: string): Intl.DateTimeFormat => {
  assertTimeZone(timeZone);
  const cached = offsetFormatters.get(timeZone);
  if (cached) return cached;
  try {
    const formatter = new Intl.DateTimeFormat("en-US-u-ca-iso8601-nu-latn", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });
    offsetFormatters.set(timeZone, formatter);
    return formatter;
  } catch {
    throw new RangeError(`Invalid time zone: ${timeZone}`);
  }
};

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
 * Offset from UTC in minutes at date, where positive values are east of UTC.
 * The result observes daylight-saving transitions for the supplied instant.
 */
export function getTimeZoneOffset(date: DateInput, timeZone: string): number {
  const instant = toValidDate(date);
  const parts = getOffsetFormatter(timeZone).formatToParts(instant);
  const values = Object.fromEntries(
    parts
      .filter(({ type }) => type !== "literal")
      .map(({ type, value }) => [type, Number(value)]),
  ) as Record<string, number>;
  const localAsUtc = Date.UTC(
    values.year,
    values.month - 1,
    values.day,
    values.hour,
    values.minute,
    values.second,
  );
  const offset = Math.round((localAsUtc - instant.getTime()) / 60_000);
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
