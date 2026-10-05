import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const site = await readFile(new URL("../docs/index.html", import.meta.url), "utf8");
const robots = await readFile(new URL("../docs/robots.txt", import.meta.url), "utf8");
const sitemap = await readFile(new URL("../docs/sitemap.xml", import.meta.url), "utf8");
const url = "https://phanhoangquoctu.github.io/fatdevcon-utilities/";
const npm = "https://www.npmjs.com/package/@fatdevcon/utilities";
const github = "https://github.com/PhanHoangQuocTu/fatdevcon-utilities";

for (const value of [
  '<html lang="en">',
  '<meta name="description"',
  `<link rel="canonical" href="${url}">`,
  'application/ld+json',
  'name="robots" content="index,follow"',
  'id="install"',
  'id="quick-start"',
  'id="features"',
  'id="api"',
  'id="examples"',
  'id="faq"',
  'api-data.js',
  npm,
  github,
]) assert.ok(site.includes(value), `site is missing ${value}`);

const inlineScript = /<script src="api-data\.js"><\/script><script>([\s\S]+)<\/script><\/body>/.exec(site)?.[1];
assert.ok(inlineScript, "site is missing its inline enhancement script");
new Function(inlineScript);

assert.match(robots, /User-agent: \*/);
assert.match(robots, new RegExp(`Sitemap: ${url}sitemap\\.xml`));
assert.match(sitemap, new RegExp(`<loc>${url}</loc>`));
console.log("Site metadata, crawl directives and conversion links verified.");
