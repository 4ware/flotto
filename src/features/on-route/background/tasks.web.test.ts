import { describe, expect, test } from "bun:test";

import { taskManager } from "@/test/native-mocks";

import { GEOFENCE_TASK, LOCATION_TASK, REPORT_INTERVAL_MS } from "./tasks.web";

describe("tasks (web)", () => {
  test("has the native module's task names and interval, without defining tasks", () => {
    // Same values as tasks.ts (checked in tasks.test.ts), so shared code reads the same names.
    expect(LOCATION_TASK).toBe("flotto.location");
    expect(GEOFENCE_TASK).toBe("flotto.geofence");
    expect(REPORT_INTERVAL_MS).toBe(10_000);
    expect(taskManager.defineTask).not.toHaveBeenCalled();
  });
});
