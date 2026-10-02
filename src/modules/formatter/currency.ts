import { countryCurrencies } from "./country-currencies";
import { normalizeCurrency } from "./number";

/** Active legal-tender codes from the bundled CLDR snapshot. Returns a fresh array. */
export function getCountryCurrencies(countryCode: string): string[] {
  if (typeof countryCode !== "string") throw new TypeError("countryCode must be a string");
  if (!/^[a-z]{2}$/i.test(countryCode)) throw new RangeError("countryCode must be a two-letter region code");
  return [...(countryCurrencies[countryCode.toUpperCase()] ?? [])];
}

/** Symbols can be ambiguous; use the currency code for identification. */
export function getCurrencySymbol(
  currency: string,
  locale: Intl.LocalesArgument = "en-US",
  display: "symbol" | "narrowSymbol" = "symbol"
): string {
  const code = normalizeCurrency(currency);
  return new Intl.NumberFormat(locale, {
    style: "currency", currency: code, currencyDisplay: display,
  }).formatToParts(0).find(part => part.type === "currency")?.value ?? code;
}

export function getCurrencyName(currency: string, locale: Intl.LocalesArgument = "en-US"): string {
  const code = normalizeCurrency(currency);
  return new Intl.DisplayNames(locale, { type: "currency" }).of(code) ?? code;
}