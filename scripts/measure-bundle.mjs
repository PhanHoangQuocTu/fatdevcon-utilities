// Reproducible browser-consumer sizes; uses esbuild already provided by tsup.
// Run after build. Optional argument selects another ESM artifact for comparison.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { gzipSync } from "node:zlib";
import { runInNewContext } from "node:vm";
import { build, version as esbuildVersion } from "esbuild";

const entry = resolve(process.argv[2] ?? "dist/index.mjs");
const api = await import(pathToFileURL(entry));
const fixtures = {
  full: null,
  toNumber: ["toNumber"],
  normalizeWhitespace: ["normalizeWhitespace"],
  capitalize: ["capitalize"],
  legacyMixed: ["toNumber", "normalizeWhitespace", "capitalize"],
  strip: ["strip"],
  title: ["title"],
  firstChar: ["firstChar"],
  lastChar: ["lastChar"],
  safeToNumber: ["safeToNumber"],
  safeToInteger: ["safeToInteger"],
  safeToBigInt: ["safeToBigInt"],
  safeToBoolean: ["safeToBoolean"],
  safeToString: ["safeToString"],
  cleaningMixed: ["strip", "title", "firstChar", "lastChar", "safeToNumber"],
};
const sizes = bytes => ({ raw: bytes.length, gzip: gzipSync(bytes, { level: 9 }).length });
const report = { node: process.version, esbuild: esbuildVersion, entry, artifacts: {}, consumers: {} };
for (const name of ["index.mjs", "index.js", "index.d.ts", "index.d.mts"]) {
  report.artifacts[name] = sizes(await readFile(new URL(name, pathToFileURL(entry))));
}
for (const [name, names] of Object.entries(fixtures)) {
  if (names?.some(key => !(key in api))) continue;
  const source = names
    ? `import { ${names.join(",")} } from ${JSON.stringify(entry)}; globalThis.consumer = { ${names.join(",")} };`
    : `import * as api from ${JSON.stringify(entry)}; globalThis.consumer = api;`;
  const bundle = await build({
    stdin: { contents: source, resolveDir: process.cwd() }, bundle: true, write: false,
    platform: "browser", format: "iife", target: "es2020", minify: true,
    treeShaking: true, metafile: true,
  });
  assert.deepEqual(bundle.metafile.outputs["stdin.js"].imports, [], "browser fixture must be self-contained");
  const code = bundle.outputFiles[0].contents;
  const context = {};
  runInNewContext(Buffer.from(code).toString(), context, { timeout: 5000 });
  assert.deepEqual(Object.keys(context.consumer).sort(), (names ?? Object.keys(api)).sort());
  if (context.consumer.safeToNumber) assert.equal(context.consumer.safeToNumber("9007199254740993"), null);
  if (context.consumer.strip) assert.equal(context.consumer.strip("  hello  "), "hello");
  if (context.consumer.firstChar) assert.equal(context.consumer.firstChar("👨‍👩‍👧‍👦x"), "👨‍👩‍👧‍👦");
  if (name === "full" && api.firstChar) {
    // A fresh browser-like realm has no Node globals. Also verify the complete
    // root can initialize without Intl, before endpoint fallback is called.
    for (const intl of [undefined, {}]) {
      const fallback = { Intl: intl };
      runInNewContext(Buffer.from(code).toString(), fallback, { timeout: 5000 });
      assert.equal(fallback.consumer.firstChar("👨‍👩‍👧‍👦"), "👨");
      assert.equal(fallback.consumer.lastChar("e\u0301"), "\u0301");
      assert.equal(fallback.consumer.safeToNumber("12.5"), 12.5);
    }
  }
  report.consumers[name] = sizes(code);
}
console.log(JSON.stringify(report, null, 2));
