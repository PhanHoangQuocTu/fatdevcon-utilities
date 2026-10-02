import { dts } from "rollup-plugin-dts";

// Keep declaration generation separate: tsup injects deprecated baseUrl.
export default {
  input: "src/index.ts",
  output: [
    { file: "dist/index.d.ts", format: "es" },
    { file: "dist/index.d.mts", format: "es" },
  ],
  plugins: [dts({ tsconfig: "./tsconfig.json" })],
};
