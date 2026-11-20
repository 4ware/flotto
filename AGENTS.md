This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
bun test                    # unit tests
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint, typecheck and `bun test` before declaring any task done.

## Testing

Unit tests run with `bun test` and React Native Testing Library (RNTL). Every module gets a test next to it (`button.tsx` → `button.test.tsx`).

- Never put tests in `src/app/`: Expo Router turns every file there into a route. Keep route files thin re-exports of screens in `src/features/`, and test the screen.
- Import RNTL from `@/test/render`, not from the package: it re-exports RNTL with a live `screen` (Bun binds CommonJS exports once) plus `renderWithProviders`, `mockApi` (canned API answers) and `iconNames`.
- `bun test` can't run the real `react-native` or native modules. `src/test/setup.ts` (preloaded via `bunfig.toml`) swaps in `src/test/fake-react-native.tsx` and `src/test/native-mocks.tsx`. Steer and inspect native modules through the objects exported there (`router`, `location`, `notifications`, `runTask`, ...). When code starts using a new native module or `react-native` export, add it there.
- Before writing or changing RNTL tests, read `node_modules/@testing-library/react-native/docs/guides/llm-guidelines.md` (RNTL v14: always `await` render and events, prefer `getByRole`, `userEvent`, `findBy*`).

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md
