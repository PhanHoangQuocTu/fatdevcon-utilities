// Bounded stress correctness + repeatable timings. Not a CI timing threshold.
// Optional baseline ESM path adds like-for-like legacy measurements.
import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import * as api from "../dist/index.mjs";

const timings = [];
function measure(name, iterations, operation) {
  for (let i = 0; i < Math.min(100, iterations); i++) operation();
  const runs = [];
  for (let run = 0; run < 5; run++) {
    const start = performance.now();
    for (let i = 0; i < iterations; i++) operation();
    runs.push(performance.now() - start);
  }
  runs.sort((a, b) => a - b);
  timings.push({ name, iterations, medianMs: Number(runs[2].toFixed(3)) });
}

for (const size of [0, 1, 10, 100, 1000, 10000, 100000, 1000000]) {
  const body = "a".repeat(size);
  assert.equal(api.strip(` \t${body}\n `), body);
  assert.equal(api.lstrip(` \t${body}X\n `), `${body}X\n `);
  assert.equal(api.rstrip(` \tX${body}\n `), ` \tX${body}`);
  assert.equal(api.strip(`🌍${body}🌍`, "🌍"), body);
  assert.equal(api.title(body), size ? `A${body.slice(1)}` : "");
  assert.equal(api.normalizeWhitespace(`\t${body}\n`), body);
  assert.equal(api.firstChar(`👨‍👩‍👧‍👦${body}`), "👨‍👩‍👧‍👦");
  assert.equal(api.lastChar(`${body}👍🏽`), "👍🏽");
  assert.equal(api.safeToNumber(`1${"0".repeat(size)}x`), null);
  if (size) {
    assert.equal(api.safeToNumber("0".repeat(size)), 0);
    assert.equal(api.safeToNumber(`0.${"0".repeat(size)}1e-999`), null);
    assert.equal(api.safeToInteger("9".repeat(size)), size > 15 ? null : Number("9".repeat(size)));
  }
}
const largeJson = JSON.stringify(Array.from({ length: 10000 }, (_, i) => ({ id: i, name: "Đặng" })));
const parsed = api.safeJsonParse(largeJson);
assert.equal(parsed.ok, true);
assert.equal(parsed.value.length, 10000);
assert.equal(api.safeToString(parsed.value), largeJson);
const deep = "[".repeat(10000) + "0" + "]".repeat(10000);
assert.equal(api.safeJsonParse(deep).ok, true);
assert.equal(api.safeJsonParse(deep.slice(1)).ok, false);

const text = "  đẶNG vĂN lÂM 👨‍👩‍👧‍👦  ";
for (const [name, operation] of Object.entries({
  strip: () => api.strip(text),
  stripSet: () => api.strip(text, " "),
  title: () => api.title(text),
  firstChar: () => api.firstChar(text),
  lastChar: () => api.lastChar(text),
  safeToNumber: () => api.safeToNumber(" -123.456e2 "),
  safeToInteger: () => api.safeToInteger("123456"),
  safeToBigInt: () => api.safeToBigInt("9007199254740993"),
  safeToBoolean: () => api.safeToBoolean(" FALSE "),
  safeToString: () => api.safeToString({ name: "Đặng", count: 1 }),
})) measure(name, 10000, operation);

const versions = { current: api };
if (process.argv[2]) versions.baseline = await import(pathToFileURL(resolve(process.argv[2])));
for (const [version, library] of Object.entries(versions)) {
  for (const name of ["capitalize", "truncateText", "countWords", "normalizeWhitespace", "toNumber"]) {
    measure(`${version}:${name}`, 10000, () => library[name](name === "toNumber" ? "123.45" : text, name === "truncateText" ? 10 : undefined));
  }
}
console.log(JSON.stringify({ runtime: globalThis.Bun ? `Bun ${Bun.version}` : `Node ${process.version}`, stress: "PASS (0–1,000,000-character inputs, 10,000-level JSON)", timings }, null, 2));
