// Lazy, fixed-size caches: constructing ICU segmenters on every call roughly
// doubled repeated legacy text-operation time in benchmark-cleaning.mjs.
// No text or user options are retained, and importing does not require Intl.
let graphemeSegmenter: Intl.Segmenter | undefined;
let wordSegmenter: Intl.Segmenter | undefined;

export function getGraphemeSegmenter(): Intl.Segmenter {
  return graphemeSegmenter ??= new Intl.Segmenter("en", { granularity: "grapheme" });
}

export function getWordSegmenter(): Intl.Segmenter {
  return wordSegmenter ??= new Intl.Segmenter("en", { granularity: "word" });
}
