import { writeFile } from "node:fs/promises";

const version = "48.2.0";
const asOf = "2026-10-03";
const root = `https://raw.githubusercontent.com/unicode-org/cldr-json/${version}/`;
const url = root + "cldr-json/cldr-core/supplemental/currencyData.json";
async function download(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status}: ${url}`);
  return response.text();
}
const data = JSON.parse(await download(url));
const countries = {};
for (const [region, entries] of Object.entries(data.supplemental.currencyData.region)) {
  const codes = entries.flatMap(entry => Object.entries(entry)
    .filter(([, period]) => period._tender !== "false"
      && (!period._from || period._from <= asOf) && (!period._to || period._to >= asOf))
    .map(([code]) => code));
  if (codes.length) countries[region] = [...new Set(codes)];
}
const sorted = Object.fromEntries(Object.entries(countries).sort(([a], [b]) => a.localeCompare(b)));
await writeFile(new URL("../src/modules/formatter/country-currencies.ts", import.meta.url),
  `// Derived from Unicode CLDR ${version}; active legal tender as of ${asOf}.
// Source: ${url}
// Modified: historical and non-tender entries removed. See THIRD_PARTY_NOTICES.md.
// Regenerate with: node scripts/update-currencies.mjs
export const countryCurrencies: Readonly<Record<string, readonly string[]>> = ${JSON.stringify(sorted, null, 2)};\n`);
const license = await download(root + "LICENSE");
await writeFile(new URL("../THIRD_PARTY_NOTICES.md", import.meta.url),
  `# Unicode CLDR\n\nCountry/currency data is derived from Unicode CLDR ${version}:\n${url}\n\nModified to retain legal-tender currencies active on ${asOf}. This is a bundled snapshot, not a live service.\n\n${license.trimEnd()}\n`);
console.log(`Generated ${Object.keys(sorted).length} region mappings (CLDR ${version}, ${asOf}).`);