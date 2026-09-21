import { describe, expect, test } from "bun:test";
import {
  canAccessExam,
  FREE_EXAM_NUMBER,
  hasPremiumAccess,
  isFreeExam,
  isPlanId,
  NO_SUBSCRIPTION,
  PLAN_IDS,
  type UserSubscription,
} from "./plans";

const FUTURE = new Date(Date.now() + 24 * 60 * 60 * 1000);
const PAST = new Date(Date.now() - 24 * 60 * 60 * 1000);

function sub(overrides: Partial<UserSubscription>): UserSubscription {
  return { ...NO_SUBSCRIPTION, ...overrides };
}

describe("hasPremiumAccess", () => {
  test("denies a user with no subscription row", () => {
    expect(hasPremiumAccess(NO_SUBSCRIPTION)).toBe(false);
  });

  describe("manual grants (no payment provider)", () => {
    test("allows until the period end", () => {
      expect(
        hasPremiumAccess(sub({ planId: "monthly", status: "active", currentPeriodEnd: FUTURE }))
      ).toBe(true);
    });

    test("denies after the period end, whatever the status says", () => {
      expect(
        hasPremiumAccess(sub({ planId: "monthly", status: "active", currentPeriodEnd: PAST }))
      ).toBe(false);
    });

    test("denies when the period end is missing", () => {
      expect(
        hasPremiumAccess(sub({ planId: "monthly", status: "active", currentPeriodEnd: null }))
      ).toBe(false);
    });
  });

  describe("provider-backed subscriptions", () => {
    const provider = { planId: "monthly" as const, paymentProvider: "paddle" };

    test("allows active even past the period end (renewal window)", () => {
      expect(hasPremiumAccess(sub({ ...provider, status: "active", currentPeriodEnd: PAST }))).toBe(
        true
      );
    });

    test("allows past_due while the provider retries payment", () => {
      expect(
        hasPremiumAccess(sub({ ...provider, status: "past_due", currentPeriodEnd: PAST }))
      ).toBe(true);
    });

    test("allows cancelled inside the paid period", () => {
      expect(
        hasPremiumAccess(sub({ ...provider, status: "cancelled", currentPeriodEnd: FUTURE }))
      ).toBe(true);
    });

    test("denies cancelled after the paid period", () => {
      expect(
        hasPremiumAccess(sub({ ...provider, status: "cancelled", currentPeriodEnd: PAST }))
      ).toBe(false);
    });

    test("denies expired", () => {
      expect(
        hasPremiumAccess(sub({ ...provider, status: "expired", currentPeriodEnd: FUTURE }))
      ).toBe(false);
    });
  });
});

describe("isFreeExam", () => {
  test("only the first exam of a skill is free", () => {
    expect(isFreeExam(FREE_EXAM_NUMBER)).toBe(true);
    for (const n of [2, 3, 4, 5]) {
      expect(isFreeExam(n)).toBe(false);
    }
  });
});

describe("canAccessExam", () => {
  const expired = sub({ planId: "monthly", status: "expired", paymentProvider: "paddle" });

  test("opens the free exam to a user with no subscription at all", () => {
    expect(canAccessExam(NO_SUBSCRIPTION, FREE_EXAM_NUMBER)).toBe(true);
  });

  test("opens the free exam to a user whose access has ended", () => {
    expect(canAccessExam(expired, FREE_EXAM_NUMBER)).toBe(true);
  });

  test("keeps every other exam behind the subscription", () => {
    expect(canAccessExam(NO_SUBSCRIPTION, 2)).toBe(false);
    expect(canAccessExam(expired, 5)).toBe(false);
  });

  test("opens every exam to a subscriber", () => {
    const active = sub({ planId: "monthly", status: "active", paymentProvider: "paddle" });
    expect(canAccessExam(active, 2)).toBe(true);
    expect(canAccessExam(active, 5)).toBe(true);
  });
});

describe("isPlanId", () => {
  test("accepts every offered plan", () => {
    for (const planId of PLAN_IDS) {
      expect(isPlanId(planId)).toBe(true);
    }
  });

  test("rejects anything else the checkout route might be handed", () => {
    // The value reaches this straight from a request body, so non-strings have
    // to be rejected as firmly as unknown plan names.
    for (const value of ["enterprise", "", null, undefined, 1, {}, ["monthly"]]) {
      expect(isPlanId(value)).toBe(false);
    }
  });
});
