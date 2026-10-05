const wordSegmenter = new Intl.Segmenter("en", { granularity: "word" });

function assertText(value: unknown): asserts value is string {
  if (typeof value !== "string") throw new TypeError("text must be a string");
}

/** Split on separators and camelCase / acronym boundaries, keeping Unicode letters. */
function splitWords(text: string): string[] {
  assertText(text);
  return text
    .replace(/(\p{Ll}|\p{N})(\p{Lu})/gu, "$1 $2")
    .replace(/(\p{Lu}+)(\p{Lu}\p{Ll})/gu, "$1 $2")
    .split(/[^\p{L}\p{M}\p{N}]+/u)
    .filter(Boolean);
}

const upperFirst = (word: string): string => {
  const [first = "", ...rest] = Array.from(word);
  return first.toLocaleUpperCase() + rest.join("");
};

/** "hello world" -> "helloWorld" */
export function camelCase(text: string): string {
  return splitWords(text)
    .map((word, index) => (index === 0 ? word.toLowerCase() : upperFirst(word.toLowerCase())))
    .join("");
}

/** "hello world" -> "HelloWorld" */
export function pascalCase(text: string): string {
  return splitWords(text).map(word => upperFirst(word.toLowerCase())).join("");
}

/** "Hello World" -> "hello-world" */
export function kebabCase(text: string): string {
  return splitWords(text).map(word => word.toLowerCase()).join("-");
}

/** "Hello World" -> "hello_world" */
export function snakeCase(text: string): string {
  return splitWords(text).map(word => word.toLowerCase()).join("_");
}

/** "hello-world" -> "Hello World" */
export function titleCase(text: string): string {
  return splitWords(text).map(word => upperFirst(word.toLowerCase())).join(" ");
}

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
};
const HTML_UNESCAPES: Record<string, string> = {
  "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&#x27;": "'",
};

/** Escapes & < > " ' so text can be placed inside HTML content or attributes. */
export function escapeHtml(text: string): string {
  assertText(text);
  return text.replace(/[&<>"']/g, char => HTML_ESCAPES[char]);
}

/** Reverses escapeHtml in a single pass, so "&amp;lt;" becomes "&lt;", not "<". */
export function unescapeHtml(text: string): string {
  assertText(text);
  return text.replace(/&(?:amp|lt|gt|quot|#39|#x27);/g, entity => HTML_UNESCAPES[entity]);
}

/** Counts words by Unicode word boundaries, so punctuation and emoji are ignored. */
export function countWords(text: string): number {
  assertText(text);
  let count = 0;
  for (const segment of wordSegmenter.segment(text)) {
    if (segment.isWordLike) count++;
  }
  return count;
}

/** Reverses by user-perceived character, so emoji and accents stay intact. */
export function reverseText(text: string): string {
  assertText(text);
  const graphemes = Array.from(
    new Intl.Segmenter("en", { granularity: "grapheme" }).segment(text),
    item => item.segment
  );
  return graphemes.reverse().join("");
}
