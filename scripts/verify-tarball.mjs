import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const npm = process.env.npm_execpath;
assert.ok(npm, "Run through npm run test:tarball");
function run(binary, args, cwd = root) {
  const result = spawnSync(binary, args, { cwd, encoding: "utf8", env: process.env });
  if (result.status !== 0) throw new Error([binary, ...args].join(" ") + "\n" + result.stdout + result.stderr + (result.error ?? ""));
  if (/npm warn|npm error/i.test(result.stderr)) throw new Error(result.stderr);
  return result.stdout;
}
const release = join(root, ".release");
mkdirSync(release, { recursive: true });
const pack = JSON.parse(run(process.execPath, [npm, "pack", "--ignore-scripts", "--json", "--pack-destination", release]))[0];
const names = pack.files.map(file => file.path);
for (const name of ["dist/index.js", "dist/index.mjs", "dist/index.d.ts", "dist/index.d.mts", "README.md", "LICENSE", "THIRD_PARTY_NOTICES.md"]) assert.ok(names.includes(name), name);
assert.ok(names.every(name => name.startsWith("dist/") || ["package.json", "README.md", "LICENSE", "THIRD_PARTY_NOTICES.md"].includes(name)), "Unexpected packaged file");
const artifact = resolve(release, pack.filename);
const consumer = mkdtempSync(join(tmpdir(), "fatdevcon-022-"));
writeFileSync(join(consumer, "package.json"), JSON.stringify({ name: "release-consumer", version: "1.0.0", private: true }));
run(process.execPath, [npm, "install", "--no-fund", "--fetch-retries=0", artifact], consumer);
let probe = readFileSync(join(root, "scripts/verify-package.mjs"), "utf8");
probe = probe.replace('new URL("../package.json", import.meta.url)', 'new URL("./node_modules/@fatdevcon/utilities/package.json", import.meta.url)');
writeFileSync(join(consumer, "probe.mjs"), probe);
console.log(run(process.execPath, ["probe.mjs"], consumer).trim());
console.log(run("bun", ["run", "probe.mjs"], consumer).trim());
const fixture = `import { formatCurrency, shortenString, getCountryCurrencies, summary, factorial, divide, NumericRangeError, getAbortError, isAbortError, wait, withRetry, type Comparator, type BytesFormatOptions, type NumericInput, type AbortErrorType, type WithRetryParameters } from "@fatdevcon/utilities";
const value: string = formatCurrency(1, "USD");
const countries: string[] = getCountryCurrencies("VN");
const compare: Comparator<number> = (a, b) => a - b;
const options: BytesFormatOptions = { base: 1024 };
shortenString(value, { endLength: 2 });
formatCurrency("1", "USD"); // numeric strings are valid input
// @ts-expect-error objects are not numeric input
formatCurrency({}, "USD");
// @ts-expect-error base is constrained
const badOptions: BytesFormatOptions = { base: 2 };
const asNumber: number = summary(1, 2);
const asBigint: bigint = summary(1n, 2n);
const asString: string = summary("1", 2);
const factorialBig: bigint = factorial(25n);
const quotient: string = divide(10n, 3n, { precision: 5 });
const input: NumericInput = "1e30";
const abortError: AbortErrorType = getAbortError();
const retryOptions: WithRetryParameters = { retryCount: 1, delay: ({ count }) => count * 10 };
const pendingWait: Promise<void> = wait(10);
const retried: Promise<string> = withRetry(async () => "ok", retryOptions);
if (isAbortError(abortError)) { void abortError.message; }
// @ts-expect-error a number pair returns a number, not a string
const wrongKind: string = summary(1, 2);
try { divide(1, 0); } catch (error) { if (error instanceof NumericRangeError) { const code: string = error.code; void code; } }
void [countries, compare, options, badOptions, asNumber, asBigint, asString, factorialBig, quotient, input, abortError, retryOptions, pendingWait, retried, wrongKind];
`;
for (const ext of ["mts", "cts"]) writeFileSync(join(consumer, "consumer." + ext), fixture);
console.log(run(process.execPath, [join(root, "node_modules/typescript-native/bin/tsc"),
  "--noEmit", "--strict", "--module", "NodeNext", "--moduleResolution", "NodeNext",
  "--target", "ES2020", "--skipLibCheck", "false", "consumer.mts", "consumer.cts"], consumer));
writeFileSync(join(release, "verification.json"), JSON.stringify({
  artifact, consumer, integrity: pack.integrity, shasum: pack.shasum,
  files: names, node: process.version, bun: run("bun", ["--version"]).trim(),
}, null, 2) + "\n");
console.log("Verified tarball installation, Node/Bun ESM+CJS, and TypeScript ESM+CJS consumers.");
console.log(artifact);
console.log("Integrity: " + pack.integrity);
