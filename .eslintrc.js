module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
    ecmaVersion: 2020,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ["@typescript-eslint", "import"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/typescript",
    "plugin:import/recommended",
    "prettier",
  ],
  env: {
    node: true,
    es2020: true,
    jest: true,
  },
  settings: {
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
        project: "./tsconfig.json",
      },
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      },
    },
  },
  rules: {
    // TypeScript rules
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/consistent-type-imports": "error",

    // Import rules
    "import/order": [
      "error",
      {
        "newlines-between": "always",
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
        ],
      },
    ],
    "import/first": "error",
    "import/no-duplicates": "error",
    "import/newline-after-import": "error",

    // General rules
    "no-console": "warn",
    "no-var": "error",
    "prefer-const": "error",
    eqeqeq: ["error", "always"],
    "no-extra-boolean-cast": "off",
    "no-useless-escape": "off",
    "no-debugger": "warn",
    "no-duplicate-imports": "off", // Handled by @typescript-eslint
    "prefer-template": "error",
    "arrow-body-style": ["error", "as-needed"],
    "no-param-reassign": "error",
    "prefer-destructuring": ["error", { object: true, array: false }],
  },
  overrides: [
    {
      files: ["**/__tests__/**/*.test.ts"],
      env: {
        jest: true,
      },
      rules: {
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/no-explicit-any": "off",
      },
    },
  ],
};
