import { parseISO } from "date-fns";

export type DateInput = Date | string | number;

/** Converts supported date inputs without accepting invalid moments. */
export const toValidDate = (date: unknown): Date => {
  let dateObj: Date;
  if (date instanceof Date) dateObj = date;
  else if (typeof date === "number") dateObj = new Date(date);
  else if (typeof date === "string") {
    // parseISO reads date-only strings as local time, unlike new Date().
    const iso = parseISO(date);
    dateObj = Number.isNaN(iso.getTime()) ? new Date(date) : iso;
  } else {
    throw new TypeError("date must be a Date, string or number");
  }
  if (Number.isNaN(dateObj.getTime())) throw new RangeError(`Invalid date: ${String(date)}`);
  return dateObj;
};
