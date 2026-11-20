/// <reference types="bun" />
// RNTL registers its matchers on Bun's `expect` (via expect.extend); this types them.
import type { JestNativeMatchers } from "@testing-library/react-native/dist/matchers/types";

declare module "bun:test" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unused-vars
  interface Matchers<T> extends JestNativeMatchers<void> {}
}
