module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: ["airbnb-base", "airbnb-typescript/base", "prettier"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 12,
    project: "./tsconfig.json",
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  rules: {
    "consistent-return": "warn", // Temporary
    "import/prefer-default-export": "off", // There is no great advantage to using default exports over named exports
    "import/no-extraneous-dependencies": ["error", { devDependencies: true }], // test libraries should be ok. https://stackoverflow.com/questions/44939304/eslint-should-be-listed-in-the-projects-dependencies-not-devdependencies
    "no-param-reassign": "warn", // temporarily changed it to warn
    "no-plusplus": "warn", // Temporary
    "no-restricted-syntax": [
      "warn",
      {
        selector: "TSEnumDeclaration", // No advantage in using enum over union types: https://github.com/typescript-eslint/typescript-eslint/issues/561
        message: "Don't declare enums. Please use union types instead.",
      },
    ], // Temporary
    "no-return-await": "off", // note you must disable the base rule as it can report incorrect errors
    "no-underscore-dangle": "warn", // Temporary
    "require-await": "error",
    "@typescript-eslint/return-await": "error",
    "@typescript-eslint/naming-convention": "warn", // temporarily changed it warn since there are too many errors and we don't want to fix them all
    "@typescript-eslint/no-explicit-any": "error", // For old any type that is tough to convert, we temporarily use AnyTodo
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/no-use-before-define": "warn", // temporarily changed it warn it since there are too many errors and we don't want to fix them all
    "@typescript-eslint/no-unused-vars": "warn", // Temporary
    "@typescript-eslint/no-shadow": "warn", // temporary
  },
};
