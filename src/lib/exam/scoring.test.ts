import { describe, expect, test } from "bun:test";
import { getScoreFeedback, getStatus } from "./scoring";

describe("writing pass mark", () => {
  // 3 free-writing tasks (10) + 1 form (7) = 37 points; 60% rounds to 22, which is 59%
  test("the results badge and the exam list agree at the threshold", () => {
    expect(getStatus("writing", "A2", 22, 37).passed).toBe(true);
    expect(getScoreFeedback("writing", "A2", 22, 37)?.label).toStartWith("Passed");
    expect(getStatus("writing", "A2", 21, 37).passed).toBe(false);
    expect(getScoreFeedback("writing", "A2", 21, 37)?.label).toStartWith("Not yet passing");
  });
});
