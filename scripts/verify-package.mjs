import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";

const require = createRequire(import.meta.url);
const esm = await import("@fatdevcon/utilities");
const cjs = require("@fatdevcon/utilities");
const metadata = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
assert.equal(metadata.version, "0.2.2");
assert.equal(typeof Intl.Segmenter, "function");
for (const api of [esm, cjs]) {
  assert.equal(api.formatCompactNumber(12500), "12.5K");
  assert.equal(api.formatCurrency(1234.5, "USD"), "$1,234.50");
  assert.equal(api.formatPercent(0.125), "12.5%");
  assert.equal(api.formatBytes(1536, { base: 1024 }), "1.5 KiB");
  assert.deepEqual(api.getCountryCurrencies("VN"), ["VND"]);
  assert.equal(api.shortenString("abcdefghijklxyzc"), "abcd...xyzc");
  assert.equal(api.truncateText("👨‍👩‍👧‍👦🇻🇳abcd", 3, { ellipsis: "…" }), "👨‍👩‍👧‍👦🇻🇳…");
  assert.equal(api.slugify("Đặng Thị Tú"), "dang-thi-tu");
  assert.equal(api.summary(0.1, 0.2), 0.3);
  assert.equal(api.formatDate(new Date(2026, 9, 3), "yyyy-MM-dd"), "2026-10-03");
}
assert.deepEqual(Object.keys(esm).filter(key => key !== "default").sort(), Object.keys(cjs).sort());
console.log(`Package exports verified (ESM + CommonJS) on ${globalThis.Bun ? "Bun " + Bun.version : "Node " + process.version}.`);