import { describe, expect, test } from "bun:test";

import { messages, translateMessageKey } from "./messages";

describe("translateMessageKey", () => {
  test("translates an API error key", () => {
    expect(translateMessageKey("Errors.wrongCredentials")).toBe(messages.Errors.wrongCredentials);
  });

  test("falls back to the generic error for unknown keys", () => {
    expect(translateMessageKey("Errors.doesNotExist")).toBe(messages.Errors.generic);
  });

  test("falls back for keys outside Errors and for no key", () => {
    expect(translateMessageKey("Validation.emailInvalid")).toBe(messages.Errors.generic);
    expect(translateMessageKey(undefined)).toBe(messages.Errors.generic);
  });
});
