import { getGraphemeSegmenter } from "../../utils/segmenter";

function assertText(value: unknown, name = "text"): asserts value is string {
  if (typeof value !== "string") throw new TypeError(`${name} must be a string`);
}

/** Index of the last code point before end; never splits a valid surrogate pair. */
function previousIndex(text: string, end: number): number {
  const last = text.charCodeAt(end - 1);
  const previous = text.charCodeAt(end - 2);
  return end - (last >= 0xdc00 && last <= 0xdfff && previous >= 0xd800 && previous <= 0xdbff ? 2 : 1);
}

function stripCharacters(text: string, chars: string, left: boolean, right: boolean): string {
  assertText(chars, "chars");
  if (!chars || !text) return text;
  const characters = new Set(chars);
  let start = 0;
  let end = text.length;
  if (left) {
    for (const char of text) {
      if (!characters.has(char)) break;
      start += char.length;
    }
  }
  if (right) {
    while (end > start) {
      const previous = previousIndex(text, end);
      if (!characters.has(text.slice(previous, end))) break;
      end = previous;
    }
  }
  return text.slice(start, end);
}

/** Trim ECMAScript whitespace from both ends, or a supplied Unicode code-point set (not a substring). */
export function strip(text: string, chars?: string): string {
  assertText(text);
  return chars === undefined ? text.trim() : stripCharacters(text, chars, true, true);
}

/** Trim whitespace or a supplied code-point set from the beginning only. Empty chars is a no-op. */
export function lstrip(text: string, chars?: string): string {
  assertText(text);
  return chars === undefined ? text.trimStart() : stripCharacters(text, chars, true, false);
}

/** Trim whitespace or a supplied code-point set from the end only. Empty chars is a no-op. */
export function rstrip(text: string, chars?: string): string {
  assertText(text);
  return chars === undefined ? text.trimEnd() : stripCharacters(text, chars, false, true);
}

/**
 * Title-case Unicode letter/mark runs, keeping internal ' / ’ apostrophes in words.
 * Preserve punctuation and whitespace; hyphens, underscores and digits delimit words.
 * Uses locale-independent Unicode casing, without normalization or accent removal.
 * Unlike titleCase, this does not split camelCase or replace separators with spaces.
 */
export function title(text: string): string {
  assertText(text);
  return text.replace(/\p{L}[\p{L}\p{M}]*(?:['’]\p{L}[\p{L}\p{M}]*)*/gu, word => {
    const lower = word.toLowerCase();
    const first = String.fromCodePoint(lower.codePointAt(0)!);
    return first.toUpperCase() + lower.slice(first.length);
  });
}

function endpoint(text: string, last: boolean): string {
  assertText(text);
  if (!text) return "";
  if (typeof Intl !== "undefined" && typeof Intl.Segmenter === "function") {
    const segments = getGraphemeSegmenter().segment(text);
    return segments.containing(last ? text.length - 1 : 0)!.segment;
  }
  // Code-point fallback, not a grapheme polyfill. Preserve already-malformed UTF-16 unchanged.
  return last ? text.slice(previousIndex(text, text.length)) : String.fromCodePoint(text.codePointAt(0)!);
}

/** First grapheme, or "" for empty input. Without Intl.Segmenter returns the first code point. */
export function firstChar
(text: string): string {
  return endpoint(text, false);
}

/** Last grapheme, or "" for empty input. Without Intl.Segmenter returns the last code point. */
export function lastChar(text: string): string {
  return endpoint(text, true);
}
