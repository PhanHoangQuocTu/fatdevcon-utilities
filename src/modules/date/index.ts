import { epochDay, parseISO } from "../../utils/date-format";
import { toValidDate } from "../../utils/date";
import type { DateInput } from "../../utils/date";
import { assertInteger } from "../../utils/validate";

export { parseISO };

const checked = (date: Date, what: string): Date => {
  if (Number.isNaN(date.getTime())) throw new RangeError(`${what} is outside the range of dates JavaScript can represent`);
  return date;
};

/** A new Date `amount` calendar days later (earlier when negative), keeping the local wall-clock time across DST changes. */
export function addDays(date: DateInput, amount: number): Date {
  assertInteger(amount, "amount");
  const result = new Date(toValidDate(date));
  result.setDate(result.getDate() + amount);
  return checked(result, "Result");
}

/**
 * A new Date `amount` calendar months later. When the target month is shorter the day is clamped to its
 * last day: `addMonths("2026-01-31", 1)` is 28 February 2026.
 */
export function addMonths(date: DateInput, amount: number): Date {
  assertInteger(amount, "amount");
  const result = new Date(toValidDate(date));
  const day = result.getDate();
  result.setDate(1);
  result.setMonth(result.getMonth() + amount);
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(day, lastDay));
  return checked(result, "Result");
}

/** 00:00:00.000 of the local calendar day containing `date`. */
export function startOfDay(date: DateInput): Date {
  const result = new Date(toValidDate(date));
  result.setHours(0, 0, 0, 0);
  return result;
}

/** 23:59:59.999 of the local calendar day containing `date`. */
export function endOfDay(date: DateInput): Date {
  const result = new Date(toValidDate(date));
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Whole local calendar days from `earlier` to `later`, ignoring the time of day and daylight-saving
 * shifts: 23:59 on the 1st to 00:01 on the 2nd is 1. Negative when `later` is before `earlier`.
 */
export function differenceInCalendarDays(later: DateInput, earlier: DateInput): number {
  const a = toValidDate(later);
  const b = toValidDate(earlier);
  return epochDay(a.getFullYear(), a.getMonth(), a.getDate()) - epochDay(b.getFullYear(), b.getMonth(), b.getDate());
}
