// Copies the built ESM bundle next to the documentation so the live demos run the exact package that ships.
// Run after `npm run build`; `npm run test:site` fails when the copy is stale.
import { copyFile, mkdir } from "node:fs/promises";

const target = new URL("../docs/assets/fatdevcon-utilities.mjs", import.meta.url);
await mkdir(new URL("../docs/assets/", import.meta.url), { recursive: true });
await copyFile(new URL("../dist/index.mjs", import.meta.url), target);
console.log("Synced dist/index.mjs to docs/assets/fatdevcon-utilities.mjs");
