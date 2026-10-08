import { epochDay, parseISO } from "../../utils/date-format";
import { toValidDate } from "../../utils/date";
import type { DateInput } from "../../utils/date";
import { assertInteger } from "../../utils/validate";

export { parseISO };

/** Options for local-calendar week boundaries. Sunday is 0 and Saturday is 6. */
export interface WeekOptions {
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

/** Options for predicates that need a deterministic reference time. */
export interface DateNowOptions {
  /** Reference moment. Defaults to the time at which the function is called. */
  now?: DateInput;
}

/** Inclusive local-calendar interval. */
export interface DateInterval {
  start: DateInput;
  end: DateInput;
}

const checked = (date: Date, what: string): Date => {
  if (Number.isNaN(date.getTime())) throw new RangeError(`${what} is outside the range of dates JavaScript can represent`);
  return date;
};

/** Days in a local calendar month without the `new Date(year, ...)` 1900 offset for years 0–99. */
const daysInLocalMonth = (year: number, month: number): number => {
  const result = new Date(0);
  result.setHours(0, 0, 0, 0);
  result.setFullYear(year, month + 1, 0);
  return result.getDate();
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
  const lastDay = daysInLocalMonth(result.getFullYear(), result.getMonth());
  result.setDate(Math.min(day, lastDay));
  return checked(result, "Result");
}

/** A new Date `amount` calendar weeks later, preserving its local wall-clock time. */
export function addWeeks(date: DateInput, amount: number): Date {
  assertInteger(amount, "amount");
  return addDays(date, amount * 7);
}

/** A new Date `amount` calendar days earlier. */
export function subDays(date: DateInput, amount: number): Date {
  assertInteger(amount, "amount");
  return addDays(date, -amount);
}

/** A new Date `amount` calendar weeks earlier. */
export function subWeeks(date: DateInput, amount: number): Date {
  assertInteger(amount, "amount");
  return addWeeks(date, -amount);
}

/** A new Date `amount` calendar months earlier, with the same month-end clamping as `addMonths`. */
export function subMonths(date: DateInput, amount: number): Date {
  assertInteger(amount, "amount");
  return addMonths(date, -amount);
}

/** A new Date `amount` local calendar years later, clamping 29 February to 28 February when needed. */
export function addYears(date: DateInput, amount: number): Date {
  assertInteger(amount, "amount");
  return addMonths(date, amount * 12);
}

/** A new Date `amount` local calendar years earlier. */
export function subYears(date: DateInput, amount: number): Date {
  assertInteger(amount, "amount");
  return addYears(date, -amount);
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

const weekStartsOnOf = (options: WeekOptions): number => {
  const weekStartsOn = options.weekStartsOn ?? 0;
  assertInteger(weekStartsOn, "options.weekStartsOn");
  if (weekStartsOn < 0 || weekStartsOn > 6) {
    throw new RangeError("options.weekStartsOn must be an integer from 0 through 6");
  }
  return weekStartsOn;
};

/** 00:00:00.000 of the local week containing `date`. Weeks start on Sunday by default. */
export function startOfWeek(date: DateInput, options: WeekOptions = {}): Date {
  const result = startOfDay(date);
  const offset = (result.getDay() - weekStartsOnOf(options) + 7) % 7;
  result.setDate(result.getDate() - offset);
  return result;
}

/** 23:59:59.999 of the local week containing `date`. Weeks start on Sunday by default. */
export function endOfWeek(date: DateInput, options: WeekOptions = {}): Date {
  const result = startOfWeek(date, options);
  result.setDate(result.getDate() + 6);
  return endOfDay(result);
}

/** 00:00:00.000 of the ISO week (Monday through Sunday) containing `date`. */
export function startOfISOWeek(date: DateInput): Date {
  return startOfWeek(date, { weekStartsOn: 1 });
}

/** 23:59:59.999 of the ISO week (Monday through Sunday) containing `date`. */
export function endOfISOWeek(date: DateInput): Date {
  return endOfWeek(date, { weekStartsOn: 1 });
}

/** 00:00:00.000 on the first local day of `date`'s month. */
export function startOfMonth(date: DateInput): Date {
  const result = startOfDay(date);
  result.setDate(1);
  return result;
}

/** 23:59:59.999 on the final local day of `date`'s month. */
export function endOfMonth(date: DateInput): Date {
  const result = startOfMonth(date);
  result.setMonth(result.getMonth() + 1, 0);
  return endOfDay(result);
}

/** 00:00:00.000 on 1 January in `date`'s local calendar year. */
export function startOfYear(date: DateInput): Date {
  const result = startOfDay(date);
  result.setMonth(0, 1);
  return result;
}

/** 23:59:59.999 on 31 December in `date`'s local calendar year. */
export function endOfYear(date: DateInput): Date {
  const result = startOfYear(date);
  result.setFullYear(result.getFullYear() + 1);
  result.setMilliseconds(-1);
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

/** True when the instant `date` is before the instant `dateToCompare`. */
export function isBefore(date: DateInput, dateToCompare: DateInput): boolean {
  return toValidDate(date).getTime() < toValidDate(dateToCompare).getTime();
}

/** True when the instant `date` is after the instant `dateToCompare`. */
export function isAfter(date: DateInput, dateToCompare: DateInput): boolean {
  return toValidDate(date).getTime() > toValidDate(dateToCompare).getTime();
}

/** True when two inputs represent precisely the same instant. */
export function isEqualDate(date: DateInput, dateToCompare: DateInput): boolean {
  return toValidDate(date).getTime() === toValidDate(dateToCompare).getTime();
}

/** True when two instants fall on the same local calendar day. */
export function isSameDay(dateLeft: DateInput, dateRight: DateInput): boolean {
  const left = toValidDate(dateLeft);
  const right = toValidDate(dateRight);
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate();
}

/** True when two instants fall in the same local calendar month. */
export function isSameMonth(dateLeft: DateInput, dateRight: DateInput): boolean {
  const left = toValidDate(dateLeft);
  const right = toValidDate(dateRight);
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth();
}

/** True when two instants fall in the same local calendar year. */
export function isSameYear(dateLeft: DateInput, dateRight: DateInput): boolean {
  return toValidDate(dateLeft).getFullYear() === toValidDate(dateRight).getFullYear();
}

const nowOf = (options: DateNowOptions): Date => toValidDate(options.now ?? new Date());

/** True when `date` is on the same local calendar day as `options.now` (or the current time). */
export function isToday(date: DateInput, options: DateNowOptions = {}): boolean {
  return isSameDay(date, nowOf(options));
}

/** True when `date` is on the local calendar day before `options.now` (or the current time). */
export function isYesterday(date: DateInput, options: DateNowOptions = {}): boolean {
  return isSameDay(date, subDays(nowOf(options), 1));
}

/** True when `date` is on the local calendar day after `options.now` (or the current time). */
export function isTomorrow(date: DateInput, options: DateNowOptions = {}): boolean {
  return isSameDay(date, addDays(nowOf(options), 1));
}

/** True when `date` is inside `interval`, including its start and end instants. */
export function isWithinInterval(date: DateInput, interval: DateInterval): boolean {
  if (typeof interval !== "object" || interval === null) throw new TypeError("interval must be an object with start and end dates");
  const value = toValidDate(date).getTime();
  const start = toValidDate(interval.start).getTime();
  const end = toValidDate(interval.end).getTime();
  if (start > end) throw new RangeError("interval.start must be before or equal to interval.end");
  return value >= start && value <= end;
}

const sign = (value: number): -1 | 0 | 1 => value === 0 ? 0 : value < 0 ? -1 : 1;

/** Whole local calendar-day periods elapsed from `earlier` to `later`; partial final days are truncated toward zero. */
export function differenceInDays(later: DateInput, earlier: DateInput): number {
  const end = toValidDate(later);
  const start = toValidDate(earlier);
  const direction = sign(end.getTime() - start.getTime());
  if (direction === 0) return 0;
  const calendarDays = Math.abs(differenceInCalendarDays(end, start));
  const candidate = addDays(start, direction * calendarDays);
  const partial = direction > 0 ? candidate.getTime() > end.getTime() : candidate.getTime() < end.getTime();
  const result = direction * (calendarDays - Number(partial));
  return result === 0 ? 0 : result;
}

/** Local calendar-month boundaries crossed from `earlier` to `later`, ignoring days and time. */
export function differenceInCalendarMonths(later: DateInput, earlier: DateInput): number {
  const end = toValidDate(later);
  const start = toValidDate(earlier);
  return (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth();
}

/** Whole local calendar-month periods elapsed from `earlier` to `later`; partial final months are truncated toward zero. */
export function differenceInMonths(later: DateInput, earlier: DateInput): number {
  const end = toValidDate(later);
  const start = toValidDate(earlier);
  const months = differenceInCalendarMonths(end, start);
  const direction = sign(months);
  if (direction === 0) return 0;
  const candidate = addMonths(start, months);
  const partial = direction > 0 ? candidate.getTime() > end.getTime() : candidate.getTime() < end.getTime();
  const result = months - direction * Number(partial);
  return result === 0 ? 0 : result;
}

/** Whole local calendar-year periods elapsed from `earlier` to `later`; partial final years are truncated toward zero. */
export function differenceInYears(later: DateInput, earlier: DateInput): number {
  const end = toValidDate(later);
  const start = toValidDate(earlier);
  const years = end.getFullYear() - start.getFullYear();
  const direction = sign(years);
  if (direction === 0) return 0;
  const candidate = addYears(start, years);
  const partial = direction > 0 ? candidate.getTime() > end.getTime() : candidate.getTime() < end.getTime();
  const result = years - direction * Number(partial);
  return result === 0 ? 0 : result;
}

/** Number of local calendar days in `date`'s month. */
export function getDaysInMonth(date: DateInput): number {
  const value = toValidDate(date);
  return daysInLocalMonth(value.getFullYear(), value.getMonth());
}

/** One-based local calendar day of the year. */
export function getDayOfYear(date: DateInput): number {
  const value = toValidDate(date);
  return epochDay(value.getFullYear(), value.getMonth(), value.getDate()) - epochDay(value.getFullYear(), 0, 1) + 1;
}

/** True when `date` falls in a Gregorian leap year in the local calendar. */
export function isLeapYear(date: DateInput): boolean {
  const year = toValidDate(date).getFullYear();
  return year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0);
}
