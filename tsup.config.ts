import { defineConfig } from "tsup";

// Ship readable, unminified output: it keeps stack traces useful, lets consumers and registry
// scanners audit the code, and bundlers minify it anyway. The library has no runtime dependencies.
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: false,
  sourcemap: false,
  clean: true,
  minify: false,
  treeshake: true,
  splitting: false,
  target: "es2020",
  outDir: "dist",
  tsconfig: "./tsconfig.json",
});
