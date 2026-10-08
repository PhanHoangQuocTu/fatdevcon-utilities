import { toValidDate } from "./date";
import type { DateInput } from "./date";

const offsetFormatters = new Map<string, Intl.DateTimeFormat>();

/** Throws a TypeError for a non-string and a RangeError for a zone the runtime does not know. */
export const getOffsetFormatter = (timeZone: unknown): Intl.DateTimeFormat => {
  if (typeof timeZone !== "string") throw new TypeError("timeZone must be a string");
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

/** UTC offset of `timeZone` at `date` in seconds, positive east of Greenwich. */
export const getOffsetSeconds = (date: DateInput, timeZone: string): number => {
  const instant = toValidDate(date);
  const parts = getOffsetFormatter(timeZone).formatToParts(instant);
  const values = Object.fromEntries(
    parts.filter(({ type }) => type !== "literal").map(({ type, value }) => [type, Number(value)]),
  ) as Record<string, number>;
  // Date.UTC(0..99, ...) treats those years as 1900..1999. Use setters so
  // offsets remain correct for supported historical instants as well.
  const localAsUtcDate = new Date(0);
  localAsUtcDate.setUTCFullYear(values.year, values.month - 1, values.day);
  localAsUtcDate.setUTCHours(values.hour, values.minute, values.second, 0);
  const localAsUtc = localAsUtcDate.getTime();
  const instantAtSecond = Math.floor(instant.getTime() / 1000) * 1000;
  const offset = (localAsUtc - instantAtSecond) / 1000;
  return offset === 0 ? 0 : offset;
};
