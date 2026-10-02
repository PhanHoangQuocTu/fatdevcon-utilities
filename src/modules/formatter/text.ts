const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });

function assertText(value: unknown, name = "text"): asserts value is string {
  if (typeof value !== "string") throw new TypeError(name + " must be a string");
}
function graphemes(text: string): string[] {
  assertText(text);
  return Array.from(segmenter.segment(text), item => item.segment);
}
function assertLength(value: number, name: string): void {
  if (!Number.isSafeInteger(value)) throw new TypeError(name + " must be a safe integer");
  if (value < 0) throw new RangeError(name + " must be non-negative");
}

export interface TruncateTextOptions {
  ellipsis?: string;
  /** Avoid splitting the last whitespace-delimited word where possible. */
  preserveWords?: boolean;
}

/** maxLength includes the ellipsis and counts user-perceived characters. */
export function truncateText(text: string, maxLength: number, options: TruncateTextOptions = {}): string {
  const chars = graphemes(text);
  assertLength(maxLength, "maxLength");
  const { ellipsis = "...", preserveWords = false } = options;
  const marker = graphemes(ellipsis);
  if (chars.length <= maxLength) return text;
  if (marker.length >= maxLength) return marker.slice(0, maxLength).join("");
  const length = maxLength - marker.length;
  let prefix = chars.slice(0, length).join("");
  if (preserveWords && !/\s/u.test(chars[length] ?? "")) {
    const boundary = prefix.search(/\s+\S*$/u);
    if (boundary >= 0) prefix = prefix.slice(0, boundary);
  }
  return (preserveWords ? prefix.trimEnd() : prefix) + ellipsis;
}

export interface ShortenStringOptions {
  startLength?: number;
  endLength?: number;
  separator?: string;
}

/** Keep both ends of an identifier. Does not expand an already short string. */
export function shortenString(text: string, options: ShortenStringOptions = {}): string {
  const chars = graphemes(text);
  const { startLength = 4, endLength = 4, separator = "..." } = options;
  assertLength(startLength, "startLength");
  assertLength(endLength, "endLength");
  const marker = graphemes(separator);
  if (chars.length <= startLength + endLength + marker.length) return text;
  return chars.slice(0, startLength).join("") + separator
    + (endLength === 0 ? "" : chars.slice(-endLength).join(""));
}

export function normalizeWhitespace(text: string): string {
  assertText(text);
  return text.trim().replace(/\s+/gu, " ");
}

/** Removes combining marks and explicitly transliterates Vietnamese d-stroke. */
export function removeDiacritics(text: string): string {
  assertText(text);
  return text.normalize("NFD").replace(/\p{M}/gu, "").replace(/đ/g, "d").replace(/Đ/g, "D");
}

/** Unicode slug: retains letters/numbers from non-Latin scripts. */
export function slugify(text: string): string {
  return removeDiacritics(text).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "");
}

/** Uppercase the first grapheme; leave the remaining text unchanged. */
export function capitalize(text: string, locale?: Intl.LocalesArgument): string {
  const chars = graphemes(text);
  return chars.length ? chars[0].toLocaleUpperCase(locale) + chars.slice(1).join("") : "";
}

export interface MaskStringOptions {
  visibleStart?: number;
  visibleEnd?: number;
  mask?: string;
}

/** Presentation helper, not encryption or secure redaction. */
export function maskString(text: string, options: MaskStringOptions = {}): string {
  const chars = graphemes(text);
  const { visibleStart = 0, visibleEnd = 4, mask = "*" } = options;
  assertLength(visibleStart, "visibleStart");
  assertLength(visibleEnd, "visibleEnd");
  if (graphemes(mask).length !== 1) throw new RangeError("mask must contain exactly one grapheme");
  return chars.map((char, index) =>
    index < visibleStart || index >= chars.length - visibleEnd ? char : mask
  ).join("");
}