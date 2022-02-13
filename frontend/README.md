# Dashboard Frontend

This is React-Typescript based frontend for Sardine's Dashboard product. It has been bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm install`

Installs all the dependencies for the project

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:4000](http://localhost:4000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

## Name convention

- Folder: If folder for React component then PascalCase else camelCase
- JS/TS/JSX/TSX file: If React component (e.t. Button.tsx) then PascalCase else camelCase. There are some exceptions.
  - React hooks file: camelCase (e.g. useToggle.ts)
  - Test file: Follow the name convention of the target file. Test file for React components (e.g. DataProvider.test.ts) should be ${Target}.test.ts. Test file for non-React should be camelCase (e.g. errorUtils.test.ts)
  - Node file: TS/JS scripts that is executed by Node should be kebab-case (e.g. generate-feature-csv.ts)
- Interface: PascalCase
- Variable: camelCase
- Function: camelCase
- Component: PascalCase
- HTML id attribute: snake_case
- HTML data-tid attribute: snake_case. Used for automated tests.
- HTML class attribute (React DOM className): kebab-case

If you run into a trouble when you try to uppercase/lowercase files but Git does not detect it, please check your git config by the following command.

```
git config -l --local
```

If you see `core.ignorecase=true` in your Git config, please run the following to change the ignorecase setting.

```
git config core.ignorecase false
```

## tsx-source-jump

We are using [tsx-source-jump](https://github.com/mizchi/tsx-source-jump) for frontend dev. This Vite plugin works with VSCode.

When you want to find a React element shown on your browser, press SHIFT key and click the element. Then, your browser will open the file with the corresponding React element in VSCode.

tsx-source-jump config is in `vite.config.ts`.

## DOs and DON'Ts

### TypeScript and ESLint

#### DO

- Explicitly define interfaces and types
- If the type/interface can be used in server, define it in `/shared`
- Follow ESLint rules
- If you cannot resolve an ESLint rule, disable it by `// eslint-disable-next-line RULENAME` only for that line
- If you believe that we should disable a certain ESLint rule, suggest that to somebody on Slack or somewhere
- Apply `prettier` on every save. VSCode and JetBrains IDs have the _Format on save_ feature.
- Report the error when it happens using `captureException`.

#### DON'T

- Don't use `any` type. `unknown` is better than `any`. If it is difficult to find a right typing, please use `AnyTodo` and fix it later.
- Don't disable the ESLint rules for the whole repo without asking
- Don't use `enum` instead of union types. You can define a union type from a const object as follows. There is almost no advantage using enum over union types.

```
export const TIME_UNITS = {
  SECOND: "second",
  MILLISECOND: " millisecond",
} as const;
export type TimeUnit = typeof TIME_UNITS[keyof typeof TIME_UNITS];
```

- Don't overuse `as`. You should use [type guards and type predicates](https://www.typescriptlang.org/docs/handbook/advanced-types.html#using-type-predicates). It is fine to use `as` in type guard functions.

### react-router

#### DO

- Use `useSearchParams` https://reactrouter.com/docs/en/v6/api#usesearchparams for getting search params.

#### DON'Ts

- Don't directly get search params from the URL by `const params = new URLSearchParams(location.search);`
- Don't use old react-router v5 techniques. We are using react-router v6.
- Don't overuse `state` in react-router. It is difficult to specify the type of the state. Please consider using the global state management like Zustand.

### react-query

##### DO

- Use `react-query` for caching fetched resources
- Invalidate when the resources are modified
- Use `react-query` inside React Hooks.

#### DON'T

- Don't use global state management (like Redux and Zustand) for simple fetched resources. Please use a fetch caching tool like `react-query`
- Don't directly use `react-query` inside a React Element, not in a React Hook. It makes it difficult to track the cache keys.
