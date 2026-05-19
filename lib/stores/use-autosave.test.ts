import { describe, expect, it } from "vitest";
import { shouldApplyAutosaveResult } from "./autosave-version";

describe("autosave version handling", () => {
  it("ignores a stale save result after a newer edit starts saving", () => {
    expect(shouldApplyAutosaveResult(1, 2)).toBe(false);
  });

  it("applies the save result for the latest edit", () => {
    expect(shouldApplyAutosaveResult(2, 2)).toBe(true);
  });
});
