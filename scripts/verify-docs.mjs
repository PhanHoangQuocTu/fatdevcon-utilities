// Runs every example in docs/api-data.js (entries marked `run: false` are illustrative) against the built package and compares the
// result with the trailing `// expected` comment. Run after `npm run build`.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import { inspect } from "node:util";

const require = createRequire(import.meta.url);
const api = require("../dist/index.js");
const source = await readFile(new URL("../docs/api-data.js", import.meta.url), "utf8");
const { GROUPS } = new Function(`${source}; return { GROUPS };`)();

// Find a `//` comment that is not inside a string literal.
const splitComment = (line) => {
  let quote = null;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quote) {
      if (ch === "\\") i++;
      else if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'" || ch === "`") quote = ch;
    else if (ch === "/" && line[i + 1] === "/") return [line.slice(0, i).trimEnd(), line.slice(i + 2).trim()];
  }
  return [line, ""];
};

const balanced = (code) => {
  let depth = 0;
  let quote = null;
  for (let i = 0; i < code.length; i++) {
    const ch = code[i];
    if (quote) {
      if (ch === "\\") i++;
      else if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'" || ch === "`") quote = ch;
    else if ("([{".includes(ch)) depth++;
    else if (")]}".includes(ch)) depth--;
  }
  return depth === 0 && !quote;
};

/** Split an example into statements, each with the expectation written after it. */
const parse = (example) => {
  const statements = [];
  let buffer = "";
  for (const raw of example.split("\n")) {
    const [code, comment] = splitComment(raw);
    if (!buffer && code.trim() === "" && comment) {
      // a comment-only line continues the expectation of the previous statement
      const last = statements[statements.length - 1];
      if (last) last.expected = `${last.expected ?? ""} ${comment}`.trim();
      continue;
    }
    buffer += (buffer ? "\n" : "") + code;
    if (balanced(buffer) && /[;}]\s*$/.test(buffer)) {
      statements.push({ code: buffer, expected: comment || undefined });
      buffer = "";
    } else if (comment && balanced(buffer)) {
      statements.push({ code: buffer, expected: comment });
      buffer = "";
    }
  }
  if (buffer.trim()) statements.push({ code: buffer, expected: undefined });
  return statements;
};

const normalize = (text) =>
  text
    .replace(/\[Object: null prototype\] /g, "")
    .replace(/\s+\([^)]*\)$/, "")
    .replace(/'((?:[^'\\"]|\\.)*)'/g, '"$1"')
    .replace(/\[\s+/g, "[")
    .replace(/\s+\]/g, "]")
    .replace(/\{\s+/g, "{ ")
    .replace(/\s+\}/g, " }")
    .replace(/\s+/g, " ")
    .trim();

const render = (value) =>
  normalize(inspect(value, { depth: 6, breakLength: Infinity, maxStringLength: null, maxArrayLength: null }));

const skip = (expected) => /^(e\.g\.|a uniform|1, 2,|pass |\d+, \d+, \d+ or)/.test(expected) || /^throws: pass/.test(expected);

const matches = (actual, expected) => {
  if (!expected.includes("…")) return actual === expected;
  const parts = expected.split("…");
  let at = 0;
  for (const part of parts) {
    const found = actual.indexOf(part, at);
    if (found < 0) return false;
    at = found + part.length;
  }
  return true;
};

const names = Object.keys(api);
let checked = 0;
let skipped = 0;
const failures = [];
const documented = new Set();

for (const group of GROUPS) {
  for (const fn of group.fns) {
    documented.add(fn.name);
    if (!names.includes(fn.name)) failures.push(`${fn.name}: documented but not exported`);
    if (!fn.params || !fn.returns && !fn.desc) failures.push(`${fn.name}: missing params or description`);
    for (const param of fn.params ?? []) {
      if (!param.name || !param.type || !param.desc) failures.push(`${fn.name}: incomplete parameter ${JSON.stringify(param)}`);
    }
    const statements = fn.run === false ? [] : parse(fn.ex);
    let setup = "";
    for (let i = 0; i < statements.length; i++) {
      const { code, expected } = statements[i];
      const isDeclaration = /^\s*(const|let|var|function|import|try|for|if)\b/.test(code) || /\bawait\b|window\./.test(code);
      if (!expected || isDeclaration || skip(expected)) {
        if (expected && skip(expected)) skipped++;
        if (isDeclaration && /\b(saveDraft|updatePosition|connect|fetchJson|fetch|AuthError|window)\b/.test(code)) continue;
        setup += `${code}\n`;
        continue;
      }
      const wantsThrow = expected.startsWith("throws");
      const body = `${setup}\nreturn (${code.replace(/;\s*$/, "")});`;
      try {
        const run = new Function(...names, body);
        const actual = run(...names.map((n) => api[n]));
        if (wantsThrow) {
          failures.push(`${fn.name}: expected a throw from \`${code}\` but got ${render(actual)}`);
        } else if (!matches(render(actual), normalize(expected))) {
          failures.push(`${fn.name}: \`${code.replace(/\s+/g, " ")}\` gave ${render(actual).slice(0, 120)} but the docs say ${normalize(expected).slice(0, 120)}`);
        }
        checked++;
      } catch (error) {
        if (wantsThrow) {
          const wanted = /ERR_[A-Z_]+/.exec(expected)?.[0];
          if (wanted && error.code !== wanted) failures.push(`${fn.name}: \`${code}\` threw ${error.code ?? error.message} instead of ${wanted}`);
          checked++;
        } else failures.push(`${fn.name}: \`${code.replace(/\s+/g, " ")}\` threw ${error.code ?? ""} ${error.message}`);
      }
    }
  }
}

const internal = new Set(["countingSortByDigit", "heapify", "merge", "NumericTypeError", "NumericRangeError"]);
for (const name of names) {
  if (!documented.has(name) && !internal.has(name)) failures.push(`${name}: exported but not documented`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  assert.fail(`${failures.length} documentation problem(s)`);
}
console.log(`Documentation verified: ${documented.size} functions, ${checked} examples checked, ${skipped} skipped.`);
