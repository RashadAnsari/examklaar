// Brevo transactional email over its HTTP API. BREVO_API_KEY is an API key, not an SMTP key.
const BREVO_SEND_URL = "https://api.brevo.com/v3/smtp/email";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error("BREVO_API_KEY is not set");
  }

  const res = await fetch(BREVO_SEND_URL, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: process.env.EMAIL_FROM_NAME ?? "Examklaar",
        email: process.env.EMAIL_FROM_ADDRESS ?? "",
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    throw new Error(`Brevo send failed with ${res.status}: ${await res.text()}`);
  }
}
