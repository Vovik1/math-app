module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  env: {
    browser: true,
    es2021: true,
  },
  plugins: ["react", "@typescript-eslint/eslint-plugin", "simple-import-sort"],
  extends: [
    "next/core-web-vitals",
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],

  rules: {
    "react/react-in-jsx-scope": "off",
    "prettier/prettier": [
      "error",
      {
        singleQuote: false,
        parser: "flow",
        endOfLine: "auto",
        printWidth: 100,
        tabWidth: 2,
      },
    ],
  },
};
