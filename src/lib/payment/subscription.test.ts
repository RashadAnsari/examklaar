import { afterAll, beforeEach, describe, expect, mock, test } from "bun:test";
import { StubPool } from "../../../test/stubPool";
import { NO_SUBSCRIPTION } from "./plans";

/**
 * Early access opens every exam for free, so it must end the moment billing
 * is configured: after that, only the subscription rules decide.
 */

const pool = new StubPool();

mock.module("@/lib/db", () => ({ pool }));

const { getUserSubscription, hasFullAccess, isEarlyAccess, userCanAccessExam } =
  await import("./subscription");

const originalProvider = process.env.PAYMENT_PROVIDER;

beforeEach(() => {
  pool.reset();
  delete process.env.PAYMENT_PROVIDER;
});

afterAll(() => {
  process.env.PAYMENT_PROVIDER = originalProvider;
});

describe("early access", () => {
  test("is on while no payment provider is configured", () => {
    expect(isEarlyAccess()).toBe(true);
    expect(hasFullAccess(NO_SUBSCRIPTION)).toBe(true);
  });

  test("opens every exam without reading the subscription", async () => {
    expect(await userCanAccessExam("user_1", 5)).toBe(true);
    expect(pool.calls).toHaveLength(0);
  });

  test("ends once a payment provider is configured", async () => {
    process.env.PAYMENT_PROVIDER = "paddle";
    expect(isEarlyAccess()).toBe(false);
    expect(hasFullAccess(NO_SUBSCRIPTION)).toBe(false);
    expect(await userCanAccessExam("user_1", 5)).toBe(false);
    expect(await userCanAccessExam("user_1", 1)).toBe(true);
  });
});

describe("getUserSubscription", () => {
  test("returns the no-subscription shape when the user has no row", async () => {
    const sub = await getUserSubscription("user_1");
    expect(sub.planId).toBeNull();
    expect(sub.status).toBeNull();
    expect(sub.paymentProvider).toBeNull();
  });

  test("scopes the read to the user id", async () => {
    await getUserSubscription("user_1");
    expect(pool.calls[0].params).toEqual(["user_1"]);
  });

  test("maps a row onto the access-rule shape", async () => {
    pool.on(/select .* from subscriptions/, () => ({
      rowCount: 1,
      rows: [
        {
          plan_id: "monthly",
          status: "active",
          current_period_end: "2099-01-01T00:00:00.000Z",
          cancel_at_period_end: true,
          provider_subscription_id: "sub_1",
          provider_customer_id: "ctm_1",
          payment_provider: "paddle",
        },
      ],
    }));
    expect(await getUserSubscription("user_1")).toEqual({
      planId: "monthly",
      status: "active",
      currentPeriodEnd: new Date("2099-01-01T00:00:00.000Z"),
      cancelAtPeriodEnd: true,
      providerSubscriptionId: "sub_1",
      providerCustomerId: "ctm_1",
      paymentProvider: "paddle",
    });
  });
});
