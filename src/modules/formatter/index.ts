import { format, FormatOptions } from "date-fns";

/* Formatting utilities */
const formatNumber = (
  value: number,
  locale?: Intl.LocalesArgument,
  options?: Intl.NumberFormatOptions
): string => {
  return new Intl.NumberFormat(locale, options).format(value);
};

const formatDate = (
  date: Date | string | number,
  formatStr: string,
  options?: FormatOptions
): string => {
  const dateObj =
    typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;

  return format(dateObj, formatStr, options);
};

export { formatNumber, formatDate };
