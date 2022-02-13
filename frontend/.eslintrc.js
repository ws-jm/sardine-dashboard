module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ["plugin:react/recommended", "plugin:@typescript-eslint/recommended", "airbnb", "airbnb-typescript", "prettier"],
  overrides: [
    {
      files: ["**/*.stories.*"],
      rules: {
        "import/no-anonymous-default-export": "off",
      },
    },
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    project: "./tsconfig.json",
    sourceType: "module",
  },
  plugins: ["react", "@typescript-eslint", "unused-imports"],
  rules: {
    "consistent-return": "warn", // Temporary
    "require-await": "error",
    "no-return-assign": "off",
    "unused-imports/no-unused-imports": "error",
    "import/prefer-default-export": "off",
    "import/no-extraneous-dependencies": ["error", { devDependencies: true }], // test libraries should be ok. https://stackoverflow.com/questions/44939304/eslint-should-be-listed-in-the-projects-dependencies-not-devdependencies
    "no-bitwise": "warn", // Temporary
    "no-empty": "warn", // Temporary
    "no-nested-ternary": "off",
    "no-param-reassign": "warn", // Temporarily changed it to warn
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
    "no-useless-escape": "warn", // Temporarily changed it to warn
    "no-useless-concat": "warn", // Temporarily changed it to warn
    "react/destructuring-assignment": "warn", // Temporarily changed it warn instead of error since there are too many errors and we don't want to fix them all
    "react/function-component-definition": ["error", { namedComponents: "arrow-function" }],
    "react/jsx-props-no-spreading": "warn", // Temporarily changed it warn
    "react/no-unescaped-entities": "warn", // Temporary
    "react/no-unused-prop-types": "warn", // Temporary
    "react/react-in-jsx-scope": "off", // Temporary
    "react/require-default-props": "off", // We should use default value instead of defaultProps. https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/default_props/
    "react/prop-types": "warn", // temporarily changed it to warn
    "require-await": "error",
    "unused-imports/no-unused-imports": "error",
    "@typescript-eslint/return-await": "error",
    "@typescript-eslint/naming-convention": "warn", // temporarily changed it warn instead of error since there are too many errors and we don't want to fix them all
    "@typescript-eslint/no-explicit-any": "error", // For old any type that is tough to convert, we temporarily use AnyTodo
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/no-use-before-define": "warn", // Temporarily changed it warn since there are too many errors and we don't want to fix them all
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }], // Allow variables begin with _
    "@typescript-eslint/no-unused-expressions": "warn", // temporarily changed it to warn
    "@typescript-eslint/no-shadow": "warn", // Temporary
    "react/no-unstable-nested-components": "warn", // Temporary
    "react/jsx-no-useless-fragment": [
      "error",
      {
        allowExpressions: true,
      },
    ],
  },
  ignorePatterns: [".storybook/*", "src/stories", "build"],
};
