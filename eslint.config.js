const parser = require("@typescript-eslint/parser");
const ts = require("@typescript-eslint/eslint-plugin");

module.exports = [
  { ignores: ["dist/**", "coverage/**", "node_modules/**"] },
  {
    files: ["src/**/*.ts"],
    languageOptions: { parser, parserOptions: { ecmaVersion: 2022, sourceType: "module" } },
    plugins: { "@typescript-eslint": ts },
    rules: {
      ...ts.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
];