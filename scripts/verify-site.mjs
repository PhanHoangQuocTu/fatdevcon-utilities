import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const [site, robots, sitemap, script, style, bundle, built, data] = await Promise.all([
  read("../docs/index.html"),
  read("../docs/robots.txt"),
  read("../docs/sitemap.xml"),
  read("../docs/assets/app.js"),
  read("../docs/assets/style.css"),
  read("../docs/assets/fatdevcon-utilities.mjs"),
  read("../dist/index.mjs"),
  read("../docs/api-data.js"),
]);
const { version } = JSON.parse(await read("../package.json"));
const url = "https://phanhoangquoctu.github.io/fatdevcon-utilities/";
const npm = "https://www.npmjs.com/package/@fatdevcon/utilities";
const github = "https://github.com/PhanHoangQuocTu/fatdevcon-utilities";

for (const value of [
  '<html lang="en">',
  '<meta name="description"',
  `<link rel="canonical" href="${url}">`,
  'name="robots" content="index,follow"',
  'application/ld+json',
  'id="install"',
  'id="quick-start"',
  'id="features"',
  'id="playground"',
  'id="api"',
  'id="examples"',
  'id="releases"',
  'id="faq"',
  'src="api-data.js"',
  'type="module" src="assets/app.js"',
  'href="assets/style.css"',
  npm,
  github,
]) assert.ok(site.includes(value), `site is missing ${value}`);

assert.equal(bundle, built, "docs/assets/fatdevcon-utilities.mjs is stale: run npm run build && npm run docs:sync");
assert.ok(site.includes(`Version ${version}`), "footer must show the current version");
assert.ok(site.includes(`"softwareVersion":"${version}"`), "structured data must carry the current version");
assert.ok(site.includes(`Release ${version}`), "release section must describe the current version");

for (const [, json] of site.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(json);
new Function(data.replace("if (typeof module", "void 0 && (typeof module").replace(/module\.exports = \{ GROUPS \};/, ""));
assert.ok(/^import |await import\(/m.test(script), "app.js must be an ES module");
assert.ok(/:focus-visible/.test(style) && /prefers-reduced-motion/.test(style) && /prefers-color-scheme: dark/.test(style), "styles must keep focus, motion and dark-mode handling");

// Every internal anchor in the static page must exist, either in the page or as a documented function.
const ids = new Set([...site.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]));
const fnNames = new Set([...data.matchAll(/\{ name: "([A-Za-z0-9]+)"/g)].map((m) => m[1]));
const groupIds = new Set([...data.matchAll(/id: "([a-z-]+)", title:/g)].map((m) => m[1]));
for (const [, target] of site.matchAll(/href="#([^"]+)"/g)) {
  assert.ok(ids.has(target) || fnNames.has(target) || groupIds.has(target), `broken anchor #${target}`);
}

assert.match(robots, /User-agent: \*/);
assert.match(robots, new RegExp(`Sitemap: ${url}sitemap\\.xml`));
assert.match(sitemap, new RegExp(`<loc>${url}</loc>`));
console.log("Site markup, structured data, live-demo bundle, anchors and crawl directives verified.");
