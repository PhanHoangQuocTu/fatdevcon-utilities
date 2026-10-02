import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: false,
  treeshake: true,
  splitting: false,
  target: "es2020",
  outDir: "dist",
  external: ["node:buffer", "node:util"],
  noExternal: [],
  tsconfig: "./tsconfig.json",
  esbuildOptions: (options) => {
    options.minify = true;
    options.minifyIdentifiers = true;
    options.minifySyntax = true;
    options.minifyWhitespace = true;
  },
});
