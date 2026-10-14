import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { GROUPS } from "../docs/api-data.js";
import { runPlayground } from "../docs/assets/playground-parser.js";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const [site, robots, sitemap, script, style, bundle, built, parser] = await Promise.all([
  read("../docs/index.html"),
  read("../docs/robots.txt"),
  read("../docs/sitemap.xml"),
  read("../docs/assets/app.js"),
  read("../docs/assets/style.css"),
  read("../docs/assets/fatdevcon-utilities.mjs"),
  read("../dist/index.mjs"),
  read("../docs/assets/playground-parser.js"),
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
assert.ok(/^import |await import\(/m.test(script), "app.js must be an ES module");
assert.ok(/:focus-visible/.test(style) && /prefers-reduced-motion/.test(style) && /prefers-color-scheme: dark/.test(style), "styles must keep focus, motion and dark-mode handling");
assert.doesNotMatch(`${script}\n${parser}`, /\b(?:eval|new\s+Function)\b/, "documentation must not dynamically execute editable source text");

const playgroundApi = await import("../dist/index.mjs");
assert.deepEqual(runPlayground('summary(0.1, 0.2)', playgroundApi), [{ kind: "ok", value: 0.3 }]);
assert.match(runPlayground('summary(0.1, 0.2) + 1', playgroundApi)[0].text, /Unexpected input/);
assert.match(runPlayground('constructor()', playgroundApi)[0].text, /not available/);
assert.match(runPlayground('safeToString({ __proto__: "x" })', playgroundApi)[0].text, /not allowed/);

// Every internal anchor in the static page must exist, either in the page or as a documented function.
const ids = new Set([...site.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]));
const fnNames = new Set(GROUPS.flatMap((group) => group.fns.map((fn) => fn.name)));
const groupIds = new Set(GROUPS.map((group) => group.id));
for (const [, target] of site.matchAll(/href="#([^"]+)"/g)) {
  assert.ok(ids.has(target) || fnNames.has(target) || groupIds.has(target), `broken anchor #${target}`);
}

assert.match(robots, /User-agent: \*/);
assert.match(robots, new RegExp(`Sitemap: ${url}sitemap\\.xml`));
assert.match(sitemap, new RegExp(`<loc>${url}</loc>`));
console.log("Site markup, structured data, live-demo bundle, anchors and crawl directives verified.");
