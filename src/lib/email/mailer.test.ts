import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { sendEmail } from "./mailer";

const realFetch = globalThis.fetch;
let calls: { url: string; init: RequestInit }[] = [];
let response = new Response(JSON.stringify({ messageId: "<id>" }), { status: 201 });

beforeEach(() => {
  calls = [];
  process.env.BREVO_API_KEY = "test-key";
  process.env.EMAIL_FROM_ADDRESS = "noreply@examklaar.nl";
  process.env.EMAIL_FROM_NAME = "Examklaar";
  globalThis.fetch = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return response;
  }) as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = realFetch;
});

describe("sendEmail", () => {
  test("posts the message to Brevo with the API key", async () => {
    response = new Response(JSON.stringify({ messageId: "<id>" }), { status: 201 });
    await sendEmail({ to: "a@b.nl", subject: "Hi", html: "<p>Hi</p>" });

    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe("https://api.brevo.com/v3/smtp/email");
    expect((calls[0].init.headers as Record<string, string>)["api-key"]).toBe("test-key");
    expect(JSON.parse(calls[0].init.body as string)).toEqual({
      sender: { name: "Examklaar", email: "noreply@examklaar.nl" },
      to: [{ email: "a@b.nl" }],
      subject: "Hi",
      htmlContent: "<p>Hi</p>",
    });
  });

  test("throws with Brevo's message when the send is rejected", async () => {
    response = new Response('{"code":"unauthorized","message":"Key not found"}', { status: 401 });
    await expect(sendEmail({ to: "a@b.nl", subject: "Hi", html: "" })).rejects.toThrow(
      /401.*Key not found/
    );
  });

  test("throws without calling Brevo when the API key is missing", async () => {
    delete process.env.BREVO_API_KEY;
    await expect(sendEmail({ to: "a@b.nl", subject: "Hi", html: "" })).rejects.toThrow(
      "BREVO_API_KEY is not set"
    );
    expect(calls).toHaveLength(0);
  });
});
